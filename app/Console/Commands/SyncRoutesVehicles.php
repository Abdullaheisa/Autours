<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Included;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\RoutesApiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use App\Console\Commands\Traits\NormalizesVehicleNames;

class SyncRoutesVehicles extends Command
{
    use NormalizesVehicleNames;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'routes:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd), defaults to tomorrow}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles}
                            {--rate-codes=Domestic : Comma-separated list of rate codes to sync}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Routes API into Autours. Creates one vehicle record per branch.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);
        ini_set('memory_limit', '512M');

        $service = new RoutesApiService();

        // 1. Resolve supplier user
        $supplierUser = User::where('email', 'tsingh@routes.ca')->first();
        if (!$supplierUser) {
            $this->error('Routes supplier user not found. Run routes:sync-branches first.');
            return self::FAILURE;
        }

        // 2. Fetch all Routes branches
        $allBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotNull('station_id')
            ->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No Routes branches found. Run: php artisan routes:sync-branches');
            return self::FAILURE;
        }

        $pickupStr = $this->option('pickup-date');
        $pickupDate = $pickupStr ? Carbon::parse($pickupStr) : Carbon::tomorrow()->addDay();
        $dropoffDate1 = $pickupDate->copy()->addDay();
        $dropoffDate7 = $pickupDate->copy()->addDays(7);
        $dropoffDate30 = $pickupDate->copy()->addDays(30);
        
        $pricesOnly = $this->option('prices-only');

        $this->info(sprintf(
            'Starting Routes vehicle sync: %d branch(es), Pickup: %s',
            $allBranches->count(),
            $pickupDate->toDateString()
        ));

        // Inclusions as requested by the user
        $inclusions = [];
        $mileageIncluded = Included::firstOrCreate(['what_is_included' => 'Unlimited mileage']);
        $inclusions[] = $mileageIncluded->id;
        
        $taxesIncluded = Included::firstOrCreate(['what_is_included' => 'Airport surcharges and local taxes']);
        $inclusions[] = $taxesIncluded->id;

        $syncedVehicleIds = [];

        foreach ($allBranches as $branch) {
            $this->info("Processing branch: {$branch->station_id} - {$branch->name}");
            
            $rates1 = $service->getRates($branch->station_id, $pickupDate, $dropoffDate1) ?: [];
            $rates7 = $service->getRates($branch->station_id, $pickupDate, $dropoffDate7) ?: [];
            $rates30 = $service->getRates($branch->station_id, $pickupDate, $dropoffDate30) ?: [];
            
            if (empty($rates1) && empty($rates7) && empty($rates30)) {
                $this->warn("No rates found for branch {$branch->station_id}");
                continue;
            }

            $mergedRates = [];

            // 1 Day Rates
            foreach ($rates1 as $rate) {
                $classCode = $rate['ClassCode'] ?? null;
                if (!$classCode) continue;
                $mergedRates[$classCode] = [
                    'model' => $rate['ModelDesc'],
                    'classDesc' => $rate['ClassDesc'] ?? '',
                    'dayPrice' => $rate['TotalCharge'] ?? $rate['RateAmount'] ?? 0,
                    'weekPrice' => null,
                    'monthPrice' => null,
                ];
            }

            // 7 Day Rates
            foreach ($rates7 as $rate) {
                $classCode = $rate['ClassCode'] ?? null;
                if (!$classCode) continue;
                $price = $rate['TotalCharge'] ?? $rate['RateAmount'] ?? 0;
                if (!isset($mergedRates[$classCode])) {
                    $mergedRates[$classCode] = [
                        'model' => $rate['ModelDesc'],
                        'classDesc' => $rate['ClassDesc'] ?? '',
                        'dayPrice' => $price > 0 ? round($price / 7, 2) : 0, // Fallback if 1-day is missing
                        'weekPrice' => $price > 0 ? round($price / 7, 2) : null,
                        'monthPrice' => null,
                    ];
                } else {
                    $mergedRates[$classCode]['weekPrice'] = $price > 0 ? round($price / 7, 2) : null;
                }
            }

            // 30 Day Rates
            foreach ($rates30 as $rate) {
                $classCode = $rate['ClassCode'] ?? null;
                if (!$classCode) continue;
                $price = $rate['TotalCharge'] ?? $rate['RateAmount'] ?? 0;
                if (!isset($mergedRates[$classCode])) {
                    $mergedRates[$classCode] = [
                        'model' => $rate['ModelDesc'],
                        'classDesc' => $rate['ClassDesc'] ?? '',
                        'dayPrice' => $price > 0 ? round($price / 30, 2) : 0, // Fallback
                        'weekPrice' => null,
                        'monthPrice' => $price > 0 ? round($price / 30, 2) : null,
                    ];
                } else {
                    $mergedRates[$classCode]['monthPrice'] = $price > 0 ? round($price / 30, 2) : null;
                }
            }

            foreach ($mergedRates as $classCode => $data) {
                if (empty($data['model']) || $data['dayPrice'] <= 0) {
                    continue;
                }

                $normalizedModel = $this->normalizeVehicleName($data['model']);
                $categoryId = $this->resolveCategoryFromSipp($classCode);

                $vehicle = Vehicle::updateOrCreate(
                    [
                        'supplier' => $supplierUser->id,
                        'pickup_loc' => $branch->id,
                        'name' => $normalizedModel,
                    ],
                    [
                        'category' => $categoryId,
                        'price' => $data['dayPrice'],
                        'week_price' => $data['weekPrice'] ?? $data['dayPrice'],
                        'month_price' => $data['monthPrice'] ?? $data['dayPrice'],
                        'activation' => true,
                        'instant_confirmation' => 1,
                    ]
                );
                
                // Sync Inclusions
                if (!$pricesOnly) {
                    $vehicle->included()->sync($inclusions);
                }

                $syncedVehicleIds[] = $vehicle->id;
            }
        }

        // Deactivate or delete old vehicles not seen in this run
        if (!$pricesOnly && !empty($syncedVehicleIds)) {
            $deleted = Vehicle::where('supplier', $supplierUser->id)
                ->whereNotIn('id', $syncedVehicleIds)
                ->delete();
            if ($deleted > 0) {
                $this->info("Deleted {$deleted} obsolete vehicle records.");
            }
        }

        $this->info('========== Routes Vehicle Sync Complete ==========');
        return self::SUCCESS;
    }

    private function resolveCategoryFromSipp(string $sipp): ?int
    {
        $categoryName = \App\Services\SippDecoder::getLocalCategoryName($sipp);
        
        if ($categoryName !== null) {
            $category = \App\Models\Category::where('name', $categoryName)->first();
            if ($category) {
                return $category->id;
            }
        }

        return null;
    }
}

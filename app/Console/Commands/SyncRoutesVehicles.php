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
        $pickupDate = $pickupStr ? Carbon::parse($pickupStr) : Carbon::tomorrow();
        $dropoffDate = $pickupDate->copy()->addDays(7);
        
        $rateCodesStr = $this->option('rate-codes') ?? 'Domestic';
        $rateCodes = explode(',', $rateCodesStr);
        $pricesOnly = $this->option('prices-only');

        $this->info(sprintf(
            'Starting Routes vehicle sync: %d branch(es), Pickup: %s, Dropoff: %s',
            $allBranches->count(),
            $pickupDate->toDateString(),
            $dropoffDate->toDateString()
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
            
            $rates = $service->getRates($branch->station_id, $pickupDate, $dropoffDate);
            
            if (empty($rates)) {
                $this->warn("No rates found for branch {$branch->station_id}");
                continue;
            }

            foreach ($rates as $rate) {
                $currentRateCode = $rate['RateCode'] ?? 'Domestic';

                $modelName = $rate['ModelDesc'];
                $classDesc = $rate['ClassDesc'];
                $classCode = $rate['ClassCode'];
                $price = $rate['TotalCharge'] ?? $rate['RateAmount']; 
                
                if (empty($modelName) || empty($price)) {
                    continue;
                }

                $normalizedModel = $this->normalizeName($modelName);
                
                $vehicle = Vehicle::updateOrCreate(
                    [
                        'company_id' => $supplierUser->id,
                        'branch_id' => $branch->id,
                        'group' => $classCode,
                        'rate_code' => $currentRateCode,
                    ],
                    [
                        'name' => $normalizedModel,
                        'car_type' => $classDesc,
                        'original_price' => $price,
                        'status' => 'active',
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
            $deleted = Vehicle::where('company_id', $supplierUser->id)
                ->whereNotIn('id', $syncedVehicleIds)
                ->delete();
            if ($deleted > 0) {
                $this->info("Deleted {$deleted} obsolete vehicle records.");
            }
        }

        $this->info('========== Routes Vehicle Sync Complete ==========');
        return self::SUCCESS;
    }
}

<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
use App\Services\KolaycarApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;
use Illuminate\Support\Str;

class SyncDriveAndSmileBranches extends Command
{
    protected $signature = 'driveandsmile:sync-branches {--dry-run : Only fetch from API and print what would be done} {--real : Perform the actual synchronization to the database}';

    protected $description = 'Sync Drive and Smile locations as branches.';

    public function handle(): int
    {
        if (!$this->option('dry-run') && !$this->option('real')) {
            $this->error('You must specify either --dry-run or --real.');
            return self::FAILURE;
        }

        if ($this->option('dry-run') && $this->option('real')) {
            $this->error('You cannot specify both --dry-run and --real.');
            return self::FAILURE;
        }

        $service = new KolaycarApiService('l1lmfb285d97knJUlxIlUA==', 'autours2323');

        $supplierUser = User::firstOrCreate(
            ['email' => 'info@driveandsmile.com.tr'],
            [
                'name' => 'Drive and Smile',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Drive and Smile',
            ]
        );
        $supplierUserId = $supplierUser->id;
        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        $this->info('Fetching locations from Drive and Smile...');
        $response = $service->getLocations();

        $locations = $response['LOCATIONS'] ?? [];

        if (empty($locations)) {
            $this->error('No locations returned from Kolaycar API.');
            return self::FAILURE;
        }

        $this->info('Locations fetched: ' . count($locations));

        $created = 0;
        $updated = 0;

        foreach ($locations as $location) {
            $locationId = (string) ($location['LOCATIONID'] ?? '');
            $locationName = (string) ($location['LOCATIONNAME'] ?? '');
            $city = (string) ($location['CITYNAME'] ?? '');
            $country = (string) ($location['COUNTRYNAME'] ?? '');
            
            $vendors = $location['VENDORS'] ?? [];
            if (empty($vendors)) {
                continue;
            }

            $firstVendor = $vendors[0] ?? [];
            $address = (string) ($firstVendor['VENDORLOCATIONADDRESS'] ?? $city);
            $geo = (string) ($firstVendor['VENDORLOCATIONGEO'] ?? '');

            if (empty($locationId) || empty($locationName)) {
                continue;
            }

            if ($this->option('dry-run')) {
                $this->line("[DRY RUN] Would sync location ID {$locationId} -> '{$locationName}'");
                continue;
            }

            $lat = null;
            $lng = null;
            if (str_contains($geo, ',')) {
                $parts = array_map('trim', explode(',', $geo, 2));
                $lat = $parts[0] ?? null;
                $lng = $parts[1] ?? null;
            }

            $countryName = CountryCurrencyResolver::resolveCountryName($country ?: 'TR');
            $currency = CountryCurrencyResolver::resolveCurrency($country ?: 'TR');

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUserId,
                    'station_id' => $locationId,
                ],
                [
                    'name' => $locationName,
                    'location' => $locationName,
                    'adresse' => $address ?: $locationName,
                    'city' => $city ?: $locationName,
                    'country' => $countryName,
                    'currency' => $currency,
                    'lat' => $lat,
                    'lng' => $lng,
                    'location_type' => str_contains(strtolower($locationName), 'airport') ? 'Airport' : 'Downtown',
                    'abriviation' => $locationId,
                ]
            );

            $normalizer = new BranchNormalizationService();
            $normData = $normalizer->normalize(
                $branch->name,
                $branch->city ?? '',
                $branch->country ?? '',
                $branch->station_id,
                $branch->abriviation
            );

            $branch->update(array_filter([
                'airport_id' => $normData['airport_id'] ?? null,
                'name' => $normData['normalized_name'] ?? null,
                'location' => $normData['location'] ?? null,
                'abriviation' => $normData['abriviation'] ?? null,
            ]));

            if ($branch->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }
        }

        $activeLocationIds = array_filter(array_map(
            fn ($l) => (string) ($l['LOCATIONID'] ?? ''),
            $locations
        ));

        $deleted = 0;
        if ($this->option('dry-run')) {
            $this->info('[DRY RUN] Would check for orphaned branches and delete them.');
        } else {
            $orphanedBranches = Branch::where('company_id', $supplierUserId)
                ->whereNotIn('station_id', $activeLocationIds)
                ->get();
            
            foreach ($orphanedBranches as $ob) {
                $ob->delete();
                $deleted++;
                $this->warn("Deleted orphaned branch: {$ob->name}");
            }

            $this->info("Sync complete. Created: {$created}, Updated: {$updated}, Deleted: {$deleted}.");
        }

        return self::SUCCESS;
    }
}

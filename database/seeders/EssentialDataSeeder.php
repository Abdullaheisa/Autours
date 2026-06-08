<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\FuelPolicy;
use App\Models\Included;
use App\Models\LocationType;
use App\Models\Specification;
use App\Models\User;
use App\Models\VehiclesPhotos;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EssentialDataSeeder extends Seeder
{
    public function run(): void
    {
        // ── Categories ────────────────────────────────────────────────
        $categories = [
            ['name' => 'Economy',      'icon' => ''],
            ['name' => 'Compact',      'icon' => ''],
            ['name' => 'Mid-size',     'icon' => ''],
            ['name' => 'Full-size',    'icon' => ''],
            ['name' => 'SUV',          'icon' => ''],
            ['name' => 'Luxury',       'icon' => ''],
            ['name' => 'Van / Minivan','icon' => ''],
            ['name' => 'Pickup Truck', 'icon' => ''],
            ['name' => 'Sports Car',   'icon' => ''],
            ['name' => 'Electric',     'icon' => ''],
        ];
        foreach ($categories as $cat) {
            Category::firstOrCreate(['name' => $cat['name']], $cat);
        }
        $this->command->info('✅ Categories seeded (' . count($categories) . ')');

        // ── Fuel Policies ────────────────────────────────────────────
        $fuelPolicies = [
            ['name' => 'Full to Full',   'description' => 'Return with the same fuel level as pickup'],
            ['name' => 'Full to Empty',  'description' => 'Pickup full, return empty — prepaid fuel'],
            ['name' => 'Same to Same',   'description' => 'Return with the same fuel level as received'],
        ];
        foreach ($fuelPolicies as $fp) {
            FuelPolicy::firstOrCreate(['name' => $fp['name']], $fp);
        }
        $this->command->info('✅ Fuel Policies seeded (' . count($fuelPolicies) . ')');

        // ── Location Types ────────────────────────────────────────────
        $locationTypes = [
            ['name' => 'Airport'],
            ['name' => 'City Center'],
            ['name' => 'Hotel'],
            ['name' => 'Train Station'],
            ['name' => 'Port / Cruise Terminal'],
            ['name' => 'Downtown'],
        ];
        foreach ($locationTypes as $lt) {
            LocationType::firstOrCreate(['name' => $lt['name']], $lt);
        }
        $this->command->info('✅ Location Types seeded (' . count($locationTypes) . ')');

        // ── Included Items ───────────────────────────────────────────
        $includedItems = [
            'GPS Navigation',
            'Unlimited Mileage',
            'Collision Damage Waiver (CDW)',
            'Third Party Liability (TPL)',
            'Theft Protection',
            'Baby Seat',
            'Additional Driver',
            'Airport Surcharge Included',
            'Roadside Assistance',
            'Free Cancellation',
        ];
        foreach ($includedItems as $item) {
            // "what_is_included" is the column name in the included table
            Included::firstOrCreate(['what_is_included' => $item]);
        }
        $this->command->info('✅ Included Items seeded (' . count($includedItems) . ')');

        // ── Vehicle Photos (sample) ───────────────────────────────────
        $photos = [
            ['name' => 'Toyota Corolla',     'photo' => ''],
            ['name' => 'Honda Civic',        'photo' => ''],
            ['name' => 'Hyundai Elantra',    'photo' => ''],
            ['name' => 'Nissan Altima',      'photo' => ''],
            ['name' => 'Kia Sportage',       'photo' => ''],
            ['name' => 'Toyota RAV4',        'photo' => ''],
            ['name' => 'Ford Explorer',      'photo' => ''],
            ['name' => 'Mercedes C-Class',   'photo' => ''],
            ['name' => 'BMW 3 Series',       'photo' => ''],
            ['name' => 'Range Rover Sport',  'photo' => ''],
        ];
        foreach ($photos as $p) {
            VehiclesPhotos::firstOrCreate(['name' => $p['name']], $p);
        }
        $this->command->info('✅ Vehicle Photos seeded (' . count($photos) . ')');

        $this->command->info('🎉 All essential data seeded successfully!');
    }
}

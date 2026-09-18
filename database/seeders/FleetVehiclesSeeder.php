<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\FleetVehicle;
use Illuminate\Database\Seeder;

class FleetVehiclesSeeder extends Seeder
{
    public function run(): void
    {
        $existingCategories = Category::all()->keyBy(function($item) {
            return strtolower(trim($item->name));
        });

        $seedItems = [
            [
                'category_name' => 'Mini',
                'badge' => 'Budget & City',
                'car_name' => 'Kia Picanto or similar',
                'photo' => 'img/categories/MINI.png__category.png',
                'price' => 45,
                'currency' => 'AED',
                'supplier_name' => 'Auto Nation',
                'seats' => '4 Seats',
                'doors' => '4 Doors',
                'luggage' => '1 Bag',
                'description' => 'Browse our premium Mini vehicle category. Autours offers the best rental rates, instant confirmation, and direct pickup options.',
                'order' => 1,
                'active' => true,
            ],
            [
                'category_name' => 'Small',
                'badge' => 'Budget & City',
                'car_name' => 'Nissan Micra or similar',
                'photo' => 'img/categories/Small.png__category (1).png__category.png',
                'price' => 50,
                'currency' => 'AED',
                'supplier_name' => 'Autours',
                'seats' => '4 Seats',
                'doors' => '4 Doors',
                'luggage' => '1 Bag',
                'description' => 'Ideal for city commutes and nimble urban parking. Enjoy maximum fuel efficiency, easy handling, and all the essential amenities for daily driving.',
                'order' => 2,
                'active' => true,
            ],
            [
                'category_name' => 'Economy',
                'badge' => 'Most Popular',
                'car_name' => 'Hyundai Accent or similar',
                'photo' => 'img/categories/Economy[1].png__category.png',
                'price' => 55,
                'currency' => 'AED',
                'supplier_name' => 'Auto Nation',
                'seats' => '5 Seats',
                'doors' => '4 Doors',
                'luggage' => '2-3 Bags',
                'description' => 'Our most popular vehicle choice. Perfect balance between affordability, interior comfort, and generous trunk space for small families or solo travelers.',
                'order' => 3,
                'active' => true,
            ],
            [
                'category_name' => 'Standard',
                'badge' => 'Executive Comfort',
                'car_name' => 'Toyota Corolla or similar',
                'photo' => 'img/categories/Standered.png__category[1].png__category.png',
                'price' => 70,
                'currency' => 'AED',
                'supplier_name' => 'SOVOYCARS',
                'seats' => '5 Seats',
                'doors' => '4 Doors',
                'luggage' => '2-3 Bags',
                'description' => 'Smooth highway cruising with enhanced suspension and legroom. A reliable sedan built for business trips and long road excursions.',
                'order' => 4,
                'active' => true,
            ],
            [
                'category_name' => 'Full Size',
                'badge' => 'Executive Comfort',
                'car_name' => 'Toyota Camry or similar',
                'photo' => 'img/categories/Full-size.png__category.png__category.png',
                'price' => 95,
                'currency' => 'AED',
                'supplier_name' => 'Autours',
                'seats' => '5 Seats',
                'doors' => '4 Doors',
                'luggage' => '3-4 Bags',
                'description' => 'Premium executive sedan featuring spacious seating, high-tech infotainment, quiet cabin dynamics, and expansive luggage storage.',
                'order' => 5,
                'active' => true,
            ],
            [
                'category_name' => 'Compact SUV',
                'badge' => 'Family & Terrain',
                'car_name' => 'Hyundai Creta or similar',
                'photo' => 'img/categories/Compact_SUV.png__category[1].png__category.png',
                'price' => 85,
                'currency' => 'AED',
                'supplier_name' => 'DRIVUS',
                'seats' => '5 Seats',
                'doors' => '5 Doors',
                'luggage' => '3-4 Bags',
                'description' => 'Crossover agility combined with elevated ride height and extra cargo volume. Perfect for both urban streets and scenic weekend getaways.',
                'order' => 6,
                'active' => true,
            ],
            [
                'category_name' => 'SUV',
                'badge' => 'Family & Terrain',
                'car_name' => 'Nissan Patrol or similar',
                'photo' => 'img/categories/SUV.png__category[1].png__category.png',
                'price' => 160,
                'currency' => 'AED',
                'supplier_name' => 'Auto Nation',
                'seats' => '7 Seats',
                'doors' => '5 Doors',
                'luggage' => '4-5 Bags',
                'description' => 'Commanding presence, formidable all-terrain capability, and luxury 7-passenger capacity. Built for long-distance family travel and adventurous terrain.',
                'order' => 7,
                'active' => true,
            ],
            [
                'category_name' => 'Minivan',
                'badge' => 'Group & Family',
                'car_name' => 'Kia Carnival or similar',
                'photo' => 'img/categories/minivan (2).png__category.png',
                'price' => 180,
                'currency' => 'AED',
                'supplier_name' => 'Autours',
                'seats' => '7 Seats',
                'doors' => '5 Doors',
                'luggage' => '5+ Bags',
                'description' => 'The ultimate family and group transport. Sliding doors for effortless boarding, modular seating arrangements, and massive luggage capacity.',
                'order' => 8,
                'active' => true,
            ],
            [
                'category_name' => 'Luxury',
                'badge' => 'VIP & Performance',
                'car_name' => 'Mercedes-Benz C-Class or similar',
                'photo' => 'img/categories/Luxury.png__category[1].png__category.png',
                'price' => 260,
                'currency' => 'AED',
                'supplier_name' => 'XDrive Mobility',
                'seats' => '5 Seats',
                'doors' => '4 Doors',
                'luggage' => '3 Bags',
                'description' => 'Unparalleled sophistication, state-of-the-art technology, and exhilarating performance. Make a distinguished statement wherever you arrive.',
                'order' => 9,
                'active' => true,
            ],
        ];

        foreach ($seedItems as $itemData) {
            $catKey = strtolower(trim($itemData['category_name']));
            if (isset($existingCategories[$catKey]) && !empty($existingCategories[$catKey]->description)) {
                // Preserve description if user had set a custom one
                if (strlen($existingCategories[$catKey]->description) > 10) {
                    $itemData['description'] = $existingCategories[$catKey]->description;
                }
            }

            FleetVehicle::updateOrCreate(
                ['category_name' => $itemData['category_name']],
                $itemData
            );
        }
    }
}

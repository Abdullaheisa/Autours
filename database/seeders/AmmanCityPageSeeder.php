<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CityPage;

class AmmanCityPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            'slug' => 'amman',
            'name' => 'Amman',
            'country' => 'Jordan',
            'country_slug' => 'jordan',
            'hero_badge' => 'Autours Amman Airport Car Rental',
            'hero_title' => 'Book Your Airport Rental',
            'hero_highlight' => 'in Amman',
            'hero_lead' => 'Search pickup availability from Queen Alia International Airport (AMM) — then choose the right car for your trip before you land.',
            'hero_bottom_title' => 'Search by Amman airport and land ready to drive.',
            'travel_info' => [
                'title' => 'Why Choose Autours in Amman?',
                'subtitle' => 'The Smart Way to Rent a Car in Jordan. Book with trusted car rental companies and compare competitive Amman car rental deals in one place.',
                'image' => 'countries/jordan.png',
                'benefits' => [
                    ['title' => 'Airport Pickup in Amman', 'description' => 'Collect your rental car at Queen Alia International Airport (AMM) and start your journey without unnecessary delays.'],
                    ['title' => 'Best Car Rental Rates in Jordan', 'description' => 'Compare prices from leading international and local rental companies to find competitive rates for economy cars, SUVs, family vehicles, and luxury cars.'],
                    ['title' => 'Transparent Pricing', 'description' => 'No hidden charges or unexpected fees. Review your rental details and total price before completing your booking.'],
                    ['title' => '24/7 Customer Support', 'description' => 'Our team is available around the clock to help with bookings, amendments, cancellations, or rental-related questions in Amman.'],
                    ['title' => 'Free Cancellation', 'description' => 'Enjoy flexible travel with free cancellation up to 24 hours before pickup on eligible bookings.']
                ]
            ],
            'steps' => [
                ['title' => 'Search', 'description' => 'Enter your Amman airport, dates, and pickup times to see available rental cars.'],
                ['title' => 'Compare', 'description' => 'Compare cars by price, vehicle type, transmission, and supplier.'],
                ['title' => 'Book & Drive', 'description' => 'Reserve your car online, pick it up at the airport, and hit the road.']
            ],
            'documents' => [
                'items' => [
                    'Valid driving license (Jordanian or International)',
                    'Passport or National ID',
                    'Credit card for security deposit',
                    'Booking confirmation (digital or printed)'
                ]
            ],
            'highlights' => [
                'title' => 'Top Destinations in Amman',
                'subtitle' => 'Explore Amman\'s most iconic attractions and neighborhoods with the freedom of your own rental car — from the Roman Theater to Rainbow Street and the Citadel.',
                'places' => [
                    ['name' => 'Amman Citadel', 'description' => 'Visit the historic Citadel with panoramic views of the city.', 'tags' => ['History', 'Iconic', 'Views'], 'image' => 'https://images.unsplash.com/photo-1596773322197-27b875db5bba?auto=format&fit=crop&w=800&q=80'],
                    ['name' => 'Roman Theater', 'description' => 'Explore the well-preserved 2nd-century Roman Theater in the heart of downtown.', 'tags' => ['City Center', 'Culture', 'History'], 'image' => 'https://images.unsplash.com/photo-1590059345229-37f26d2e0ccf?auto=format&fit=crop&w=800&q=80'],
                    ['name' => 'Rainbow Street', 'description' => 'Walk through the vibrant street packed with cafes, shops, and art galleries.', 'tags' => ['Shopping', 'Vibrant', 'Culture'], 'image' => 'https://images.unsplash.com/photo-1599388377759-b903e1ba28c5?auto=format&fit=crop&w=800&q=80']
                ]
            ],
            'faqs' => [
                ['q' => 'What are the main car rental rules in Amman?', 'a' => 'To rent a car in Amman, you generally need a valid driving license, passport, and a payment card for the security deposit. Requirements can vary depending on the rental supplier.']
            ],
            'partners_description' => 'Compare competitive rental rates from trusted car rental companies operating in Amman. All suppliers are verified and available for instant booking.',
            'cta_title' => 'Book Your Amman Airport Car Rental in Minutes',
            'cta_description' => 'Unlock competitive deals from trusted suppliers at Amman\'s major airports. Compare prices, choose the right vehicle, enjoy transparent pricing and flexible cancellation options, and receive your booking confirmation online.',
            'cta_primary_text' => 'Compare Prices',
            'cta_secondary_text' => 'Get Expert Help',
            'is_published' => true,
        ];

        CityPage::updateOrCreate(['slug' => 'amman'], $data);
    }
}

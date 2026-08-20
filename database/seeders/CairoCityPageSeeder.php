<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CityPage;

class CairoCityPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            'slug' => 'cairo',
            'name' => 'Cairo',
            'country' => 'Egypt',
            'country_slug' => 'egypt',
            'hero_badge' => 'Autours Cairo Airport Car Rental',
            'hero_title' => 'Book Your Airport Rental',
            'hero_highlight' => 'in Cairo',
            'hero_lead' => 'Search pickup availability from Cairo International Airport (CAI) — then choose the right car for your trip before you land.',
            'hero_bottom_title' => 'Search by Cairo airport and land ready to drive.',
            'travel_info' => [
                'title' => 'Why Choose Autours in Cairo?',
                'subtitle' => 'The Smart Way to Rent a Car in Egypt. Book with trusted car rental companies and compare competitive Cairo car rental deals in one place.',
                'image' => 'countries/egypt.png',
                'benefits' => [
                    ['title' => 'Airport Pickup in Cairo', 'description' => 'Collect your rental car at Cairo International Airport (CAI) and start your journey without unnecessary delays.'],
                    ['title' => 'Best Car Rental Rates in Egypt', 'description' => 'Compare prices from leading international and local rental companies to find competitive rates for economy cars, SUVs, family vehicles, and luxury cars.'],
                    ['title' => 'Transparent Pricing', 'description' => 'No hidden charges or unexpected fees. Review your rental details and total price before completing your booking.'],
                    ['title' => '24/7 Customer Support', 'description' => 'Our team is available around the clock to help with bookings, amendments, cancellations, or rental-related questions in Cairo.'],
                    ['title' => 'Free Cancellation', 'description' => 'Enjoy flexible travel with free cancellation up to 24 hours before pickup on eligible bookings.']
                ]
            ],
            'steps' => [
                ['title' => 'Search', 'description' => 'Enter your Cairo airport, dates, and pickup times to see available rental cars.'],
                ['title' => 'Compare', 'description' => 'Compare cars by price, vehicle type, transmission, and supplier.'],
                ['title' => 'Book & Drive', 'description' => 'Reserve your car online, pick it up at the airport, and hit the road.']
            ],
            'documents' => [
                'items' => [
                    'Valid driving license (Egyptian or International)',
                    'Passport or National ID',
                    'Credit card for security deposit',
                    'Booking confirmation (digital or printed)'
                ]
            ],
            'highlights' => [
                'title' => 'Top Destinations in Cairo',
                'subtitle' => 'Explore Cairo\'s most iconic attractions and neighborhoods with the freedom of your own rental car — from the Pyramids of Giza to Downtown Cairo and the Nile River.',
                'places' => [
                    ['name' => 'Giza Pyramids', 'description' => 'Visit the Great Pyramids of Giza and the Sphinx.', 'tags' => ['History', 'Iconic', 'Wonder'], 'image' => 'https://images.unsplash.com/photo-1539768942893-dac5f4e24eb6?auto=format&fit=crop&w=800&q=80'],
                    ['name' => 'Downtown Cairo', 'description' => 'Explore the vibrant heart of the city, Tahrir Square, and the Egyptian Museum.', 'tags' => ['City Center', 'Culture', 'Museums'], 'image' => 'https://images.unsplash.com/photo-1553152531-bc66099b244d?auto=format&fit=crop&w=800&q=80'],
                    ['name' => 'Khan el-Khalili', 'description' => 'Dive into the historic bazaar for shopping and traditional atmosphere.', 'tags' => ['Shopping', 'Historic', 'Culture'], 'image' => 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80'],
                    ['name' => 'Zamalek', 'description' => 'Enjoy the upscale neighborhood on Gezira Island with art galleries and fine dining.', 'tags' => ['Upscale', 'Dining', 'Island'], 'image' => 'https://images.unsplash.com/photo-1600869009498-8d429f88d4f5?auto=format&fit=crop&w=800&q=80']
                ]
            ],
            'faqs' => [
                ['q' => 'What are the main car rental rules in Cairo?', 'a' => 'To rent a car in Cairo, you generally need a valid driving license, passport, and a payment card for the security deposit. Requirements can vary depending on the rental supplier.']
            ],
            'partners_description' => 'Compare competitive rental rates from trusted car rental companies operating in Cairo. All suppliers are verified and available for instant booking.',
            'cta_title' => 'Book Your Cairo Airport Car Rental in Minutes',
            'cta_description' => 'Unlock competitive deals from trusted suppliers at Cairo\'s major airports. Compare prices, choose the right vehicle, enjoy transparent pricing and flexible cancellation options, and receive your booking confirmation online.',
            'cta_primary_text' => 'Compare Prices',
            'cta_secondary_text' => 'Get Expert Help',
            'is_published' => true,
        ];

        CityPage::updateOrCreate(['slug' => 'cairo'], $data);
    }
}

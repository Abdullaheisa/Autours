<?php

namespace Database\Seeders;

use App\Models\CarRentalBrand;
use App\Models\User;
use App\Models\Branch;
use App\Models\Airport;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CarRentalBrandsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Array of Brands and their branches to seed
        $brandsData = [
            [
                'slug' => 'alamo',
                'name' => 'Alamo',
                'display_name' => 'Alamo Car Rental',
                'logo' => '/img/company_logos/alamo.webp',
                'rating' => 9.23,
                'review_count' => 4174,
                'rating_label' => 'Brilliant',
                'description' => "Alamo Rent A Car, established in 1974, has built a reputation for providing a seamless and efficient rental experience for travelers worldwide. With a presence in numerous countries across North America, South America, Europe, Asia, and Oceania, Alamo offers convenient access to rental services at major travel destinations.\n\nAlamo's dedication to cleanliness and safety is exemplified by its Complete Clean Pledge, ensuring that every vehicle undergoes rigorous sanitization procedures. This commitment provides peace of mind to customers, knowing that their health and safety are prioritized.\n\nAs a subsidiary of Enterprise Holdings, Alamo benefits from the resources and support of one of the largest car rental companies globally. By choosing Alamo, travelers can expect a combination of convenience, safety, and exceptional customer service.",
                'countries' => [
                    [
                        'name' => 'United Arab Emirates',
                        'code' => 'AE',
                        'airports' => [
                            ['name' => 'Dubai International Airport', 'city' => 'Dubai', 'address' => 'Terminal 1, DXB Airport'],
                            ['name' => 'Abu Dhabi International Airport', 'city' => 'Abu Dhabi', 'address' => 'Terminal 1, AUH Airport'],
                            ['name' => 'Sharjah International Airport', 'city' => 'Sharjah', 'address' => 'Main Terminal, SHJ Airport'],
                        ],
                        'cities' => [
                            ['name' => 'Dubai Marina Branch', 'city' => 'Dubai', 'address' => 'Marina Walk, Dubai Marina'],
                            ['name' => 'Deira City Center', 'city' => 'Dubai', 'address' => 'Deira City Center Mall'],
                            ['name' => 'Abu Dhabi Corniche', 'city' => 'Abu Dhabi', 'address' => 'Corniche Road, Abu Dhabi'],
                        ]
                    ],
                    [
                        'name' => 'Saudi Arabia',
                        'code' => 'SA',
                        'airports' => [
                            ['name' => 'King Khalid International Airport', 'city' => 'Riyadh', 'address' => 'Terminal 5, KKIA'],
                            ['name' => 'King Abdulaziz International Airport', 'city' => 'Jeddah', 'address' => 'North Terminal, KAIA'],
                            ['name' => 'King Fahd International Airport', 'city' => 'Dammam', 'address' => 'Main Terminal, KFIA'],
                        ],
                        'cities' => [
                            ['name' => 'Riyadh Olaya Branch', 'city' => 'Riyadh', 'address' => 'Olaya Street, Riyadh'],
                            ['name' => 'Jeddah Corniche', 'city' => 'Jeddah', 'address' => 'King Fahd Corniche, Jeddah'],
                        ]
                    ],
                    [
                        'name' => 'Egypt',
                        'code' => 'EG',
                        'airports' => [
                            ['name' => 'Cairo International Airport', 'city' => 'Cairo', 'address' => 'Terminal 2, CAI Airport'],
                        ],
                        'cities' => [
                            ['name' => 'Cairo Downtown', 'city' => 'Cairo', 'address' => 'Tahrir Square Area, Cairo'],
                        ]
                    ]
                ]
            ],
            [
                'slug' => 'avis',
                'name' => 'AVIS',
                'display_name' => 'AVIS Car Rental',
                'logo' => '/img/company_logos/avis.webp',
                'rating' => 8.95,
                'review_count' => 6821,
                'rating_label' => 'Excellent',
                'description' => "Avis Car Rental is one of the world's leading car rental brands, operating in more than 180 countries and territories worldwide. Founded in 1946, Avis has been at the forefront of the car rental industry, consistently delivering quality vehicles and exceptional customer service.\n\nAvis is committed to providing a premium car rental experience with a diverse fleet of vehicles ranging from economy cars to luxury SUVs. Their innovative Avis App allows customers to manage their reservations, choose their preferred vehicle, and skip the counter entirely at many locations.\n\nWith a strong focus on corporate travel, Avis offers tailored solutions for business travelers, including preferred pricing, streamlined billing, and dedicated account management services.",
                'countries' => [
                    [
                        'name' => 'United Arab Emirates',
                        'code' => 'AE',
                        'airports' => [
                            ['name' => 'Dubai International Airport', 'city' => 'Dubai', 'address' => 'Terminal 3, DXB Airport'],
                            ['name' => 'Abu Dhabi International Airport', 'city' => 'Abu Dhabi', 'address' => 'Terminal 1, AUH Airport'],
                        ],
                        'cities' => [
                            ['name' => 'JLT Branch', 'city' => 'Dubai', 'address' => 'Cluster T, JLT, Dubai'],
                            ['name' => 'Downtown Dubai', 'city' => 'Dubai', 'address' => 'Emaar Boulevard, Downtown'],
                        ]
                    ],
                    [
                        'name' => 'Saudi Arabia',
                        'code' => 'SA',
                        'airports' => [
                            ['name' => 'King Khalid International Airport', 'city' => 'Riyadh', 'address' => 'KKIA Main Terminal'],
                            ['name' => 'King Abdulaziz International Airport', 'city' => 'Jeddah', 'address' => 'KAIA North Terminal'],
                        ],
                        'cities' => [
                            ['name' => 'Tahlia Street Branch', 'city' => 'Riyadh', 'address' => 'Tahlia Street, Riyadh'],
                        ]
                    ]
                ]
            ],
            [
                'slug' => 'budget',
                'name' => 'Budget',
                'display_name' => 'Budget Car Rental',
                'logo' => '/img/company_logos/budget.webp',
                'rating' => 8.71,
                'review_count' => 5340,
                'rating_label' => 'Very Good',
                'description' => "Budget Car Rental has been serving customers worldwide since 1958, offering quality vehicles at competitive prices. As a subsidiary of Avis Budget Group, Budget operates over 3,300 locations across more than 120 countries.\n\nBudget is known for providing exceptional value without compromising on quality. Their diverse fleet includes economy, compact, midsize, and full-size vehicles, as well as SUVs, minivans, and luxury cars to meet every traveler's needs and budget.\n\nWith user-friendly booking tools and flexible rental options, Budget makes it easy to find the perfect car at the best price, whether you're planning a short trip or an extended journey.",
                'countries' => [
                    [
                        'name' => 'United Arab Emirates',
                        'code' => 'AE',
                        'airports' => [
                            ['name' => 'Dubai International Airport', 'city' => 'Dubai', 'address' => 'Terminal 1, DXB Airport'],
                            ['name' => 'Al Maktoum International Airport', 'city' => 'Dubai', 'address' => 'DWC Airport'],
                        ],
                        'cities' => [
                            ['name' => 'Bur Dubai Branch', 'city' => 'Dubai', 'address' => 'Al Mankhool Rd, Bur Dubai'],
                            ['name' => 'Deira Branch', 'city' => 'Dubai', 'address' => 'Al Rigga Street, Deira'],
                        ]
                    ],
                    [
                        'name' => 'Saudi Arabia',
                        'code' => 'SA',
                        'airports' => [
                            ['name' => 'King Khalid International Airport', 'city' => 'Riyadh', 'address' => 'KKIA Terminal'],
                        ],
                        'cities' => [
                            ['name' => 'Riyadh Exit 7', 'city' => 'Riyadh', 'address' => 'Exit 7, Ring Road, Riyadh'],
                        ]
                    ],
                    [
                        'name' => 'Egypt',
                        'code' => 'EG',
                        'airports' => [
                            ['name' => 'Cairo International Airport', 'city' => 'Cairo', 'address' => 'Terminal 3, CAI'],
                        ],
                        'cities' => [
                            ['name' => 'Maadi Branch', 'city' => 'Cairo', 'address' => 'Road 9, Maadi, Cairo'],
                        ]
                    ]
                ]
            ],
            [
                'slug' => 'hertz',
                'name' => 'Hertz',
                'display_name' => 'Hertz Car Rental',
                'logo' => '/img/company_logos/hertz.webp',
                'rating' => 8.85,
                'review_count' => 7612,
                'rating_label' => 'Excellent',
                'description' => "Hertz is one of the most recognized names in the car rental industry, with a history spanning over 100 years. Founded in 1918, Hertz has become synonymous with quality and reliability in vehicle rentals across the globe.\n\nOperating in more than 150 countries with approximately 12,000 locations worldwide, Hertz offers one of the most extensive networks in the industry. The Hertz Gold Plus Rewards program provides frequent renters with exclusive benefits, including expedited service and free rental days.\n\nHertz's premium Ultimate Choice program allows members to choose any vehicle in their designated section, giving customers the freedom to select the exact car that meets their needs. With a commitment to innovation and sustainability, Hertz continues to expand its electric and hybrid vehicle offerings.",
                'countries' => [
                    [
                        'name' => 'United Arab Emirates',
                        'code' => 'AE',
                        'airports' => [
                            ['name' => 'Dubai International Airport', 'city' => 'Dubai', 'address' => 'All Terminals, DXB'],
                        ],
                        'cities' => [
                            ['name' => 'Downtown Dubai', 'city' => 'Dubai', 'address' => 'Burj Khalifa District, Dubai'],
                        ]
                    ],
                    [
                        'name' => 'Saudi Arabia',
                        'code' => 'SA',
                        'airports' => [
                            ['name' => 'King Khalid International Airport', 'city' => 'Riyadh', 'address' => 'KKIA'],
                        ],
                        'cities' => [
                            ['name' => 'Al Hamra District', 'city' => 'Riyadh', 'address' => 'Al Hamra, Riyadh'],
                        ]
                    ]
                ]
            ],
            [
                'slug' => 'sixt',
                'name' => 'SIXT',
                'display_name' => 'SIXT Car Rental',
                'logo' => '/img/company_logos/sixt.webp',
                'rating' => 9.02,
                'review_count' => 5890,
                'rating_label' => 'Brilliant',
                'description' => "SIXT is a premium international car rental company headquartered in Germany, with over 100 years of experience in the mobility industry. Founded in 1912, SIXT has grown from a small Munich-based car rental service to a global leader operating in over 110 countries.\n\nKnown for its distinctive orange branding and premium vehicle fleet, SIXT offers some of the newest and most prestigious cars available for rental. The company's fleet includes luxury vehicles from brands such as Mercedes-Benz, BMW, Porsche, and Audi, as well as a comprehensive range of economy and midsize options.\n\nSIXT's digital innovation has been a cornerstone of its growth strategy. The SIXT app provides customers with a seamless end-to-end experience, from booking to vehicle return, with features like contactless rental and real-time vehicle tracking.",
                'countries' => [
                    [
                        'name' => 'United Arab Emirates',
                        'code' => 'AE',
                        'airports' => [
                            ['name' => 'Dubai International Airport', 'city' => 'Dubai', 'address' => 'Terminal 3, DXB'],
                        ],
                        'cities' => [
                            ['name' => 'Business Bay', 'city' => 'Dubai', 'address' => 'Bay Square, Business Bay'],
                        ]
                    ]
                ]
            ],
            [
                'slug' => 'europcar',
                'name' => 'Europcar',
                'display_name' => 'Europcar Car Rental',
                'logo' => '/img/company_logos/europcar.webp',
                'rating' => 8.60,
                'review_count' => 4250,
                'rating_label' => 'Very Good',
                'description' => "Europcar is Europe's leading car rental company, operating in over 140 countries across the globe. Founded in France in 1949, Europcar has built a strong reputation for providing quality vehicles and reliable service to both leisure and business travelers.\n\nEuropcar's diverse fleet includes over 250,000 vehicles, ranging from compact city cars to spacious family SUVs and premium executive vehicles. The company's extensive network of over 3,500 stations ensures that customers can find a Europcar location at virtually every major airport, train station, and city center worldwide.\n\nThe Europcar Privilege loyalty program rewards frequent renters with exclusive benefits, including priority service, vehicle upgrades, and free rental days. Europcar's commitment to sustainable mobility is reflected in its growing fleet of electric and hybrid vehicles.",
                'countries' => [
                    [
                        'name' => 'United Arab Emirates',
                        'code' => 'AE',
                        'airports' => [
                            ['name' => 'Dubai International Airport', 'city' => 'Dubai', 'address' => 'Terminal 1, DXB'],
                        ],
                        'cities' => [
                            ['name' => 'TECOM Branch', 'city' => 'Dubai', 'address' => 'Dubai Internet City, TECOM'],
                        ]
                    ]
                ]
            ]
        ];

        // 2. Loop to create Users, CarRentalBrands, and Branches
        foreach ($brandsData as $bData) {
            $email = $bData['slug'] . '@autours.net';
            
            // Check if user already exists
            $user = User::where('email', $email)->first();
            if (!$user) {
                $user = User::create([
                    'name' => $bData['name'],
                    'email' => $email,
                    'password' => Hash::make('0000'), // default developer password
                    'role' => 'active_supplier',
                    'company' => $bData['name'],
                    'logo' => $bData['slug'] . '.webp', // will resolve in frontend to logo folder
                ]);
            } else {
                // Ensure correct role & details
                $user->update([
                    'role' => 'active_supplier',
                    'company' => $bData['name'],
                    'logo' => $bData['slug'] . '.webp',
                ]);
            }

            // Create or update CarRentalBrand record
            CarRentalBrand::updateOrCreate(
                ['slug' => $bData['slug']],
                [
                    'user_id' => $user->id,
                    'name' => $bData['name'],
                    'display_name' => $bData['display_name'],
                    'logo' => $bData['logo'],
                    'rating' => $bData['rating'],
                    'review_count' => $bData['review_count'],
                    'rating_label' => $bData['rating_label'],
                    'description' => $bData['description'],
                ]
            );

            // Seed Branches
            foreach ($bData['countries'] as $cData) {
                // 1. Seed Airport Branches
                foreach ($cData['airports'] as $apBranch) {
                    // Try to resolve airport_id
                    $airport = Airport::where('airport_name', 'like', '%' . $apBranch['city'] . '%')
                        ->orWhere('iata_code', 'like', '%' . $apBranch['city'] . '%')
                        ->first();
                    
                    Branch::updateOrCreate(
                        [
                            'company_id' => $user->id,
                            'name' => $apBranch['name'],
                            'city' => $apBranch['city'],
                            'country' => $cData['name']
                        ],
                        [
                            'location' => $apBranch['city'],
                            'adresse' => $apBranch['address'],
                            'location_type' => 'Airport',
                            'activation' => 1,
                            'airport_id' => $airport ? $airport->id : null
                        ]
                    );
                }

                // 2. Seed City Branches
                foreach ($cData['cities'] as $cityBranch) {
                    Branch::updateOrCreate(
                        [
                            'company_id' => $user->id,
                            'name' => $cityBranch['name'],
                            'city' => $cityBranch['city'],
                            'country' => $cData['name']
                        ],
                        [
                            'location' => $cityBranch['city'],
                            'adresse' => $cityBranch['address'],
                            'location_type' => 'City Center',
                            'activation' => 1
                        ]
                    );
                }
            }
        }
    }
}

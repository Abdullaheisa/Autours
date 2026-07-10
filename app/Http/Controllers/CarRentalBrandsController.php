<?php

namespace App\Http\Controllers;

use App\Models\CarRentalBrand;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CarRentalBrandsController extends Controller
{
    private function resolveBrand($user)
    {
        // Try to find a seeded brand details record
        $brandDetails = CarRentalBrand::where('user_id', $user->id)
            ->orWhere('slug', Str::slug($user->company ?: $user->name))
            ->first();

        $name = $user->company ?: $user->name;
        $slug = $brandDetails ? $brandDetails->slug : Str::slug($name);
        
        $logo = $user->logo;
        if ($logo) {
            if (!str_starts_with($logo, '/') && !str_starts_with($logo, 'http')) {
                $logo = '/img/' . $logo;
            }
        } else {
            $logo = $brandDetails ? $brandDetails->logo : '/img/company_logos/default.png';
        }

        // Calculate dynamic real rating from rentals
        $rentalsQuery = \App\Models\Rental::where('supplier_id', $user->id)->whereNotNull('rate');
        $realReviewsCount = $rentalsQuery->count();

        if ($realReviewsCount > 0) {
            $realRating = round($rentalsQuery->avg('rate'), 2);
            
            // Map rating to label
            $realRatingLabel = 'Excellent';
            if ($realRating >= 9.5) {
                $realRatingLabel = 'Exceptional';
            } elseif ($realRating >= 9.0) {
                $realRatingLabel = 'Brilliant';
            } elseif ($realRating >= 8.5) {
                $realRatingLabel = 'Very Good';
            } elseif ($realRating >= 8.0) {
                $realRatingLabel = 'Good';
            } else {
                $realRatingLabel = 'Recommended';
            }
        } else {
            // Fallback if no rental rates exist yet
            $realRating = $brandDetails ? (float) $brandDetails->rating : 8.80;
            $realReviewsCount = $brandDetails ? (int) $brandDetails->review_count : 150;
            $realRatingLabel = $brandDetails ? $brandDetails->rating_label : 'Excellent';
        }

        // Fetch description prioritizing CarRentalBrand table, then user description column, then default fallback
        $description = '';
        if ($brandDetails && !empty($brandDetails->description)) {
            $description = $brandDetails->description;
        } elseif (!empty($user->description)) {
            $description = $user->description;
        } else {
            $description = "Rent a car with {$name} through Autours to get the best prices and outstanding customer support.";
        }

        return [
            'id' => $slug,
            'user_id' => $user->id,
            'name' => $name,
            'displayName' => $brandDetails ? $brandDetails->display_name : ($name . ' Car Rental'),
            'logo' => $logo,
            'rating' => (float) $realRating,
            'reviewCount' => (int) $realReviewsCount,
            'ratingLabel' => $realRatingLabel,
            'description' => $description,
        ];
    }

    public function index()
    {
        // Get all active suppliers
        $suppliers = User::where('role', 'active_supplier')->get();
        
        $formatted = $suppliers->map(function ($user) {
            return $this->resolveBrand($user);
        });

        // Calculate global stats dynamically
        $activeSupplierIds = $suppliers->pluck('id')->toArray();
        $totalBrands = $suppliers->count();
        $totalCountries = Branch::whereIn('company_id', $activeSupplierIds)
            ->where('activation', 1)
            ->distinct('country')
            ->count('country');
        $totalBranches = Branch::whereIn('company_id', $activeSupplierIds)
            ->where('activation', 1)
            ->count();

        return response()->json([
            'brands' => $formatted,
            'stats' => [
                'totalBrands' => $totalBrands,
                'totalCountries' => $totalCountries,
                'totalBranches' => $totalBranches,
            ]
        ]);
    }

    public function show($brandSlug)
    {
        // Find supplier by slug (comparing slug of company or name)
        $suppliers = User::where('role', 'active_supplier')->get();
        $matchedSupplier = null;
        $matchedBrand = null;

        foreach ($suppliers as $user) {
            $brand = $this->resolveBrand($user);
            if ($brand['id'] === strtolower($brandSlug)) {
                $matchedSupplier = $user;
                $matchedBrand = $brand;
                break;
            }
        }

        if (!$matchedSupplier) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        $countries = $this->getBrandCountriesAndBranches($matchedSupplier->id);

        return response()->json(array_merge($matchedBrand, [
            'countries' => $countries,
        ]));
    }

    public function showCountry($brandSlug, $countrySlug)
    {
        $suppliers = User::where('role', 'active_supplier')->get();
        $matchedSupplier = null;
        $matchedBrand = null;

        foreach ($suppliers as $user) {
            $brand = $this->resolveBrand($user);
            if ($brand['id'] === strtolower($brandSlug)) {
                $matchedSupplier = $user;
                $matchedBrand = $brand;
                break;
            }
        }

        if (!$matchedSupplier) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        $countries = $this->getBrandCountriesAndBranches($matchedSupplier->id);

        $matchedCountry = null;
        foreach ($countries as $country) {
            if ($country['countrySlug'] === strtolower($countrySlug)) {
                $matchedCountry = $country;
                break;
            }
        }

        if (!$matchedCountry) {
            return response()->json(['message' => 'Country details not found for this brand'], 404);
        }

        return response()->json([
            'brand' => [
                'id' => $matchedBrand['id'],
                'name' => $matchedBrand['name'],
                'displayName' => $matchedBrand['displayName'],
                'logo' => $matchedBrand['logo'],
                'rating' => $matchedBrand['rating'],
                'reviewCount' => $matchedBrand['reviewCount'],
                'ratingLabel' => $matchedBrand['ratingLabel'],
            ],
            'country' => $matchedCountry
        ]);
    }

    private function getBrandCountriesAndBranches($userId)
    {
        $branches = Branch::where('company_id', $userId)
            ->where('activation', 1)
            ->get();

        $groupedByCountry = $branches->groupBy('country');

        $countries = [];

        foreach ($groupedByCountry as $countryName => $countryBranches) {
            $countrySlug = strtolower(trim(str_replace(' ', '-', $countryName)));
            $countryCode = \App\Services\CountryCurrencyResolver::resolveCountryCode($countryName);
            if (empty($countryCode)) {
                $countryCode = 'AE';
            }

            if ($countrySlug === 'united-arab-emirates' || $countrySlug === 'uae') {
                $countrySlug = 'uae';
            } elseif ($countrySlug === 'saudi-arabia' || $countrySlug === 'saudi') {
                $countrySlug = 'saudi';
            }

            $airportBranches = [];
            $cityBranches = [];

            foreach ($countryBranches as $branch) {
                $branchNameLower = strtolower($branch->name);
                $isAirportByName = str_contains($branchNameLower, 'airport') || 
                                   str_contains($branchNameLower, 'aeroport') || 
                                   str_contains($branchNameLower, 'havalim') || 
                                   str_contains($branch->name, 'مطار');

                $isAirport = strtolower($branch->location_type) === 'airport' || 
                             $branch->airport_id !== null || 
                             $isAirportByName;

                $formattedBranch = [
                    'id' => (string) $branch->id,
                    'name' => $branch->name,
                    'type' => $isAirport ? 'airport' : 'city',
                    'city' => $branch->city,
                    'address' => $branch->adresse,
                    'phone' => $branch->phone,
                    'openingHours' => $branch->openingHours ?? '24/7',
                ];

                if ($formattedBranch['type'] === 'airport') {
                    $airportBranches[] = $formattedBranch;
                } else {
                    $cityBranches[] = $formattedBranch;
                }
            }

            // Calculate real total active vehicles in this country for this brand/supplier
            $branchIds = $countryBranches->pluck('id')->toArray();
            $totalVehicles = \App\Models\Vehicle::where('supplier', $userId)
                ->where('activation', 1)
                ->where(function($query) use ($branchIds) {
                    $query->whereIn('pickup_loc', $branchIds)
                          ->orWhereHas('branches', function($q) use ($branchIds) {
                              $q->whereIn('branches.id', $branchIds);
                          });
                })
                ->count();

            $countries[] = [
                'countrySlug' => $countrySlug,
                'countryCode' => $countryCode,
                'countryName' => $countryName,
                'countryFlag' => $this->getCountryFlagEmoji($countryCode),
                'airportBranches' => $airportBranches,
                'cityBranches' => $cityBranches,
                'totalCars' => $totalVehicles,
            ];
        }

        return $countries;
    }

    private function getCountryFlagEmoji($countryCode)
    {
        $codePoints = array_map(function ($char) {
            return 127397 + ord($char);
        }, str_split(strtoupper($countryCode)));

        return mb_convert_encoding('&#' . implode(';&#', $codePoints) . ';', 'UTF-8', 'HTML-ENTITIES');
    }
}

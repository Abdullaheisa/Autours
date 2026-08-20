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

    private function getActiveSuppliersWithData()
    {
        // Get active suppliers who have at least one active branch and active vehicle
        return User::where('role', 'active_supplier')
            ->whereNotNull('logo')
            ->where('logo', '!=', '')
            ->where('logo', '!=', 'company_logos/default.png')
            ->where('logo', '!=', '/img/company_logos/default.png')
            ->whereHas('branches', function ($q) {
                $q->where('activation', 1);
            })
            ->whereHas('vehicles', function ($q) {
                $q->where('activation', 1);
            })
            ->get();
    }

    public function index()
    {
        return \Illuminate\Support\Facades\Cache::remember('car_rental_brands_index_v2', 300, function () {
            // Get only active suppliers with real data (branches and vehicles)
            $suppliers = $this->getActiveSuppliersWithData();
            
            $formatted = $suppliers->map(function ($user) {
                return $this->resolveBrand($user);
            })->values();

            // Calculate global stats dynamically based on filtered suppliers
            $activeSupplierIds = $suppliers->pluck('id')->toArray();
            $totalBrands = $suppliers->count();
            $totalCountries = Branch::whereIn('company_id', $activeSupplierIds)
                ->where('activation', 1)
                ->distinct('country')
                ->count('country');
            $totalBranches = Branch::whereIn('company_id', $activeSupplierIds)
                ->where('activation', 1)
                ->count();

            return [
                'brands' => $formatted,
                'stats' => [
                    'totalBrands' => $totalBrands,
                    'totalCountries' => $totalCountries,
                    'totalBranches' => $totalBranches,
                ]
            ];
        });
    }

    public function show($brandSlug)
    {
        $cacheKey = 'car_rental_brand_show_' . strtolower(trim($brandSlug));

        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () use ($brandSlug) {
            $brandSlugLower = strtolower(trim($brandSlug));
            $matchedSupplier = null;

            // 1. First check if a seeded or saved CarRentalBrand matches slug
            $brandDetails = CarRentalBrand::where('slug', $brandSlugLower)->first();
            if ($brandDetails && $brandDetails->user_id) {
                $matchedSupplier = User::find($brandDetails->user_id);
            }

            // 2. If not found, match by user company or name slug directly
            if (!$matchedSupplier) {
                $suppliers = User::where('role', 'active_supplier')
                    ->whereNotNull('logo')
                    ->where('logo', '!=', '')
                    ->get();

                foreach ($suppliers as $user) {
                    $slug = Str::slug($user->company ?: $user->name);
                    if ($slug === $brandSlugLower) {
                        $matchedSupplier = $user;
                        break;
                    }
                }
            }

            if (!$matchedSupplier) {
                return null;
            }

            $matchedBrand = $this->resolveBrand($matchedSupplier);
            $countries = $this->getBrandCountriesAndBranches($matchedSupplier->id);

            return array_merge($matchedBrand, [
                'countries' => $countries,
            ]);
        });

        if (!$data) {
            return response()->json(['message' => 'Brand not found'], 404);
        }

        return response()->json($data);
    }

    public function showCountry($brandSlug, $countrySlug)
    {
        $brandResponse = $this->show($brandSlug);
        if ($brandResponse->getStatusCode() !== 200) {
            return $brandResponse;
        }

        $brandData = $brandResponse->getData(true);
        $countries = $brandData['countries'] ?? [];

        $matchedCountry = null;
        $targetCountrySlug = strtolower(trim($countrySlug));

        foreach ($countries as $country) {
            if ($country['countrySlug'] === $targetCountrySlug) {
                $matchedCountry = $country;
                break;
            }
        }

        if (!$matchedCountry) {
            return response()->json(['message' => 'Country details not found for this brand'], 404);
        }

        return response()->json([
            'brand' => [
                'id' => $brandData['id'],
                'name' => $brandData['name'],
                'displayName' => $brandData['displayName'],
                'logo' => $brandData['logo'],
                'rating' => $brandData['rating'],
                'reviewCount' => $brandData['reviewCount'],
                'ratingLabel' => $brandData['ratingLabel'],
            ],
            'country' => $matchedCountry
        ]);
    }

    private function getBrandCountriesAndBranches($userId)
    {
        // 1. Fetch all active branches for this supplier in a single fast query
        $branches = Branch::where('company_id', $userId)
            ->where('activation', 1)
            ->get();

        if ($branches->isEmpty()) {
            return [];
        }

        // 2. Fetch vehicle counts per pickup location in a single aggregate query
        $branchIds = $branches->pluck('id')->toArray();
        $vehiclesPerPickup = \App\Models\Vehicle::where('supplier', $userId)
            ->where('activation', 1)
            ->whereIn('pickup_loc', $branchIds)
            ->select('pickup_loc', \Illuminate\Support\Facades\DB::raw('count(*) as count'))
            ->groupBy('pickup_loc')
            ->pluck('count', 'pickup_loc');

        $totalActiveVehicles = \App\Models\Vehicle::where('supplier', $userId)
            ->where('activation', 1)
            ->count();

        $groupedByCountry = $branches->groupBy('country');
        $countries = [];

        foreach ($groupedByCountry as $countryName => $countryBranches) {
            $countrySlug = strtolower(trim(str_replace(' ', '-', $countryName)));
            $countryCode = \App\Services\CountryCurrencyResolver::resolveCountryCode($countryName);

            if ($countrySlug === 'united-arab-emirates' || $countrySlug === 'uae') {
                $countrySlug = 'uae';
            } elseif ($countrySlug === 'saudi-arabia' || $countrySlug === 'saudi') {
                $countrySlug = 'saudi';
            }

            $airportBranches = [];
            $cityBranches = [];
            $countryVehicleCount = 0;

            foreach ($countryBranches as $branch) {
                $branchNameLower = strtolower($branch->name);
                $isAirportByName = str_contains($branchNameLower, 'airport') || 
                                   str_contains($branchNameLower, 'aeroport') || 
                                   str_contains($branchNameLower, 'havalim') || 
                                   str_contains($branch->name, 'مطار');

                $isAirport = strtolower($branch->location_type ?? '') === 'airport' || 
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

                $countryVehicleCount += ($vehiclesPerPickup[$branch->id] ?? 0);
            }

            // If no specific pickup_loc was mapped, fallback gracefully
            if ($countryVehicleCount === 0 && $totalActiveVehicles > 0) {
                $countryVehicleCount = min($totalActiveVehicles, count($countryBranches) * 5);
            }

            $countries[] = [
                'countrySlug' => $countrySlug,
                'countryCode' => $countryCode,
                'countryName' => $countryName,
                'countryFlag' => $this->getCountryFlagEmoji($countryCode),
                'airportBranches' => $airportBranches,
                'cityBranches' => $cityBranches,
                'totalCars' => $countryVehicleCount,
            ];
        }

        return $countries;
    }

    private function getCountryFlagEmoji($countryCode)
    {
        if (empty($countryCode)) {
            return '🌐';
        }

        if (str_starts_with(strtoupper($countryCode), 'US-')) {
            return '🇺🇸';
        }

        $codePoints = array_map(function ($char) {
            return 127397 + ord($char);
        }, str_split(strtoupper($countryCode)));

        return mb_convert_encoding('&#' . implode(';&#', $codePoints) . ';', 'UTF-8', 'HTML-ENTITIES');
    }
}

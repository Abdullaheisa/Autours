<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Events\NewRental;
use App\Http\Requests\BookCarRequest;
use App\Http\Requests\CreateEditVehicle;
use App\Http\Requests\EditVehiclePrice;
use App\Http\Requests\FilterVehicleRequest;
use App\Http\Requests\GetVehiclePageRequest;
use App\Http\Requests\StoreSupplierVehicleApiRequest;
use App\Exports\VehiclesTemplateExport;
use App\Imports\VehiclesExcelImport;
use App\Models\CurrencyRate;
use App\Models\Included;
use App\Models\LocationTypeVehicle;
use App\Models\PaymentMethod;
use App\Models\PaymentMethodSupplier;
use App\Models\SupplierRentalTerm;
use App\Models\VehicleIncluded;
use App\Models\VehicleSpecification;
use App\Services\EmrJsonApiService;
use App\Services\JimpisoftApiService;
use App\Services\SurpriceApiService;
use App\Services\VehicleService;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Category;
use App\Models\LocationType;
use App\Models\Specification;
use App\Models\Vehicle;
use App\Models\Branch;
use App\Models\VehiclesPhotos;
use App\Models\Rental;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Maatwebsite\Excel\Facades\Excel;
use stdClass;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public VehicleService $vehicleService;


    public function index()
    {
        return Inertia::render('ResultsPage');
    }


    public function filter(FilterVehicleRequest $request)
    {
        try {

            $location = $request->pickupLoc;
            $dateFrom = $request->date_from;
            $dateTo = $request->date_to;

            $timeFrom = $request->time_from;
            $timeTo = $request->time_to;


            $filteredVehicles = Vehicle::query();

            if ($location) {
                $filteredVehicles->whereHas('branch', function ($q) use ($location) {
                    if (is_numeric($location)) {
                        // Direct branch ID lookup
                        $branch = Branch::find($location);
                        if ($branch) {
                            $q->where(function ($q2) use ($branch) {
                                $q2->where('branches.id', $branch->id)
                                   ->orWhere('branches.location', $branch->location)
                                   ->orWhere('branches.city', $branch->city);
                            });
                        } else {
                            $q->where('branches.id', $location);
                        }
                    } else {
                        // String location: search by location, name, city, or adresse (partial match)
                        $q->where(function ($q2) use ($location) {
                            $q2->where('branches.location', 'LIKE', "%{$location}%")
                               ->orWhere('branches.name', 'LIKE', "%{$location}%")
                               ->orWhere('branches.city', 'LIKE', "%{$location}%")
                               ->orWhere('branches.adresse', 'LIKE', "%{$location}%");
                        });
                    }
                });
            }
            $priceTax = 0;


            $currency = $request->currency;
            info("Session get ");

            if ($filteredVehicles == null) {
                return response()->json([
                    'data' => ['message' => 'There is no chosen '],
                    'status' => false
                ]);
            }
            $query = $filteredVehicles->whereHas('supplierUser', function($q) {
                $q->where('role', 'active_supplier');
            })->with('category', 'fuelPolicy', 'supplierUser.rentals.rentalRates','supplierUser.paymentMethods', 'profit', 'included', 'branch', 'locationType', 'specifications');

            if ($request->category) {
                $query->whereIn('category', $request->category);
            }
            if ($request->supplier) {

                $query->whereIn('supplier', $request->supplier);
            }
            if ($request->location_type_id) {

                $query->whereHas('locationType', function (\Illuminate\Database\Eloquent\Builder $query) use ($request) {
                    $query->whereIn('location_type_id', $request->location_type_id);
                });
            }

            if ($request->payment_methods) {

                $query->whereHas('supplierUser.paymentMethods', function (\Illuminate\Database\Eloquent\Builder $query) use ($request) {
                    $query->whereIn('payment_method_id', $request->payment_methods);
                });
            }

            if ($request->specifications) {
                $specifications = $request->specifications;
                foreach ($specifications as $specification) {
                    if ($specification && isset($specification['option']) && is_array($specification['option']) && count($specification['option']) > 0) {
                        $query->whereHas('specifications', function ($q) use ($specification) {
                            $q->where('name', $specification['name'])
                              ->whereIn('value', $specification['option']);
                        });
                    }
                }
            }

            $maxPrice = 0;
            $minPrice = 10000000;


            if (is_numeric($location)) {
                $cityBranch = Branch::find($location);
                $city = $cityBranch ? $cityBranch->location : $location;
                $branches = Branch::query()->where('location', $city)->get();
            } else {
                $city = $location;
                $branches = Branch::query()->where('location', $city)->get();
            }

            $suppliers = User::query()->whereIn('id', $branches->pluck('company_id'))->where('role', 'active_supplier')->get();
            $paymentMethods = PaymentMethod::query()->whereIn('id', PaymentMethodSupplier::query()->whereIn('supplier_id', $branches->pluck('company_id')->toArray())->get()->pluck('payment_method_id')->toArray())->get();
            $vehicles = $query->where('activation', true)->has('profit')->orderBy('id', 'asc')->get();

            // Group vehicles to ensure sidebar aggregates only count unique models
            $groupedVehicles = collect();
            $groupedKeys = [];
            foreach ($vehicles as $vehicle) {
                $supplierId = $vehicle->supplier instanceof User ? $vehicle->supplier->id : ($vehicle->getAttributes()['supplier'] ?? '');
                $categoryId = $vehicle->getAttributes()['category'] ?? '';
                $key = strtolower(trim($vehicle->name)) . '|' . $supplierId . '|' . $categoryId . '|' . $vehicle->price . '|' . $vehicle->week_price . '|' . $vehicle->month_price;
                
                if (!isset($groupedKeys[$key])) {
                    $vehicle->setAttribute('available_branches', $vehicle->branch ? [$vehicle->branch->toArray()] : []);
                    $vehicle->setAttribute('branch_vehicle_ids', $vehicle->branch ? [$vehicle->branch->id => $vehicle->id] : []);
                    $groupedKeys[$key] = $vehicle;
                    $groupedVehicles->push($vehicle);
                } else {
                    $existing = $groupedKeys[$key];
                    if ($vehicle->branch) {
                        $existingBranches = $existing->getAttributes()['available_branches'] ?? [];
                        $existingBranchIds = array_column($existingBranches, 'id');
                        
                        if (!in_array($vehicle->branch->id, $existingBranchIds)) {
                            $existingBranches[] = $vehicle->branch->toArray();
                            $existing->setAttribute('available_branches', $existingBranches);
                            
                            $branchVehicleIds = $existing->getAttributes()['branch_vehicle_ids'] ?? [];
                            $branchVehicleIds[$vehicle->branch->id] = $vehicle->id;
                            $existing->setAttribute('branch_vehicle_ids', $branchVehicleIds);
                        }
                    }
                }
            }
            $vehicles = $groupedVehicles;

            $locationTypeIds = $vehicles->flatMap(function ($vehicle) {
                return $vehicle->locationType->pluck('id');
            })->unique()->filter()->values()->toArray();
            $locationTypes = LocationType::query()->whereIn('id', $locationTypeIds)->get();

            foreach ($locationTypes as $locationType) {
                $locationType->vehicle_count = 0;
                foreach ($vehicles as $vehicle) {
                    if (isset($vehicle->locationType) && count($vehicle->locationType) && $vehicle->locationType[0]->id == $locationType->id) {
                        $locationType->vehicle_count++;
                    }
                }
            }

            foreach ($paymentMethods as $paymentMethod) {
                $paymentMethod->vehicle_count = 0;
                foreach ($vehicles as $vehicle) {
                    if ($vehicle->supplierUser && $vehicle->supplierUser->paymentMethods && count($vehicle->supplierUser->paymentMethods) && $vehicle->supplierUser->paymentMethods[0]->id == $paymentMethod->id) {
                        $paymentMethod->vehicle_count++;
                    }
                }
            }

            $paymentMethods = $paymentMethods->filter(function($method) {
                return $method->vehicle_count > 0;
            })->values();

            $categoryIds = $vehicles->pluck('category')->unique()->filter()->values()->toArray();
            $categories = Category::query()
                ->whereIn('id', $categoryIds)
                ->orderBy('sort')
                ->get();
            foreach ($categories as $category) {
                $category->vehicle_count = 0;
                foreach ($vehicles as $vehicle) {
                    if (isset($vehicle->category) && $vehicle->category == $category->id) {
                        $category->vehicle_count++;
                    }
                }
            }
            foreach ($suppliers as $supplier) {
                $supplier->vehicle_count = 0;
                foreach ($vehicles as $vehicle) {
                    $vehicleSupplierId = $vehicle->supplierUser ? $vehicle->supplierUser->id : ($vehicle->getAttributes()['supplier'] ?? null);
                    if ($vehicleSupplierId == $supplier->id) {
                        $supplier->vehicle_count++;
                    }
                }
            }

            $suppliers = $suppliers->filter(function($supplier) {
                return $supplier->vehicle_count > 0;
            })->values();

            $startDate = Carbon::parse($dateFrom);
            $endDate = Carbon::parse($dateTo);

            $diffInDays = $startDate->diffInDays($endDate);
            foreach ($vehicles as $vehicle) {
                // Use profit margins if available, default to 0% markup
                $perDayProfit   = $vehicle->profit->per_day_profit   ?? 0;
                $perWeekProfit  = $vehicle->profit->per_week_profit  ?? 0;
                $perMonthProfit = $vehicle->profit->per_month_profit ?? 0;

                if ($diffInDays >= '1' && $diffInDays < '3') {
                    $vehicle->final_price = ($vehicle->price + (($vehicle->price * $perDayProfit) / 100)) * $diffInDays;
                    $priceTax = $perDayProfit;
                } else if ($diffInDays >= '3' && $diffInDays <= '7') {
                    $vehicle->final_price = ($vehicle->week_price + (($vehicle->week_price * $perWeekProfit) / 100)) * $diffInDays;
                    $priceTax = $perWeekProfit;
                } else if ($diffInDays >= 8) {
                    $vehicle->final_price = ($vehicle->month_price + (($vehicle->month_price * $perMonthProfit) / 100)) * $diffInDays;
                    $priceTax = $perMonthProfit;
                } else {
                    // fallback: use daily price
                    $vehicle->final_price = ($vehicle->price + (($vehicle->price * $perDayProfit) / 100)) * max($diffInDays, 1);
                }
                $vehicle->final_price = round($vehicle->final_price, 2);
                if ($vehicle->branch && $currency != $vehicle->branch->currency) {
                    $rate = CurrencyRate::query()->where('currency_from', $vehicle->branch->currency)->where('currency_to', $currency)->first();
                    if ($rate != null) {
                        $vehicle->final_price *= $rate->rate;
                        $vehicle->final_price = round($vehicle->final_price, 2);
                    }
                }
                if ($vehicle->final_price >= $maxPrice) $maxPrice = round($vehicle->final_price) + 1;
                if ($vehicle->final_price <= $minPrice) $minPrice = round($vehicle->final_price);

            }

            if ($request->has('priceRange')) {
                $priceRange = (float) $request->input('priceRange');
                $vehicles = $vehicles->filter(function ($vehicle) use ($priceRange) {
                    return $vehicle->final_price <= $priceRange;
                })->values();
            }

            $vehicles = $vehicles->toArray();
            $count = count($vehicles);


            usort($vehicles, function ($a, $b) {
                if ($a["final_price"] == $b["final_price"])
                    return (0);
                return (($a["final_price"] < $b["final_price"]) ? -1 : 1);
            });
            if ($minPrice >= $maxPrice) $minPrice = 0;
            $locationName = $location;
            if (is_numeric($location)) {
                $cityBranch = Branch::find($location);
                $locationName = $cityBranch ? $cityBranch->name : $location;
            }

            $page = (int) $request->input('page', 1);
            $perPage = (int) $request->input('per_page', 15);
            $lastPage = ceil($count / $perPage) ?: 1;
            $paginatedVehicles = array_slice($vehicles, ($page - 1) * $perPage, $perPage);

            // Inject expensive metadata only for paginated subset
            $supplierCache = [];

            foreach ($paginatedVehicles as &$vehicleArr) {
                $vehicleId = $vehicleArr['id'];
                $supplierId = is_array($vehicleArr['supplier']) ? $vehicleArr['supplier']['id'] : $vehicleArr['supplier'];

                $promos = DB::select('SELECT what_is_included as promotion FROM promos JOIN included ON included.id = promos.included_id  WHERE vehicle_id = :vehicle_id', ['vehicle_id' => $vehicleId]);
                $vehicleArr['promos'] = array_map(function($p) { return $p->promotion; }, $promos);

                if (!isset($supplierCache[$supplierId])) {
                    $rentals = Rental::query()->where('supplier_id', $supplierId)->with('rentalRates.question')->whereNotNull('rate')->get();
                    
                    $questionsRate = DB::select('SELECT objective, sum(rental_rates.rate)/count(rental_rates.id)  as total_rate FROM rentals
                                            JOIN rental_rates on rental_rates.rental_id = rentals.id
                                            JOIN rate_questions on rate_questions.id = rental_rates.question_id
                                            WHERE supplier_id = :supplier_id
                                            Group By rate_questions.objective', ['supplier_id' => $supplierId]);
                                            
                    $supplierRate = round($rentals->sum('rate') / ($rentals->count() <= 0 ? 1 : $rentals->count()), 1);
                    $supplierReviewsCount = $rentals->count();
                    $rentalTerms = SupplierRentalTerm::query()->where('supplier_id', $supplierId)->join('rental_terms', 'rental_terms.id', '=', 'supplier_rental_terms.rental_term_id')->select(['title', 'description'])->get()->toArray();
                    
                    $supplierCache[$supplierId] = [
                        'questions_rate' => $questionsRate,
                        'supplier_rate' => $supplierRate,
                        'supplier_number_of_reviews' => $supplierReviewsCount,
                        'rental_terms' => $rentalTerms,
                    ];
                }

                $vehicleArr['questions_rate'] = $supplierCache[$supplierId]['questions_rate'];
                $vehicleArr['supplier_rate'] = $supplierCache[$supplierId]['supplier_rate'];
                $vehicleArr['supplier_number_of_reviews'] = $supplierCache[$supplierId]['supplier_number_of_reviews'];
                $vehicleArr['rental_terms'] = $supplierCache[$supplierId]['rental_terms'];
            }
            unset($vehicleArr);

            return [
                'location' => $locationName,
                'location_id' => is_numeric($location) ? (int)$location : null,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'filteredVehicles' => $paginatedVehicles,
                'filteredCategories' => $categories,
                'filteredSuppliers' => $suppliers,
                'filteredLocationTypes' => $locationTypes,
                'paymentMethods' => $paymentMethods,
                'count' => $count,
                'max' => $maxPrice,
                'min' => $minPrice,
                'priceTax' => $priceTax,
                'daysNumber' => $diffInDays,
                'current_page' => $page,
                'last_page' => $lastPage,
                'total' => $count
            ];
        } catch (\Exception $e) {
            return response()->json([
                'data' => ['message' => $e->getMessage()],
                'status' => false
            ], StatusCodes::SERVER_ERROR);
        }
    }

    public function search(Request $request)
    {
        $location = $request->pickupLoc;
        $date = $request->date;

        $vehicles = Vehicle::query();

        if ($location) {
            $vehicles->whereRelation('branch', 'location', $location);
        }

//         if ($date && $date !== null) {
//             $startDate = $date[0];
//             $endDate = $date[1];
//
//             $rented = Rental::query()
//             ->where('end_date', '>', $endDate)
//             ->orWhere('end_date', '>', $startDate);
//
//             $exclude = $rented->pluck('vehicle_id')->unique();
//
//             $vehicles->whereNotIn('id', $exclude);
//
//         }

        $vehicles = $vehicles->whereHas('supplierUser', function($q) {
            $q->where('role', 'active_supplier');
        })->where('activation', true);

        $results = $vehicles->with(['category', 'supplierUser'])->get();


        Session::put([
            'filteredVehicles' => $results,
            'location' => $location,
            'date' => $date,
            'currency' => $request->currency
        ]);

        return redirect()->intended('results');
    }

    public function updatePrice(EditVehiclePrice $request)
    {
        try {

            $existingVehicle = Vehicle::find($request->id);

            if ($request->has('price')) {
                $existingVehicle->price = $request->price;
            }

            if ($request->has('week_price')) {
                $existingVehicle->week_price = $request->week_price;
            }

            if ($request->has('month_price')) {
                $existingVehicle->month_price = $request->month_price;
            }
            $existingVehicle->save();
            return response()->json([
                'data' => $existingVehicle,
                'status' => true
            ]);
        } catch (\Exception $e) {
            return response()->json([], StatusCodes::SERVER_ERROR);
        }
    }

    public function create(CreateEditVehicle $request)
    {
        DB::beginTransaction();
        if ($request->update === '1') {

            $existingVehicle = Vehicle::find($request->id);
            $item = $existingVehicle;
            if (!$existingVehicle) {
                return response()->json(['error' => 'Vehicle not found'], 404);
            }

            if ($request->has('photo')) {
                $existingVehicle->photo = $request->photo;
            }

            if ($request->has('name')) {
                $existingVehicle->name = $request->name;
            }

            if ($request->has('description')) {
                $newDescription = (string) $request->description;
                if ($existingVehicle->description && preg_match('/(\[(?:SURPRICE-GROUP-ID|JIMPI-GROUP-ID|EMR-GROUP-ID|RENTLY-MODEL-ID):[^\]]+\])/', $existingVehicle->description, $matches)) {
                    $tag = $matches[1];
                    if (!str_contains($newDescription, $tag)) {
                        $newDescription = $tag . ' ' . ltrim($newDescription);
                    }
                }
                $existingVehicle->description = $newDescription;
            }

            if ($request->has('price')) {
                $existingVehicle->price = $request->price;
            }

            if ($request->has('week_price')) {
                $existingVehicle->week_price = $request->week_price;
            }
            if ($request->has('fuel_policy')) {
                $existingVehicle->fuel_policy_id = $request->fuel_policy;
            }

            if ($request->has('month_price')) {
                $existingVehicle->month_price = $request->month_price;
            }
            if ($request->has('instant_confirmation')) {
                $existingVehicle->instant_confirmation = $request->instant_confirmation == 'false' ? 0 : 1;
            }


            if ($request->has('pickupLoc')) {
                if (is_numeric($request->pickupLoc)) {
                    $existingVehicle->pickup_loc = $request->pickupLoc;
                } else {
                    $branch = Branch::query()->where('location', $request->pickupLoc)->first();
                    if ($branch) {
                        $existingVehicle->pickup_loc = $branch->id;
                    }
                }
            }

            if ($request->has('category')) {
                $existingVehicle->category = $request->get('category');
            }


            if ($request->has('location_types')) {
                LocationTypeVehicle::query()->where('vehicle_id', $existingVehicle->id)->delete();
                $locTypes = is_array($request->location_types) ? $request->location_types : [$request->location_types];
                foreach ($locTypes as $locTypeId) {
                    if ($locTypeId && $locTypeId !== 'undefined' && $locTypeId !== 'null') {
                        LocationTypeVehicle::query()->insert([
                            'vehicle_id' => $existingVehicle->id,
                            'location_type_id' => $locTypeId
                        ]);
                    }
                }
            }

            $existingVehicle->save();
            if ($request->has('specifications')) {
                VehicleSpecification::query()->where('vehicle_id', $existingVehicle->id)->delete();
                $specifications = json_decode($request->specifications);
                foreach ($specifications as $specification) {
                    if ($specification->selectedOption !== "") {
                        VehicleSpecification::insert(
                            [
                                'vehicle_id' => $existingVehicle->id,
                                'name' => isset($specification->name) ? $specification->name : '',
                                'value' => isset($specification->selectedOption) ? $specification->selectedOption : '',
                                'icon' => isset($specification->icon) ? $specification->icon : '',
                                'created_at' => Carbon::now()->toDateTimeString(),
                                'updated_at' => Carbon::now()->toDateTimeString()
                            ]
                        );
                    }
                }
            }
            if ($request->has('included')) {
                $included = explode(',', $request->included);
                VehicleIncluded::query()->where('vehicle_id', $request->id)->delete();
                foreach ($included as $include) {
                    $includeId = Included::query()->where('what_is_included', $include)->first();
                    if(!is_null($includeId)){
                        VehicleIncluded::insert(['vehicle_id' => $request->id, 'included_id' => $includeId->id]);
                    }
                }
            }

        } else {

            $item = new Vehicle();

            if ($request->has('photo')) {
                $item->photo = $request->photo;
            }

            if ($request->has('name')) {
                $item->name = $request->name;
            }

            if ($request->has('description')) {
                $item->description = $request->description;
            }
            if ($request->has('instant_confirmation')) {
                $item->instant_confirmation = $request->instant_confirmation ? 1 : 0;
            }
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            $item->supplier = $user->id;

            if ($request->has('price')) {
                $item->price = $request->price;
            }
            if ($request->has('fuel_policy')) {
                $item->fuel_policy_id = $request->fuel_policy;
            }

            if ($request->has('week_price')) {
                $item->week_price = $request->week_price;
            }

            if ($request->has('month_price')) {
                $item->month_price = $request->month_price;
            }


            if ($request->has('pickupLoc')) {
                $item->pickup_loc = $request->pickupLoc;
            }

            if ($request->has('category')) {
                $item->category = $request->category;
            }


            $item->save();
            if ($request->has('location_types')) {
                $locTypes = is_array($request->location_types) ? $request->location_types : [$request->location_types];
                foreach ($locTypes as $locTypeId) {
                    if ($locTypeId && $locTypeId !== 'undefined' && $locTypeId !== 'null') {
                        LocationTypeVehicle::query()->insert([
                            'vehicle_id' => $item->id,
                            'location_type_id' => $locTypeId
                        ]);
                    }
                }
            }
            if ($request->has('specifications')) {
                $specifications = json_decode($request->specifications);
                foreach ($specifications as $specification) {
                    VehicleSpecification::insert(
                        [
                            'vehicle_id' => $item->id,
                            'name' => $specification->name,
                            'value' => $specification->option,
                            'icon' => $specification->icon,
                        ]
                    );
                }
            }
            if ($request->has('included')) {
                $included = explode(',', $request->included);
                foreach ($included as $include) {
                    VehicleIncluded::insert(['vehicle_id' => $item->id, 'included_id' => $include]);
                }
            }
        }
        DB::commit();

        if ($request->update !== '1') {
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "A new vehicle '{$item->name}' has been added by supplier '{$user->name}' (ID: {$user->id}). Please assign a profit margin to this vehicle.",
                    function ($message) use ($item, $user) {
                        $message->to(['admin@autours.net', 'contact@autours.net'])
                                ->subject("New Vehicle Added: {$item->name}");
                    }
                );
            } catch (\Exception $mailEx) {
                info("Failed sending vehicle creation email alert: " . $mailEx->getMessage());
            }
        }

        return response()->json([
            'data' => $item,
            'status' => true
        ]);
    }

    public function createExternal(StoreSupplierVehicleApiRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!in_array($user->role, ['supplier', 'active_supplier'], true)) {
            return response()->json([
                'status' => false,
                'message' => 'Only suppliers can create vehicles using this API.',
            ], StatusCodes::FORBIDDEN);
        }

        DB::beginTransaction();
        $storedImageName = null;

        try {
            $photoReference = $request->photo;

            // Handle photo upload - accepts both 'photo' and 'car_photo' field names
            $photoFile = $request->file('photo') ?? $request->file('car_photo');
            if ($photoFile) {
                $image = $photoFile;
                $safeOriginalName = Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME));
                $imageName = $safeOriginalName . '_' . Str::slug($request->name) . '_vehicle_photo_' . time() . '.' . $image->extension();

                $photosDirectory = public_path('img/vehicles');
                if (!File::exists($photosDirectory)) {
                    File::makeDirectory($photosDirectory, 0755, true);
                }

                $image->move($photosDirectory, $imageName);
                $storedImageName = $imageName;

                $vehiclePhoto = VehiclesPhotos::query()->create([
                    'photo' => $imageName,
                    'name' => $request->name,
                ]);

                $photoReference = (string) $vehiclePhoto->id;
            }

            $vehicle = new Vehicle();
            $vehicle->photo = $photoReference;
            $vehicle->name = $request->name;
            $vehicle->description = $request->description;
            $vehicle->supplier = $user->id;
            $vehicle->price = $request->price;
            $vehicle->week_price = $request->week_price;
            $vehicle->month_price = $request->month_price;
            $vehicle->pickup_loc = $request->pickup_loc;
            $vehicle->category = $request->category;
            $vehicle->fuel_policy_id = $request->fuel_policy_id;
            $vehicle->instant_confirmation = $request->boolean('instant_confirmation');
            $vehicle->activation = $request->has('activation') ? $request->boolean('activation') : true;
            $vehicle->save();

            if ($request->filled('location_types')) {
                $locationTypes = collect($request->location_types)
                    ->unique()
                    ->map(fn ($locationTypeId) => [
                        'vehicle_id' => $vehicle->id,
                        'location_type_id' => $locationTypeId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                    ->values()
                    ->all();

                LocationTypeVehicle::query()->insert($locationTypes);
            }

            if ($request->filled('specifications')) {
                $specifications = collect($request->specifications)
                    ->map(fn ($specification) => [
                        'vehicle_id' => $vehicle->id,
                        'name' => $specification['name'],
                        'value' => $specification['value'],
                        'icon' => $specification['icon'] ?? '',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                    ->values()
                    ->all();

                VehicleSpecification::query()->insert($specifications);
            }

            // Handle included - accepts both IDs and names
            if ($request->filled('included')) {
                $includedInput = $request->included;
                $includedIds = [];

                foreach ($includedInput as $item) {
                    if (is_numeric($item)) {
                        // It's an ID
                        $includedIds[] = (int) $item;
                    } else {
                        // It's a name - search for matching included item
                        $includedItem = Included::query()
                            ->whereRaw('LOWER(what_is_included) LIKE ?', ['%' . strtolower(trim($item)) . '%'])
                            ->first();

                        if ($includedItem) {
                            $includedIds[] = $includedItem->id;
                        }
                    }
                }

                if (!empty($includedIds)) {
                    $included = collect($includedIds)
                        ->unique()
                        ->map(fn ($includedId) => [
                            'vehicle_id' => $vehicle->id,
                            'included_id' => $includedId,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ])
                        ->values()
                        ->all();

                    VehicleIncluded::query()->insert($included);
                }
            }

            DB::commit();

            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "A new vehicle '{$vehicle->name}' has been added by external supplier '{$user->name}' (ID: {$user->id}). Please assign a profit margin to this vehicle.",
                    function ($message) use ($vehicle, $user) {
                        $message->to(['admin@autours.net', 'contact@autours.net'])
                                ->subject("New External Vehicle Added: {$vehicle->name}");
                    }
                );
            } catch (\Exception $mailEx) {
                info("Failed sending external vehicle creation email alert: " . $mailEx->getMessage());
            }

            $vehicle->load(['category', 'branch', 'fuelPolicy', 'locationType', 'included', 'specifications']);

            return response()->json([
                'status' => true,
                'message' => 'Vehicle created successfully',
                'data' => $vehicle,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();

            if ($storedImageName !== null) {
                File::delete(public_path('img/vehicles/' . $storedImageName));
            }

            return response()->json([
                'status' => false,
                'message' => 'Failed to create vehicle',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Update vehicle price for external supplier API.
     *
     * @param Request $request
     * @param int $vehicleId
     * @return JsonResponse
     */
    public function updatePriceExternal(Request $request, int $vehicleId): JsonResponse
    {
        $validated = $request->validate([
            'price' => 'sometimes|required|numeric|between:1,999999.99',
            'week_price' => 'sometimes|required|numeric|between:1,999999.99',
            'month_price' => 'sometimes|required|numeric|between:1,999999.99',
        ]);

        // At least one price field must be provided
        if (empty($validated)) {
            return response()->json([
                'status' => false,
                'message' => 'At least one price field (price, week_price, month_price) is required.',
            ], StatusCodes::BAD_REQUEST);
        }

        $supplier = $request->user();

        $vehicle = Vehicle::query()
            ->where('id', $vehicleId)
            ->where('supplier', $supplier->id)
            ->first();

        if (!$vehicle) {
            return response()->json([
                'status' => false,
                'message' => 'Vehicle not found or you do not have permission to update it.',
            ], 404);
        }

        try {
            if (isset($validated['price'])) {
                $vehicle->price = $validated['price'];
            }

            if (isset($validated['week_price'])) {
                $vehicle->week_price = $validated['week_price'];
            }

            if (isset($validated['month_price'])) {
                $vehicle->month_price = $validated['month_price'];
            }

            $vehicle->save();

            return response()->json([
                'status' => true,
                'message' => 'Vehicle price updated successfully.',
                'data' => [
                    'id' => $vehicle->id,
                    'name' => $vehicle->name,
                    'price' => $vehicle->price,
                    'week_price' => $vehicle->week_price,
                    'month_price' => $vehicle->month_price,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update vehicle price.',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Get all vehicles for external supplier API.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getVehiclesExternal(Request $request): JsonResponse
    {
        $supplier = $request->user();

        $query = Vehicle::query()
            ->where('supplier', $supplier->id);

        if ($request->filled('branch_id')) {
            $query->where('pickup_loc', $request->branch_id);
        }

        if ($request->filled('country')) {
            $query->whereHas('branch', function ($q) use ($request) {
                $q->where('country', $request->country);
            });
        }

        if ($request->filled('address')) {
            $query->whereHas('branch', function ($q) use ($request) {
                $q->where('adresse', 'LIKE', '%' . $request->address . '%')
                  ->orWhere('location', 'LIKE', '%' . $request->address . '%')
                  ->orWhere('city', 'LIKE', '%' . $request->address . '%');
            });
        }

        if ($request->filled('search')) {
            $query->where('name', 'LIKE', '%' . $request->search . '%');
        }

        $vehicles = $query->with(['category', 'branch', 'fuelPolicy', 'vehiclePhoto'])
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        foreach ($vehicles->items() as $vehicle) {
            $promos = DB::select('SELECT what_is_included as promotion FROM promos JOIN included ON included.id = promos.included_id  WHERE vehicle_id = :vehicle_id', ['vehicle_id' => $vehicle->id]);
            $vehicle->setAttribute('promos', array_map(function($p) { return $p->promotion; }, $promos));
        }

        return response()->json([
            'status' => true,
            'data' => $vehicles,
        ]);
    }




    public function getFilteredSpecifications(Request $request)
    {
        $specifications = Specification::query()->get();

        if ($request->has('vehicle_ids')) {
            foreach ($specifications as $specification) {
                $arrayX = [];
                foreach ($specification->options as $option) {
                    $x = new \stdClass();
                    $x->value = $option;
                    $x->vehicle_count = VehicleSpecification::query()
                        ->where('name', $specification->name)
                        ->where('value', $option)
                        ->whereIn('vehicle_id', $request->vehicle_ids)
                        ->count();
                    $arrayX[] = $x;
                }
                $specification->options = $arrayX;
            }
        }
        return response()->json($specifications);

    }


    public function getCategories()
    {

        return response()->json(Category::all());

    }

    public function deleteCategories(Request $request)
    {
        Category::where('id', $request->id)->delete();

        return $this->getCategories();

    }


    public function getLocations()
    {
        $locations = Branch::query()
            ->orderBy('name')
            ->get()
            ->unique(function ($branch) {
                return $branch->airport_id ? 'airport_' . $branch->airport_id : mb_strtolower(trim($branch->name));
            })
            ->values();
        return response()->json($locations);
    }

    public function show(Request $request)
    {
        $vehicles = Vehicle::query();

        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
        $branchId = $request->get('branch_id');
        $supplierId = $request->get('supplier');
        $categoryId = $request->get('category_id');
        $search = $request->get('search');

        if ($user) {
            $id = $user->id;
            $role = $user->role;

            if ($role === 'active_supplier') {
                $vehicles->where('supplier', $id);
            }
        }

        if (!is_null($supplierId)) {
            $vehicles->where('supplier', $supplierId);
        }

        if ($branchId != null) {
            $vehicles->where('pickup_loc', $branchId);
        }

        if ($categoryId != null) {
            $vehicles->where('category', $categoryId);
        }

        if ($search != null) {
            $vehicles->where('name', 'LIKE', '%' . $search . '%');
        }

        $query = $vehicles->with('category', 'supplierUser', 'branch', 'fuelPolicy')->orderBy('id');

        if ($request->has('paginate')) {
            $data = $query->paginate($request->get('per_page', 10));
        } else {
            $data = $query->get();
        }

        $data->each(function ($vehicle) {
            $vehicle->activation = $vehicle->activation == 1;
            $vehicle->load(['rentals' => function ($query) {
                $query->where('order_status', 1);
            }]);
            $vehicle->setAttribute('rentals_count', $vehicle->rentals->count());
        });

        return response()->json($data);
    }

    public function getVehicle(GetVehiclePageRequest $request)
    {
        try {

            $location = $request->location ?? $request->pickupLoc;
            $currency = $request->currency;
            $selectedVehicle = Vehicle::where('id', $request->id)
                ->whereHas('supplierUser', function($q) {
                    $q->where('role', 'active_supplier');
                })
                ->with('locationType','category', 'fuelPolicy', 'branch', 'included', 'specifications', 'supplierUser.fuelPolicy', 'supplierUser.rentals.rentalRates','supplierUser.paymentMethods', 'fuelPolicy')->first();

            if (!$selectedVehicle) {
                return response()->json([
                    'message' => 'Vehicle not found or supplier is inactive.',
                    'status' => false
                ], 404);
            }

            if ($location && $selectedVehicle) {
                $selectedVehicle->available_branches = $selectedVehicle->branch ? collect([$selectedVehicle->branch]) : collect([]);
            }
            $startDate = Carbon::parse($request->date_from);
            $endDate = Carbon::parse($request->date_to);
            $diffInDays = $startDate->diffInDays($endDate);

            if ($diffInDays >= '1' && $diffInDays < '3') {
                $selectedVehicle->final_price = ($selectedVehicle->price + (($selectedVehicle->price * $selectedVehicle->profit->per_day_profit) / 100)) * $diffInDays;
                $selectedVehicle->profit_price =  (($selectedVehicle->price * $selectedVehicle->profit->per_day_profit) / 100) * $diffInDays;
            } else if ($diffInDays >= '3' && $diffInDays <= '7') {
                $selectedVehicle->final_price = ($selectedVehicle->week_price + (($selectedVehicle->week_price * $selectedVehicle->profit->per_week_profit) / 100)) * $diffInDays;
                $selectedVehicle->profit_price =  (($selectedVehicle->week_price * $selectedVehicle->profit->per_week_profit) / 100) * $diffInDays;

            } else if ($diffInDays >= '8' && $diffInDays < '30') {
                $selectedVehicle->final_price = ($selectedVehicle->month_price + (($selectedVehicle->month_price * $selectedVehicle->profit->per_month_profit) / 100)) * $diffInDays;
                $selectedVehicle->profit_price =  (($selectedVehicle->month_price * $selectedVehicle->profit->per_month_profit) / 100) * $diffInDays;

            }


            if ($currency != $selectedVehicle->branch->currency) {
                $rate = CurrencyRate::query()->where('currency_from', $selectedVehicle->branch->currency)->where('currency_to', $currency)->first();
                if ($rate != null) {
                    $selectedVehicle->final_price *= $rate->rate;
                }
            }
            $selectedVehicle->final_price = round($selectedVehicle->final_price, 2);
            $selectedVehicle->rental_terms = SupplierRentalTerm::query()->where('supplier_id', $selectedVehicle->supplierUser->id)->join('rental_terms', 'rental_terms.id', '=', 'supplier_rental_terms.rental_term_id')->select(['title', 'description'])->get();

            $rentals = Rental::query()->where('supplier_id', $selectedVehicle->supplierUser->id)->whereNotNull('rate')->get();
            $selectedVehicle->supplier_rate = round($rentals->sum('rate') / ($rentals->count() <= 0 ? 1 : $rentals->count()), 1);
            $selectedVehicle->supplier_number_of_reviews = $rentals->count();

            return response()->json([
                'data' => [
                    'vehicle' => $selectedVehicle,
                    'date_from' => $startDate->toDateString(),
                    'date_to' => $endDate->toDateString(),
                    'time_from' => $endDate->toTimeString(),
                    'time_to' => $endDate->toTimeString(),
                    'days' => $diffInDays,
                    'currency' => $currency,
                    'location' => $location
                ],
                'status' => true
            ]);
        } catch (\Exception $e) {

            return response()->json([
                'message' => $e->getMessage(),
                'status' => false
            ], StatusCodes::SERVER_ERROR);
        }
    }


    public function createPhotos(Request $request)
    {
        if ($request->has('id') && !empty($request->id)) {
            $item = VehiclesPhotos::findOrFail($request->id);
        } else {
            $item = new VehiclesPhotos();
        }

        if ($request->has('name')) {
            $item->name = $request->name;
        }

        if ($request->hasFile('photo')) {
            // Delete old photo file if it exists and we are updating
            if (!empty($item->photo)) {
                $oldPath = public_path('img/vehicles/' . $item->photo);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $image = $request->file('photo');
            $image_name = preg_replace('/\.jpg/', '', str_replace(' ', '_', $request->file('photo')->getClientOriginalName())) . "_" . $request->name . "_vehicle_photo" . "." . $request->file('photo')->extension();
            $image->move(public_path('img/vehicles'), $image_name);

            $item->photo = $image_name;
        }

        $item->save();

        return response(1);
    }

    public function getPhotos()
    {

        return response()->json(VehiclesPhotos::orderBy('name', 'asc')->get());

    }

    public function deletePhotos(Request $request)
    {
        $photo = VehiclesPhotos::findOrFail($request->id);
        $photoPath = public_path('img\vehicles\\' . $photo->photo);
        File::delete($photoPath);
        $photo->delete();
        return $this->getPhotos();
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        if (!is_numeric($id) || !is_int((int)$id)) {
            return response()->json([
                'data' => ['message' => 'id is not valid id'],
                'status' => false
            ], StatusCodes::SERVER_ERROR);
        }
        $vehicle = Vehicle::query()->with(['branch', 'category', 'included', 'locationType', 'fuelPolicy'])->find($id);
        $vehicle->what_is_included = $vehicle->included->pluck('what_is_included');
        $vehicle->specifications = VehicleSpecification::query()->where("vehicle_id", $id)->orderBy('name')->get();
        $specs = Specification::query()->orderBy('name')->get();
        foreach ($specs as $spec) {
            $spec->selectedOption = "";
            foreach ($vehicle->specifications as $specification) {
                if ($specification['name'] == $spec->name) {
                    $spec->selectedOption = $specification['value'];
                }
            }
        }
        $vehicle->specifications = $specs;
        return response()->json([
            'data' => $vehicle,
            'status' => true
        ]);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            $query = Vehicle::query()->where('id', $id);
            // If called via external API with authenticated user, restrict to their vehicles
            if ($user) {
                $query->where('supplier', $user->id);
            }
            $deleted = $query->delete();
            if (!$deleted) {
                return response()->json(['status' => false, 'message' => 'Vehicle not found or not authorized'], 404);
            }
            return response()->json([
                'status' => true,
                'message' => 'deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function store(Request $request)
    {
        //
    }

    public function updateActivation(Request $request)
    {
        $user = $request->user();
        $query = Vehicle::query()->where('id', $request->vehicle_id);
        // If called via external API with authenticated user, restrict to their vehicles
        if ($user) {
            $query->where('supplier', $user->id);
        }
        $vehicle = $query->first();
        if ($vehicle) {
            $vehicle->update(['activation' => $request->activation]);
            return response()->json(['status' => true]);
        }
        return response()->json(['status' => false, 'message' => 'Vehicle not found'], 404);
    }

    public function bulkUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
            'branch' => 'required|integer'
        ]);
        DB::beginTransaction();
        try {

            $supplierId = $request->supplier;
            if (empty($supplierId)) {
                $supplierId = auth()->user()->id;
            }

            $import = new VehiclesExcelImport(
                $request->branch,
                $supplierId
            );

            Excel::import($import, $request->file('file'));

            $vehicleCount = count($import->vehicleIds);
            $errors = $import->errors;

            // If we have some vehicles but also some errors, it's a partial success
            if ($vehicleCount > 0 && !empty($errors)) {
                DB::commit();
                return response()->json([
                    'status' => true,
                    'data' => [
                        'vehicles_imported' => $vehicleCount,
                        'vehicle_ids' => $import->vehicleIds
                    ],
                    'warnings' => $errors,
                    'message' => "Uploaded {$vehicleCount} vehicle(s) successfully. Some rows had errors."
                ], StatusCodes::SUCCESS);
            }

            // If no vehicles and we have errors, it's a failure
            if ($vehicleCount === 0 && !empty($errors)) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'errors' => $errors,
                    'message' => 'No vehicles could be imported due to errors'
                ], StatusCodes::BAD_REQUEST);
            }

            // If no vehicles and no errors, the file might be empty or wrong format
            if ($vehicleCount === 0) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'No vehicles found in the file. Please check the format matches the template.'
                ], StatusCodes::BAD_REQUEST);
            }

            DB::commit();
            return response()->json([
                'status' => true,
                'data' => [
                    'vehicles_imported' => $vehicleCount,
                    'vehicle_ids' => $import->vehicleIds
                ],
                'message' => "Uploaded {$vehicleCount} vehicle(s) successfully"
            ], StatusCodes::SUCCESS);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }

    }

    /**
     * Download the bulk upload template Excel file
     *
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadBulkUploadTemplate()
    {
        return Excel::download(
            new VehiclesTemplateExport(),
            'vehicles_bulk_upload_template.xlsx'
        );
    }

    /**
     * Refresh EMR prices for a specific branch/city and date range.
     * Cached for 15 minutes to avoid hammering the EMR API.
     */
    public function refreshEmrPrices(Request $request)
    {
        try {
            $location = $request->pickupLoc;
            $dateFrom = $request->date_from;
            $dateTo = $request->date_to;

            if (empty($location) || empty($dateFrom) || empty($dateTo)) {
                return response()->json([
                    'status' => false,
                    'message' => 'pickupLoc, date_from, and date_to are required.'
                ], 422);
            }

            $cacheKey = "emr_prices:v2:{$location}:{$dateFrom}:{$dateTo}";

            if ($cached = Cache::get($cacheKey)) {
                return response()->json([
                    'status' => true,
                    'fresh' => false,
                    'cached_at' => $cached['cached_at'],
                    'message' => 'Prices served from cache.',
                    'data' => $cached['data']
                ]);
            }

            $supplierUser = User::firstOrCreate(
                ['email' => 'alicansarp@emrcarrental.com'],
                [
                    'name' => 'Turev Rent (EMR)',
                    'role' => 'active_supplier',
                    'password' => Hash::make(Str::random(32)),
                    'company' => 'Turev Rent',
                ]
            );

            if (is_numeric($location)) {
                $branches = Branch::where('id', $location)
                    ->where('company_id', $supplierUser->id)
                    ->whereNotNull('station_id')
                    ->get();
            } else {
                $branches = Branch::where('location', $location)
                    ->where('company_id', $supplierUser->id)
                    ->whereNotNull('station_id')
                    ->get();
            }

            if ($branches->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No EMR branches found for the given location.'
                ], 404);
            }

            $service = new EmrJsonApiService();
            $pickupDateTime = $dateFrom . ' 10:00';
            $dropoffDateTime = $dateTo . ' 10:00';

            $updatedVehicles = 0;
            $branchResults = [];

            foreach ($branches as $branch) {
                $apiCurrency = match ($branch->currency) {
                    'TRY' => 'TL',
                    'EUR' => 'EURO',
                    default => 'TL',
                };

                $cars = $service->getAvailableCars(
                    $branch->station_id,
                    $branch->station_id,
                    $pickupDateTime,
                    $dropoffDateTime,
                    $apiCurrency
                );

                $branchResults[$branch->id] = [];

                foreach ($cars as $car) {
                    $groupId = (string) ($car['group_id'] ?? '');
                    $dailyRental = (float) str_replace(',', '.', (string) ($car['daily_rental'] ?? 0));

                    if (empty($groupId) || $dailyRental <= 0) {
                        continue;
                    }

                    $vehicle = Vehicle::where('description', 'LIKE', "%[EMR-GROUP-ID:{$groupId}]%")
                        ->where('pickup_loc', $branch->id)
                        ->first();

                    if ($vehicle) {
                        $vehicle->update([
                            'price' => $dailyRental,
                            'week_price' => round($dailyRental * 7, 2),
                            'month_price' => round($dailyRental * 30, 2),
                            'activation' => true,
                        ]);
                        $updatedVehicles++;
                    }

                    $branchResults[$branch->id][$groupId] = [
                        'day_value' => $dailyRental,
                        'total_value' => (float) str_replace(',', '.', (string) ($car['total_rental'] ?? 0)),
                        'currency' => $car['currency'] ?? $apiCurrency,
                        'days' => (int) ($car['days'] ?? 1),
                    ];
                }
            }

            $result = [
                'branches_updated' => $branches->pluck('id')->toArray(),
                'vehicles_updated' => $updatedVehicles,
                'prices' => $branchResults,
            ];

            Cache::put($cacheKey, [
                'data' => $result,
                'cached_at' => now()->toIso8601String(),
            ], now()->addMinutes(15));

            return response()->json([
                'status' => true,
                'fresh' => true,
                'message' => 'Prices refreshed successfully.',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('EMR price refresh failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Price refresh failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refresh Jimpisoft prices for a specific branch/city and date range.
     * Cached for 15 minutes to avoid hammering the Jimpisoft API.
     */
    public function refreshJimpisoftPrices(Request $request)
    {
        try {
            $location = $request->pickupLoc;
            $dateFrom = $request->date_from;
            $dateTo = $request->date_to;

            if (empty($location) || empty($dateFrom) || empty($dateTo)) {
                return response()->json([
                    'status' => false,
                    'message' => 'pickupLoc, date_from, and date_to are required.'
                ], 422);
            }

            $cacheKey = "jimpisoft_prices:v2:{$location}:{$dateFrom}:{$dateTo}";

            if ($cached = Cache::get($cacheKey)) {
                return response()->json([
                    'status' => true,
                    'fresh' => false,
                    'cached_at' => $cached['cached_at'],
                    'message' => 'Prices served from cache.',
                    'data' => $cached['data']
                ]);
            }

            $supplierUser = User::firstOrCreate(
                ['email' => 'Jincy@drivus.ae'],
                [
                    'name' => 'Drivus',
                    'role' => 'active_supplier',
                    'password' => Hash::make(Str::random(32)),
                    'company' => 'Drivus',
                ]
            );

            if (is_numeric($location)) {
                $branches = Branch::where('id', $location)
                    ->where('company_id', $supplierUser->id)
                    ->whereNotNull('station_id')
                    ->get();
            } else {
                $branches = Branch::where('location', $location)
                    ->where('company_id', $supplierUser->id)
                    ->whereNotNull('station_id')
                    ->get();
            }

            if ($branches->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No Jimpisoft branches found for the given location.'
                ], 404);
            }

            $vehicles = Vehicle::where('supplier', $supplierUser->id)
                ->where('description', 'LIKE', '%[JIMPI-GROUP-ID:%')
                ->get();

            $groupIds = [];
            $vehicleByGroup = [];
            foreach ($vehicles as $v) {
                if (preg_match('/\[JIMPI-GROUP-ID:([^\]]+)\]/', $v->description, $m)) {
                    $groupId = $m[1];
                    $groupIds[] = $groupId;
                    $vehicleByGroup[$groupId][$v->pickup_loc] = $v;
                }
            }

            $groupIds = array_values(array_unique($groupIds));

            if (empty($groupIds)) {
                return response()->json([
                    'status' => false,
                    'message' => 'No Jimpisoft vehicles found.'
                ], 404);
            }

            $service = new JimpisoftApiService();
            $pickupDateTime = $dateFrom . ' 10:00';
            $dropoffDateTime = $dateTo . ' 10:00';

            $updatedVehicles = 0;
            $branchResults = [];

            if ($branches->count() === 1) {
                $branch = $branches->first();
                $prices = $service->getMultiplePrices($groupIds, $pickupDateTime, $dropoffDateTime, $branch->station_id);

                foreach ($prices as $groupId => $priceData) {
                    $dayValue = $priceData['day_value'] ?? null;
                    if ($dayValue === null || $dayValue <= 0) {
                        continue;
                    }

                    $vehicle = $vehicleByGroup[$groupId][$branch->id] ?? null;
                    if ($vehicle) {
                        // Only update dynamic daily rate, leave sync-calculated week/month alone
                        $vehicle->update([
                            'price' => $dayValue,
                        ]);
                        $updatedVehicles++;
                    }
                }

                $branchResults[$branch->id] = $prices;
            } else {
                $stationToBranchMap = [];
                foreach ($branches as $branch) {
                    $stationToBranchMap[$branch->station_id] = $branch->id;
                }

                $stationPrices = $service->getMultiplePricesForStations(
                    $groupIds,
                    $pickupDateTime,
                    $dropoffDateTime,
                    $stationToBranchMap,
                    5
                );

                foreach ($stationPrices as $branchId => $prices) {
                    $branchResults[$branchId] = $prices;

                    foreach ($prices as $groupId => $priceData) {
                        $dayValue = $priceData['day_value'] ?? null;
                        if ($dayValue === null || $dayValue <= 0) {
                            continue;
                        }

                        $vehicle = $vehicleByGroup[$groupId][$branchId] ?? null;
                        if ($vehicle) {
                            // Only update dynamic daily rate, leave sync-calculated week/month alone
                            $vehicle->update([
                                'price' => $dayValue,
                            ]);
                            $updatedVehicles++;
                        }
                    }
                }
            }

            $result = [
                'branches_updated' => $branches->pluck('id')->toArray(),
                'vehicles_updated' => $updatedVehicles,
                'prices' => $branchResults,
            ];

            Cache::put($cacheKey, [
                'data' => $result,
                'cached_at' => now()->toIso8601String(),
            ], now()->addMinutes(15));

            return response()->json([
                'status' => true,
                'fresh' => true,
                'message' => 'Prices refreshed successfully.',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Jimpisoft price refresh failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Price refresh failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refresh Surprice prices for a specific branch/city and date range.
     * Cached for 15 minutes to avoid hammering the Surprice API.
     */
    public function refreshSurpricePrices(Request $request)
    {
        try {
            $location = $request->pickupLoc;
            $dateFrom = $request->date_from;
            $dateTo = $request->date_to;

            if (empty($location) || empty($dateFrom) || empty($dateTo)) {
                return response()->json([
                    'status' => false,
                    'message' => 'pickupLoc, date_from, and date_to are required.'
                ], 422);
            }

            $cacheKey = "surprice_prices:v2:{$location}:{$dateFrom}:{$dateTo}";

            if ($cached = Cache::get($cacheKey)) {
                return response()->json([
                    'status' => true,
                    'fresh' => false,
                    'cached_at' => $cached['cached_at'],
                    'message' => 'Prices served from cache.',
                    'data' => $cached['data']
                ]);
            }

            $supplierUser = User::firstOrCreate(
                ['email' => 'a.racko@surpricemobility.com'],
                [
                    'name' => 'Surprice Mobility',
                    'role' => 'active_supplier',
                    'password' => Hash::make('Qrentals@12345'),
                    'company' => 'Surprice',
                ]
            );

            if (is_numeric($location)) {
                $branches = Branch::where('id', $location)
                    ->where('company_id', $supplierUser->id)
                    ->whereNotNull('station_id')
                    ->get();
            } else {
                $branches = Branch::where('location', $location)
                    ->where('company_id', $supplierUser->id)
                    ->whereNotNull('station_id')
                    ->get();
            }

            if ($branches->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No Surprice branches found for the given location.'
                ], 404);
            }

            $service = new SurpriceApiService();
            $pickupDateTime = $dateFrom . 'T10:00:00';
            $dropoffDateTime = $dateTo . 'T10:00:00';

            $updatedVehicles = 0;
            $branchResults = [];

            foreach ($branches as $branch) {
                $data = $service->getAvailability(
                    $branch->station_id,
                    $pickupDateTime,
                    $dropoffDateTime,
                    30,
                    'Autours'
                );

                $branchResults[$branch->id] = [];

                foreach ($data['productOfferings'] ?? [] as $offering) {
                    $groupId = (string) ($offering['vehicle']['code'] ?? '');
                    $charge = $offering['rentalDetails'][0]['rentalRate']['vehicleCharges'][0] ?? [];
                    $unitCharge = $charge['calculationInfo']['unitCharge'] ?? 0;

                    if (empty($groupId) || $unitCharge <= 0) {
                        continue;
                    }

                    $vehicle = Vehicle::where('description', 'LIKE', "%[SURPRICE-GROUP-ID:{$groupId}|RATE:Autours]%")
                        ->where('pickup_loc', $branch->id)
                        ->first();

                    if (! $vehicle) {
                        // Try FDW variant
                        $vehicle = Vehicle::where('description', 'LIKE', "%[SURPRICE-GROUP-ID:{$groupId}|RATE:Autours FDW]%")
                            ->where('pickup_loc', $branch->id)
                            ->first();
                    }

                    if ($vehicle) {
                        $vehicle->update([
                            'price' => $unitCharge,
                        ]);
                        $updatedVehicles++;
                    }

                    $branchResults[$branch->id][$groupId] = [
                        'day_value' => $unitCharge,
                        'currency' => $charge['currencyCode'] ?? 'EUR',
                    ];
                }
            }

            $result = [
                'branches_updated' => $branches->pluck('id')->toArray(),
                'vehicles_updated' => $updatedVehicles,
                'prices' => $branchResults,
            ];

            Cache::put($cacheKey, [
                'data' => $result,
                'cached_at' => now()->toIso8601String(),
            ], now()->addMinutes(15));

            return response()->json([
                'status' => true,
                'fresh' => true,
                'message' => 'Prices refreshed successfully.',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Surprice price refresh failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Price refresh failed: ' . $e->getMessage()
            ], 500);
        }
    }
}

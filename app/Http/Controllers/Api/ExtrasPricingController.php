<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Extra;
use App\Models\SupplierExtra;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Branch;
use App\Services\CountryCurrencyResolver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ExtrasPricingController extends Controller
{
    /**
     * Resolve the operating currency for a branch, country, or supplier.
     */
    protected function resolveScopeCurrency(?Branch $branch, ?string $country = null, ?int $supplierId = null): string
    {
        if ($branch) {
            if (!empty($branch->currency)) {
                return strtoupper(trim($branch->currency));
            }
            if (!empty($branch->country)) {
                $code = CountryCurrencyResolver::resolveCountryCode($branch->country);
                if (!empty($code)) {
                    return CountryCurrencyResolver::resolveCurrency($code);
                }
                $c = CountryCurrencyResolver::resolveCurrencyByCountryName($branch->country);
                if (!empty($c)) {
                    return $c;
                }
            }
        }

        if (!empty($country)) {
            $code = CountryCurrencyResolver::resolveCountryCode($country);
            if (!empty($code)) {
                return CountryCurrencyResolver::resolveCurrency($code);
            }
            $c = CountryCurrencyResolver::resolveCurrencyByCountryName($country);
            if (!empty($c)) {
                return $c;
            }
        }

        if ($supplierId) {
            $branchWithCurrency = Branch::where('company_id', $supplierId)
                ->whereNotNull('currency')
                ->where('currency', '!=', '')
                ->first();
            if ($branchWithCurrency && !empty($branchWithCurrency->currency)) {
                return strtoupper(trim($branchWithCurrency->currency));
            }

            $supplier = User::find($supplierId);
            if ($supplier && !empty($supplier->country)) {
                $code = CountryCurrencyResolver::resolveCountryCode($supplier->country);
                if (!empty($code)) {
                    return CountryCurrencyResolver::resolveCurrency($code);
                }
            }
        }

        return 'USD';
    }

    /**
     * Get active extras for booking / public / customer checkout.
     * Price returned is in the branch operating currency with profit margin applied.
     */
    public function getPricing(Request $request)
    {
        $supplierId = $request->query('supplier_id');
        $branchId = $request->query('branch_id');
        $country = $request->query('country');
        $vehicleId = $request->query('vehicle_id');

        // Resolve vehicle details if vehicle_id is provided
        if ($vehicleId) {
            $vehicle = Vehicle::with('branch')->find($vehicleId);
            if ($vehicle) {
                if (!$supplierId) {
                    $supplierId = $vehicle->supplier;
                }
                if (!$branchId || !Branch::where('id', $branchId)->exists()) {
                    $branchId = $vehicle->pickup_loc;
                }
                if (!$country && $vehicle->branch) {
                    $country = $vehicle->branch->country;
                }
            }
        }

        // If branch_id provided, validate and resolve branch details
        if ($branchId) {
            $branch = Branch::find($branchId);
            if ($branch) {
                if (!$country) {
                    $country = $branch->country;
                }
                if (!$supplierId && $branch->company_id) {
                    $supplierId = $branch->company_id;
                }
            } else {
                // If branch_id was actually passed as a vehicle ID by mistake, resolve branch from vehicle
                $altVehicle = Vehicle::with('branch')->find($branchId);
                if ($altVehicle) {
                    $branchId = $altVehicle->pickup_loc;
                    if (!$supplierId) {
                        $supplierId = $altVehicle->supplier;
                    }
                    if (!$country && $altVehicle->branch) {
                        $country = $altVehicle->branch->country;
                    }
                }
            }
        }

        $branchObj = null;
        if ($branchId) {
            $branchObj = Branch::find($branchId);
        }
        if (!$branchObj && isset($vehicle) && $vehicle && $vehicle->branch) {
            $branchObj = $vehicle->branch;
        }

        $branchCurrency = $this->resolveScopeCurrency($branchObj, $country, $supplierId ? (int)$supplierId : null);

        // If no supplier can be resolved, do not return any company extras
        if (!$supplierId) {
            return response()->json([
                'status' => true,
                'data' => []
            ]);
        }

        $extras = Extra::where('is_active', true)->orderBy('id')->get();

        // Check legacy overrides on User model
        $legacyOverrides = [];
        $supplierUser = User::find($supplierId);
        if ($supplierUser && is_array($supplierUser->extras_pricing)) {
            $legacyOverrides = $supplierUser->extras_pricing;
        }

        $result = $extras->map(function ($item) use ($supplierId, $branchId, $country, $legacyOverrides, $branchCurrency) {
            $override = null;

            // 1. Branch level override (highest priority)
            if ($branchId) {
                $override = SupplierExtra::where('supplier_id', $supplierId)
                    ->where('branch_id', $branchId)
                    ->where('extra_id', $item->id)
                    ->first();
            }

            // 2. Country level override (medium priority)
            if (!$override && $country) {
                $override = SupplierExtra::where('supplier_id', $supplierId)
                    ->where('country', $country)
                    ->whereNull('branch_id')
                    ->where('extra_id', $item->id)
                    ->first();
            }

            // 3. Company level override (base priority)
            if (!$override) {
                $override = SupplierExtra::where('supplier_id', $supplierId)
                    ->whereNull('branch_id')
                    ->whereNull('country')
                    ->where('extra_id', $item->id)
                    ->first();
            }

            $basePrice = 0;
            $profitPercent = 0;
            $isEnabled = false;

            if ($override) {
                $isEnabled = (bool)$override->is_enabled;
                $basePrice = (float)$override->custom_price;
                if ((float)$override->profit_percent > 0) {
                    $profitPercent = (float)$override->profit_percent;
                }
            } elseif (isset($legacyOverrides[$item->key])) {
                $basePrice = (float)$legacyOverrides[$item->key];
                $isEnabled = true;
            }

            // Strictly only return extras that the company has enabled! No demo fallback!
            if (!$isEnabled) {
                return null;
            }

            $finalPrice = $profitPercent > 0 
                ? round($basePrice + ($basePrice * $profitPercent / 100), 2)
                : round($basePrice, 2);

            return [
                'id' => $item->key,
                'db_id' => $item->id,
                'key' => $item->key,
                'name' => $item->name,
                'description' => $item->description,
                'faqs' => $item->faqs ?? [],
                'base_price' => $basePrice,
                'profit_percent' => $profitPercent,
                'price' => $finalPrice,
                'price_usd' => $finalPrice,
                'currency' => $branchCurrency,
                'type' => $item->type ?? 'boolean',
                'max_qty' => (int)($item->max_qty ?? 1),
                'badge' => $item->badge,
                'is_active' => (bool)$item->is_active,
                'is_enabled' => true,
                'supplier_id' => $supplierId,
                'branch_id' => $branchId,
            ];
        })->filter()->values();

        return response()->json([
            'status' => true,
            'data' => $result
        ]);
    }

    /**
     * Admin: Get all extras (active and inactive) with profit details
     */
    public function adminIndex(Request $request)
    {
        $extras = Extra::orderBy('id', 'asc')->get()->map(function ($item) {
            $base = (float)$item->price;
            $profit = (float)($item->profit_percent ?? 0);
            $item->currency = 'USD';
            $item->final_price = $profit > 0 ? round($base + ($base * $profit / 100), 2) : round($base, 2);
            return $item;
        });

        return response()->json([
            'status' => true,
            'data' => $extras
        ]);
    }

    /**
     * Admin: Create a new extra (always fixed in USD)
     */
    public function adminStore(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'key' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'profit_percent' => 'nullable|numeric|min:0|max:1000',
            'currency' => 'nullable|string|max:10',
            'type' => 'required|in:boolean,quantity',
            'max_qty' => 'nullable|integer|min:1|max:10',
            'badge' => 'nullable|string|max:50',
            'faqs' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $key = !empty($validated['key']) 
            ? Str::slug($validated['key'], '_') 
            : Str::slug($validated['name'], '_');

        // Ensure key is unique
        $originalKey = $key;
        $counter = 1;
        while (Extra::where('key', $key)->exists()) {
            $key = "{$originalKey}_{$counter}";
            $counter++;
        }

        $extra = Extra::create([
            'key' => $key,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => (float)($validated['price'] ?? 0),
            'profit_percent' => (float)($validated['profit_percent'] ?? 0),
            'currency' => 'USD',
            'type' => $validated['type'],
            'max_qty' => $validated['type'] === 'quantity' ? (int)($validated['max_qty'] ?? 3) : 1,
            'badge' => $validated['badge'] ?? null,
            'faqs' => $validated['faqs'] ?? null,
            'is_active' => $request->has('is_active') ? (bool)$validated['is_active'] : true,
            'supplier_id' => null,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Extra created successfully',
            'data' => $extra
        ], 201);
    }

    /**
     * Admin: Update an existing extra (always fixed in USD)
     */
    public function adminUpdate(Request $request, $id)
    {
        $extra = Extra::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'profit_percent' => 'nullable|numeric|min:0|max:1000',
            'currency' => 'nullable|string|max:10',
            'type' => 'required|in:boolean,quantity',
            'max_qty' => 'nullable|integer|min:1|max:10',
            'badge' => 'nullable|string|max:50',
            'faqs' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $extra->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => array_key_exists('price', $validated) ? (float)$validated['price'] : (float)$extra->price,
            'profit_percent' => array_key_exists('profit_percent', $validated) ? (float)$validated['profit_percent'] : (float)$extra->profit_percent,
            'currency' => 'USD',
            'type' => $validated['type'],
            'max_qty' => $validated['type'] === 'quantity' ? (int)($validated['max_qty'] ?? 3) : 1,
            'badge' => $validated['badge'] ?? null,
            'faqs' => array_key_exists('faqs', $validated) ? $validated['faqs'] : $extra->faqs,
            'is_active' => $request->has('is_active') ? (bool)$validated['is_active'] : $extra->is_active,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Extra updated successfully',
            'data' => $extra
        ]);
    }

    /**
     * Admin: Delete an extra
     */
    public function adminDestroy($id)
    {
        $extra = Extra::findOrFail($id);
        $extra->delete();

        return response()->json([
            'status' => true,
            'message' => 'Extra deleted successfully'
        ]);
    }

    /**
     * Admin: Toggle active status
     */
    public function adminToggleActive($id)
    {
        $extra = Extra::findOrFail($id);
        $extra->is_active = !$extra->is_active;
        $extra->save();

        return response()->json([
            'status' => true,
            'message' => 'Extra status updated',
            'is_active' => $extra->is_active
        ]);
    }

    /**
     * Supplier: Get the global extras catalog (all active extras)
     * Returns each extra along with whether the supplier has enabled it + their custom price/profit
     */
    public function supplierGetCatalog(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $branchId = $request->query('branch_id');
        $country = $request->query('country');

        $targetBranch = null;
        if ($branchId) {
            $targetBranch = Branch::where('id', $branchId)->where('company_id', $user->id)->first()
                ?: Branch::find($branchId);
        }
        $scopeCurrency = $this->resolveScopeCurrency($targetBranch, $country, $user->id);

        $allExtras = Extra::where('is_active', true)->orderBy('id')->get();

        // Load overrides matching the requested scope
        $query = SupplierExtra::where('supplier_id', $user->id);
        if ($branchId) {
            $query->where('branch_id', $branchId);
        } elseif ($country) {
            $query->where('country', $country)->whereNull('branch_id');
        } else {
            $query->whereNull('branch_id')->whereNull('country');
        }
        $supplierExtras = $query->get()->keyBy('extra_id');

        // Fallback to company level if branch or country has no overrides yet
        $companyExtras = collect();
        if (($branchId || $country) && $supplierExtras->isEmpty()) {
            $companyExtras = SupplierExtra::where('supplier_id', $user->id)
                ->whereNull('branch_id')
                ->whereNull('country')
                ->get()
                ->keyBy('extra_id');
        }

        $result = $allExtras->map(function ($extra) use ($supplierExtras, $companyExtras, $scopeCurrency) {
            $override = $supplierExtras->get($extra->id) ?? $companyExtras->get($extra->id);
            return [
                'id'             => $extra->id,
                'key'            => $extra->key,
                'name'           => $extra->name,
                'description'    => $extra->description,
                'currency'       => $scopeCurrency,
                'type'           => $extra->type ?? 'boolean',
                'max_qty'        => (int)($extra->max_qty ?? 1),
                'badge'          => $extra->badge,
                // Supplier-specific fields
                'enabled'        => $override ? (bool)$override->is_enabled : false,
                'custom_price'   => $override ? (float)$override->custom_price : 0,
                'profit_percent' => $override ? (float)$override->profit_percent : 0,
            ];
        });

        return response()->json([
            'status' => true,
            'data'   => $result,
        ]);
    }

    /**
     * Supplier: Save their extras configuration (which are enabled + price + profit)
     */
    public function supplierSaveExtras(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $branchId = $request->input('branch_id');
        $country = $request->input('country');
        $extras = $request->input('extras', []);

        foreach ($extras as $item) {
            $extraId = $item['extra_id'] ?? null;
            if (!$extraId) continue;

            $match = ['supplier_id' => $user->id, 'extra_id' => $extraId];
            if ($branchId) {
                $match['branch_id'] = $branchId;
            } elseif ($country) {
                $match['country'] = $country;
                $match['branch_id'] = null;
            } else {
                $match['branch_id'] = null;
                $match['country'] = null;
            }

            $existing = SupplierExtra::where($match)->first();
            $profit = $existing ? (float)$existing->profit_percent : 0;
            if (isset($item['profit_percent'])) {
                $profit = max(0, (float)$item['profit_percent']);
            }

            SupplierExtra::updateOrCreate(
                $match,
                [
                    'is_enabled'     => (bool)($item['enabled'] ?? false),
                    'custom_price'   => max(0, (float)($item['custom_price'] ?? 0)),
                    'profit_percent' => $profit,
                ]
            );
        }

        return response()->json([
            'status'  => true,
            'message' => 'Extras configuration saved successfully',
        ]);
    }

    /**
     * Admin: Get catalog view for a specific supplier's extras configuration
     */
    public function adminGetSupplierExtras(Request $request, $supplierId)
    {
        $supplier = User::find($supplierId);
        if (!$supplier) {
            return response()->json(['status' => false, 'message' => 'Supplier not found'], 404);
        }

        $branchId = $request->query('branch_id');
        $country = $request->query('country');

        $targetBranch = $branchId ? Branch::find($branchId) : null;
        $scopeCurrency = $this->resolveScopeCurrency($targetBranch, $country, (int)$supplierId);

        $allExtras = Extra::where('is_active', true)->orderBy('id')->get();

        $query = SupplierExtra::where('supplier_id', $supplierId);
        if ($branchId) {
            $query->where('branch_id', $branchId);
        } elseif ($country) {
            $query->where('country', $country)->whereNull('branch_id');
        } else {
            $query->whereNull('branch_id')->whereNull('country');
        }
        $supplierExtras = $query->get()->keyBy('extra_id');

        // Fallback to company level if branch or country has no overrides yet
        $companyExtras = collect();
        if (($branchId || $country) && $supplierExtras->isEmpty()) {
            $companyExtras = SupplierExtra::where('supplier_id', $supplierId)
                ->whereNull('branch_id')
                ->whereNull('country')
                ->get()
                ->keyBy('extra_id');
        }

        $result = $allExtras->map(function ($extra) use ($supplierExtras, $companyExtras, $scopeCurrency) {
            $override = $supplierExtras->get($extra->id) ?? $companyExtras->get($extra->id);
            return [
                'id'             => $extra->id,
                'key'            => $extra->key,
                'name'           => $extra->name,
                'description'    => $extra->description,
                'currency'       => $scopeCurrency,
                'type'           => $extra->type ?? 'boolean',
                'max_qty'        => (int)($extra->max_qty ?? 1),
                'badge'          => $extra->badge,
                'enabled'        => $override ? (bool)$override->is_enabled : false,
                'custom_price'   => $override ? (float)$override->custom_price : 0,
                'profit_percent' => $override ? (float)$override->profit_percent : (float)($extra->profit_percent ?? 0),
            ];
        });

        return response()->json([
            'status' => true,
            'data'   => $result,
        ]);
    }

    /**
     * Admin: Update a specific supplier's extras configuration (company, country, or branch scope)
     */
    public function adminSaveSupplierExtras(Request $request, $supplierId)
    {
        $supplier = User::find($supplierId);
        if (!$supplier) {
            return response()->json(['status' => false, 'message' => 'Supplier not found'], 404);
        }

        $branchId = $request->input('branch_id');
        $country = $request->input('country');
        $extras = $request->input('extras', []);

        foreach ($extras as $item) {
            $extraId = $item['extra_id'] ?? null;
            if (!$extraId) continue;

            $match = [
                'supplier_id' => $supplierId,
                'extra_id'    => $extraId,
                'branch_id'   => $branchId ? (int)$branchId : null,
                'country'     => $branchId ? null : ($country ?: null),
            ];

            SupplierExtra::updateOrCreate(
                $match,
                [
                    'is_enabled'     => (bool)($item['enabled'] ?? false),
                    'custom_price'   => max(0, (float)($item['custom_price'] ?? 0)),
                    'profit_percent' => max(0, (float)($item['profit_percent'] ?? 0)),
                ]
            );
        }

        return response()->json([
            'status'  => true,
            'message' => 'Supplier extras updated successfully',
        ]);
    }

    /**
     * Admin: 1-Click enable or disable all extras for a company or branch
     */
    public function adminToggleSupplierExtras(Request $request, $supplierId)
    {
        $supplier = User::find($supplierId);
        if (!$supplier) {
            return response()->json(['status' => false, 'message' => 'Supplier not found'], 404);
        }

        $branchId = $request->input('branch_id');
        $country = $request->input('country');
        $enable = (bool)$request->input('enable', false);

        $allExtras = Extra::where('is_active', true)->get();
        foreach ($allExtras as $extra) {
            $match = [
                'supplier_id' => $supplierId,
                'extra_id'    => $extra->id,
                'branch_id'   => $branchId ? (int)$branchId : null,
                'country'     => $branchId ? null : ($country ?: null),
            ];

            $existing = SupplierExtra::where($match)->first();
            $customPrice = $existing ? (float)$existing->custom_price : (float)$extra->price;
            $profit = $existing ? (float)$existing->profit_percent : (float)($extra->profit_percent ?? 0);

            SupplierExtra::updateOrCreate($match, [
                'is_enabled'     => $enable,
                'custom_price'   => $customPrice,
                'profit_percent' => $profit,
            ]);
        }

        return response()->json([
            'status'  => true,
            'message' => $enable ? 'All add-ons enabled successfully' : 'All add-ons disabled/cancelled successfully',
        ]);
    }

    /**
     * Supplier: 1-Click enable or disable all extras for this company or a specific branch
     */
    public function supplierToggleExtras(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
        }

        $branchId = $request->input('branch_id');
        $country = $request->input('country');
        $enable = (bool)$request->input('enable', false);

        $allExtras = Extra::where('is_active', true)->get();
        foreach ($allExtras as $extra) {
            $match = [
                'supplier_id' => $user->id,
                'extra_id'    => $extra->id,
                'branch_id'   => $branchId ? (int)$branchId : null,
                'country'     => $branchId ? null : ($country ?: null),
            ];

            $existing = SupplierExtra::where($match)->first();
            $customPrice = $existing ? (float)$existing->custom_price : (float)$extra->price;
            $profit = $existing ? (float)$existing->profit_percent : (float)($extra->profit_percent ?? 0);

            SupplierExtra::updateOrCreate($match, [
                'is_enabled'     => $enable,
                'custom_price'   => $customPrice,
                'profit_percent' => $profit,
            ]);
        }

        return response()->json([
            'status'  => true,
            'message' => $enable ? 'All add-ons enabled successfully' : 'All add-ons disabled/cancelled successfully',
        ]);
    }

    /**
     * Admin: Overview showing which companies and branches have extras enabled/disabled
     */
    public function adminGetExtrasOverview(Request $request)
    {
        $suppliers = User::where('role', 'active_supplier')
            ->where(function ($q) {
                $q->where('vehicles_hidden', false)->orWhereNull('vehicles_hidden');
            })
            ->whereHas('vehicles')
            ->with(['branches' => function ($q) {
                $q->where('activation', 1)
                  ->whereHas('vehicles')
                  ->select('id', 'name', 'city', 'country', 'company_id');
            }])
            ->get();

        $activeExtras = Extra::where('is_active', true)->get();
        $activeExtrasCount = $activeExtras->count();
        $allOverrides = SupplierExtra::all();

        $data = $suppliers->map(function ($supplier) use ($activeExtrasCount, $allOverrides) {
            $companyOverrides = $allOverrides->where('supplier_id', $supplier->id)
                ->whereNull('branch_id')
                ->whereNull('country');

            $disabledCount = $companyOverrides->where('is_enabled', false)->count();
            $enabledCount = $companyOverrides->where('is_enabled', true)->count();

            $isAllDisabled = ($enabledCount === 0);
            $effectiveEnabledCount = $enabledCount;

            $branches = ($supplier->branches ?? collect())->map(function ($branch) use ($supplier, $allOverrides, $isAllDisabled) {
                $branchOverrides = $allOverrides->where('supplier_id', $supplier->id)
                    ->where('branch_id', $branch->id);

                $bEnabled = $branchOverrides->where('is_enabled', true)->count();

                $branchAllDisabled = $branchOverrides->isNotEmpty()
                    ? ($bEnabled === 0)
                    : $isAllDisabled;

                return [
                    'id'               => $branch->id,
                    'name'             => $branch->name,
                    'city'             => $branch->city,
                    'country'          => $branch->country,
                    'is_all_disabled'  => $branchAllDisabled,
                    'has_overrides'    => $branchOverrides->isNotEmpty(),
                ];
            });

            return [
                'supplier_id'             => $supplier->id,
                'supplier_name'           => $supplier->name,
                'logo'                    => $supplier->logo,
                'country'                 => $supplier->country,
                'total_active_extras'     => $activeExtrasCount,
                'effective_enabled_count' => $effectiveEnabledCount,
                'is_all_disabled'         => $isAllDisabled,
                'branches'                => $branches,
            ];
        });

        return response()->json([
            'status' => true,
            'data'   => $data,
        ]);
    }

    /**
     * Legacy: Update extras pricing for supplier (kept for backwards compat)
     */
    public function updateSupplierPricing(Request $request)
    {
        return $this->supplierSaveExtras($request);
    }

    /**
     * Legacy: Admin update pricing for any supplier (kept for backwards compat)
     */
    public function updateAdminPricing(Request $request)
    {
        $supplierId = $request->input('supplier_id');
        if (!$supplierId) {
            return response()->json(['status' => false, 'message' => 'Supplier ID required'], 422);
        }
        return $this->adminSaveSupplierExtras($request, $supplierId);
    }

    /**
     * Admin: Bulk apply profit % and/or price to multiple suppliers at once.
     *
     * Scope options:
     *   - 'all'     → all suppliers
     *   - 'company' → specific supplier_id
     *   - 'country' → all suppliers in a given country
     *
     * Fields applied (only non-null values override):
     *   - profit_percent : apply this margin to every enabled extra for matched suppliers
     *   - custom_price   : apply this flat price to every extra for matched suppliers
     *   - enable_all     : if true, enable ALL catalog extras for matched suppliers
     *
     * extra_ids: array of extra IDs to target, or empty/null = all active extras
     */
    public function adminBulkApply(Request $request)
    {
        $request->validate([
            'scope'          => 'required|in:all,company,country,branch',
            'supplier_id'    => 'nullable|integer',
            'country'        => 'nullable|string|max:100',
            'branch_id'      => 'nullable|integer',
            'profit_percent' => 'nullable|numeric|min:0|max:1000',
            'custom_price'   => 'nullable|numeric|min:0',
            'enable_all'     => 'nullable|boolean',
            'extra_ids'      => 'nullable|array',
            'extra_ids.*'    => 'integer',
        ]);

        $scope         = $request->input('scope');
        $profitPercent = $request->input('profit_percent'); // null = don't touch
        $customPrice   = $request->input('custom_price');   // null = don't touch
        $enableAll     = $request->boolean('enable_all', false);
        $extraIds      = $request->input('extra_ids', []);

        // Resolve target supplier IDs
        $supplierIds = collect();

        if ($scope === 'company') {
            $supplierId = $request->input('supplier_id');
            if (!$supplierId) {
                return response()->json(['status' => false, 'message' => 'supplier_id is required for company scope'], 422);
            }
            $supplierIds = collect([(int)$supplierId]);
        } elseif ($scope === 'branch') {
            $branchId = $request->input('branch_id');
            if (!$branchId) {
                return response()->json(['status' => false, 'message' => 'branch_id is required for branch scope'], 422);
            }
            $branch = \App\Models\Branch::find($branchId);
            if (!$branch || !$branch->company_id) {
                return response()->json(['status' => false, 'message' => 'Branch or associated company not found'], 404);
            }
            $supplierIds = collect([(int)$branch->company_id]);
        } elseif ($scope === 'country') {
            $country = $request->input('country');
            if (!$country) {
                return response()->json(['status' => false, 'message' => 'country is required for country scope'], 422);
            }
            $branchSuppliers = \App\Models\Branch::where('country', $country)
                ->whereNotNull('company_id')
                ->pluck('company_id');
            $userSuppliers = User::whereIn('role', ['supplier', 'active_supplier'])
                ->where('country', $country)
                ->pluck('id');
            $supplierIds = $branchSuppliers->merge($userSuppliers)->unique()->values();
        } else {
            // 'all' → all active suppliers and suppliers
            $supplierIds = User::whereIn('role', ['supplier', 'active_supplier'])->pluck('id');
        }

        if ($supplierIds->isEmpty()) {
            return response()->json(['status' => false, 'message' => 'No suppliers found for the given scope'], 404);
        }

        // Resolve target extra IDs
        $activeExtras = Extra::where('is_active', true);
        if (!empty($extraIds)) {
            $activeExtras->whereIn('id', $extraIds);
        }
        $activeExtraIds = $activeExtras->pluck('id');

        if ($activeExtraIds->isEmpty()) {
            return response()->json(['status' => false, 'message' => 'No active extras found'], 404);
        }

        $updatedCount = 0;

        foreach ($supplierIds as $sid) {
            foreach ($activeExtraIds as $eid) {
                $existing = SupplierExtra::where('supplier_id', $sid)->where('extra_id', $eid)->first();

                $data = [];

                if ($enableAll) {
                    $data['is_enabled'] = true;
                }

                if (!is_null($profitPercent)) {
                    $data['profit_percent'] = (float)$profitPercent;
                }

                if (!is_null($customPrice)) {
                    $data['custom_price'] = (float)$customPrice;
                }

                if (empty($data)) continue; // Nothing to update

                if ($existing) {
                    $existing->update($data);
                } else {
                    // Create record with defaults for unset fields
                    SupplierExtra::create(array_merge([
                        'supplier_id'    => $sid,
                        'extra_id'       => $eid,
                        'is_enabled'     => false,
                        'custom_price'   => 0,
                        'profit_percent' => 0,
                    ], $data));
                }

                $updatedCount++;
            }
        }

        return response()->json([
            'status'  => true,
            'message' => "Bulk apply completed: {$updatedCount} records updated across " . count($supplierIds) . " supplier(s).",
            'affected_suppliers' => count($supplierIds),
            'affected_records'   => $updatedCount,
        ]);
    }
}


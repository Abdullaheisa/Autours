<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\Promo;
use App\Models\Included;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PromosController extends Controller
{
    /**
     * Get active promos for vehicles
     */
    public function index(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) return response()->json([]);

        // If included_id is provided, get vehicles mapped to this promo
        if ($request->has('included_id')) {
            $query = Promo::query()->where('included_id', $request->query('included_id'));
            
            // Suppliers only see their own vehicles; Admin sees all
            if ($user->role !== 'admin') {
                $query->where('supplier_id', $user->id);
            } elseif ($request->has('supplier_id')) {
                $query->where('supplier_id', $request->query('supplier_id'));
            }
            
            return $query->pluck('vehicle_id');
        }

        // Get list of included_ids that are promoted
        $query = Promo::query();
        if ($user->role !== 'admin') {
            $query->where('supplier_id', $user->id);
        }
        return $query->pluck('included_id')->unique()->values();
    }

    /**
     * Assign promo to vehicles
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user() ?? Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], StatusCodes::UNAUTHORIZED);
            }

            $includedId = (int) $request->get('included_id');
            if (!$includedId) {
                return response()->json(['error' => 'Invalid promo ID'], 422);
            }

            $selectAll = filter_var($request->get('select_all', false), FILTER_VALIDATE_BOOLEAN);

            // Parse selected vehicle IDs from request
            $newVehicleIds = array_filter(
                array_map('trim', explode(',', (string) $request->selected_vehicles))
            );
            $newVehicleIds = array_values(array_unique(array_map('intval', $newVehicleIds)));

            if ($user->role === 'admin') {
                // Admin can assign promos to any vehicle or supplier.
                $targetSupplierId = $request->get('supplier_id');

                if ($selectAll && $targetSupplierId) {
                    // Apply to ALL vehicles of this supplier for this specific promo
                    Promo::where('supplier_id', $targetSupplierId)->where('included_id', $includedId)->delete();
                    
                    Promo::create([
                        'included_id' => $includedId,
                        'vehicle_id'  => 0,
                        'supplier_id' => (int) $targetSupplierId,
                    ]);

                    $allSupplierVehicles = Vehicle::where('supplier', $targetSupplierId)->pluck('id')->toArray();
                    $records = [];
                    $now = now();
                    foreach ($allSupplierVehicles as $vId) {
                        $records[] = [
                            'included_id' => $includedId,
                            'vehicle_id'  => (int) $vId,
                            'supplier_id' => (int) $targetSupplierId,
                            'created_at'  => $now,
                            'updated_at'  => $now,
                        ];
                    }
                    foreach (array_chunk($records, 1000) as $chunk) {
                        DB::table('promos')->insert($chunk);
                    }
                } else {
                    $existingVehicleIds = Promo::where('included_id', $includedId)
                        ->where('vehicle_id', '>', 0)
                        ->pluck('vehicle_id')
                        ->toArray();

                    $toDelete = array_diff($existingVehicleIds, $newVehicleIds);
                    if (!empty($toDelete)) {
                        Promo::where('included_id', $includedId)
                            ->whereIn('vehicle_id', $toDelete)
                            ->delete();
                    }

                    $toAdd = array_diff($newVehicleIds, $existingVehicleIds);
                    if (!empty($toAdd)) {
                        $vehiclesMap = Vehicle::whereIn('id', $toAdd)->pluck('supplier', 'id')->toArray();
                        $records = [];
                        $now = now();
                        foreach ($toAdd as $vId) {
                            $sId = $vehiclesMap[$vId] ?? null;
                            if (!$sId) continue;
                            $records[] = [
                                'included_id' => $includedId,
                                'vehicle_id'  => (int) $vId,
                                'supplier_id' => (int) $sId,
                                'created_at'  => $now,
                                'updated_at'  => $now,
                            ];
                        }
                        foreach (array_chunk($records, 1000) as $chunk) {
                            DB::table('promos')->insert($chunk);
                        }
                    }
                }
            } else {
                // SUPPLIER MODE:
                // Delete previous mapping ONLY for this specific promo
                Promo::where('supplier_id', $user->id)->where('included_id', $includedId)->delete();

                if ($selectAll || empty($newVehicleIds)) {
                    // 1. Insert master supplier promo (vehicle_id = 0)
                    Promo::create([
                        'included_id' => $includedId,
                        'vehicle_id'  => 0,
                        'supplier_id' => $user->id,
                    ]);

                    // 2. Bulk insert all supplier vehicles for compatibility
                    $allVehicleIds = Vehicle::where('supplier', $user->id)
                        ->pluck('id')
                        ->toArray();

                    $records = [];
                    $now = now();
                    foreach ($allVehicleIds as $vId) {
                        $records[] = [
                            'included_id' => $includedId,
                            'vehicle_id'  => (int) $vId,
                            'supplier_id' => $user->id,
                            'created_at'  => $now,
                            'updated_at'  => $now,
                        ];
                    }
                    foreach (array_chunk($records, 1000) as $chunk) {
                        DB::table('promos')->insert($chunk);
                    }
                } else {
                    // Specific vehicles selected
                    $validSupplierVehicles = Vehicle::where('supplier', $user->id)
                        ->whereIn('id', $newVehicleIds)
                        ->pluck('id')
                        ->toArray();

                    $records = [];
                    $now = now();
                    foreach ($validSupplierVehicles as $vId) {
                        $records[] = [
                            'included_id' => $includedId,
                            'vehicle_id'  => (int) $vId,
                            'supplier_id' => $user->id,
                            'created_at'  => $now,
                            'updated_at'  => $now,
                        ];
                    }
                    foreach (array_chunk($records, 1000) as $chunk) {
                        DB::table('promos')->insert($chunk);
                    }
                }
            }

            return response()->json(['status' => true]);

        } catch (\Exception $exception) {
            Log::error("PromosController@store error: " . $exception->getMessage() . "\n" . $exception->getTraceAsString());
            return response()->json(['error' => $exception->getMessage(), 'message' => $exception->getMessage()], StatusCodes::SERVER_ERROR);
        }
    }


    /**
     * Delete active promo assignments for a given included_id
     */
    public function destroy($id)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], StatusCodes::UNAUTHORIZED);
        }

        $query = Promo::query()->where('included_id', $id);
        if ($user->role !== 'admin') {
            $query->where('supplier_id', $user->id);
        }

        $deleted = $query->delete();
        return response()->json(['status' => true]);
    }

    // ==========================================
    // Promo Definitions (included table where is_promo = 1)
    // ==========================================

    public function getDefinitions(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) return response()->json([]);

        if ($user->role === 'admin') {
            // Admin sees all promos with the supplier model loaded if suggested
            return Included::where('is_promo', 1)->with('supplier')->get();
        }

        if (in_array($user->role, ['supplier', 'active_supplier'])) {
            // Suppliers see approved global promos + their own suggestions
            return Included::where('is_promo', 1)
                ->where(function($q) use ($user) {
                    $q->whereNull('supplier_id')->where('status', 'approved')
                      ->orWhere('supplier_id', $user->id);
                })->get();
        }

        // Guests see only approved ones
        return Included::where('is_promo', 1)->where('status', 'approved')->get();
    }

    public function storeDefinition(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], StatusCodes::UNAUTHORIZED);
        }

        $included = new Included();
        $included->what_is_included = $request->included;
        $included->is_promo = 1;
        $included->is_special_offer = filter_var($request->get('is_special_offer', false), FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        
        if ($request->has('description')) {
            $included->description = $request->description;
        }


        if ($user->role === 'admin') {
            $included->supplier_id = null;
            $included->status = 'approved';
        } else {
            $included->supplier_id = $user->id;
            $included->status = 'pending';
        }

        $status = $included->save();

        if ($status && $user->role !== 'admin') {
            try {
                $supplierName = $user->company ?? $user->name ?? 'A supplier';
                Mail::raw(
                    "A new promo badge has been suggested by supplier '{$supplierName}' (ID: {$user->id}).\n\nSuggested Promo Badge Name: '{$included->what_is_included}'\nDescription: '{$included->description}'\n\nPlease log in to the admin dashboard to review and approve/reject this suggestion.",
                    function ($message) use ($user, $included, $supplierName) {
                        $message->to(['admin@autours.net', 'contact@autours.net'])
                                ->subject("New Promo Suggestion from {$supplierName}: {$included->what_is_included}");
                    }
                );
            } catch (\Exception $mailEx) {
                Log::error("Failed sending promo suggestion email: " . $mailEx->getMessage());
            }
        }

        return response()->json([
            'data' => $included,
            'status' => $status,
            'message' => $included->status === 'pending' ? 'Your promo request has been submitted for admin approval.' : 'Promo badge created successfully.'
        ]);
    }

    public function updateDefinitionStatus(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], StatusCodes::FORBIDDEN);
        }

        $included = Included::where('is_promo', 1)->find($request->id);
        if (!$included) {
            return response()->json(['status' => false, 'message' => 'Not found'], 404);
        }

        $included->status = $request->status; // 'approved' or 'rejected'
        $status = $included->save();

        return response()->json([
            'data' => $included,
            'status' => $status,
            'message' => 'Promo status updated successfully.'
        ]);
    }

    public function updateDefinition(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], StatusCodes::FORBIDDEN);
        }

        $included = Included::where('is_promo', 1)->find($request->id);
        if (!$included) {
            return response()->json(['status' => false, 'message' => 'Not found'], 404);
        }

        $included->what_is_included = $request->included;
        if ($request->has('description')) {
            $included->description = $request->description;
        }
        if ($request->has('is_special_offer')) {
            $included->is_special_offer = filter_var($request->get('is_special_offer'), FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }
        $status = $included->save();

        return response()->json([
            'data' => $included,
            'status' => $status,
            'message' => 'Promo updated successfully.'
        ]);
    }

    public function deleteDefinition(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated'], StatusCodes::UNAUTHORIZED);
        }

        $included = Included::where('is_promo', 1)->find($request->id);
        if (!$included) {
            return response()->json(['status' => false, 'message' => 'Not found'], 404);
        }

        // Only Admin can delete approved ones, or supplier can delete their own suggested ones
        if ($user->role !== 'admin') {
            if ($included->supplier_id !== $user->id) {
                return response()->json(['status' => false, 'message' => 'Unauthorized'], StatusCodes::FORBIDDEN);
            }
        }

        // Also clean up any vehicle mappings in promos table
        Promo::where('included_id', $included->id)->delete();

        $status = $included->delete();
        return response()->json([
            'data' => [],
            'status' => $status,
            'message' => 'Promo deleted successfully.'
        ]);
    }
}

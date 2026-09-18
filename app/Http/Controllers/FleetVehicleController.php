<?php

namespace App\Http\Controllers;

use App\Models\FleetVehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class FleetVehicleController extends Controller
{
    /**
     * Get all fleet vehicles.
     */
    public function index(Request $request)
    {
        $query = FleetVehicle::query()->orderBy('order', 'asc')->orderBy('id', 'asc');

        if ($request->boolean('active_only') || $request->query('active') === '1') {
            $query->where('active', true);
        }

        $items = $query->get();

        return response()->json([
            'status' => true,
            'data' => $items,
        ]);
    }

    /**
     * Store a new fleet vehicle.
     */
    public function store(Request $request)
    {
        $request->validate([
            'category_name' => 'required|string|max:255',
            'car_name' => 'required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
        ]);

        $item = new FleetVehicle();
        $item->category_name = $request->category_name;
        $item->badge = $request->badge;
        $item->car_name = $request->car_name;
        $item->price = $request->price ?? 0;
        $item->currency = $request->currency ?: 'AED';
        $item->supplier_name = $request->supplier_name ?: 'Autours';
        $item->seats = $request->seats;
        $item->doors = $request->doors;
        $item->luggage = $request->luggage;
        $item->description = $request->description;
        $item->order = $request->order ?? 0;
        $item->active = $request->has('active') ? $request->boolean('active') : true;

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $dir = public_path('img/fleet');
            if (!File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
            }
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $file->move($dir, $filename);
            $item->photo = 'img/fleet/' . $filename;
        } elseif ($request->filled('photo')) {
            $item->photo = $request->photo;
        }

        $item->save();

        return response()->json([
            'status' => true,
            'message' => 'Fleet car added successfully',
            'data' => $item,
        ]);
    }

    /**
     * Update an existing fleet vehicle.
     */
    public function update(Request $request, $id)
    {
        $item = FleetVehicle::findOrFail($id);

        if ($request->has('category_name')) {
            $item->category_name = $request->category_name;
        }
        if ($request->has('badge')) {
            $item->badge = $request->badge;
        }
        if ($request->has('car_name')) {
            $item->car_name = $request->car_name;
        }
        if ($request->has('price')) {
            $item->price = $request->price;
        }
        if ($request->has('currency')) {
            $item->currency = $request->currency;
        }
        if ($request->has('supplier_name')) {
            $item->supplier_name = $request->supplier_name;
        }
        if ($request->has('seats')) {
            $item->seats = $request->seats;
        }
        if ($request->has('doors')) {
            $item->doors = $request->doors;
        }
        if ($request->has('luggage')) {
            $item->luggage = $request->luggage;
        }
        if ($request->has('description')) {
            $item->description = $request->description;
        }
        if ($request->has('order')) {
            $item->order = (int)$request->order;
        }
        if ($request->has('active')) {
            $item->active = $request->boolean('active');
        }

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $dir = public_path('img/fleet');
            if (!File::exists($dir)) {
                File::makeDirectory($dir, 0755, true);
            }
            $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file->getClientOriginalName());
            $file->move($dir, $filename);
            $item->photo = 'img/fleet/' . $filename;
        } elseif ($request->filled('photo')) {
            $item->photo = $request->photo;
        }

        $item->save();

        return response()->json([
            'status' => true,
            'message' => 'Fleet car updated successfully',
            'data' => $item,
        ]);
    }

    /**
     * Delete a fleet vehicle.
     */
    public function destroy($id)
    {
        $item = FleetVehicle::findOrFail($id);
        $item->delete();

        return response()->json([
            'status' => true,
            'message' => 'Fleet car deleted successfully',
        ]);
    }

    /**
     * Toggle active state.
     */
    public function toggleActive($id)
    {
        $item = FleetVehicle::findOrFail($id);
        $item->active = !$item->active;
        $item->save();

        return response()->json([
            'status' => true,
            'message' => 'Status updated successfully',
            'data' => $item,
        ]);
    }
}

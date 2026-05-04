<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\Profit;
use App\Models\Promo;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Branch;

class PromosController extends Controller
{
    public function index()
    {
        return Promo::query()->where('supplier_id', auth()->user()->id)->pluck('included_id');
    }

    public function create()
    {
    }

    public function store(Request $request)
    {
        try {

            foreach (explode(',', $request->selected_vehicles) as $vehicle_id) {
                $promo = new Promo();
                $promo->included_id = $request->get('included_id');
                $promo->vehicle_id = $vehicle_id;
                $promo->supplier_id = auth()->user()->id;
                $promo->save();
            }
            return response()->json(['status' => true]);

        } catch (\Exception $exception) {
            return response()->json(['error' => $exception->getMessage()], StatusCodes::SERVER_ERROR);
        }
    }

    public function show($id)
    {
    }

    public function edit($id)
    {
    }

    public function update(Request $request, $id)
    {
    }

    public function destroy($id)
    {
        Promo::query()->where('supplier_id', auth()->user()->id)->where('included_id', $id)->delete();
    }
}

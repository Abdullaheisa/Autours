<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Http\Requests\AssignRentalTerm;
use App\Http\Requests\CreateRentalTerms;
use App\Http\Requests\RentalRateRequest;
use App\Models\RateQuestion;
use App\Models\RentalRate;
use App\Models\RentalTerms;
use App\Models\SupplierRentalTerm;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Category;
use App\Models\Specification;
use App\Models\Vehicle;
use App\Models\Branch;
use App\Models\VehiclesPhotos;
use App\Models\Rental;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class RatesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {

            if ($request->has('key')) {
                $keyDecrypted = decrypt($request->key, env('APP_KEY'));
                $key = base64_decode($keyDecrypted);
                $date = explode( ',', $key)[1];
                if (Carbon::parse($date)->diffInDays(Carbon::now()) <= 0) {
                    return response()->json([
                        "success" => false,
                        "message" => "Sorry the link has been expired."
                    ], StatusCodes::BAD_REQUEST);
                }
            }
            if (is_null($request->id) || !is_int((int)$request->id)) {
                return response()->json([
                    "success" => false,
                    "message" => "rental not valid"
                ], StatusCodes::BAD_REQUEST);
            }
            return response()->json([
                "success" => false,
                "data" => [
                    "questions" => RateQuestion::query()->orderBy('id')->get(),
                    "rental" => Rental::query()->with(['vehicle', 'supplier'])->find($request->id),
                ]
            ]);
        } catch (\Exception $e) {
            info($e->getMessage());
            return response()->json([
                "success" => false,
                "message" => "something went wrong or key not valid"
            ], StatusCodes::SERVER_ERROR);
        }
    }

    public function store(RentalRateRequest $request)
    {
        try {

            if (RentalRate::query()->where('rental_id', $request->id)->count()) {
                return response()->json([
                    "success" => false,
                    "message" => "You have rated this rental already!"
                ], StatusCodes::BAD_REQUEST);
            }
            $questions = RateQuestion::query()->orderBy('id')->get()->toArray();
            foreach ($request->rates as $key => $rate) {
                $rentalRate = new RentalRate();
                $rentalRate->question_id = $questions[$key]['id'];
                $rentalRate->rental_id = $request->id;
                $rentalRate->rate = $rate;
                $rentalRate->save();
            }
            if ($request->comment) {
                Rental::query()->find($request->id)->update(['comment' => $request->comment]);
            }
            Rental::query()->find($request->id)->update(['rate' => array_sum($request->rates) / count($request->rates)]);
            return response()->json([
                "success" => true,
                "message" => "You have rated this rental!"
            ], StatusCodes::SUCCESS);
        } catch (\Exception $e) {
            info($e->getMessage());
            return response()->json([
                "success" => false,
                "message" => "error"
            ], StatusCodes::SERVER_ERROR);
        }
    }

    public function show($id)
    {
    }

    public function edit(Request $request)
    {
    }

    public function destroy(Request $request)
    {
    }

}

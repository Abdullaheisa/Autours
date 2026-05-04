<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\PaymentMethod;
use App\Models\PaymentMethodSupplier;
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
use function Symfony\Component\Translation\t;

class PaymentMethodsController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        try {
            if (\auth()->user()) {

                $paymentMethods = PaymentMethod::query()->get();
                $activePaymentMethods = PaymentMethodSupplier::query()->where('supplier_id', \auth()->id())->get()->pluck('payment_method_id')->toArray();
                foreach ($paymentMethods as $paymentMethod) {
                    $paymentMethod->activation = in_array($paymentMethod->id, $activePaymentMethods);
                }
                return response()->json([
                    'success' => true,
                    'data' => $paymentMethods
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            if (PaymentMethodSupplier::query()->where('supplier_id', \auth()->id())->where('payment_method_id', $request->selectedMethodId)->exists()) {
                PaymentMethodSupplier::query()->where('supplier_id', \auth()->id())->where('payment_method_id', $request->selectedMethodId)->delete();
                return response()->json([
                    'success' => true,
                    'message' => 'Method has been removed']);
            } else {
                if(PaymentMethodSupplier::query()->where('supplier_id', \auth()->user()->id)->count() >= 1) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Can not use more than one method'
                    ], StatusCodes::FORBIDDEN);
                }
                $paymentMethod = new PaymentMethodSupplier();
                $paymentMethod->supplier_id = \auth()->user()->id;
                $paymentMethod->payment_method_id = $request->selectedMethodId;

                $paymentMethod->save();
            }
            return response()->json([
                'success' => true,
                'message' => 'Method has been added']);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

}

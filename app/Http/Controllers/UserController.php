<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Http\Requests\CreateBranchRequest;
use App\Http\Requests\Dashboard\AssignParentRequest;
use App\Http\Requests\ForgetPasswordRequest;
use App\Http\Requests\SetNewPasswordRequest;
use App\Mail\UsersEmail\ForgetPasswordEmail;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Branch;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{

    public function assignCompanies(AssignParentRequest $request)
    {
        try {
            User::query()->where('id', $request->selectedCompany)->update([
                'parent_company_id' => $request->parentCompany,
                'role' => 'active_supplier'
            ]);
            return response(['success' => true]);
        } catch (\Exception $exception) {
            info($exception->getMessage());
            return response([
                'success' => false
            ], StatusCodes::SERVER_ERROR);
        }
    }

    public function upload(Request $request)
    {
        $user = User::where('id', Auth::user()->id)->first();
        $updateData = $request->all();

        if ($request->hasFile('logo')) {
            $image = $request->file('logo');
            $image_name = Auth::user()->name . "_logo" . md5(Carbon::now()->toDateString()) . "." . $request->file('logo')->extension();
            $image->move(public_path('img'), $image_name);

            $updateData['logo'] = $image_name;
        }


        if ($request->has('newPass')) {
            if ($request->has('oldPass') && Hash::check($request->oldPass, $user->password) && $request->newPass === $request->confirmNewPass) {
                $updateData['password'] = Hash::make($request->newPass);
            } else {
                return response()->json(['message' => 0]);
            }
        }


        $user->update($updateData);

        return response()->json(['message' => 1]);

    }

    public function changeCompany(Request $request)
    {
        $user = User::query()->where('id',$request->selectedCompany)->first();

        if ($user) {
            Auth::login($user); // Log in the new user
            $request->session()->regenerate();
        }

    }
    public function role()
    {
        $user = Auth::user();
        $check = Auth::check();
        if ($check) {
            return json_encode($user->role);
        } else {
            return 'null';
        }

    }

    public function priceTax()
    {
        $priceTax = User::where('role', 'admin')->value('price_tax');
        $weekPriceTax = User::where('role', 'admin')->value('week_price_tax');
        $monthPriceTax = User::where('role', 'admin')->value('month_price_tax');
        $yearPriceTax = User::where('role', 'admin')->value('year_price_tax');

        return json_encode([
            'priceTax' => $priceTax,
            'weekPriceTax' => $weekPriceTax,
            'monthPriceTax' => $monthPriceTax,
            'yearPriceTax' => $yearPriceTax
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        if (isset($user->language))
            $user->language = explode(',', auth()->user()->language);
        return $user;

    }

    public function Companies()
    {
        if (\auth()->user()->role == 'admin') {
            return User::query()
                ->whereIn('role', ['active_supplier', 'under_review'])
                ->with(['parent'])
                ->get();
        } else {
            return User::query()
                ->whereIn('role', ['active_supplier', 'under_review'])
                ->where('parent_company_id', \auth()->user()->id)
                ->get();
        }
    }

    public function getLogos()
    {
        return User::query()->where('role', 'active_supplier')->whereNotNull('logo')->take(4)->pluck('logo');
    }

    public function membership()
    {

        $user = Auth::user();
        $user->update(['role' => 'under_review']);

        return response()->json(['message' => 'Role updated successfully']);
    }

    public function memberships()
    {
        return User::whereIn('role', ['supplier', 'under_review', 'active_supplier'])->get();
    }

    public function suppliers(Request $request)
    {
        $query = User::query()->where('role', 'active_supplier');
        if ($request->has('country')) {
            $query->where('country', $request->country);
        }
        return $query->get();
    }

    public function acceptMemberships(Request $request)
    {
        User::where('id', $request->id)->update(['role' => 'active_supplier']);
        return User::whereIn('role', ['supplier', 'under_review', 'active_supplier'])->get();
    }

    public function deleteMemberships(Request $request)
    {
        User::where('id', $request->id)->update(['role' => 'supplier']);
        return User::whereIn('role', ['supplier', 'under_review', 'active_supplier'])->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function createBranch(CreateBranchRequest $request)
    {
        try {

            $branch = new Branch();

            $branch->name = $request->name;
            $branch->location = $request->location;
            $branch->adresse = $request->adresse;
            $branch->country = $request->country;
            $branch->location_type = $request->pickup_type;
            $branch->city = $request->city;
            $branch->phone = $request->phone;
            $branch->lat = $request->lat;
            $branch->lng = $request->lng;
            $branch->email = $request->email;
            $branch->company_id = auth()->user()->id;
            $branch->currency = $request->currency;

            $branch->save();

            return response()->json([
                'message' => 'Branch created successfully',
                'status' => true
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'status' => false
            ], StatusCodes::SERVER_ERROR);
        }
    }

    public function getBranch(Request $request)
    {
        $companyId = auth()->user()->id;


        $branches = Branch::query();
        if ($request->has('company_id')) {
            $branches->where('company_id', $request->company_id);
        } else if ($companyId) {
            $branches->where('company_id', $companyId);
        }
        if ($request->has('country')) {
            $branches->where('country', $request->country);
        }
        return response()->json($branches->get());
    }

    public function deleteBranch(Request $request)
    {
        Branch::where('id', $request->id)->delete();
        return response()->json(['message' => 'Branch deleted successfully']);

    }


    public function profile(Request $request)
    {
        try {
            $user = \auth()->user();
            if (is_null($user) || $user->role != 'customer') {
                return response()->json([
                    'data' => [],
                    'message' => 'no logged in User'
                ], StatusCodes::FORBIDDEN);
            }
            $user->rentals = Rental::query()->where('customer_id', $user->id)->with(['vehicle.supplier', 'vehicle.branch', 'status'])->orderBy('id', 'desc')->get();
            return response()->json([
                'data' => $user
            ]);
        } catch (\Exception $e) {
            info("error while getting the user profile");
            info($e->getMessage());
            return response()->json([
                'data' => [],
                'message' => 'Server Error'
            ], StatusCodes::SERVER_ERROR);
        }

    }

    public function getCustomers(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            $data = User::query()->where('role', 'customer')->get();
            return response()->json([
                'data' => $data,
                'status' => 1
            ]);
        } catch (\Exception $e) {
            info("error while getting the customers");
            info($e->getMessage());
            return response()->json([
                'data' => [],
                'message' => 'Server Error'
            ], StatusCodes::SERVER_ERROR);
        }
    }

    public function forgetPassword(ForgetPasswordRequest $request)
    {
        try {
            $user = User::query()->where('email', $request->email)->first();
            $forgetPasswordLink = url('/') . '/new-password-form?key=' . base64_encode(encrypt($request->email . ',' . Carbon::now()->toDateString(), env('APP_KEY')));
            $user->password_reset_key = $forgetPasswordLink;

            $user->save();
            $user->setNewPasswordLink = $forgetPasswordLink;

            event(new ForgetPasswordEmail($user));
            return response()->json([
                'status' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => true,
            ]);
        }
    }

    public function ValidateForgetPasswordKey(Request $request)
    {

        try {
            if (!$request->has("key")) {
                return response()->json([
                    'status' => false,
                    'message' => ''
                ], StatusCodes::SERVER_ERROR);
            }
            $decryptedKey = explode(',', decrypt(base64_decode($request->key), env('APP_KEY')));
            $email = $decryptedKey[0];
            $date = $decryptedKey[1];
            if (!Carbon::now()->isSameDay($date)) {
                return response()->json([
                    'status' => false,
                    'message' => ''
                ], StatusCodes::FORBIDDEN);
            }
            $user = User::query()->where('email', $email)->first();
            if (is_null($user) || is_null($user->password_reset_key) || $user->password_reset_key != $request->key) {
                return response()->json([
                    'status' => false,
                    'message' => ''
                ], StatusCodes::FORBIDDEN);
            }
            return response()->json([
                'status' => true,
                'data' => $user,
                'message' => 'key validated'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => ''
            ], StatusCodes::SERVER_ERROR);
        }
    }

    public function setNewPassword(SetNewPasswordRequest $request)
    {
        try {
            if (!$request->has("key")) {
                return response()->json([
                    'status' => false,
                    'message' => ''
                ], StatusCodes::SERVER_ERROR);
            }
            $decryptedKey = explode(',', decrypt(base64_decode($request->key), env('APP_KEY')));
            $email = $decryptedKey[0];
            $date = $decryptedKey[1];
            if (!Carbon::now()->isSameDay($date)) {
                return response()->json([
                    'status' => false,
                    'message' => ''
                ], StatusCodes::FORBIDDEN);
            }
            $user = User::query()->where('email', $email)->first();
            if (is_null($user)) {
                return response()->json([
                    'status' => false,
                    'message' => ''
                ], StatusCodes::FORBIDDEN);
            }

            $user->password = Hash::make($request->newPassword);
            $user->password_reset_key = null;
            $user->save();
            return response()->json([
                'status' => true,
                'message' => 'password has been reset successfully '
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }
    }
}

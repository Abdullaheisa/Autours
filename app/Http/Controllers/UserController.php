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
use App\Services\BranchNormalizationService;
use Illuminate\Support\Facades\DB;

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
        // Resolve the authenticated user via sanctum guard (Bearer token) first,
        // then fall back to the session guard. This is safe for both auth modes.
        $authUser = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$authUser) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = User::where('id', $authUser->id)->first();
        $updateData = $request->all();

        // CRITICAL: never allow a profile update to downgrade the user's role.
        // The frontend may include a 'role' field but it must never overwrite the DB value.
        unset($updateData['role']);
        unset($updateData['description']);

        if ($request->has('default_custom_price_tiers')) {
            $tiers = $request->default_custom_price_tiers;
            if (is_string($tiers)) {
                $tiers = json_decode($tiers, true);
            }
            $updateData['default_custom_price_tiers'] = $tiers;
        }

        // Prevent unique constraint violations for phone_num
        if ($request->has('phone_num') && !empty(trim($request->phone_num))) {
            $reqPhone = preg_replace('/[^0-9]/', '', $request->phone_num);
            $userPhone = preg_replace('/[^0-9]/', '', $user->phone_num ?? '');
            if ($reqPhone !== $userPhone) {
                $exists = User::whereRaw("REPLACE(REPLACE(REPLACE(phone_num, '+', ''), ' ', ''), '-', '') = ?", [$reqPhone])
                    ->where('id', '<>', $user->id)->exists();
                if ($exists) {
                    return response()->json([
                        'message' => 'The phone number has already been taken.'
                    ], StatusCodes::BAD_REQUEST);
                }
            } else {
                unset($updateData['phone_num']);
            }
        } else {
            unset($updateData['phone_num']);
        }

        // Prevent unique constraint violations for email
        if ($request->has('email') && !empty(trim($request->email))) {
            $reqEmail = trim(strtolower($request->email));
            $userEmail = trim(strtolower($user->email ?? ''));
            if ($reqEmail !== $userEmail) {
                $exists = User::where('email', $reqEmail)->where('id', '<>', $user->id)->exists();
                if ($exists) {
                    return response()->json([
                        'message' => 'The email address has already been taken.'
                    ], StatusCodes::BAD_REQUEST);
                }
            } else {
                unset($updateData['email']);
            }
        } else {
            unset($updateData['email']);
        }

        if ($request->hasFile('logo')) {
            $image      = $request->file('logo');
            $image_name = $authUser->name . '_logo' . md5(Carbon::now()->toDateString()) . '.' . $image->extension();
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

        $oldName = $user->name;
        $oldCompany = $user->company;

        $user->update($updateData);

        // Synchronize description to CarRentalBrand
        if ($request->has('description')) {
            \App\Models\CarRentalBrand::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'description' => $request->description,
                    'name' => $user->company ?: $user->name,
                    'slug' => \Illuminate\Support\Str::slug($user->company ?: $user->name),
                    'display_name' => ($user->company ?: $user->name) . ' Car Rental',
                    'logo' => $user->logo ?: '/img/company_logos/default.png',
                ]
            );
        }

        // Dynamic propagation to associated models (e.g., Blog author string)
        if ($request->has('name') && $user->name !== $oldName && !empty($oldName)) {
            \App\Models\Blog::where('author', $oldName)->update(['author' => $user->name]);
        }
        if ($request->has('company') && $user->company !== $oldCompany && !empty($oldCompany)) {
            \App\Models\Blog::where('author', $oldCompany)->update(['author' => $user->company]);
        }

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
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? Auth::user();
        if ($user) {
            return response()->json($user->role);
        } else {
            return response()->json(null);
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

    public function index()
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
        if ($user) {
            if (isset($user->language)) {
                $user->language = explode(',', $user->language);
            }
            $brand = \App\Models\CarRentalBrand::where('user_id', $user->id)->first();
            $user->description = $brand ? $brand->description : null;
        }
        return $user;

    }

    public function Companies()
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? \auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $query = User::query()
            ->whereIn('role', ['active_supplier', 'supplier', 'under_review', 'suspended_supplier']);

        if ($user->role != 'admin') {
            $query->where('parent_company_id', $user->id);
        }

        $companies = $query->with(['parent', 'branches:id,company_id,country,activation'])
            ->withCount(['vehicles'])
            ->get()
            ->makeVisible('vehicles_hidden');

        // Calculate real rental stats, revenue, and average ratings from database
        $stats = DB::table('rentals')
            ->select('supplier_id')
            ->selectRaw('count(*) as bookings_count')
            ->selectRaw('avg(rate) as average_rating')
            ->selectRaw("sum(case when order_status in (2, 7) then (case when supplier_price > 0 then supplier_price else price end) else 0 end) as total_revenue")
            ->groupBy('supplier_id')
            ->get()
            ->keyBy('supplier_id');

        return $companies->map(function($company) use ($stats) {
            $companyStats = $stats->get($company->id);
            $company->rentals_count = $companyStats ? (int) $companyStats->bookings_count : 0;
            $company->revenue = $companyStats ? (float) $companyStats->total_revenue : 0.0;
            $company->rating = $companyStats && $companyStats->average_rating !== null ? round((float) $companyStats->average_rating, 2) : 0.0;
            return $company;
        });
    }

    public function getLogos()
    {
        return User::query()->where('role', 'active_supplier')->whereNotNull('logo')->take(4)->pluck('logo');
    }

    public function membership()
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
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
            $supplierIds = Branch::where('country', $request->country)->pluck('company_id');
            $query->whereIn('id', $supplierIds);
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
            $branch->location_type = $request->input('pickup_type', $request->input('location_type', 'City'));
            $branch->city = $request->city;
            $branch->phone = $request->phone;
            $branch->lat = $request->lat;
            $branch->lng = $request->lng;
            $branch->email = $request->email;
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            $branch->company_id = $user->id;
            $branch->currency = $request->currency;
            $branch->abriviation = $request->abriviation;

            $branch->save();

            // Normalize branch name/location against canonical airports
            $normalizer = new BranchNormalizationService();
            $normData = $normalizer->normalize(
                $branch->name ?? '',
                $branch->city ?? '',
                $branch->country ?? '',
                $branch->station_id,
                $branch->abriviation
            );
            $branch->update($normData);

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
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
        $companyId = $user ? $user->id : null;


        $branches = Branch::query();
        if ($request->has('company_id')) {
            $branches->where('company_id', $request->company_id);
        } else if ($companyId && $user && $user->role === 'active_supplier') {
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
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? \auth()->user();
            if (is_null($user) || $user->role != 'customer') {
                return response()->json([
                    'data' => [],
                    'message' => 'no logged in User'
                ], StatusCodes::FORBIDDEN);
            }
            $user->rentals = Rental::query()->where('customer_id', $user->id)->with(['vehicle.supplierUser', 'vehicle.branch', 'status'])->orderBy('id', 'desc')->get();
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
            $data = User::query()
                ->where('role', 'customer')
                ->withCount('customerRentals as rentals_count')
                ->get();

            $data->each(function($customer) {
                // Calculate average rating of reviews: average of 'rate' column in all customer rentals
                $avgRate = Rental::where('customer_id', $customer->id)
                    ->whereNotNull('rate')
                    ->avg('rate');
                $customer->setAttribute('rating', $avgRate ? round($avgRate, 1) : 0);
                
                // Formulate correct address: Address, City, Country
                $addressParts = [];
                if (!empty($customer->address)) $addressParts[] = $customer->address;
                if (!empty($customer->city)) $addressParts[] = $customer->city;
                if (!empty($customer->country)) $addressParts[] = $customer->country;
                
                $customer->setAttribute('formatted_address', count($addressParts) > 0 ? implode(', ', $addressParts) : 'N/A');
            });

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

    public function deleteCustomer(Request $request): \Illuminate\Http\JsonResponse
    {
        try {
            User::where('id', $request->id)->where('role', 'customer')->delete();
            $data = User::query()->where('role', 'customer')->get();
            return response()->json([
                'data' => $data,
                'status' => 1,
                'message' => 'Customer deleted successfully'
            ]);
        } catch (\Exception $e) {
            info("error while deleting the customer");
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
            if ($user) {
                $key = base64_encode(encrypt($request->email . ',' . Carbon::now()->toDateString(), env('APP_KEY')));
                $forgetPasswordLink = url('/') . '/new-password-form?key=' . $key;
                
                $user->password_reset_key = $key;
                $user->save();
                
                $user->setNewPasswordLink = $forgetPasswordLink;

                \Illuminate\Support\Facades\Mail::to($user->email)->send(new ForgetPasswordEmail(json_encode(['user' => $user])));
            }
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
            if (is_null($user) || is_null($user->password_reset_key) || ($user->password_reset_key != $request->key && !str_ends_with($user->password_reset_key, $request->key))) {
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
            if (is_null($user) || is_null($user->password_reset_key) || ($user->password_reset_key != $request->key && !str_ends_with($user->password_reset_key, $request->key))) {
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

    /**
     * Toggle vehicles visibility for a supplier.
     * When hidden, the supplier's vehicles won't appear in public search results.
     */
    public function toggleSupplierVehiclesVisibility(int $id)
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $supplier = User::findOrFail($id);
        $supplier->vehicles_hidden = !$supplier->vehicles_hidden;
        $supplier->save();

        return response()->json([
            'status' => true,
            'vehicles_hidden' => $supplier->vehicles_hidden,
            'message' => $supplier->vehicles_hidden
                ? 'Supplier vehicles are now hidden from search results.'
                : 'Supplier vehicles are now visible in search results.'
        ]);
    }
}

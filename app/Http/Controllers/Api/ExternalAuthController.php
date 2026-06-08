<?php

namespace App\Http\Controllers\Api;

use App\Enums\StatusCodes;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ExternalLoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class ExternalAuthController extends Controller
{
    /**
     * Handle external API login for suppliers.
     *
     * @param ExternalLoginRequest $request
     * @return JsonResponse
     */
    public function login(ExternalLoginRequest $request): JsonResponse
    {
        $user = User::query()
            ->where('email', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials.',
            ], StatusCodes::UNAUTHORIZED);
        }

        if (!in_array($user->role, ['admin', 'supplier', 'active_supplier', 'customer', 'under_review'], true)) {
            return response()->json([
                'status' => false,
                'message' => 'Your account role cannot access this API.',
            ], StatusCodes::FORBIDDEN);
        }

        // Revoke existing tokens (optional - uncomment if you want single device login)
        // $user->tokens()->delete();

        $token = $user->createToken('supplier-api-token', ['supplier:*'])->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login successful.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }

    /**
     * Handle external API logout for suppliers.
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        $user = request()->user();

        if ($user) {
            // Revoke the current token
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get the authenticated supplier's profile.
     *
     * @return JsonResponse
     */
    public function profile(): JsonResponse
    {
        $user = request()->user();

        return response()->json([
            'status' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone_num,
                'company_name' => $user->company ?? null,
                'integration' => $user->integration,
                'webhook_url' => $user->webhook_url,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Update the supplier's integration settings.
     *
     * @return JsonResponse
     */
    public function updateIntegrationSettings(): JsonResponse
    {
        $user = request()->user();

        $validated = request()->validate([
            'integration' => ['required', 'boolean'],
            'webhook_url' => ['nullable', 'url', 'max:500'],
        ]);

        // If enabling integration, webhook_url is required
        if ($validated['integration'] && empty($validated['webhook_url'])) {
            return response()->json([
                'status' => false,
                'message' => 'Webhook URL is required when enabling integration.',
            ], StatusCodes::BAD_REQUEST);
        }

        $user->update([
            'integration' => $validated['integration'],
            'webhook_url' => $validated['webhook_url'],
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Integration settings updated successfully.',
            'data' => [
                'integration' => $user->integration,
                'webhook_url' => $user->webhook_url,
            ],
        ]);
    }

    /**
     * Get the supplier's rentals.
     *
     * @return JsonResponse
     */
    public function getRentals(): JsonResponse
    {
        $user = request()->user();

        $rentals = \App\Models\Rental::query()
            ->whereHas('vehicle', function ($query) use ($user) {
                $query->where('supplier', $user->id);
            })
            ->orWhere('supplier_id', $user->id)
            ->with(['vehicle', 'customer', 'status', 'paymentMethod'])
            ->orderByDesc('created_at')
            ->paginate(request()->get('per_page', 15));

        return response()->json([
            'status' => true,
            'data' => $rentals,
        ]);
    }

    /**
     * Get all available "What's Included" items.
     *
     * @return JsonResponse
     */
    public function getIncluded(): JsonResponse
    {
        $included = \App\Models\Included::query()
            ->where('is_promo', 0)
            ->orderBy('what_is_included')
            ->get(['id', 'what_is_included', 'description']);

        return response()->json([
            'status' => true,
            'data' => $included,
        ]);
    }

    /**
     * Get all available categories.
     *
     * @return JsonResponse
     */
    public function getCategories(): JsonResponse
    {
        $categories = \App\Models\Category::query()
            ->orderBy('name')
            ->get(['id', 'name', 'photo']);

        return response()->json([
            'status' => true,
            'data' => $categories,
        ]);
    }

    /**
     * Get all available fuel policies.
     *
     * @return JsonResponse
     */
    public function getFuelPolicies(): JsonResponse
    {
        $fuelPolicies = \App\Models\FuelPolicy::query()
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        return response()->json([
            'status' => true,
            'data' => $fuelPolicies,
        ]);
    }

    /**
     * Get all location types.
     *
     * @return JsonResponse
     */
    public function getLocationTypes(): JsonResponse
    {
        $locationTypes = \App\Models\LocationType::query()
            ->orderBy('name')
            ->select(['id', 'name as type', 'icon'])
            ->get();

        return response()->json([
            'status' => true,
            'data' => $locationTypes,
        ]);
    }

    /**
     * Get supplier's branches.
     *
     * @return JsonResponse
     */
    public function getBranches(): JsonResponse
    {
        $user = request()->user();

        $branches = \App\Models\Branch::query()
            ->where('company_id', $user->id)
            ->orderBy('location')
            ->get(['id', 'name', 'location', 'adresse', 'city', 'country']);

        return response()->json([
            'status' => true,
            'data' => $branches,
        ]);
    }
}

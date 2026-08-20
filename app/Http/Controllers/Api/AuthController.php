<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Enums\StatusCodes;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Events\NewSupplier;

class AuthController extends Controller
{
    /**
     * Stateless user registration.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'unique:users,phone_num'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $validator->errors(),
            ], StatusCodes::BAD_REQUEST);
        }

        try {
            $role = 'customer';
            if ($request->supplier == 1 || $request->role === 'supplier' || $request->role === 'under_review') {
                $role = 'under_review';
            } elseif ($request->role === 'admin') {
                $role = 'admin';
            }

            $user = User::create([
                'name' => $request->name,
                'phone_num' => $request->phone,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'country' => $request->country ?? null,
                'role' => $role,
            ]);

            if ($role === 'under_review' && class_exists(NewSupplier::class)) {
                try {
                    event(new NewSupplier($user->email));
                } catch (\Exception $mailEx) {
                    \Illuminate\Support\Facades\Log::error('Failed to send NewSupplier email: ' . $mailEx->getMessage());
                }
            }

            return response()->json([
                'status' => true,
                'message' => 'Registration successful. Please login.',
            ], StatusCodes::SUCCESS);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Server error during registration.',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Stateless login issuing plain text Sanctum token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error.',
                'errors' => $validator->errors(),
            ], StatusCodes::BAD_REQUEST);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid credentials.',
                ], StatusCodes::UNAUTHORIZED);
            }

            // Create Sanctum Plain Text Token
            $token = $user->createToken('API_TOKEN')->plainTextToken;

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'logo' => $user->logo,
                'phone_num' => $user->phone_num,
                'country' => $user->country,
            ];

            return response()->json([
                'status' => true,
                'message' => 'Login successful.',
                'token' => $token,
                'user' => $userData,
                'data' => $userData, // Ensure compatibility with both Redux formats
            ], StatusCodes::SUCCESS);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Server error during login.',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Stateless logout revoking the active Sanctum token.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user) {
                $token = $user->currentAccessToken();
                if ($token && method_exists($token, 'delete')) {
                    $token->delete();
                }

                // Fallback direct check via bearer token
                $bearerToken = $request->bearerToken();
                if ($bearerToken) {
                    $tokenInstance = \Laravel\Sanctum\PersonalAccessToken::findToken($bearerToken);
                    if ($tokenInstance) {
                        $tokenInstance->delete();
                    }
                }
            }

            return response()->json([
                'status' => true,
                'message' => 'Successfully logged out.',
            ], StatusCodes::SUCCESS);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Logout Error: ' . $e->getMessage());
            
            // Return success even on warnings to ensure the frontend clears local state cleanly
            return response()->json([
                'status' => true,
                'message' => 'Logged out with warnings.',
            ], StatusCodes::SUCCESS);
        }
    }

    /**
     * Securely impersonate a supplier/user. Only accessible to administrators.
     */
    public function impersonate(Request $request, $userId): JsonResponse
    {
        $admin = $request->user();
        if (!$admin || $admin->role !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized. Only administrators can impersonate.',
            ], StatusCodes::UNAUTHORIZED);
        }

        try {
            $user = User::findOrFail($userId);

            // Create Sanctum Plain Text Token for the impersonated user
            $token = $user->createToken('API_TOKEN')->plainTextToken;

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'logo' => $user->logo,
                'phone_num' => $user->phone_num,
                'country' => $user->country,
            ];

            return response()->json([
                'status' => true,
                'message' => 'Impersonation successful.',
                'token' => $token,
                'user' => $userData,
                'data' => $userData,
            ], StatusCodes::SUCCESS);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Server error during impersonation.',
                'error' => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }
}

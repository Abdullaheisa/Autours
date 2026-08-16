<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class isCustomer
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // 1. Check Sanctum Bearer token first (priority for API requests)
        $user = Auth::guard('sanctum')->user();

        // 2. Fallback to web session only if no Sanctum Bearer token was provided
        if (!$user) {
            $user = Auth::guard('web')->user() ?? Auth::user();
        }

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Unauthenticated. Please log in or register as a customer to place a booking.',
            ], 401);
        }

        if ($user->role === 'customer' || $user->role === 'user' || empty($user->role)) {
            if (Auth::guard('sanctum')->check()) {
                Auth::shouldUse('sanctum');
            } else {
                Auth::setUser($user);
            }
            return $next($request);
        }

        return response()->json([
            'status' => false,
            'message' => 'Only customer accounts can place vehicle bookings. Administrator and Supplier accounts cannot book vehicles.',
        ], 403);
    }
}

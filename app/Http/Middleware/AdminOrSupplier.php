<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Closure;

class AdminOrSupplier
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if ($user && ($user->role == 'admin' || $user->role == 'active_supplier' || $user->role == 'supplier' || $user->role == 'under_review')) {
            if (Auth::guard('sanctum')->check()) {
                Auth::shouldUse('sanctum');
            } else {
                Auth::setUser($user);
            }
            return $next($request);
        }
        
        return response()->json(['error' => 'Unauthorized'], 401);
    }
}

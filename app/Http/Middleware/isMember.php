<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class isMember
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
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if ($user && ($user->role == 'active_supplier' || $user->role == 'supplier' || $user->role == 'reviewing' || $user->role == 'under_review')) {
            if (Auth::guard('sanctum')->check()) {
                Auth::shouldUse('sanctum');
            } else {
                Auth::setUser($user);
            }
            return $next($request);
        } else {
            return abort(403, 'Unauthorized');
        }
    }
}

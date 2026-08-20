<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/auth/*',
        'api/auth/login',
        'api/auth/register',
        'api/auth/logout',
        'post/*',
        'delete/*',
        'edit/*',
        'update/*',
        'accept/*',
        'select-*',
        'branches/*',
        'promo',
        'promo/*',
        'payment_methods',
        'upload',
        'change-company',
        'book/vehicles',
        'cancel/booking',
        'rating',
        'forget-password',
        'validate-forget-password-key',
        'save-new-password',
        'filter/vehicles',
        'search/vehicles',
        'assign-parent',
        'upload/branch',
        'accept/rentals',
        'delete/rentals',
        'rentals/reconcile',
        'post/vehicles',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     *
     * @throws \Illuminate\Session\TokenMismatchException
     */
    public function handle($request, \Closure $next)
    {
        // Bypass CSRF securely for stateless Sanctum Bearer token requests
        $token = $request->bearerToken();
        if ($token) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken && $accessToken->tokenable) {
                return $next($request);
            }
        }

        return parent::handle($request, $next);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SwaggerAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = env('SWAGGER_USER', 'admin');
        $pass = env('SWAGGER_PASS', 'admin');

        if ($request->getUser() !== $user || $request->getPassword() !== $pass) {
            return response('Unauthorized.', 401, ['WWW-Authenticate' => 'Basic realm="API Documentation"']);
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Enums\StatusCodes;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Providers\RouteServiceProvider;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Inertia\Inertia;
use function Symfony\Component\Translation\t;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = RouteServiceProvider::HOME;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    public function create()
    {
        return Inertia::render('Auth/Login');
    }

    public function store(LoginRequest $request)
    {
        try {
            $credentials = $request->validate([
                'email' => ['required', 'email'],
                'password' => ['required'],
            ]);


            $user = User::query()->where('email', $request->email)->with(['children'])->first();

            if (Auth::attempt($credentials)) {
                $request->session()->regenerate();
            }
            if (\auth()->user()) {
                return response()->json([
                    'data' => [],
                    'status' => true,
                    'children' => count($user->children),
                    'user_type' => \auth()->user()->role
                ]);
            }
            return response()->json([
                'message' => ['Credentials not valid'],
                'status' => false,
            ], StatusCodes::SERVER_ERROR);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'status' => false
            ], status:StatusCodes::SERVER_ERROR);
        }

    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

}

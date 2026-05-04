<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignRentalTerm;
use App\Http\Requests\CreateRentalTerms;
use App\Models\Currency;
use App\Models\FuelPolicy;
use App\Models\RentalTerms;
use App\Models\SupplierRentalTerm;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Category;
use App\Models\Specification;
use App\Models\Vehicle;
use App\Models\Branch;
use App\Models\VehiclesPhotos;
use App\Models\Rental;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class FuelPolicyController extends Controller
{
    /**
     * Display a listing of the resource.
     */


    public function index()
    {
        return FuelPolicy::query()->get();
    }
}

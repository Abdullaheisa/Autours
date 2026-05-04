<?php

namespace App\Http\Controllers;

use App\Http\Requests\Dashboard\CreateCategoryRequest;
use App\Http\Requests\Dashboard\UpdateCategoryRequest;
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

class CategoriesController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {

      return Branch::query()->distinct('country')->get()->unique('country')->pluck('country');

    }

    public function createCategories(CreateCategoryRequest $request)
    {
        $item = new Category();

        if ($request->hasFile('photo')) {
            $image = $request->file('photo');
            $image_name = $request->file('photo')->getClientOriginalName() . "_" . "_category" . "." . $request->file('photo')->extension();
            $image->move(public_path('img/categories'), $image_name);

            $item->photo = $image_name;
        }

        if ($request->has('name')) {
            $item->name = $request->name;
        }

        $item->save();

        return response()->json(['message' => 'Added successfully']);
    }
    public function updateCategories(UpdateCategoryRequest $request)
    {
        $item = Category::query()->find($request->id);
        if ($request->hasFile('photo')) {
            $image = $request->file('photo');
            $image_name = $request->file('photo')->getClientOriginalName() . "_" . "_category" . "." . $request->file('photo')->extension();
            $image->move(public_path('img/categories'), $image_name);

            $item->photo = $image_name;
        }

        if ($request->has('name')) {
            $item->name = $request->name;
        }

        $item->save();

        return response()->json(['message' => 'updated successfully']);
    }

}

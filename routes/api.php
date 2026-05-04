<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BlogCategoryController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\Api\ExternalAuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

/*
|--------------------------------------------------------------------------
| External Supplier API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('external/supplier')->group(function () {
    // Public authentication routes
    Route::post('/login', [ExternalAuthController::class, 'login'])->name('external.supplier.login');

    // Protected routes (require authentication)
    Route::middleware(['auth:sanctum'])->group(function () {
        // Auth routes
        Route::post('/logout', [ExternalAuthController::class, 'logout'])->name('external.supplier.logout');
        Route::get('/profile', [ExternalAuthController::class, 'profile'])->name('external.supplier.profile');
        Route::put('/integration-settings', [ExternalAuthController::class, 'updateIntegrationSettings'])->name('external.supplier.integration-settings');

        // Vehicle routes
        Route::get('/vehicles', [VehicleController::class, 'getVehiclesExternal'])->name('external.supplier.vehicles.index');
        Route::post('/vehicles', [VehicleController::class, 'createExternal'])->name('external.supplier.vehicles.store');
        Route::put('/vehicles/{vehicleId}/price', [VehicleController::class, 'updatePriceExternal'])->name('external.supplier.vehicles.update-price');

        // Rental routes
        Route::get('/rentals', [ExternalAuthController::class, 'getRentals'])->name('external.supplier.rentals');

        // Reference data routes
        Route::get('/included', [ExternalAuthController::class, 'getIncluded'])->name('external.supplier.included');
        Route::get('/categories', [ExternalAuthController::class, 'getCategories'])->name('external.supplier.categories');
        Route::get('/fuel-policies', [ExternalAuthController::class, 'getFuelPolicies'])->name('external.supplier.fuel-policies');
        Route::get('/location-types', [ExternalAuthController::class, 'getLocationTypes'])->name('external.supplier.location-types');
        Route::get('/branches', [ExternalAuthController::class, 'getBranches'])->name('external.supplier.branches');
    });
});

/*
|--------------------------------------------------------------------------
| Blog Routes
|--------------------------------------------------------------------------
*/

// Blog Category Routes
Route::prefix('blog-categories')->group(function () {
    // Public routes
    Route::get('/', [BlogCategoryController::class, 'index'])->name('blog-categories.index');
    Route::get('/active', [BlogCategoryController::class, 'active'])->name('blog-categories.active');
    Route::get('/{blogCategory}', [BlogCategoryController::class, 'show'])->name('blog-categories.show');
    Route::get('/{category}/blogs', [BlogController::class, 'getBlogsByCategory'])->name('blog-categories.blogs');

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [BlogCategoryController::class, 'store'])->name('blog-categories.store');
        Route::put('/{blogCategory}', [BlogCategoryController::class, 'update'])->name('blog-categories.update');
        Route::delete('/{blogCategory}', [BlogCategoryController::class, 'destroy'])->name('blog-categories.destroy');
        Route::patch('/{blogCategory}/toggle-activation', [BlogCategoryController::class, 'toggleActivation'])->name('blog-categories.toggle-activation');
    });
});

// Blog Routes
Route::prefix('blogs')->group(function () {

    // Public routes
    Route::get('/', [BlogController::class, 'index'])->name('blogs.index');
    Route::get('/published', [BlogController::class, 'published'])->name('blogs.published');
    Route::get('/slug/{slug}', [BlogController::class, 'showBySlug'])->name('blogs.show-by-slug');
    Route::get('/{blog}', [BlogController::class, 'show'])->name('blogs.show');

    // Protected routes
});


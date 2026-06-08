<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BlogCategoryController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\Api\ExternalAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
|
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/get/user/data', [\App\Http\Controllers\UserController::class, 'index']);
    Route::get('/get/user/role', [\App\Http\Controllers\UserController::class, 'role']);
    Route::get('/my-current-user-profile', [\App\Http\Controllers\UserController::class, 'profile']);
    Route::post('/vehicles/bulk-upload', [\App\Http\Controllers\VehicleController::class, 'bulkUpload']);
});

Route::post('/jimpisoft/refresh-prices', [VehicleController::class, 'refreshJimpisoftPrices'])->name('jimpisoft.refresh-prices');
Route::post('/emr/refresh-prices', [VehicleController::class, 'refreshEmrPrices'])->name('emr.refresh-prices');
Route::post('/surprice/refresh-prices', [VehicleController::class, 'refreshSurpricePrices'])->name('surprice.refresh-prices');

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
        Route::post('/vehicles/toggle-activation', [VehicleController::class, 'updateActivation'])->name('external.supplier.vehicles.toggle-activation');
        Route::put('/vehicles/{vehicleId}/price', [VehicleController::class, 'updatePriceExternal'])->name('external.supplier.vehicles.update-price');
        Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy'])->name('external.supplier.vehicles.destroy');

        // Rental routes
        Route::get('/rentals', [ExternalAuthController::class, 'getRentals'])->name('external.supplier.rentals');

        // Reference data routes
        Route::get('/included', [ExternalAuthController::class, 'getIncluded'])->name('external.supplier.included');
        Route::get('/categories', [ExternalAuthController::class, 'getCategories'])->name('external.supplier.categories');
        Route::get('/fuel-policies', [ExternalAuthController::class, 'getFuelPolicies'])->name('external.supplier.fuel-policies');
        Route::get('/location-types', [ExternalAuthController::class, 'getLocationTypes'])->name('external.supplier.location-types');
        Route::get('/branches', [ExternalAuthController::class, 'getBranches'])->name('external.supplier.branches');
        
        // Dashboard route
        Route::get('/dashboard', [DashboardController::class, 'supplierDashboard'])->name('external.supplier.dashboard');
    });
});

/*
|--------------------------------------------------------------------------
| Supplier / Company Settings API Routes (Bearer Token Auth)
|--------------------------------------------------------------------------
*/
Route::prefix('supplier')->middleware(['auth:sanctum', 'active_supplier'])->group(function () {
    // Payment Methods
    Route::get('get/payment_methods', [\App\Http\Controllers\PaymentMethodsController::class, 'index']);
    Route::post('payment_methods', [\App\Http\Controllers\PaymentMethodsController::class, 'store']);

    // Rental Terms
    Route::get('get/rental-terms', [\App\Http\Controllers\RentalTermsController::class, 'index']);
    Route::post('select-rental-terms', [\App\Http\Controllers\RentalTermsController::class, 'assignRentalTerms']);

    // Branches
    Route::post('upload/branch', [\App\Http\Controllers\UserController::class, 'createBranch']);
    Route::get('get/branches', [\App\Http\Controllers\UserController::class, 'getBranch']);
    Route::post('delete/branches', [\App\Http\Controllers\UserController::class, 'deleteBranch']);

    // Promos
    Route::get('promo', [\App\Http\Controllers\PromosController::class, 'index']);
    Route::post('promo', [\App\Http\Controllers\PromosController::class, 'store']);
    Route::delete('promo/{id}', [\App\Http\Controllers\PromosController::class, 'destroy']);

    // Vehicles Management
    Route::get('edit/vehicles/{id}', [\App\Http\Controllers\VehicleController::class, 'edit']);

    // Dashboard Stats
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'supplierDashboard']);
});

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    
    // Customers
    Route::get('/get/customers', [\App\Http\Controllers\UserController::class, 'getCustomers']);
    Route::post('/delete/customers', [\App\Http\Controllers\UserController::class, 'deleteCustomer']);

    // Subscribers
    Route::get('/get/subscribers', [\App\Http\Controllers\SubscriberController::class, 'index']);
    Route::post('/delete/subscribers', [\App\Http\Controllers\SubscriberController::class, 'destroy']);

    // Rentals
    Route::get('/get/rentals/admin', [\App\Http\Controllers\BookingsController::class, 'getAdminRentals']);
    
    // Specifications
    Route::post('/post/specifications', [\App\Http\Controllers\SpecificationsController::class, 'create']);
    Route::post('/specifications/update', [\App\Http\Controllers\SpecificationsController::class, 'update']);
    Route::post('/delete/specifications', [\App\Http\Controllers\SpecificationsController::class, 'destroy']);

    // Rental Terms
    Route::post('/delete/rental-terms', [\App\Http\Controllers\RentalTermsController::class, 'destroy']);
    Route::post('/update/rental-terms/status', [\App\Http\Controllers\RentalTermsController::class, 'approveOrReject']);

    // What's Included
    Route::post('/post/included', [\App\Http\Controllers\IncludedController::class, 'store']);
    Route::post('/post/included/update', [\App\Http\Controllers\IncludedController::class, 'update']);
    Route::post('/delete/included', [\App\Http\Controllers\IncludedController::class, 'delete']);

    // Promos Admin Definitions
    Route::post('/post/promos/definitions/status', [\App\Http\Controllers\PromosController::class, 'updateDefinitionStatus']);
    Route::post('/post/promos/definitions/update', [\App\Http\Controllers\PromosController::class, 'updateDefinition']);
    Route::post('/delete/promos/definitions', [\App\Http\Controllers\PromosController::class, 'deleteDefinition']);

    // Categories
    Route::post('/post/categories', [\App\Http\Controllers\CategoriesController::class, 'createCategories']);
    Route::post('/update/categories', [\App\Http\Controllers\CategoriesController::class, 'updateCategories']);
    Route::post('/delete/categories', [\App\Http\Controllers\VehicleController::class, 'deleteCategories']);

    // Photos
    Route::post('/post/photos', [\App\Http\Controllers\VehicleController::class, 'createPhotos']);
    Route::post('/delete/photos', [\App\Http\Controllers\VehicleController::class, 'deletePhotos']);

    // Profits
    Route::post('/profit/upload', [\App\Http\Controllers\ProfitsController::class, 'upload']);

    // Background Settings
    Route::get('/background-settings', [\App\Http\Controllers\BackgroundSettingsController::class, 'index']);
    Route::post('/background-settings', [\App\Http\Controllers\BackgroundSettingsController::class, 'store']);
    Route::delete('/background-settings/{id}', [\App\Http\Controllers\BackgroundSettingsController::class, 'destroy']);
    Route::post('/background-settings/{id}', [\App\Http\Controllers\BackgroundSettingsController::class, 'update']);
    Route::post('/background-settings/{id}/reset', [\App\Http\Controllers\BackgroundSettingsController::class, 'resetToDefault']);

    // Company & Requests
    Route::get('/get/companies', [\App\Http\Controllers\UserController::class, 'Companies']);
    Route::get('/get/requests', [\App\Http\Controllers\UserController::class, 'memberships']);
    Route::post('/accept/requests', [\App\Http\Controllers\UserController::class, 'acceptMemberships']);
    Route::post('/delete/requests', [\App\Http\Controllers\UserController::class, 'deleteMemberships']);
});
Route::get('/db-debug', function() {
    return response()->json([
        'vehicles' => \App\Models\Vehicle::get(['id', 'name', 'supplier', 'activation'])->toArray(),
        'users' => \App\Models\User::get(['id', 'name', 'email', 'role'])->toArray(),
        'rentals' => \App\Models\Rental::get(['id', 'supplier_id', 'vehicle_id', 'price', 'supplier_price', 'order_status'])->toArray()
    ]);
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
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [BlogController::class, 'store'])->name('api.blogs.store');
        Route::post('/{blog}', [BlogController::class, 'update'])->name('api.blogs.update');
        Route::put('/{blog}', [BlogController::class, 'update'])->name('api.blogs.put-update');
        Route::delete('/{blog}', [BlogController::class, 'destroy'])->name('api.blogs.destroy');
        Route::patch('/{blog}/toggle-publish', [BlogController::class, 'togglePublish'])->name('api.blogs.toggle-publish');
    });
});

// Legacy API Endpoints (migrated from web.php for /api prefix support)
Route::get('get/suppliers', [\App\Http\Controllers\UserController::class, 'suppliers']);
Route::post('/get/vehicle/data', [\App\Http\Controllers\VehicleController::class, 'getVehicle']);
Route::get('/get/countries', [\App\Http\Controllers\CountryController::class, 'index']);
Route::get('/my-current-user-profile', [\App\Http\Controllers\UserController::class, 'profile']);
Route::get('get/categories', [\App\Http\Controllers\VehicleController::class, 'getCategories']);
Route::get('get/specifications', [\App\Http\Controllers\SpecificationsController::class, 'index']);
Route::post('post/specifications', [\App\Http\Controllers\SpecificationsController::class, 'create']);
Route::post('specifications/update', [\App\Http\Controllers\SpecificationsController::class, 'update']);
Route::post('delete/specifications', [\App\Http\Controllers\SpecificationsController::class, 'destroy']);
Route::post('get/filtered/specifications', [\App\Http\Controllers\VehicleController::class, 'getFilteredSpecifications']);
Route::get('results', [\App\Http\Controllers\VehicleController::class, 'index']);
Route::get('/get/logos', [\App\Http\Controllers\UserController::class, 'getLogos']);
Route::get('/get/backgrounds', [\App\Http\Controllers\BackgroundSettingsController::class, 'getBackgrounds']);
Route::get('get/priceTax', [\App\Http\Controllers\UserController::class, 'priceTax']);
Route::post('filter/vehicles', [\App\Http\Controllers\VehicleController::class, 'filter']);
Route::get('get/vehicles', [\App\Http\Controllers\VehicleController::class, 'show']);
Route::post('/search/vehicles', [\App\Http\Controllers\VehicleController::class, 'search']);
Route::get('/get/locations', [\App\Http\Controllers\VehicleController::class, 'getLocations']);
Route::get('/get/rentals', [\App\Http\Controllers\BookingsController::class, 'getRentals'])->middleware('auth:sanctum');
Route::get('/get/rentals/admin', [\App\Http\Controllers\BookingsController::class, 'getAdminRentals']);
Route::post('/delete/rentals', [\App\Http\Controllers\BookingsController::class, 'destroy']);
// Customers
Route::get('get/customers', [\App\Http\Controllers\UserController::class, 'getCustomers']);
Route::post('delete/customers', [\App\Http\Controllers\UserController::class, 'deleteCustomer']);

// Subscribers
Route::get('get/subscribers', [\App\Http\Controllers\SubscriberController::class, 'index']);
Route::post('delete/subscribers', [\App\Http\Controllers\SubscriberController::class, 'destroy']);

// Included
Route::get('get/included', [\App\Http\Controllers\IncludedController::class, 'index']);
Route::post('post/included', [\App\Http\Controllers\IncludedController::class, 'store']);
Route::post('post/included/update', [\App\Http\Controllers\IncludedController::class, 'update']);
Route::post('delete/included', [\App\Http\Controllers\IncludedController::class, 'delete']);

// Promos Shared Definitions
Route::middleware('auth:sanctum')->group(function () {
    Route::get('get/promos/definitions', [\App\Http\Controllers\PromosController::class, 'getDefinitions']);
    Route::post('post/promos/definitions', [\App\Http\Controllers\PromosController::class, 'storeDefinition']);
    Route::post('delete/promos/definitions', [\App\Http\Controllers\PromosController::class, 'deleteDefinition']);
});

// Rental Terms
Route::get('get/rental-terms', [\App\Http\Controllers\RentalTermsController::class, 'index']);
Route::post('post/rental-terms', [\App\Http\Controllers\RentalTermsController::class, 'insert']);
Route::post('delete/rental-terms', [\App\Http\Controllers\RentalTermsController::class, 'destroy']);
Route::post('edit/rental-terms', [\App\Http\Controllers\RentalTermsController::class, 'edit']);
Route::post('show/rental-terms', [\App\Http\Controllers\RentalTermsController::class, 'show']);
Route::post('update/rental-terms/status', [\App\Http\Controllers\RentalTermsController::class, 'approveOrReject']);
Route::post('select-rental-terms', [\App\Http\Controllers\RentalTermsController::class, 'assignRentalTerms'])->middleware('auth:sanctum');

// Payment Methods
Route::get('get/payment_methods', [\App\Http\Controllers\PaymentMethodsController::class, 'index'])->middleware('auth:sanctum');
Route::post('payment_methods', [\App\Http\Controllers\PaymentMethodsController::class, 'store'])->middleware('auth:sanctum');

// Background Settings
Route::get('/background-settings', [\App\Http\Controllers\BackgroundSettingsController::class, 'index']);
Route::post('/background-settings', [\App\Http\Controllers\BackgroundSettingsController::class, 'store']);
Route::delete('/background-settings/{id}', [\App\Http\Controllers\BackgroundSettingsController::class, 'destroy']);
Route::post('/background-settings/{id}', [\App\Http\Controllers\BackgroundSettingsController::class, 'update']);
Route::post('/background-settings/{id}/reset', [\App\Http\Controllers\BackgroundSettingsController::class, 'resetToDefault']);
Route::get('get/photos', [\App\Http\Controllers\VehicleController::class, 'getPhotos']);
Route::get('get/currencies', [\App\Http\Controllers\CurrencyController::class, 'index']);
Route::get('get/fuel-policies', [\App\Http\Controllers\FuelPolicyController::class, 'index']);
Route::get('get/included', [\App\Http\Controllers\IncludedController::class, 'index']);

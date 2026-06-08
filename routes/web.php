<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\BackgroundSettingsController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\BookingsController;
use App\Http\Controllers\BranchesController;
use App\Http\Controllers\CategoriesController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentMethodsController;
use App\Http\Controllers\PromosController;
use App\Http\Controllers\SpecificationsController;
use App\Http\Controllers\SubscriberController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\FuelPolicyController;
use App\Http\Controllers\IncludedController;
use App\Http\Controllers\LocationTypesController;
use App\Http\Controllers\ProfitsController;
use App\Http\Controllers\RatesController;
use App\Http\Controllers\RentalTermsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use App\Models\Branch;
use App\Models\Rental;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/cleanup-custom-banners', function () {
    $deleted = \App\Models\BackgroundSetting::where('section_key', 'like', 'banner_%')->delete();
    return "Deleted {$deleted} custom banner(s) successfully!";
});

Route::get('/add-notif-column', function () {
    try {
        if (!\Illuminate\Support\Facades\Schema::hasColumn('users', 'read_notifications')) {
            \Illuminate\Support\Facades\Schema::table('users', function (\Illuminate\Database\Schema\Blueprint $table) {
                $table->text('read_notifications')->nullable();
            });
            return "Column 'read_notifications' added successfully!";
        }
        return "Column 'read_notifications' already exists.";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});

Route::get('/debug-db', function () {
    try {
        $reflector = new \ReflectionClass(\App\Http\Controllers\VehicleController::class);
        $methods = array_map(function($m) { return $m->name; }, $reflector->getMethods());
        sort($methods);
        return response()->json($methods);
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});



Route::get('/seed-dummy', function () {
    if (\App\Models\User::where('role', 'customer')->count() == 0) {
        \App\Models\User::query()->insert([
            'name' => 'Dummy Customer',
            'email' => 'customer@dummy.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
    if (\App\Models\User::where('role', 'under_review')->count() == 0) {
        \App\Models\User::query()->insert([
            'name' => 'Pending Supplier',
            'email' => 'supplier@dummy.com',
            'password' => bcrypt('password'),
            'role' => 'under_review',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
    if (\Illuminate\Support\Facades\DB::table('subscribers')->count() == 0) {
        \Illuminate\Support\Facades\DB::table('subscribers')->insert([
            'email' => 'subscriber@dummy.com',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
    if (\App\Models\Rental::count() == 0) {
        \App\Models\Rental::query()->insert([
            'customer_id' => \App\Models\User::where('role', 'customer')->first()->id ?? 1,
            'supplier_id' => 1,
            'vehicle_id' => 1,
            'order_number' => 'ATR001',
            'order_status' => 'confirmed',
            'price' => 500,
            'start_date' => now(),
            'end_date' => now()->addDays(3),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
    // Seed default background settings (same section_key values as old Vue project)
    $defaultBackgrounds = [
        ['section_key' => 'banner',      'section_name' => 'Hero Banner',      'default_image_path' => '/img/banner-bk.jpg'],
        ['section_key' => 'our_fleet',   'section_name' => 'Our Fleet',        'default_image_path' => '/images/background/our_fleet.png'],
        ['section_key' => 'be_supplier', 'section_name' => 'Be a Supplier',    'default_image_path' => '/img/be-supplier-background.png'],
        ['section_key' => 'offers',      'section_name' => 'Offers / Cinema',  'default_image_path' => '/img/offers.jpeg'],
    ];
    foreach ($defaultBackgrounds as $bg) {
        if (!\App\Models\BackgroundSetting::where('section_key', $bg['section_key'])->exists()) {
            \App\Models\BackgroundSetting::create([
                'section_key'        => $bg['section_key'],
                'section_name'       => $bg['section_name'],
                'default_image_path' => $bg['default_image_path'],
                'is_active'          => true,
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);
        }
    }

    // Seed default location types
    $defaultLocationTypes = [
        ['name' => 'Airport', 'icon' => 'plane'],
        ['name' => 'Office', 'icon' => 'building'],
        ['name' => 'Hotel', 'icon' => 'hotel'],
        ['name' => 'Port', 'icon' => 'anchor'],
    ];
    foreach ($defaultLocationTypes as $loc) {
        if (!\App\Models\LocationType::where('name', $loc['name'])->exists()) {
            \App\Models\LocationType::create([
                'name' => $loc['name'],
                'icon' => $loc['icon'],
            ]);
        }
    }

    // Seed default visual photos
    $defaultPhotos = [
        ['name' => 'Toyota Corolla', 'photo' => 'corolla.png'],
        ['name' => 'Hyundai Elantra', 'photo' => 'elantra.png'],
        ['name' => 'Kia Picanto', 'photo' => 'picanto.png'],
        ['name' => 'Nissan Sunny', 'photo' => 'sunny.png'],
    ];
    foreach ($defaultPhotos as $photo) {
        if (!\App\Models\VehiclesPhotos::where('name', $photo['name'])->exists()) {
            \App\Models\VehiclesPhotos::create([
                'name' => $photo['name'],
                'photo' => $photo['photo'],
            ]);
        }
    }

    // Seed default what\'s included features
    $defaultIncluded = [
        ['what_is_included' => 'Free Cancellation', 'description' => 'Cancel for free up to 48 hours before pickup'],
        ['what_is_included' => 'Unlimited Mileage', 'description' => 'Drive as far as you want without extra charges'],
        ['what_is_included' => 'Theft Protection', 'description' => 'Coverage in case the vehicle is stolen'],
        ['what_is_included' => 'Collision Damage Waiver', 'description' => 'Limits your financial liability for damage'],
    ];
    foreach ($defaultIncluded as $inc) {
        if (!\App\Models\Included::where('what_is_included', $inc['what_is_included'])->exists()) {
            \App\Models\Included::create([
                'what_is_included' => $inc['what_is_included'],
                'description' => $inc['description'],
            ]);
        }
    }

    return 'Dummy data seeded successfully! All vehicle photos, location types, and included features are now populated.';
});

Route::get('/', function () {
    return Inertia::render('LandingPage');
});

Route::get('/v2', function () {
    return Inertia::render('LandingPagev2');
});

Route::get('/booking/update-status', [BookingsController::class, 'updateBookingStatus']);

Route::group(['prefix' => '/booking'], function () {
    Route::get('/{id}', [BookingsController::class, 'show'])->middleware('customer');

});

// Route::inertia('/vehicles/{id}', 'VehiclePage');
Route::get('/vehicles/book', function () {
    return Inertia::render('VehiclePage');
});
Route::get('get/suppliers', [UserController::class, 'suppliers']);

Route::post('/get/vehicle/data', [VehicleController::class, 'getVehicle']);
Route::get('/get/countries', [CountryController::class, 'index']);

Route::inertia('/my-profile', 'MyProfile');
Route::inertia('/update-booking', 'UpdateBooking');
Route::get('/my-current-user-profile', [UserController::class, 'profile']);

Route::inertia('company', 'Dashboard/Companies/CreateCompany');
Route::inertia('index', 'Dashboard/Index')->middleware('admin_or_supplier');
Route::inertia('suppliers', 'Dashboard/Suppliers');

Route::get('get/categories', [VehicleController::class, 'getCategories']);
Route::get('get/specifications', [SpecificationsController::class, 'index']);
Route::post('get/filtered/specifications', [VehicleController::class, 'getFilteredSpecifications']);

Route::get('results', [VehicleController::class, 'index'])->name('results');

Route::inertia('/supplier/login', 'Auth/SupplierLogin');
Route::inertia('/supplier/signup', 'Auth/SupplierRegister');
Route::get('/login', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::get('logout', [LoginController::class, 'logout']);

Route::get('/register', [RegisterController::class, 'create'])->name('register');

Route::post('/post/user/data', [RegisterController::class, 'store']);

Route::get('/get/logos', [UserController::class, 'getLogos']);
Route::get('/get/backgrounds', [BackgroundSettingsController::class, 'getBackgrounds']);
Route::get('get/priceTax', [UserController::class, 'priceTax']);
Route::get('/get/user/data', [UserController::class, 'index'])->middleware('auth:sanctum');
Route::get('/get/companies', [UserController::class, 'Companies'])->middleware('auth:sanctum');
Route::post('/assign-parent', [UserController::class, 'assignCompanies'])->middleware('auth:sanctum');
Route::get('get/user/role', [UserController::class, 'role'])->middleware('auth:sanctum');
Route::post('upload', [UserController::class, 'upload'])->middleware('auth:sanctum');

// Real Dynamic Notifications Routes (Database-backed dynamically, no new tables)
Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->middleware('auth:sanctum');
Route::patch('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markRead'])->middleware('auth:sanctum');
Route::patch('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->middleware('auth:sanctum');

// Included routes available for both Admin and Supplier
Route::post('/post/included', [\App\Http\Controllers\IncludedController::class, 'store'])->middleware('auth:sanctum');
Route::post('/delete/included', [\App\Http\Controllers\IncludedController::class, 'delete'])->middleware('auth:sanctum');


Route::post('/upload/branch', [UserController::class, 'createBranch'])->middleware('auth:sanctum');
Route::get('get/branches', [UserController::class, 'getBranch'])->middleware('auth:sanctum');

Route::post('filter/vehicles', [VehicleController::class, 'filter']);
Route::get('get/vehicles', [VehicleController::class, 'show']);
Route::post('/search/vehicles', [VehicleController::class, 'search']);

Route::get('/get/locations', [VehicleController::class, 'getLocations']);

Route::get('/get/rentals', [BookingsController::class, 'getRentals'])->middleware('auth:sanctum');
Route::get('/invoice/booking/{id}', [BookingsController::class, 'bookingInvoice'])->middleware('auth:sanctum');

Route::get('get/photos', [VehicleController::class, 'getPhotos']);
Route::get('get/rental-terms', [RentalTermsController::class, 'index']);
Route::get('get/currencies', [CurrencyController::class, 'index']);
Route::get('get/fuel-policies', [FuelPolicyController::class, 'index']);
Route::get('get/included', [IncludedController::class, 'index']);

// Authorized only
Route::middleware(['auth:sanctum', 'admin_or_supplier'])->group(function () {

    Route::inertia('rentals/admin', 'Dashboard/AdminRentals');
    Route::inertia('rentals/supplier', 'Dashboard/Rentals');
    Route::post('post/rental-terms', [RentalTermsController::class, 'insert']);
    Route::get('get/profit', [ProfitsController::class, 'show']);

    Route::get('/rental/rate/{id}', [BookingsController::class, 'getRate']);

    // Bulk Upload allowed for both Admins and Suppliers
    Route::post('vehicles/bulk-upload', [VehicleController::class, 'bulkUpload']);
    Route::get('vehicles/bulk-upload/template', [VehicleController::class, 'downloadBulkUploadTemplate']);

});
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/get/rentals/admin', [BookingsController::class, 'getAdminRentals']);
    Route::get('/get/supplier/invoice', [BookingsController::class, 'getSupplierInvoices']);
    Route::inertia('admin-reviews', 'Dashboard/AdminReviews');

    Route::inertia('margin', 'Dashboard/ProfitMargin');
    Route::inertia('customers', 'Dashboard/Customers');
    Route::get('/get/customers', [UserController::class, 'getCustomers']);
    Route::post('/delete/customers', [UserController::class, 'deleteCustomer']);

    Route::inertia('categories', 'Dashboard/Categories');
    Route::inertia('companies', 'Dashboard/Companies/AssignParent');
    Route::post('post/categories', [CategoriesController::class, 'createCategories']);
    Route::post('update/categories', [CategoriesController::class, 'updateCategories']);
    Route::post('delete/categories', [VehicleController::class, 'deleteCategories']);

    Route::inertia('specifications', 'Dashboard/Specifications');
    Route::post('post/specifications', [SpecificationsController::class, 'create']);
    Route::post('specifications/update', [SpecificationsController::class, 'update']);
    Route::post('delete/specifications', [SpecificationsController::class, 'destroy']);
    Route::post('rentals/reconcile', [BookingsController::class, 'reconcile']);

    Route::inertia('included', 'Dashboard/Included');
    Route::inertia('create-included', 'Dashboard/CreateIncluded');
    Route::post('/post/included/status', [\App\Http\Controllers\IncludedController::class, 'updateStatus']);
    Route::post('/post/included/update', [\App\Http\Controllers\IncludedController::class, 'update']);

    Route::inertia('rental-terms', 'Dashboard/RentalTerms');
    Route::post('delete/rental-terms', [RentalTermsController::class, 'destroy']);
    Route::post('edit/rental-terms', [RentalTermsController::class, 'edit']);
    Route::post('show/rental-terms', [RentalTermsController::class, 'show']);
    Route::post('update/rental-terms/status', [RentalTermsController::class, 'approveOrReject']);

    Route::inertia('memberships', 'Dashboard/Memberships');
    Route::get('get/requests', [UserController::class, 'memberships']);
    Route::post('accept/requests', [UserController::class, 'acceptMemberships']);
    Route::post('delete/requests', [UserController::class, 'deleteMemberships']);
    Route::post('profit/upload', [ProfitsController::class, 'upload']);

    Route::inertia('photos', 'Dashboard/Photos');
    Route::inertia('vehicles-bulk-upload', 'Dashboard/VehiclesBulkUpload');
    Route::post('post/photos', [VehicleController::class, 'createPhotos']);
    Route::post('delete/photos', [VehicleController::class, 'deletePhotos']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/get/subscribers', [SubscriberController::class, 'index']);
    Route::post('/delete/subscribers', [SubscriberController::class, 'destroy']);
    Route::inertia('/subscribers','Dashboard/SubscribersList');

    // Blog Management Routes
    Route::prefix('admin/blogs')->group(function () {
        Route::inertia('/', 'Dashboard/Blogs/Blogs')->name('blogs.list');
        Route::inertia('/categories', 'Dashboard/Blogs/Categories')->name('blogs.categories');
        Route::inertia('/create', 'Dashboard/Blogs/Create')->name('blogs.create');
        Route::inertia('/{blog}', 'Dashboard/Blogs/View')->name('blogs.view');
        Route::inertia('/{blog}/edit', 'Dashboard/Blogs/Edit')->name('blogs.edit');
    });

    /* Commented out to prevent conflict with routes/api.php
    Route::prefix('api/blogs')->group(function () {
        // Public routes

        // Protected routes
        Route::post('/', [BlogController::class, 'store'])->name('blogs.store');
        Route::post('/{blog}', [BlogController::class, 'update'])->name('blogs.update');
        Route::put('/{blog}', [BlogController::class, 'update'])->name('blogs.put-update');
        Route::delete('/{blog}', [BlogController::class, 'destroy'])->name('blogs.destroy');
        Route::patch('/{blog}/toggle-publish', [BlogController::class, 'togglePublish'])->name('blogs.toggle-publish');
    });
    */

    // Background Settings Management
    Route::inertia('admin/background-settings', 'Dashboard/BackgroundSettings')->name('background.settings');
    /* Commented out to prevent conflict with routes/api.php
    Route::get('/api/background-settings', [BackgroundSettingsController::class, 'index']);
    Route::post('/api/background-settings/{id}', [BackgroundSettingsController::class, 'update']);
    Route::post('/api/background-settings/{id}/reset', [BackgroundSettingsController::class, 'resetToDefault']);
    */

});

Route::middleware(['auth:sanctum', 'member'])->group(function () {
    Route::inertia('membership', 'Dashboard/Membership');
    Route::post('post/request', [UserController::class, 'membership']);
});

Route::middleware(['auth:sanctum', 'active_supplier'])->group(function () {
    Route::inertia('vehicle', 'Dashboard/Vehicles/CreateVehicle');
    Route::inertia('branches', 'Dashboard/Branches/Branches');
    Route::post('delete/branches', [UserController::class, 'deleteBranch']);
    Route::inertia('/branches/show', 'Dashboard/Branches/Edit');
    Route::inertia('/branches/add', 'Dashboard/Branches/Add');
    Route::get('/branches/edit/{id}', [BranchesController::class, 'show']);
    Route::post('/branches/update', [BranchesController::class, 'update']);
    Route::inertia('/branches/cars', 'Dashboard/Branches/Cars');

    Route::post('post/vehicles', [VehicleController::class, 'create']);
    Route::post('/edit-vehicle-price', [VehicleController::class, 'updatePrice']);
    Route::post('update/vehicles/activation', [VehicleController::class, 'updateActivation']);
    Route::post('delete/vehicles/{id}', [VehicleController::class, 'destroy']);
    Route::get('edit/vehicles/{id}', [VehicleController::class, 'edit']);
    Route::inertia('vehicles', 'Dashboard/Vehicles/Vehicles');
    Route::inertia('edit/vehicle', 'Dashboard/Vehicles/EditVehicle');
    Route::inertia('promos', 'Dashboard/Promos');
    Route::inertia('reviews', 'Dashboard/Reviews');
    Route::get('get/location-types', [LocationTypesController::class, 'index']);

    Route::inertia('price-list', 'Dashboard/PriceList');
    Route::inertia('/select-company', 'Dashboard/Companies/SelectCompany');
    Route::post('/change-company', [UserController::class, 'changeCompany']);
    Route::get('/get/payment_methods', [PaymentMethodsController::class, 'index']);
    Route::inertia('/supplier/payment_methods', 'Dashboard/Companies/PaymentMethods');
    Route::post('/payment_methods', [PaymentMethodsController::class, 'store']);

    Route::inertia('supplier-rental-terms', 'Dashboard/SupplierRentalTerms');
    Route::post('select-rental-terms', [RentalTermsController::class, 'assignRentalTerms']);


    Route::post('accept/rentals', [VehicleController::class, 'acceptRentals']);
    Route::post('delete/rentals', [VehicleController::class, 'deleteRentals']);
    Route::get('/supplier-dashboard', [DashboardController::class, 'supplierDashboard']);
    Route::post('/promo', [PromosController::class, 'store']);
    Route::delete('/promo/{id}', [PromosController::class, 'destroy']);
    Route::get('/promo', [PromosController::class, 'index']);


});

Route::middleware(['auth:sanctum', 'customer'])->group(function () {
    Route::post('/book/vehicles', [BookingsController::class, 'book']);
    Route::inertia('/my-bookings', 'MyBookings');
    Route::post('/cancel/booking', [BookingsController::class, 'cancelBooking']);
});


Route::inertia('/rentals/rate', 'RentalRate');
Route::get('/get/rating/questions', [RatesController::class, 'index']);
Route::post('/rating', [RatesController::class, 'store']);
Route::post('/forget-password', [UserController::class, 'forgetPassword']);
Route::inertia('/new-password-form', 'Auth/NewPasswordForm');
Route::post('/validate-forget-password-key', [UserController::class, 'validateForgetPasswordKey']);
Route::post('/save-new-password', [UserController::class, 'setNewPassword']);
Route::inertia('/contact-us', 'ContactUs' );
Route::inertia('/about-us', 'AboutUs' );
Route::inertia('/why_autours', 'WhyAutours' );
Route::inertia('/where-we-are', 'WhereWeAre' );
Route::get('/blogs', function() {
    return \Inertia\Inertia::render('Blogs/Blogs');
});
Route::get('/blogs/{slug}', function($slug) {
    $blog = \App\Models\Blog::where('slug', $slug)->firstOrFail();
    return \Inertia\Inertia::render('Blogs/BlogDetails', [
        'initialBlog' => $blog
    ]);
});
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::post('/send-email',[SubscriberController::class,'sendEmail']);

// API Documentation Routes
Route::get('/docs', function () {
    return response()->file(public_path('docs/index.php'));
})->name('api.docs');

Route::get('/docs/swagger.json', function () {
    return response()->file(public_path('docs/swagger.json'), [
        'Content-Type' => 'application/json'
    ]);
})->name('api.docs.json');


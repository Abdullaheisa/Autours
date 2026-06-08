<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use App\Models\User;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Enums\RentalStatuses;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user() ?? Auth::user();
            if (!$user) {
                return response()->json([], 401);
            }

        // Auto-heal database schema on the fly (self-migration)
        if (!\Illuminate\Support\Facades\Schema::hasColumn('users', 'read_notifications')) {
            try {
                \Illuminate\Support\Facades\Schema::table('users', function (\Illuminate\Database\Schema\Blueprint $table) {
                    $table->text('read_notifications')->nullable();
                });
            } catch (\Exception $e) {
                // Ignore if another concurrent request already ran it
            }
        }

        // Fetch read notifications from user record
        $readNotifications = [];
        if ($user->read_notifications) {
            $readNotifications = json_decode($user->read_notifications, true) ?: [];
        }

        $notifications = [];

        if ($user->role === 'admin') {
            // 1. New Suppliers under review
            $pendingSuppliers = User::where('role', 'under_review')
                ->orderBy('created_at', 'desc')
                ->take(15)
                ->get();

            foreach ($pendingSuppliers as $supplier) {
                $id = 'supplier_review_' . $supplier->id;
                $notifications[] = [
                    'id' => $id,
                    'title' => 'New Supplier Request',
                    'message' => "Company '{$supplier->name}' has registered and is waiting for activation.",
                    'type' => 'system',
                    'timestamp' => $supplier->created_at ? $supplier->created_at->diffForHumans() : 'Just now',
                    'targetUrl' => '/admin/requests',
                    'isRead' => in_array($id, $readNotifications),
                    'raw_time' => $supplier->created_at ? $supplier->created_at->timestamp : 0,
                ];
            }

            // 2. New Bookings (confirmed or pending)
            $newBookings = Rental::with(['customer', 'vehicle'])
                ->whereIn('order_status', [RentalStatuses::ISSUED, RentalStatuses::CONFIRMED, RentalStatuses::PENDING])
                ->orderBy('created_at', 'desc')
                ->take(15)
                ->get();

            foreach ($newBookings as $rental) {
                $customerName = $rental->customer->name ?? 'A customer';
                $vehicleName = $rental->vehicle->name ?? 'a car';
                // Calculate days
                $days = $rental->num_of_days ?? 1;
                if ($days <= 0 && $rental->start_date && $rental->end_date) {
                    $days = Carbon::parse($rental->start_date)->diffInDays(Carbon::parse($rental->end_date)) ?: 1;
                }

                $id = 'booking_new_' . $rental->id;
                $notifications[] = [
                    'id' => $id,
                    'title' => 'New Booking',
                    'message' => "{$customerName} booked {$vehicleName} for {$days} days.",
                    'type' => 'booking',
                    'timestamp' => $rental->created_at ? $rental->created_at->diffForHumans() : 'Just now',
                    'targetUrl' => '/rentals/admin',
                    'isRead' => in_array($id, $readNotifications),
                    'raw_time' => $rental->created_at ? $rental->created_at->timestamp : 0,
                ];
            }

            // 3. Cancelled Bookings
            $cancelledBookings = Rental::with(['customer', 'vehicle'])
                ->where('order_status', RentalStatuses::CANCELED)
                ->orderBy('updated_at', 'desc')
                ->take(15)
                ->get();

            foreach ($cancelledBookings as $rental) {
                $customerName = $rental->customer->name ?? 'A customer';
                $vehicleName = $rental->vehicle->name ?? 'a car';

                $id = 'booking_cancel_' . $rental->id;
                $notifications[] = [
                    'id' => $id,
                    'title' => 'Booking Cancelled',
                    'message' => "Booking {$rental->order_number} for {$vehicleName} by {$customerName} has been cancelled.",
                    'type' => 'booking',
                    'timestamp' => $rental->updated_at ? $rental->updated_at->diffForHumans() : 'Just now',
                    'targetUrl' => '/rentals/admin',
                    'isRead' => in_array($id, $readNotifications),
                    'raw_time' => $rental->updated_at ? $rental->updated_at->timestamp : 0,
                ];
            }

            // 4. Vehicles needing profit margin setup
            $vehiclesWithoutProfit = Vehicle::with('supplierUser')->doesntHave('profit')
                ->orderBy('created_at', 'desc')
                ->take(15)
                ->get();

            foreach ($vehiclesWithoutProfit as $vehicle) {
                $supplierModel = $vehicle->supplierUser;
                $supplierName = ($supplierModel instanceof User) ? ($supplierModel->company ?? $supplierModel->name ?? 'A supplier') : 'A supplier';
                $id = 'vehicle_profit_' . $vehicle->id;
                $notifications[] = [
                    'id' => $id,
                    'title' => 'Vehicle Margin Required',
                    'message' => "New vehicle '{$vehicle->name}' was added by {$supplierName} and needs profit setup.",
                    'type' => 'system',
                    'timestamp' => $vehicle->created_at ? $vehicle->created_at->diffForHumans() : 'Just now',
                    'targetUrl' => '/admin/profit',
                    'isRead' => in_array($id, $readNotifications),
                    'raw_time' => $vehicle->created_at ? $vehicle->created_at->timestamp : 0,
                ];
            }

            // 5. New Promo/Included Suggestions from Suppliers
            $pendingInclusions = \App\Models\Included::with('supplier')
                ->where('status', 'pending')
                ->whereNotNull('supplier_id')
                ->orderBy('created_at', 'desc')
                ->take(15)
                ->get();

            foreach ($pendingInclusions as $inc) {
                $supplierName = $inc->supplier->company ?? $inc->supplier->name ?? 'A supplier';
                $id = 'inclusion_suggest_' . $inc->id;
                $notifications[] = [
                    'id' => $id,
                    'title' => 'New Promo Suggestion',
                    'message' => "Supplier '{$supplierName}' suggested a new promo: '{$inc->what_is_included}'.",
                    'type' => 'system',
                    'timestamp' => $inc->created_at ? $inc->created_at->diffForHumans() : 'Just now',
                    'targetUrl' => '/admin?tab=promos',
                    'isRead' => in_array($id, $readNotifications),
                    'raw_time' => $inc->created_at ? $inc->created_at->timestamp : 0,
                ];
            }

        } elseif (in_array($user->role, ['active_supplier', 'supplier', 'under_review'])) {
            $supplierId = $user->id;

            // 1. New Bookings for this supplier's vehicles
            $newBookings = Rental::with(['customer', 'vehicle'])
                ->where('supplier_id', $supplierId)
                ->whereIn('order_status', [RentalStatuses::ISSUED, RentalStatuses::CONFIRMED, RentalStatuses::PENDING])
                ->orderBy('created_at', 'desc')
                ->take(15)
                ->get();

            foreach ($newBookings as $rental) {
                $customerName = $rental->customer->name ?? 'A customer';
                $vehicleName = $rental->vehicle->name ?? 'your car';
                $days = $rental->num_of_days ?? 1;
                if ($days <= 0 && $rental->start_date && $rental->end_date) {
                    $days = Carbon::parse($rental->start_date)->diffInDays(Carbon::parse($rental->end_date)) ?: 1;
                }

                $id = 'booking_new_' . $rental->id;
                $notifications[] = [
                    'id' => $id,
                    'title' => 'New Booking Received',
                    'message' => "{$customerName} booked {$vehicleName} for {$days} days.",
                    'type' => 'booking',
                    'timestamp' => $rental->created_at ? $rental->created_at->diffForHumans() : 'Just now',
                    'targetUrl' => '/rentals/supplier',
                    'isRead' => in_array($id, $readNotifications),
                    'raw_time' => $rental->created_at ? $rental->created_at->timestamp : 0,
                ];
            }

            // 2. Cancelled Bookings for this supplier's vehicles
            $cancelledBookings = Rental::with(['customer', 'vehicle'])
                ->where('supplier_id', $supplierId)
                ->where('order_status', RentalStatuses::CANCELED)
                ->orderBy('updated_at', 'desc')
                ->take(15)
                ->get();

            foreach ($cancelledBookings as $rental) {
                $customerName = $rental->customer->name ?? 'A customer';
                $vehicleName = $rental->vehicle->name ?? 'your car';

                $id = 'booking_cancel_' . $rental->id;
                $notifications[] = [
                    'id' => $id,
                    'title' => 'Booking Cancelled',
                    'message' => "Booking {$rental->order_number} for {$vehicleName} has been cancelled.",
                    'type' => 'booking',
                    'timestamp' => $rental->updated_at ? $rental->updated_at->diffForHumans() : 'Just now',
                    'targetUrl' => '/rentals/supplier',
                    'isRead' => in_array($id, $readNotifications),
                    'raw_time' => $rental->updated_at ? $rental->updated_at->timestamp : 0,
                ];
            }
        }

        // Sort collectively by raw_time descending
        usort($notifications, function ($a, $b) {
            return $b['raw_time'] <=> $a['raw_time'];
        });

        // Strip raw_time before returning
        $notifications = array_map(function ($item) {
            unset($item['raw_time']);
            return $item;
        }, $notifications);

        return response()->json($notifications);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("NotificationController@index error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'error' => $e->getMessage(),
                'message' => 'there is an error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function markRead(Request $request, $id)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $readNotifications = [];
        if ($user->read_notifications) {
            $readNotifications = json_decode($user->read_notifications, true) ?: [];
        }

        if (!in_array($id, $readNotifications)) {
            $readNotifications[] = $id;
            $user->read_notifications = json_encode($readNotifications);
            $user->save();
        }

        return response()->json(['status' => true]);
    }

    public function markAllRead(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $notifications = $this->getNotificationIdsForUser($user);

        $readNotifications = [];
        if ($user->read_notifications) {
            $readNotifications = json_decode($user->read_notifications, true) ?: [];
        }

        foreach ($notifications as $id) {
            if (!in_array($id, $readNotifications)) {
                $readNotifications[] = $id;
            }
        }

        $user->read_notifications = json_encode($readNotifications);
        $user->save();

        return response()->json(['status' => true]);
    }

    private function getNotificationIdsForUser($user)
    {
        $ids = [];
        if ($user->role === 'admin') {
            // 1. Supplier requests
            $ids = array_merge($ids, User::where('role', 'under_review')->pluck('id')->map(function($id) { return 'supplier_review_' . $id; })->toArray());
            
            // 2. Bookings
            $ids = array_merge($ids, Rental::whereIn('order_status', [RentalStatuses::ISSUED, RentalStatuses::CONFIRMED, RentalStatuses::PENDING, RentalStatuses::CANCELED])->pluck('id')->map(function($id) { 
                return 'booking_new_' . $id; 
            })->toArray());
            $ids = array_merge($ids, Rental::whereIn('order_status', [RentalStatuses::ISSUED, RentalStatuses::CONFIRMED, RentalStatuses::PENDING, RentalStatuses::CANCELED])->pluck('id')->map(function($id) { 
                return 'booking_cancel_' . $id; 
            })->toArray());
            
            // 3. Vehicles profit
            $ids = array_merge($ids, Vehicle::doesntHave('profit')->pluck('id')->map(function($id) { return 'vehicle_profit_' . $id; })->toArray());

            // 4. Inclusions suggestions
            $ids = array_merge($ids, \App\Models\Included::where('status', 'pending')->whereNotNull('supplier_id')->pluck('id')->map(function($id) { 
                return 'inclusion_suggest_' . $id; 
            })->toArray());
        } else {
            $supplierId = $user->id;
            // Bookings for this supplier
            $ids = array_merge($ids, Rental::where('supplier_id', $supplierId)->whereIn('order_status', [RentalStatuses::ISSUED, RentalStatuses::CONFIRMED, RentalStatuses::PENDING])->pluck('id')->map(function($id) { 
                return 'booking_new_' . $id; 
            })->toArray());
            $ids = array_merge($ids, Rental::where('supplier_id', $supplierId)->where('order_status', RentalStatuses::CANCELED)->pluck('id')->map(function($id) { 
                return 'booking_cancel_' . $id; 
            })->toArray());
        }
        return $ids;
    }
}

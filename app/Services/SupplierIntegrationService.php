<?php

namespace App\Services;

use App\Models\Rental;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupplierIntegrationService
{
    /**
     * Send rental data to supplier's API or webhook based on integration type.
     *
     * @param Rental $rental
     * @param string $eventType
     * @return bool
     */
    public function sendRentalToSupplier(Rental $rental, string $eventType = 'new_rental'): bool
    {
        $rental->load(['vehicle', 'vehicle.branch', 'customer', 'supplier', 'paymentMethod']);

        $supplier = $this->getSupplier($rental);

        if (!$supplier || !$this->shouldSendToSupplier($supplier)) {
            return false;
        }

        // Route to the appropriate integration based on type
        if ($supplier->integration_type === 'kolaycar') {
            return $this->sendViaKolaycar($rental, $supplier, $eventType);
        }

        if ($supplier->integration_type === 'greenmotion') {
            return $this->sendViaGreenMotion($rental, $supplier, $eventType);
        }

        // Default: webhook integration
        if (!empty($supplier->webhook_url)) {
            $payload = $this->buildPayload($rental, $eventType);
            return $this->sendWebhook($supplier, $payload, $eventType);
        }

        return false;
    }

    /**
     * Get the supplier from rental.
     *
     * @param Rental $rental
     * @return User|null
     */
    private function getSupplier(Rental $rental): ?User
    {
        // Try to get supplier from relationship first
        if ($rental->supplier) {
            return $rental->supplier;
        }

        // Fallback to vehicle's supplier
        if ($rental->vehicle && $rental->vehicle->supplier) {
            return User::find($rental->vehicle->supplier);
        }

        return null;
    }

    /**
     * Check if we should send data to this supplier.
     *
     * @param User $supplier
     * @return bool
     */
    private function shouldSendToSupplier(User $supplier): bool
    {
        // For Kolaycar suppliers, we only need integration enabled + credentials
        if ($supplier->integration_type === 'kolaycar') {
            return $supplier->integration === true
                && !empty($supplier->api_key)
                && !empty($supplier->api_password);
        }

        // For Green Motion suppliers, we also need integration enabled + credentials
        if ($supplier->integration_type === 'greenmotion') {
            return $supplier->integration === true
                && !empty($supplier->api_key)
                && !empty($supplier->api_password);
        }

        // For webhook suppliers, we need integration enabled + webhook URL
        return $supplier->integration === true && !empty($supplier->webhook_url);
    }

    /**
     * Send reservation to Kolaycar API.
     *
     * @param Rental $rental
     * @param User $supplier
     * @param string $eventType
     * @return bool
     */
    private function sendViaKolaycar(Rental $rental, User $supplier, string $eventType): bool
    {
        try {
            $service = new KolaycarApiService($supplier->api_key, $supplier->api_password);

            switch ($eventType) {
                case 'new_rental':
                case 'rental_request':
                    return $this->createKolaycarReservation($service, $rental, $supplier);

                case 'rental_cancelled':
                    return $this->cancelKolaycarReservation($service, $rental, $supplier);

                case 'rental_updated':
                    // For updates: cancel old reservation and create new one
                    if (!empty($rental->external_reservation_no)) {
                        $this->cancelKolaycarReservation($service, $rental, $supplier);
                    }
                    return $this->createKolaycarReservation($service, $rental, $supplier);

                default:
                    Log::warning("Kolaycar integration: Unknown event type '{$eventType}'", [
                        'rental_id' => $rental->id,
                    ]);
                    return false;
            }
        } catch (\Exception $e) {
            Log::error("Kolaycar integration error for supplier {$supplier->id}", [
                'event'     => $eventType,
                'rental_id' => $rental->id,
                'error'     => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Create a reservation on the Kolaycar API.
     *
     * @param KolaycarApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function createKolaycarReservation(KolaycarApiService $service, Rental $rental, User $supplier): bool
    {
        $vehicle = $rental->vehicle;
        $customer = $rental->customer;
        $branch = $vehicle ? $vehicle->branch : null;

        if (!$vehicle || !$customer) {
            Log::error('Kolaycar integration: Missing vehicle or customer', [
                'rental_id' => $rental->id,
            ]);
            return false;
        }

        // Extract the Kolaycar vehicle ID from the vehicle description tag
        // Format: [Kolaycar-ID:123] or [Allmeet-ID:456] etc.
        $kolaycarVehicleId = $this->extractExternalVehicleId($vehicle->description);

        if (!$kolaycarVehicleId) {
            Log::warning('Kolaycar integration: Could not extract vehicle ID from description', [
                'rental_id'   => $rental->id,
                'vehicle_id'  => $vehicle->id,
                'description' => $vehicle->description,
            ]);
            return false;
        }

        // Get the pickup/return location IDs from the branch station_id
        $pickupLocationId = $branch ? $branch->station_id : '';
        $returnLocationId = $pickupLocationId; // Same location for now

        // Parse customer name into first/last
        $nameParts = $this->splitCustomerName($customer->name ?? '');

        // Format dates to Kolaycar format (d.m.Y)
        $pickupDate = $rental->start_date
            ? Carbon::parse($rental->start_date)->format('d.m.Y')
            : '';
        $returnDate = $rental->end_date
            ? Carbon::parse($rental->end_date)->format('d.m.Y')
            : '';
        $pickupTime = $rental->start_time
            ? Carbon::parse($rental->start_time)->format('H:i')
            : '10:00';
        $returnTime = $rental->end_time
            ? Carbon::parse($rental->end_time)->format('H:i')
            : '10:00';

        // Dynamically fetch and cache the Kolaycar VENDORID for this supplier
        $vendorId = \Illuminate\Support\Facades\Cache::remember("kolaycar_vendor_id_{$supplier->id}", now()->addDays(30), function () use ($service) {
            $locations = $service->getLocations();
            foreach ($locations['LOCATIONS'] ?? [] as $loc) {
                foreach ($loc['VENDORS'] ?? [] as $v) {
                    if (!empty($v['VENDORID'])) {
                        return (string)$v['VENDORID'];
                    }
                }
            }
            return '0';
        });

        $reservationData = [
            'PICKUPLOCATIONID'  => $pickupLocationId,
            'RETURNLOCATIONID'  => $returnLocationId,
            'PICKUPDATE'        => $pickupDate,
            'RETURNDATE'        => $returnDate,
            'PICKUPTIME'        => $pickupTime,
            'RETURNTIME'        => $returnTime,
            'VENDORID'          => $vendorId,
            'VEHICLEID'         => $kolaycarVehicleId,
            'CUSTOMERNAME'      => $nameParts['first'],
            'CUSTOMERSURNAME'   => $nameParts['last'],
            'CUSTOMERTELEPHONE' => $customer->phone_num ?? '',
            'CUSTOMEREMAIL'     => $customer->email ?? '',
            'CUSTOMERNOTE'      => 'Autours Booking #' . ($rental->order_number ?? $rental->id),
            'PARAM8VALUE'       => $rental->order_number ?? '', // Reference Code
        ];

        $response = $service->postReservation($reservationData);

        if (isset($response['RETURNCODE']) && (string) $response['RETURNCODE'] !== '0') {
            $msg = $response['MESSAGE'] ?? 'Kolaycar API error';
            throw new \Exception($msg);
        }

        $reservationNo = $response['RESERVATION'][0]['RESERVATIONNO'] ?? $response['RESERVATIONNO'] ?? null;

        if (empty($response) || empty($reservationNo)) {
            Log::error('Kolaycar reservation creation failed', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
                'response'    => $response,
            ]);
            throw new \Exception("Supplier booking failed: No reservation number returned.");
        }

        // Store the Kolaycar reservation number on the rental
        $rental->update([
            'external_reservation_no' => (string) $reservationNo,
        ]);

        Log::info('Kolaycar reservation created successfully', [
            'rental_id'      => $rental->id,
            'order_number'   => $rental->order_number,
            'reservation_no' => $reservationNo,
            'supplier_id'    => $supplier->id,
        ]);

        return true;
    }

    /**
     * Cancel a reservation on the Kolaycar API.
     *
     * @param KolaycarApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function cancelKolaycarReservation(KolaycarApiService $service, Rental $rental, User $supplier): bool
    {
        $reservationNo = $rental->external_reservation_no;

        if (empty($reservationNo)) {
            Log::warning('Kolaycar cancellation: No external reservation number found', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
            ]);
            return false;
        }

        $response = $service->cancelReservation($reservationNo);

        if (!empty($response)) {
            Log::info('Kolaycar reservation cancelled successfully', [
                'rental_id'      => $rental->id,
                'reservation_no' => $reservationNo,
                'supplier_id'    => $supplier->id,
            ]);
            return true;
        }

        Log::error('Kolaycar reservation cancellation failed', [
            'rental_id'      => $rental->id,
            'reservation_no' => $reservationNo,
            'supplier_id'    => $supplier->id,
            'response'       => $response,
        ]);

        return false;
    }

    /**
     * Extract external vehicle ID from the description tag.
     * Looks for patterns like [Kolaycar-ID:123], [Allmeet-ID:456], etc.
     *
     * @param string|null $description
     * @return string|null
     */
    private function extractExternalVehicleId(?string $description): ?string
    {
        if (empty($description)) {
            return null;
        }

        // Match any tag pattern like [SomePrefix-ID:123]
        if (preg_match('/\[[\w-]+-ID:(\d+)\]/', $description, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Extract external vendor ID from the description tag.
     * Looks for patterns like [Kolaycar-ID:123:Vendor:456]
     *
     * @param string|null $description
     * @return string|null
     */
    private function extractExternalVendorId(?string $description): ?string
    {
        if (empty($description)) {
            return null;
        }

        if (preg_match('/Vendor:(\d+)/', $description, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * Split a full customer name into first and last name.
     *
     * @param string $fullName
     * @return array{first: string, last: string}
     */
    private function splitCustomerName(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName), 2);

        return [
            'first' => $parts[0] ?? '',
            'last'  => $parts[1] ?? '',
        ];
    }

    /**
     * Build the payload to send to the supplier via webhook.
     *
     * @param Rental $rental
     * @param string $eventType
     * @return array
     */
    private function buildPayload(Rental $rental, string $eventType): array
    {
        return [
            'event' => $eventType,
            'timestamp' => now()->toIso8601String(),
            'rental' => [
                'id' => $rental->id,
                'order_number' => $rental->order_number,
                'order_status' => $rental->order_status,
                'price' => $rental->price,
                'supplier_price' => $rental->supplier_price ?? null,
                'start_date' => $rental->start_date,
                'end_date' => $rental->end_date,
                'start_time' => $rental->start_time,
                'end_time' => $rental->end_time,
                'num_of_days' => $rental->num_of_days ?? null,
                'comment' => $rental->comment,
                'created_at' => $rental->created_at?->toIso8601String(),
                'updated_at' => $rental->updated_at?->toIso8601String(),
            ],
            'vehicle' => $rental->vehicle ? [
                'id' => $rental->vehicle->id,
                'name' => $rental->vehicle->name,
                'description' => $rental->vehicle->description ?? null,
                'category_id' => $rental->vehicle->category,
                'price' => $rental->vehicle->price,
            ] : null,
            'customer' => $rental->customer ? [
                'id' => $rental->customer->id,
                'name' => $rental->customer->name,
                'email' => $rental->customer->email,
                'phone' => $rental->customer->phone_num ?? null,
            ] : null,
            'payment_method' => $rental->paymentMethod ? [
                'id' => $rental->paymentMethod->id,
                'name' => $rental->paymentMethod->name ?? null,
            ] : null,
        ];
    }

    /**
     * Send the webhook request to the supplier.
     *
     * @param User $supplier
     * @param array $payload
     * @param string $eventType
     * @return bool
     */
    private function sendWebhook(User $supplier, array $payload, string $eventType): bool
    {
        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Webhook-Event' => $eventType,
                    'X-Webhook-Source' => 'autours',
                ])
                ->post($supplier->webhook_url, $payload);

            if ($response->successful()) {
                Log::info("Webhook sent successfully to supplier {$supplier->id}", [
                    'event' => $eventType,
                    'rental_id' => $payload['rental']['id'] ?? null,
                    'webhook_url' => $supplier->webhook_url,
                ]);
                return true;
            }

            Log::warning("Webhook failed for supplier {$supplier->id}", [
                'event' => $eventType,
                'rental_id' => $payload['rental']['id'] ?? null,
                'webhook_url' => $supplier->webhook_url,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error("Webhook exception for supplier {$supplier->id}", [
                'event' => $eventType,
                'rental_id' => $payload['rental']['id'] ?? null,
                'webhook_url' => $supplier->webhook_url,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Send new rental notification to supplier.
     *
     * @param Rental $rental
     * @return bool
     */
    public function sendNewRental(Rental $rental): bool
    {
        return $this->sendRentalToSupplier($rental, 'new_rental');
    }

    /**
     * Send rental directly to Kolaycar synchronously and let exceptions bubble up.
     *
     * @param Rental $rental
     * @return void
     * @throws \Exception
     */
    public function sendNewRentalSynchronous(Rental $rental): void
    {
        $supplier = $this->getSupplier($rental);

        if (!$supplier || !$this->shouldSendToSupplier($supplier)) {
            return;
        }
        
        if (!empty($rental->external_reservation_no)) {
             return;
        }

        if ($supplier->integration_type === 'kolaycar') {
            $service = new KolaycarApiService($supplier->api_key, $supplier->api_password);
            $this->createKolaycarReservation($service, $rental, $supplier);
        } elseif ($supplier->integration_type === 'greenmotion') {
            $service = new GreenMotionApiService($supplier->api_key, $supplier->api_password);
            $this->createGreenMotionReservation($service, $rental, $supplier);
        }
    }

    /**
     * Send rental update notification to supplier.
     *
     * @param Rental $rental
     * @return bool
     */
    public function sendRentalUpdate(Rental $rental): bool
    {
        return $this->sendRentalToSupplier($rental, 'rental_updated');
    }

    /**
     * Send rental cancellation notification to supplier.
     *
     * @param Rental $rental
     * @return bool
     */
    public function sendRentalCancellation(Rental $rental): bool
    {
        return $this->sendRentalToSupplier($rental, 'rental_cancelled');
    }

    /**
     * Send rental request notification to supplier.
     *
     * @param Rental $rental
     * @return bool
     */
    public function sendRentalRequest(Rental $rental): bool
    {
        return $this->sendRentalToSupplier($rental, 'rental_request');
    }

    /**
     * Send reservation to Green Motion API.
     *
     * @param Rental $rental
     * @param User $supplier
     * @param string $eventType
     * @return bool
     */
    private function sendViaGreenMotion(Rental $rental, User $supplier, string $eventType): bool
    {
        try {
            $service = new GreenMotionApiService($supplier->api_key, $supplier->api_password);

            switch ($eventType) {
                case 'new_rental':
                case 'rental_request':
                    return $this->createGreenMotionReservation($service, $rental, $supplier);

                case 'rental_cancelled':
                    return $this->cancelGreenMotionReservation($service, $rental, $supplier);

                case 'rental_updated':
                    if (!empty($rental->external_reservation_no)) {
                        $this->cancelGreenMotionReservation($service, $rental, $supplier);
                    }
                    return $this->createGreenMotionReservation($service, $rental, $supplier);

                default:
                    Log::warning("Green Motion integration: Unknown event type '{$eventType}'", [
                        'rental_id' => $rental->id,
                    ]);
                    return false;
            }
        } catch (\Exception $e) {
            Log::error("Green Motion integration error for supplier {$supplier->id}", [
                'event'     => $eventType,
                'rental_id' => $rental->id,
                'error'     => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Create a reservation on the Green Motion API.
     *
     * @param GreenMotionApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function createGreenMotionReservation(GreenMotionApiService $service, Rental $rental, User $supplier): bool
    {
        $vehicle = $rental->vehicle;
        $customer = $rental->customer;
        $branch = $vehicle ? $vehicle->branch : null;

        if (!$vehicle || !$customer) {
            Log::error('Green Motion integration: Missing vehicle or customer', [
                'rental_id' => $rental->id,
            ]);
            return false;
        }

        $greenMotionVehicleId = $this->extractExternalVehicleId($vehicle->description);

        if (!$greenMotionVehicleId) {
            Log::warning('Green Motion integration: Could not extract vehicle ID from description', [
                'rental_id'   => $rental->id,
                'vehicle_id'  => $vehicle->id,
                'description' => $vehicle->description,
            ]);
            return false;
        }

        $pickupLocationId = $branch ? $branch->station_id : '';
        
        if (!$pickupLocationId) {
            throw new \Exception("Missing station ID for branch.");
        }

        $nameParts = $this->splitCustomerName($customer->name ?? '');

        $pickupDate = $rental->start_date ? Carbon::parse($rental->start_date)->format('Y-m-d') : '';
        $returnDate = $rental->end_date ? Carbon::parse($rental->end_date)->format('Y-m-d') : '';
        $pickupTime = $rental->start_time ? Carbon::parse($rental->start_time)->format('H:i') : '10:00';
        $returnTime = $rental->end_time ? Carbon::parse($rental->end_time)->format('H:i') : '10:00';
        $currency = $rental->currency ?? 'GBP';
        
        $age = $rental->customer_age ?? 30;

        // Fetch fresh quoteid and vehicle total from GetVehicles
        $vehiclesResponse = $service->getVehicles(
            (int) $pickupLocationId,
            $pickupDate,
            $pickupTime,
            $returnDate,
            $returnTime,
            $age,
            $currency
        );

        $quoteid = $vehiclesResponse['quoteid'] ?? null;
        if (!$quoteid) {
            throw new \Exception("Could not retrieve quoteid from Green Motion API.");
        }

        $targetVehicle = null;
        foreach ($vehiclesResponse['vehicles'] as $v) {
            if (isset($v['@attributes']['id']) && (string) $v['@attributes']['id'] === (string) $greenMotionVehicleId) {
                $targetVehicle = $v;
                break;
            }
        }

        if (!$targetVehicle) {
            throw new \Exception("Vehicle $greenMotionVehicleId not available for requested dates on Green Motion.");
        }

        // Handle possible product type
        $vehicleTotal = 0;
        $rentalCode = '';
        if (isset($targetVehicle['product']) && is_array($targetVehicle['product'])) {
            $products = isset($targetVehicle['product']['@attributes']) ? [$targetVehicle['product']] : $targetVehicle['product'];
            $targetProduct = $products[0]; // just grab the first product for now, or match it
            $vehicleTotal = (float) $targetProduct['total'];
            $rentalCode = $targetProduct['@attributes']['type'] ?? '';
        } else {
            $vehicleTotal = (float) $targetVehicle['total'];
        }

        $reservationData = [
            'location_id' => $pickupLocationId,
            'start_date' => $pickupDate,
            'start_time' => $pickupTime,
            'end_date' => $returnDate,
            'end_time' => $returnTime,
            'vehicle_id' => $greenMotionVehicleId,
            'vehicle_total' => number_format($vehicleTotal, 2, '.', ''),
            'currency' => $currency,
            'grand_total' => number_format($vehicleTotal, 2, '.', ''),
            'cust_info' => [
                'firstname' => $nameParts['first'],
                'lastname' => $nameParts['last'] ?: 'Customer',
                'age' => $age,
                'telephone' => $customer->phone_num ?? '0000000000',
                'email' => $customer->email ?? 'noreply@autours.net',
                'city' => $customer->city ?? 'Unknown',
                'postcode' => $customer->zip_code ?? '00000',
                'country' => $customer->country ?? 'GB',
            ],
            'payment_type' => 'POA',
            'quoteid' => $quoteid,
        ];

        if ($rentalCode) {
            $reservationData['rentalcode'] = $rentalCode;
        }

        $response = $service->makeReservation($reservationData);

        $reservationNo = $response['booking_ref'] ?? null;

        if (empty($reservationNo)) {
            Log::error('Green Motion reservation creation failed', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
                'response'    => $response,
            ]);
            throw new \Exception("Supplier booking failed: No booking reference returned.");
        }

        $rental->update([
            'external_reservation_no' => (string) $reservationNo,
        ]);

        Log::info('Green Motion reservation created successfully', [
            'rental_id'      => $rental->id,
            'order_number'   => $rental->order_number,
            'reservation_no' => $reservationNo,
            'supplier_id'    => $supplier->id,
        ]);

        return true;
    }

    /**
     * Cancel a reservation on the Green Motion API.
     *
     * @param GreenMotionApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function cancelGreenMotionReservation(GreenMotionApiService $service, Rental $rental, User $supplier): bool
    {
        $reservationNo = $rental->external_reservation_no;

        if (empty($reservationNo)) {
            Log::warning('Green Motion cancellation: No external reservation number found', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
            ]);
            return false;
        }

        $vehicle = $rental->vehicle;
        $branch = $vehicle ? $vehicle->branch : null;
        $pickupLocationId = $branch ? $branch->station_id : '';

        if (!$pickupLocationId) {
            Log::error('Green Motion cancellation: Missing station ID', ['rental_id' => $rental->id]);
            return false;
        }

        $response = $service->cancelReservation((int) $pickupLocationId, $reservationNo);

        if (!empty($response['booking_ref'])) {
            Log::info('Green Motion reservation cancelled successfully', [
                'rental_id'      => $rental->id,
                'reservation_no' => $reservationNo,
                'supplier_id'    => $supplier->id,
            ]);
            return true;
        }

        Log::error('Green Motion reservation cancellation failed', [
            'rental_id'      => $rental->id,
            'reservation_no' => $reservationNo,
            'supplier_id'    => $supplier->id,
            'response'       => $response,
        ]);

        return false;
    }
}

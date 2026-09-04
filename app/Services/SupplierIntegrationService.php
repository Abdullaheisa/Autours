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

        if ($supplier->integration_type === 'xdrive') {
            return $this->sendViaXdrive($rental, $supplier, $eventType);
        }

        if ($supplier->integration_type === 'northcar') {
            return $this->sendViaNorthcar($rental, $supplier, $eventType);
        }

        if ($supplier->integration_type === 'surprice') {
            return $this->sendViaSurprice($rental, $supplier, $eventType);
        }

        if ($supplier->integration_type === 'wheelsys') {
            return $this->sendViaWheelsys($rental, $supplier, $eventType);
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

        if ($supplier->integration_type === 'xdrive') {
            return $supplier->integration === true;
        }

        if ($supplier->integration_type === 'northcar') {
            return $supplier->integration === true;
        }

        if ($supplier->integration_type === 'surprice') {
            return $supplier->integration === true;
        }

        if ($supplier->integration_type === 'wheelsys') {
            return $supplier->integration === true;
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
        } elseif ($supplier->integration_type === 'xdrive') {
            $service = new XdriveJsonApiService();
            $this->createXdriveReservation($service, $rental, $supplier);
        } elseif ($supplier->integration_type === 'northcar') {
            $service = new NorthcarApiService();
            $this->createNorthcarReservation($service, $rental, $supplier);
        } elseif ($supplier->integration_type === 'surprice') {
            $service = new SurpriceApiService();
            $this->createSurpriceReservation($service, $rental, $supplier);
        } elseif ($supplier->integration_type === 'wheelsys') {
            $service = new WheelsysApiService();
            $this->createWheelsysReservation($service, $rental, $supplier);
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
            throw new \Exception("Sorry, this vehicle is no longer available on the supplier's end for the requested dates. Please select another vehicle.");
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

    /**
     * Send reservation to Xdrive API.
     *
     * @param Rental $rental
     * @param User $supplier
     * @param string $eventType
     * @return bool
     */
    private function sendViaXdrive(Rental $rental, User $supplier, string $eventType): bool
    {
        try {
            $service = new XdriveJsonApiService();

            switch ($eventType) {
                case 'new_rental':
                case 'rental_request':
                    return $this->createXdriveReservation($service, $rental, $supplier);

                case 'rental_cancelled':
                    return $this->cancelXdriveReservation($service, $rental, $supplier);

                case 'rental_updated':
                    if (!empty($rental->external_reservation_no)) {
                        $this->cancelXdriveReservation($service, $rental, $supplier);
                    }
                    return $this->createXdriveReservation($service, $rental, $supplier);

                default:
                    Log::warning("Xdrive integration: Unknown event type '{$eventType}'", [
                        'rental_id' => $rental->id,
                    ]);
                    return false;
            }
        } catch (\Exception $e) {
            Log::error("Xdrive integration error for supplier {$supplier->id}", [
                'event'     => $eventType,
                'rental_id' => $rental->id,
                'error'     => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Create a reservation on the Xdrive API.
     *
     * @param XdriveJsonApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function createXdriveReservation(XdriveJsonApiService $service, Rental $rental, User $supplier): bool
    {
        $vehicle = $rental->vehicle;
        $customer = $rental->customer;
        $branch = $vehicle ? $vehicle->branch : null;

        if (!$vehicle || !$customer) {
            Log::error('Xdrive integration: Missing vehicle or customer', [
                'rental_id' => $rental->id,
            ]);
            return false;
        }

        $xdriveGroupId = null;
        if (preg_match('/\[Xdrive-GROUP-ID:([^\]]+)\]/', $vehicle->description, $m)) {
            $xdriveGroupId = $m[1];
        }

        if (!$xdriveGroupId) {
            Log::warning('Xdrive integration: Could not extract Group ID from description', [
                'rental_id'   => $rental->id,
                'vehicle_id'  => $vehicle->id,
                'description' => $vehicle->description,
            ]);
            return false;
        }

        $pickupLocationId = $branch ? $branch->station_id : '';
        $returnLocationId = $pickupLocationId; // Same location for now

        if (!$pickupLocationId) {
            throw new \Exception("Missing station ID for branch.");
        }

        $pickupDate = $rental->start_date ? Carbon::parse($rental->start_date)->format('Y-m-d') : '';
        $returnDate = $rental->end_date ? Carbon::parse($rental->end_date)->format('Y-m-d') : '';
        $pickupTime = $rental->start_time ? Carbon::parse($rental->start_time)->format('H:i') : '10:00';
        $returnTime = $rental->end_time ? Carbon::parse($rental->end_time)->format('H:i') : '10:00';

        // Xdrive requires advance notice. If the pickup date is today, bump it to tomorrow for the API search.
        $pickupCarbon = Carbon::parse($pickupDate);
        if ($pickupCarbon->isToday() || $pickupCarbon->isPast()) {
            $daysToAdd = Carbon::now()->startOfDay()->diffInDays($pickupCarbon, false) * -1 + 1;
            if ($daysToAdd < 1) $daysToAdd = 1;
            $pickupCarbon->addDays($daysToAdd);
            $pickupDate = $pickupCarbon->format('Y-m-d');
            $returnDate = Carbon::parse($returnDate)->addDays($daysToAdd)->format('Y-m-d');
        }
        
        // Xdrive only supports TL, EURO, USD, GBP. Fallback to TL if not supported.
        $currency = strtoupper($rental->currency ?? 'TL');
        if (!in_array($currency, ['TL', 'EURO', 'USD', 'GBP'])) {
            $currency = 'TL';
        }

        $availableCars = $service->getAvailableCars(
            (string)$pickupLocationId,
            (string)$returnLocationId,
            $pickupDate . ' ' . $pickupTime,
            $returnDate . ' ' . $returnTime,
            $currency
        );

        $targetCar = null;
        foreach ($availableCars as $car) {
            if (isset($car['group_id']) && trim((string)$car['group_id']) === trim((string)$xdriveGroupId)) {
                $targetCar = $car;
                break;
            }
        }

        if (!$targetCar) {
            \Illuminate\Support\Facades\Log::error("Xdrive Availability Failure", [
                'requested_group' => $xdriveGroupId,
                'pickup_location' => $pickupLocationId,
                'pickup_date' => $pickupDate,
                'currency' => $currency,
                'available_cars' => $availableCars
            ]);
            throw new \Exception("Sorry, this vehicle is no longer available on the supplier's end for the requested dates. Please select another vehicle.");
        }

        $rezId = $targetCar['rez_id'] ?? null;
        $carsParkId = $targetCar['cars_park_id'] ?? null;

        if (!$rezId || !$carsParkId) {
            throw new \Exception("Could not retrieve rez_id or cars_park_id from Xdrive API.");
        }

        $nameParts = $this->splitCustomerName($customer->name ?? '');

        $pickup = Carbon::parse($pickupDate . ' ' . $pickupTime);
        $dropoff = Carbon::parse($returnDate . ' ' . $returnTime);

        $reservationData = [
            'Rez_ID' => $rezId,
            'Cars_Park_ID' => $carsParkId,
            'Group_ID' => $xdriveGroupId,
            'Pickup_ID' => $pickupLocationId,
            'Drop_Off_ID' => $returnLocationId,
            'Name' => $nameParts['first'],
            'SurName' => $nameParts['last'] ?: 'Customer',
            'MobilePhone' => $customer->phone_num ?? '0000000000',
            'Mail_Adress' => $customer->email ?? 'noreply@autours.net',
            'Rental_ID' => $customer->id_passport ?? $customer->id ?? '',
            'Your_Rez_ID' => $rental->order_number ?? $rental->id,
            'Pickup_Day' => $pickup->format('d'),
            'Pickup_Month' => $pickup->format('m'),
            'Pickup_Year' => $pickup->format('Y'),
            'Pickup_Hour' => $pickup->format('H'),
            'Pickup_Min' => $pickup->format('i'),
            'Drop_Off_Day' => $dropoff->format('d'),
            'Drop_Off_Month' => $dropoff->format('m'),
            'Drop_Off_Year' => $dropoff->format('Y'),
            'Drop_Off_Hour' => $dropoff->format('H'),
            'Drop_Off_Min' => $dropoff->format('i'),
            'Currency' => $currency,
            'Adress' => $customer->address ?? '',
            'District' => $customer->state ?? '',
            'City' => $customer->city ?? '',
            'Country' => $customer->country ?? '',
            'Flight_Number' => $rental->flight_number ?? '',
            'Payment_Type' => 0,
            'Your_Rent_Price' => $rental->supplier_price ?? $rental->price,
        ];

        $response = $service->saveReservation($reservationData);

        $isSuccess = (isset($response['Status']) && strtolower((string)$response['Status']) === 'true') ||
                     (isset($response['success']) && strtolower((string)$response['success']) === 'true');

        if ($isSuccess) {
            $confirmedRezId = $response['ID'] ?? $response['rez_id'] ?? $rezId;

            $rental->update([
                'external_reservation_no' => $rezId . '|' . $confirmedRezId,
            ]);

            Log::info('Xdrive reservation created successfully', [
                'rental_id'      => $rental->id,
                'order_number'   => $rental->order_number,
                'reservation_no' => $confirmedRezId,
                'supplier_id'    => $supplier->id,
            ]);

            return true;
        }

        Log::error('Xdrive reservation creation failed', [
            'rental_id'   => $rental->id,
            'supplier_id' => $supplier->id,
            'response'    => $response,
        ]);
        throw new \Exception("Supplier booking failed: " . json_encode($response));
    }

    /**
     * Cancel a reservation on the Xdrive API.
     *
     * @param XdriveJsonApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function cancelXdriveReservation(XdriveJsonApiService $service, Rental $rental, User $supplier): bool
    {
        $reservationData = $rental->external_reservation_no;
        if (empty($reservationData)) {
            Log::warning('Xdrive cancellation: No external reservation number found', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
            ]);
            return false;
        }

        $parts = explode('|', $reservationData);
        if (count($parts) !== 2) {
            Log::warning('Xdrive cancellation: Invalid reservation data format', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
                'reservation_data' => $reservationData
            ]);
            return false;
        }

        $rezId = $parts[0];
        $id = $parts[1];

        $response = $service->cancelReservation($rezId, $id);

        if (isset($response['Status']) && strtolower((string)$response['Status']) === 'true') {
            Log::info('Xdrive reservation cancelled successfully', [
                'rental_id'      => $rental->id,
                'reservation_no' => $reservationData,
                'supplier_id'    => $supplier->id,
            ]);
            return true;
        }

        Log::error('Xdrive reservation cancellation failed', [
            'rental_id'      => $rental->id,
            'reservation_no' => $reservationData,
            'supplier_id'    => $supplier->id,
            'response'       => $response,
        ]);

        return false;
    }

    /**
     * Send reservation to Northcar API.
     *
     * @param Rental $rental
     * @param User $supplier
     * @param string $eventType
     * @return bool
     */
    private function sendViaNorthcar(Rental $rental, User $supplier, string $eventType): bool
    {
        try {
            $service = new NorthcarApiService();

            switch ($eventType) {
                case 'new_rental':
                case 'rental_request':
                    return $this->createNorthcarReservation($service, $rental, $supplier);

                case 'rental_cancelled':
                    return $this->cancelNorthcarReservation($service, $rental, $supplier);

                case 'rental_updated':
                    if (!empty($rental->external_reservation_no)) {
                        $this->cancelNorthcarReservation($service, $rental, $supplier);
                    }
                    return $this->createNorthcarReservation($service, $rental, $supplier);

                default:
                    Log::warning("Northcar integration: Unknown event type '{$eventType}'", [
                        'rental_id' => $rental->id,
                    ]);
                    return false;
            }
        } catch (\Exception $e) {
            Log::error("Northcar integration error for supplier {$supplier->id}", [
                'event'     => $eventType,
                'rental_id' => $rental->id,
                'error'     => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Create a reservation on the Northcar API.
     *
     * @param NorthcarApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function createNorthcarReservation(NorthcarApiService $service, Rental $rental, User $supplier): bool
    {
        $vehicle = $rental->vehicle;
        $customer = $rental->customer;
        $branch = $vehicle ? $vehicle->branch : null;

        if (!$vehicle || !$customer) {
            Log::error('Northcar integration: Missing vehicle or customer', [
                'rental_id' => $rental->id,
            ]);
            return false;
        }

        $pickupLocationId = $branch ? $branch->station_id : '';
        $returnLocationId = $pickupLocationId;

        if (!$pickupLocationId) {
            throw new \Exception("Missing station ID for branch.");
        }

        $nameParts = $this->splitCustomerName($customer->name ?? '');
        $pickupDate = Carbon::parse($rental->start_date)->format('Y-m-d');
        $pickupTime = Carbon::parse($rental->start_time)->format('H:i:s');
        $pickupDateStr = Carbon::parse($pickupDate . ' ' . $pickupTime)->format('mdY h:i A');

        $returnDate = Carbon::parse($rental->end_date)->format('Y-m-d');
        $returnTime = Carbon::parse($rental->end_time)->format('H:i:s');
        $returnDateStr = Carbon::parse($returnDate . ' ' . $returnTime)->format('mdY h:i A');

        $classCode = '';
        if (preg_match('/\[Northcar-ClassCode:([^\]]+)\]/i', $vehicle->description ?? '', $m)) {
            $classCode = $m[1];
        } elseif (preg_match('/\[NORTHCAR-GROUP-ID:([^\]]+)\]/i', $vehicle->description ?? '', $m)) {
            $classCode = $m[1];
        }

        // Fetch real-time availability to get the exact RateID for these dates
        $availability = $service->getAvailability($pickupLocationId, $returnLocationId, $pickupDateStr, $returnDateStr);
        $payload = $availability['Payload'] ?? null;
        $vehicles = $payload['Vehicles']['Vehicle'] ?? $payload['Vehicle'] ?? $payload['RateProduct'] ?? null;
        
        $rateId = '';
        if ($vehicles) {
            if (isset($vehicles['ClassCode'])) {
                $vehicles = [$vehicles];
            }
            foreach ($vehicles as $v) {
                if (($v['ClassCode'] ?? '') === $classCode) {
                    $rateId = $v['RateId'] ?? '';
                    break;
                }
            }
        }

        if (empty($rateId)) {
            throw new \Exception("Northcar API Error: Vehicle class {$classCode} is no longer available for these dates.");
        }

        $reservationData = [
            'SupplierName' => $supplier->name ?? 'NorthCarRental',
            'RentalLocationID' => $pickupLocationId,
            'ReturnLocationID' => $returnLocationId,
            'PickupDateTime' => $pickupDateStr,
            'ReturnDateTime' => $returnDateStr,
            'RateID' => $rateId,
            'ClassCode' => $classCode,
            'RenterFirst' => $nameParts['first'],
            'RenterLast' => $nameParts['last'] ?: 'Customer',
            'EmailAddress' => $customer->email ?? 'noreply@autours.net',
            'RenterHomePhone' => $customer->phone_num ?? '00000000',
            'RenterAddress1' => $customer->address ?? 'Unknown',
            'RenterCity' => $customer->city ?? 'Unknown',
            'RenterCountry' => $customer->country ?? 'GB',
            'CurrencyCode' => $rental->currency ?? 'GBP',
            'TotalPricing' => [
                'RentalDays' => $rental->num_of_days ?? 1,
                'RateCharge' => number_format((float)($rental->supplier_price ?? $rental->price), 2, '.', ''),
                'TotalExtras' => '0.00',
                'TotalCharges' => number_format((float)($rental->supplier_price ?? $rental->price), 2, '.', ''),
            ]
        ];

        $response = $service->addReservation($reservationData);

        $reservationNo = $response['Payload']['ConfirmNum'] ?? $response['TRNXML']['Payload']['ConfirmNum'] ?? $response['ConfirmNum'] ?? null;
        if (isset($response['Payload']) && is_array($response['Payload']) && isset($response['Payload'][0]['ConfirmNum'])) {
            $reservationNo = $response['Payload'][0]['ConfirmNum'];
        } elseif (isset($response['TRNXML']['Payload']) && is_array($response['TRNXML']['Payload']) && isset($response['TRNXML']['Payload'][0]['ConfirmNum'])) {
            $reservationNo = $response['TRNXML']['Payload'][0]['ConfirmNum'];
        }

        if (empty($reservationNo)) {
            Log::error('Northcar reservation creation failed (no ConfirmNum)', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
                'response'    => $response,
            ]);
            throw new \Exception("Supplier booking failed: No booking reference returned.");
        }

        $rental->update([
            'external_reservation_no' => (string) $reservationNo,
        ]);

        Log::info('Northcar reservation created successfully', [
            'rental_id'      => $rental->id,
            'order_number'   => $rental->order_number,
            'reservation_no' => $reservationNo,
            'supplier_id'    => $supplier->id,
        ]);

        return true;
    }

    /**
     * Cancel a reservation on the Northcar API.
     *
     * @param NorthcarApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function cancelNorthcarReservation(NorthcarApiService $service, Rental $rental, User $supplier): bool
    {
        $reservationNo = $rental->external_reservation_no;

        if (empty($reservationNo)) {
            Log::warning('Northcar cancellation: No external reservation number found', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
            ]);
            return false;
        }

        $response = $service->cancelReservation($reservationNo);
        $messageId = $response['Message']['MessageID'] ?? '';

        if ($messageId === 'RSPERR') {
            Log::error('Northcar reservation cancellation failed', [
                'rental_id'      => $rental->id,
                'reservation_no' => $reservationNo,
                'supplier_id'    => $supplier->id,
                'response'       => $response,
            ]);
            return false;
        }

        Log::info('Northcar reservation cancelled successfully', [
            'rental_id'      => $rental->id,
            'reservation_no' => $reservationNo,
            'supplier_id'    => $supplier->id,
        ]);
        return true;
    }
    /**
     * Send reservation to Surprice API.
     *
     * @param Rental $rental
     * @param User $supplier
     * @param string $eventType
     * @return bool
     */
    private function sendViaSurprice(Rental $rental, User $supplier, string $eventType): bool
    {
        try {
            $service = new SurpriceApiService();

            switch ($eventType) {
                case 'new_rental':
                case 'rental_request':
                    return $this->createSurpriceReservation($service, $rental, $supplier);

                case 'rental_cancelled':
                    return $this->cancelSurpriceReservation($service, $rental, $supplier);

                case 'rental_updated':
                    if (!empty($rental->external_reservation_no)) {
                        return $this->amendSurpriceReservation($service, $rental, $supplier);
                    }
                    return $this->createSurpriceReservation($service, $rental, $supplier);

                default:
                    Log::warning("Surprice integration: Unknown event type '{$eventType}'", [
                        'rental_id' => $rental->id,
                    ]);
                    return false;
            }
        } catch (\Exception $e) {
            Log::error("Surprice integration error for supplier {$supplier->id}", [
                'event'     => $eventType,
                'rental_id' => $rental->id,
                'error'     => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Create a reservation on the Surprice API.
     *
     * @param SurpriceApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function createSurpriceReservation(SurpriceApiService $service, Rental $rental, User $supplier): bool
    {
        $vehicle = $rental->vehicle;
        $customer = $rental->customer;
        $branch = $vehicle ? $vehicle->branch : null;

        if (!$vehicle || !$customer) {
            Log::error('Surprice integration: Missing vehicle or customer', [
                'rental_id' => $rental->id,
            ]);
            return false;
        }

        $description = $vehicle->description ?? '';
        
        // Extract groupId and rateCode from description: [SURPRICE-GROUP-ID:XYZ|RATE:Autours]
        $groupId = null;
        $rateCode = null;
        if (preg_match('/\[SURPRICE-GROUP-ID:([^|\]]+)\|RATE:([^\]]+)\]/', $description, $m)) {
            $groupId = $m[1];
            $rateCode = $m[2];
        } else {
            Log::warning('Surprice integration: Could not extract groupId and rateCode from description', [
                'rental_id'   => $rental->id,
                'vehicle_id'  => $vehicle->id,
                'description' => $description,
            ]);
            return false;
        }

        $pickupLocationCode = $branch ? $branch->station_id : '';
        $returnLocationCode = $pickupLocationCode;
        
        if (!$pickupLocationCode) {
            throw new \Exception("Missing station ID for branch.");
        }

        $pickupDate = $rental->start_date ? Carbon::parse($rental->start_date)->format('Y-m-d') : '';
        $returnDate = $rental->end_date ? Carbon::parse($rental->end_date)->format('Y-m-d') : '';
        $pickupTime = $rental->start_time ? Carbon::parse($rental->start_time)->format('H:i:s') : '10:00:00';
        $returnTime = $rental->end_time ? Carbon::parse($rental->end_time)->format('H:i:s') : '10:00:00';
        
        $pickupDateTime = "{$pickupDate}T{$pickupTime}";
        $returnDateTime = "{$returnDate}T{$returnTime}";
        
        $age = $rental->customer_age ?? 30;

        // Fetch availability to get a fresh vendorRateID
        $availability = $service->getAvailabilityForStations(
            [$pickupLocationCode => $branch->id],
            $pickupDateTime,
            $returnDateTime,
            $age,
            $rateCode,
            1,
            null
        );

        $branchAvailability = $availability[$branch->id] ?? [];
        $offerings = $branchAvailability['productOfferings'] ?? [];

        $vendorRateID = null;
        foreach ($offerings as $offering) {
            $offeringGroupId = (string) ($offering['vehicle']['code'] ?? '');
            if ($offeringGroupId === $groupId) {
                $vendorRateID = $offering['rentalDetails'][0]['rentalRate']['rateQualifier']['vendorRateID'] ?? null;
                break;
            }
        }

        if (!$vendorRateID) {
            throw new \Exception("Sorry, this vehicle is no longer available on the supplier's end for the requested dates. Please select another vehicle.");
        }

        $nameParts = $this->splitCustomerName($customer->name ?? '');
        $dob = $customer->dob ? Carbon::parse($customer->dob)->format('Y-m-d') : Carbon::now()->subYears(30)->format('Y-m-d');
        $issueDate = Carbon::now()->subYears(5)->format('Y-m-d');
        $expDate = Carbon::now()->addYears(5)->format('Y-m-d');
        
        // Use default dates/codes if the customer is missing info, as per their schema docs
        $reservationData = [
            'pickUpDateTime' => Carbon::parse($pickupDateTime)->format('Y-m-d\TH:i:s'),
            'returnDateTime' => Carbon::parse($returnDateTime)->format('Y-m-d\TH:i:s'),
            'pickUpLocationCode' => $pickupLocationCode,
            'returnLocationCode' => $returnLocationCode,
            'vehicleGroupPrefAccriss' => $groupId,
            'rateCode' => $rateCode,
            'vendorRateID' => $vendorRateID,
            'customerInfo' => [
                'customer' => [
                    'name' => $customer->name ?? 'Customer',
                    'email' => $customer->email ?? 'noreply@autours.net',
                    'phone' => $customer->phone_num ?? '+000000000000',
                    'addressLine' => $customer->address ?? 'Unknown Address',
                    'city' => $customer->city ?? 'Unknown',
                    'country' => $customer->country ?? 'GB',
                    'postalCode' => $customer->zip_code ?? '00000',
                    'dateOfBirth' => $dob,
                    'driverLicenseNumber' => $customer->license_number ?? '123456',
                    'driverLicenseCountryId' => $customer->country ?? 'GB',
                    'driverLicenseIssueDate' => $issueDate,
                    'driverLicenseExpirationDate' => $expDate,
                ]
            ]
        ];

        $response = $service->createReservation($reservationData);
        
        // According to API, confirmation orderId is returned in the response under orderInfo
        $reservationNo = $response['orderInfo']['corporateOrderId'] ?? $response['orderInfo']['id'] ?? $response['id'] ?? null;
        
        if (empty($reservationNo) && isset($response['success']) && $response['success'] === false) {
             $errorMsg = $response['error']['message'] ?? 'Unknown error';
             throw new \Exception("Supplier booking failed: " . $errorMsg);
        }

        if (empty($reservationNo)) {
            Log::error('Surprice reservation creation failed (no reservation number)', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
                'response'    => $response,
            ]);
            throw new \Exception("Supplier booking failed: No booking reference returned.");
        }

        $rental->update([
            'external_reservation_no' => (string) $reservationNo,
        ]);

        Log::info('Surprice reservation created successfully', [
            'rental_id'      => $rental->id,
            'order_number'   => $rental->order_number,
            'reservation_no' => $reservationNo,
            'supplier_id'    => $supplier->id,
        ]);

        return true;
    }

    /**
     * Amend a reservation on the Surprice API.
     *
     * @param SurpriceApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function amendSurpriceReservation(SurpriceApiService $service, Rental $rental, User $supplier): bool
    {
        $vehicle = $rental->vehicle;
        $customer = $rental->customer;
        $orderId = $rental->external_reservation_no;

        if (!$vehicle || !$customer || empty($orderId)) {
            Log::error('Surprice integration: Missing vehicle, customer or orderId for amend', [
                'rental_id' => $rental->id,
            ]);
            return false;
        }

        $description = $vehicle->description ?? '';
        
        $groupId = null;
        if (preg_match('/\[SURPRICE-GROUP-ID:([^|\]]+)\|RATE:([^\]]+)\]/', $description, $m)) {
            $groupId = $m[1];
        } else {
            Log::warning('Surprice integration: Could not extract groupId from description for amend', [
                'rental_id'   => $rental->id,
                'vehicle_id'  => $vehicle->id,
            ]);
            return false;
        }

        $pickupDate = $rental->start_date ? Carbon::parse($rental->start_date)->format('Y-m-d') : '';
        $returnDate = $rental->end_date ? Carbon::parse($rental->end_date)->format('Y-m-d') : '';
        $pickupTime = $rental->start_time ? Carbon::parse($rental->start_time)->format('H:i:s') : '10:00:00';
        $returnTime = $rental->end_time ? Carbon::parse($rental->end_time)->format('H:i:s') : '10:00:00';
        
        $pickupDateTime = "{$pickupDate}T{$pickupTime}";
        $returnDateTime = "{$returnDate}T{$returnTime}";
        
        $nameParts = $this->splitCustomerName($customer->name ?? '');
        $dob = $customer->dob ? Carbon::parse($customer->dob)->format('Y-m-d') : Carbon::now()->subYears(30)->format('Y-m-d');
        $issueDate = Carbon::now()->subYears(5)->format('Y-m-d');
        $expDate = Carbon::now()->addYears(5)->format('Y-m-d');

        $amendData = [
            'pickUpDateTime' => Carbon::parse($pickupDateTime)->format('Y-m-d\TH:i:s'),
            'returnDateTime' => Carbon::parse($returnDateTime)->format('Y-m-d\TH:i:s'),
            'vehicleGroupPrefAccriss' => $groupId,
            'flightNo' => $rental->flight_number ?? '',
            'customerInfo' => [
                'customer' => [
                    'name' => $customer->name ?? 'Customer',
                    'email' => $customer->email ?? 'noreply@autours.net',
                    'phone' => $customer->phone_num ?? '+000000000000',
                    'addressLine' => $customer->address ?? 'Unknown Address',
                    'city' => $customer->city ?? 'Unknown',
                    'country' => $customer->country ?? 'GB',
                    'postalCode' => $customer->zip_code ?? '00000',
                    'dateOfBirth' => $dob,
                    'driverLicenseNumber' => $customer->license_number ?? '123456',
                    'driverLicenseCountryId' => $customer->country ?? 'GB',
                    'driverLicenseIssueDate' => $issueDate,
                    'driverLicenseExpirationDate' => $expDate,
                ]
            ]
        ];

        $response = $service->amendReservation($orderId, $amendData);

        if (empty($response)) {
             throw new \Exception("Supplier booking amend failed: No response returned.");
        }

        if (isset($response['success']) && $response['success'] === false) {
             $errorMsg = $response['error']['message'] ?? 'Unknown error';
             throw new \Exception("Supplier booking amend failed: " . $errorMsg);
        }

        $status = strtolower($response['orderInfo']['status'] ?? $response['status'] ?? '');
        
        if ($status === 'pending') {
            $commitResponse = $service->commitReservation($orderId);
            
            if (empty($commitResponse) || (isset($commitResponse['success']) && $commitResponse['success'] === false)) {
                $errorMsg = $commitResponse['error']['message'] ?? 'Unknown error during commit';
                throw new \Exception("Supplier booking commit failed: " . $errorMsg);
            }
        }

        Log::info('Surprice reservation amended successfully', [
            'rental_id'      => $rental->id,
            'order_number'   => $rental->order_number,
            'reservation_no' => $orderId,
        ]);

        return true;
    }

    /**
     * Cancel a reservation on the Surprice API.
     *
     * @param SurpriceApiService $service
     * @param Rental $rental
     * @param User $supplier
     * @return bool
     */
    private function cancelSurpriceReservation(SurpriceApiService $service, Rental $rental, User $supplier): bool
    {
        $reservationNo = $rental->external_reservation_no;

        if (empty($reservationNo)) {
            Log::warning('Surprice cancellation: No external reservation number found', [
                'rental_id'   => $rental->id,
                'supplier_id' => $supplier->id,
            ]);
            return false;
        }

        $response = $service->cancelReservation($reservationNo);

        if (!empty($response) && (!isset($response['success']) || $response['success'] !== false)) {
            Log::info('Surprice reservation cancelled successfully', [
                'rental_id'      => $rental->id,
                'reservation_no' => $reservationNo,
                'supplier_id'    => $supplier->id,
            ]);
            return true;
        }

        Log::error('Surprice reservation cancellation failed', [
            'rental_id'      => $rental->id,
            'reservation_no' => $reservationNo,
            'supplier_id'    => $supplier->id,
            'response'       => $response,
        ]);

        return false;
    }

    /**
     * Send reservation to Wheelsys API.
     */
    private function sendViaWheelsys(Rental $rental, User $supplier, string $eventType): bool
    {
        try {
            $service = new WheelsysApiService();

            switch ($eventType) {
                case 'new_rental':
                case 'rental_request':
                    return $this->createWheelsysReservation($service, $rental, $supplier);

                case 'rental_cancelled':
                    return $this->cancelWheelsysReservation($service, $rental, $supplier);

                case 'rental_updated':
                    if (!empty($rental->external_reservation_no)) {
                        $this->cancelWheelsysReservation($service, $rental, $supplier);
                    }
                    return $this->createWheelsysReservation($service, $rental, $supplier);

                default:
                    Log::warning("Wheelsys integration: Unknown event type '{$eventType}'", [
                        'rental_id' => $rental->id,
                    ]);
                    return false;
            }
        } catch (\Exception $e) {
            Log::error("Wheelsys integration error for supplier {$supplier->id}", [
                'event'     => $eventType,
                'rental_id' => $rental->id,
                'error'     => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Create a reservation on the Wheelsys API.
     */
    private function createWheelsysReservation(WheelsysApiService $service, Rental $rental, User $supplier): bool
    {
        $vehicle = $rental->vehicle;
        $customer = $rental->customer;
        $branch = $vehicle ? $vehicle->branch : null;

        if (!$vehicle || !$customer) {
            Log::error('Wheelsys integration: Missing vehicle or customer', ['rental_id' => $rental->id]);
            return false;
        }

        // [WHEELSYS-GROUP-ID:C]
        if (preg_match('/\[WHEELSYS-GROUP-ID:([^\]]+)\]/', $vehicle->description, $m)) {
            $wheelsysGroupId = $m[1];
        } else {
            Log::warning('Wheelsys integration: Could not extract group ID from description', [
                'rental_id' => $rental->id,
                'description' => $vehicle->description,
            ]);
            return false;
        }

        $stationId = $branch ? $branch->station_id : '';
        if (!$stationId) {
            throw new \Exception("Missing station ID for branch.");
        }

        $nameParts = $this->splitCustomerName($customer->name ?? '');

        $pickupDate = $rental->start_date ? Carbon::parse($rental->start_date)->format('d/m/Y') : '';
        $returnDate = $rental->end_date ? Carbon::parse($rental->end_date)->format('d/m/Y') : '';
        $pickupTime = $rental->start_time ? Carbon::parse($rental->start_time)->format('H:i') : '10:00';
        $returnTime = $rental->end_time ? Carbon::parse($rental->end_time)->format('H:i') : '10:00';

        $reservationData = [
            'DATE_FROM' => $pickupDate,
            'TIME_FROM' => $pickupTime,
            'DATE_TO' => $returnDate,
            'TIME_TO' => $returnTime,
            'PICKUP_STATION' => $stationId,
            'RETURN_STATION' => $stationId,
            'GROUP' => $wheelsysGroupId,
            'CUSTFIRST_NAME' => $nameParts['first'] ?: 'Customer',
            'CUSTLAST_NAME' => $nameParts['last'] ?: 'Customer',
            'CUSTOMER_EMAIL' => $customer->email ?? 'noreply@autours.net',
            'CUSTOMER_PHONE' => $customer->phone_num ?? '0000000000',
            'VOUCHERNO' => $rental->order_number ?? (string) $rental->id,
        ];

        $response = $service->makeReservation($reservationData);

        $reservationNo = $response['irn'] ?? null;

        if (empty($reservationNo)) {
            throw new \Exception("Wheelsys booking failed: No booking reference returned.");
        }

        $rental->update([
            'external_reservation_no' => (string) $reservationNo,
        ]);

        Log::info('Wheelsys reservation created successfully', [
            'rental_id' => $rental->id,
            'reservation_no' => $reservationNo,
        ]);

        return true;
    }

    /**
     * Cancel a reservation on the Wheelsys API.
     */
    private function cancelWheelsysReservation(WheelsysApiService $service, Rental $rental, User $supplier): bool
    {
        $reservationNo = $rental->external_reservation_no;
        if (empty($reservationNo)) {
            return false;
        }

        $referenceNo = $rental->order_number ?? (string) $rental->id;

        $response = $service->cancelReservation($reservationNo, $referenceNo);

        if (isset($response['status']) && $response['status'] === 'CNC') {
            Log::info('Wheelsys reservation cancelled successfully', [
                'rental_id' => $rental->id,
                'reservation_no' => $reservationNo,
            ]);
            return true;
        }

        return false;
    }
}

<?php

namespace App\Services;

use App\Models\Rental;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SupplierIntegrationService
{
    /**
     * Send rental data to supplier's webhook if integration is enabled.
     *
     * @param Rental $rental
     * @param string $eventType
     * @return bool
     */
    public function sendRentalToSupplier(Rental $rental, string $eventType = 'new_rental'): bool
    {
        $rental->load(['vehicle', 'customer', 'supplier', 'paymentMethod']);

        $supplier = $this->getSupplier($rental);

        if (!$supplier || !$this->shouldSendToSupplier($supplier)) {
            return false;
        }

        $payload = $this->buildPayload($rental, $eventType);

        return $this->sendWebhook($supplier, $payload, $eventType);
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
        return $supplier->integration === true && !empty($supplier->webhook_url);
    }

    /**
     * Build the payload to send to the supplier.
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
}


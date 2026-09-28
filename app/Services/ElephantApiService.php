<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ElephantApiService
{
    private string $baseUrl = 'https://api.cycarrental.com/api';
    private int $requestTimeout = 30;
    private string $username;
    private string $password;

    public function __construct(string $username = 'Autours', string $password = 'Autours202')
    {
        $this->username = $username;
        $this->password = $password;
    }

    private function client()
    {
        return Http::timeout($this->requestTimeout)
            ->withBasicAuth($this->username, $this->password)
            ->withOptions(['verify' => false]);
    }

    /**
     * Fetch all locations.
     */
    public function getStations(): array
    {
        $response = $this->client()->get("{$this->baseUrl}/common/GetStations");

        if (!$response->successful()) {
            Log::error('Elephant API: GetStations failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }
    
    /**
     * Fetch places for a specific station.
     */
    public function getPlacesForStation(string $code): array
    {
        $response = $this->client()->get("{$this->baseUrl}/common/GetPlacesForStation", [
            'code' => $code
        ]);

        if (!$response->successful()) {
            Log::error('Elephant API: GetPlacesForStation failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }
    
    /**
     * Fetch vehicle groups.
     */
    public function getVehicleGroups(): array
    {
        $response = $this->client()->get("{$this->baseUrl}/common/GetVehicleGroups");

        if (!$response->successful()) {
            Log::error('Elephant API: GetVehicleGroups failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Fetch rates and availability.
     */
    public function getRateAvailability(
        string $pickupLocationCode,
        string $returnLocationCode,
        string $pickupDateTime,
        string $returnDateTime,
        string $paymentMethod = 'Local'
    ): array {
        $response = $this->client()->get("{$this->baseUrl}/common/GetRateAvailability", [
            'dateTimeFrom' => $pickupDateTime,
            'dateTimeTo' => $returnDateTime,
            'pickupplace' => $pickupLocationCode,
            'dropoffplace' => $returnLocationCode,
            'pm' => $paymentMethod,
        ]);

        if (!$response->successful()) {
            Log::error('Elephant API: GetRateAvailability failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }
    
    public function getExtrasAvailability(
        string $vehicleGroup,
        string $dateFrom,
        string $dateTo,
        string $pickupLocationCode,
        string $returnLocationCode,
        string $paymentMethod = 'Local'
    ): array {
        $response = $this->client()->get("{$this->baseUrl}/common/GetVehicleGroupExtrasAvailability", [
            'vehiclegroup' => $vehicleGroup,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'pickupplace' => $pickupLocationCode,
            'dropoffplace' => $returnLocationCode,
            'pm' => $paymentMethod,
            'lang' => 'en'
        ]);

        if (!$response->successful()) {
            Log::error('Elephant API: GetVehicleGroupExtrasAvailability failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Create a reservation.
     */
    public function insertReservation(array $data): array
    {
        $response = $this->client()->post("{$this->baseUrl}/reservations/InsertReservation", $data);

        if (!$response->successful()) {
            Log::error('Elephant API: InsertReservation failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Cancel a reservation.
     */
    public function cancelReservation(string $refNo): array
    {
        $response = $this->client()->put("{$this->baseUrl}/reservations/CancelReservation_refno", [
            'refno' => $refNo
        ]);

        if (!$response->successful()) {
            Log::error('Elephant API: CancelReservation failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }
}

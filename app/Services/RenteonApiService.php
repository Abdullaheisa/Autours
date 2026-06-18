<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RenteonApiService
{
    private const BASE_URL = 'https://aggregator.renteon.com';
    private const USERNAME = 'autours.agg.api';
    private const PASSWORD = 'K1.li-5hEw.Av.9IjV';
    
    // For development use 'demo', for production use 'Essence'
    public const PROVIDER_CODE = 'Essence';

    private int $requestTimeout = 30;

    /**
     * Set the HTTP request timeout in seconds.
     */
    public function setTimeout(int $seconds): void
    {
        $this->requestTimeout = max(1, $seconds);
    }

    /**
     * Fetch all available locations from the Renteon API.
     *
     * @return array<int, array>
     */
    public function getLocations(): array
    {
        $url = self::BASE_URL . '/api/setup/locations';

        $response = Http::timeout($this->requestTimeout)
            ->withBasicAuth(self::USERNAME, self::PASSWORD)
            ->withOptions(['verify' => false])
            ->get($url);

        if (! $response->successful()) {
            Log::error('Renteon API: Locations request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Check availability for a specific pickup and dropoff station.
     *
     * @param string $pickupLocation
     * @param string $returnLocation
     * @param string $pickupDate (ISO 8601 format without time zone designator)
     * @param string $dropoffDate (ISO 8601 format without time zone designator)
     * @param string $currency (ISO 4217 currency code)
     * @return array<int, mixed>
     */
    public function getAvailability(
        string $pickupLocation,
        string $returnLocation,
        string $pickupDate,
        string $dropoffDate,
        string $currency = 'EUR'
    ): array {
        $url = self::BASE_URL . '/api/bookings/availability';

        $payload = [
            'Prepaid' => false,
            'IncludeOnRequest' => false,
            'PickupLocation' => $pickupLocation,
            'DropOffLocation' => $returnLocation,
            'PickupDate' => $pickupDate,
            'DropOffDate' => $dropoffDate,
            'Currency' => $currency,
            'Providers' => [
                [
                    'Code' => self::PROVIDER_CODE,
                ]
            ]
        ];

        $response = Http::timeout($this->requestTimeout)
            ->withBasicAuth(self::USERNAME, self::PASSWORD)
            ->withOptions(['verify' => false])
            ->post($url, $payload);

        if (! $response->successful()) {
            Log::error('Renteon API: Availability request failed', [
                'status' => $response->status(),
                'pickup' => $pickupLocation,
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }
}

<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SurpriceApiService
{
    private const BASE_URL = 'https://surpricecars-ota-service.uat.surpricemobility.com:3015';
    private const BEARER_TOKEN = '69a638a6-9059-4039-ad36-196f9b1f9a7b';

    private int $requestTimeout = 30;

    /**
     * Fetch all cities from Surprice API.
     *
     * @return array<int, array>
     */
    public function getCities(): array
    {
        $response = Http::timeout($this->requestTimeout)
            ->withHeaders($this->authHeaders())
            ->withOptions(['verify' => false])
            ->get(self::BASE_URL . '/v1/cities');

        if (! $response->successful()) {
            Log::error('Surprice API: Failed to fetch cities', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        $data = $response->json();
        return $data['results'] ?? [];
    }

    /**
     * Fetch all countries from Surprice API.
     *
     * @return array<int, array>
     */
    public function getCountries(): array
    {
        $response = Http::timeout($this->requestTimeout)
            ->withHeaders($this->authHeaders())
            ->withOptions(['verify' => false])
            ->get(self::BASE_URL . '/v1/countries');

        if (! $response->successful()) {
            Log::error('Surprice API: Failed to fetch countries', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        $data = $response->json();
        return $data['results'] ?? [];
    }

    /**
     * Fetch all rental locations/stations from Surprice API.
     *
     * @return array<int, array>
     */
    public function getLocations(int $limit = 500): array
    {
        $response = Http::timeout($this->requestTimeout)
            ->withHeaders($this->authHeaders())
            ->withOptions(['verify' => false])
            ->get(self::BASE_URL . '/v1/location/search', [
                'limit' => $limit,
                'offset' => 0,
            ]);

        if (! $response->successful()) {
            Log::error('Surprice API: Failed to fetch locations', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        $data = $response->json();
        return $data['results'] ?? [];
    }

    /**
     * Check availability for a single location.
     *
     * @param string $locationCode   e.g. "ATH", "DXB"
     * @param string $pickupDateTime ISO-8601, e.g. "2026-06-01T10:00:00"
     * @param string $dropoffDateTime ISO-8601
     * @param int $driverAge
     * @param string $rateCode       e.g. "Autours" or "Autours FDW"
     * @return array<string, mixed>
     */
    public function getAvailability(
        string $locationCode,
        string $pickupDateTime,
        string $dropoffDateTime,
        int $driverAge = 30,
        string $rateCode = 'Autours'
    ): array {
        $response = Http::timeout($this->requestTimeout)
            ->withHeaders($this->authHeaders())
            ->withOptions(['verify' => false])
            ->post(self::BASE_URL . '/v1/availability', [
                'pickUpLocationCode' => $locationCode,
                'returnLocationCode' => $locationCode,
                'pickUpDateTime' => $pickupDateTime,
                'returnDateTime' => $dropoffDateTime,
                'driverAge' => $driverAge,
                'rateCode' => $rateCode,
            ]);

        if (! $response->successful()) {
            Log::error('Surprice API: Availability request failed', [
                'status' => $response->status(),
                'location' => $locationCode,
                'rate_code' => $rateCode,
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Check availability for multiple stations concurrently.
     *
     * @param array<string, int> $stationToBranchMap station_id => branch_id
     * @param string $pickupDateTime
     * @param string $dropoffDateTime
     * @param int $driverAge
     * @param string $rateCode
     * @param int $concurrency
     * @return array<int, array<string, mixed>> branch_id => availabilityData
     */
    public function getAvailabilityForStations(
        array $stationToBranchMap,
        string $pickupDateTime,
        string $dropoffDateTime,
        int $driverAge = 30,
        string $rateCode = 'Autours',
        int $concurrency = 10,
        ?\Closure $onChunkProcessed = null
    ): array {
        if (empty($stationToBranchMap)) {
            return [];
        }

        $url = self::BASE_URL . '/v1/availability';
        $results = [];
        $stationIds = array_keys($stationToBranchMap);

        foreach (array_chunk($stationIds, $concurrency) as $chunk) {
            try {
                $responses = Http::pool(function (Pool $pool) use ($chunk, $url, $pickupDateTime, $dropoffDateTime, $driverAge, $rateCode) {
                    foreach ($chunk as $stationId) {
                        $pool->as((string) $stationId)
                            ->withHeaders($this->authHeaders())
                            ->withOptions(['verify' => false])
                            ->timeout($this->requestTimeout)
                            ->post($url, [
                                'pickUpLocationCode' => $stationId,
                                'returnLocationCode' => $stationId,
                                'pickUpDateTime' => $pickupDateTime,
                                'returnDateTime' => $dropoffDateTime,
                                'driverAge' => $driverAge,
                                'rateCode' => $rateCode,
                            ]);
                    }
                });
            } catch (\Exception $e) {
                Log::error('Surprice API: Concurrent availability fetch failed', ['error' => $e->getMessage()]);
                continue;
            }

            foreach ($chunk as $stationId) {
                $response = $responses[(string) $stationId] ?? null;

                if (! $response || $response instanceof \Exception) {
                    continue;
                }

                if (! $response->successful()) {
                    continue;
                }

                $data = $response->json() ?? [];

                // Skip if API returned an error structure (type === 3)
                if (isset($data['type']) && $data['type'] === 3) {
                    continue;
                }

                $branchId = $stationToBranchMap[$stationId];
                $results[$branchId] = $data;
            }

            if ($onChunkProcessed !== null) {
                $onChunkProcessed(count($chunk));
            }
        }

        return $results;
    }

    /**
     * Create a reservation on Surprice.
     *
     * @param array<string, mixed> $params
     * @return array<string, mixed>
     */
    public function createReservation(array $params): array
    {
        $response = Http::timeout(60)
            ->withHeaders($this->authHeaders())
            ->withOptions(['verify' => false])
            ->post(self::BASE_URL . '/v1/reservation', $params);

        if (! $response->successful()) {
            Log::error('Surprice API: Failed to create reservation', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Amend an existing reservation.
     *
     * @param string $orderId
     * @param array<string, mixed> $params
     * @return array<string, mixed>
     */
    public function amendReservation(string $orderId, array $params): array
    {
        $response = Http::timeout(60)
            ->withHeaders($this->authHeaders())
            ->withOptions(['verify' => false])
            ->post(self::BASE_URL . "/v1/reservation/{$orderId}/amend", $params);

        if (! $response->successful()) {
            Log::error('Surprice API: Failed to amend reservation', [
                'status' => $response->status(),
                'order_id' => $orderId,
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Cancel a reservation.
     *
     * @param string $orderId
     * @return array<string, mixed>
     */
    public function cancelReservation(string $orderId): array
    {
        $response = Http::timeout(60)
            ->withHeaders($this->authHeaders())
            ->withOptions(['verify' => false])
            ->post(self::BASE_URL . "/v1/reservation/{$orderId}/cancel");

        if (! $response->successful()) {
            Log::error('Surprice API: Failed to cancel reservation', [
                'status' => $response->status(),
                'order_id' => $orderId,
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Commit (confirm) a reservation after amendment.
     *
     * @param string $orderId
     * @return array<string, mixed>
     */
    public function commitReservation(string $orderId): array
    {
        $response = Http::timeout(60)
            ->withHeaders($this->authHeaders())
            ->withOptions(['verify' => false])
            ->post(self::BASE_URL . "/v1/reservation/{$orderId}/commit");

        if (! $response->successful()) {
            Log::error('Surprice API: Failed to commit reservation', [
                'status' => $response->status(),
                'order_id' => $orderId,
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Ignore an amendment and revert to previous state.
     *
     * @param string $orderId
     * @return array<string, mixed>
     */
    public function ignoreReservation(string $orderId): array
    {
        $response = Http::timeout(60)
            ->withHeaders($this->authHeaders())
            ->withOptions(['verify' => false])
            ->post(self::BASE_URL . "/v1/reservation/{$orderId}/ignore");

        if (! $response->successful()) {
            Log::error('Surprice API: Failed to ignore reservation amendment', [
                'status' => $response->status(),
                'order_id' => $orderId,
                'body' => $response->body(),
            ]);
            return [];
        }

        return $response->json() ?? [];
    }

    /**
     * Set the HTTP request timeout in seconds.
     */
    public function setTimeout(int $seconds): void
    {
        $this->requestTimeout = max(1, $seconds);
    }

    /**
     * Build authorization headers.
     *
     * @return array<string, string>
     */
    private function authHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . self::BEARER_TOKEN,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }
}

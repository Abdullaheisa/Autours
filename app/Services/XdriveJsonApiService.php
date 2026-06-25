<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class XdriveJsonApiService
{
    private const BASE_URL = 'http://xdrivejson.turevsistem.com/';
    private const KEY_HACK = '5c0fdb7f-7322-4101-a587-ffa75cf0bd54';
    private const USERNAME = 'XdriveAutotours';
    private const PASSWORD = 'tdzkv69i5ddmev4';

    private int $requestTimeout = 15;

    /**
     * Fetch all locations from Xdrive JSON API.
     *
     * @return array<int, array>
     */
    public function getLocations(): array
    {
        $response = Http::timeout(30)
            ->get(self::BASE_URL . 'JsonLocations.aspx', [
                'Key_Hack' => self::KEY_HACK,
            ]);

        if (! $response->successful()) {
            Log::error('Xdrive API: Failed to fetch locations', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $this->parseResponse($response);
    }

    /**
     * Fetch all vehicle groups from Xdrive JSON API.
     *
     * @return array<int, array>
     */
    public function getGroups(): array
    {
        $response = Http::timeout(30)
            ->get(self::BASE_URL . 'JsonGroup.aspx', [
                'Key_Hack' => self::KEY_HACK,
            ]);

        if (! $response->successful()) {
            Log::error('Xdrive API: Failed to fetch groups', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $this->parseResponse($response);
    }

    /**
     * Fetch available cars for a single station.
     *
     * @param string $pickupId    Pickup Location ID
     * @param string $dropoffId   Drop-off Location ID
     * @param string $pickupDate  Format: yyyy-MM-dd HH:mm
     * @param string $dropoffDate Format: yyyy-MM-dd HH:mm
     * @param string $currency    TL, EURO, USD, GBP
     * @return array<int, array>
     */
    public function getAvailableCars(
        string $pickupId,
        string $dropoffId,
        string $pickupDate,
        string $dropoffDate,
        string $currency = 'TL'
    ): array {
        $pickup = new \DateTime($pickupDate);
        $dropoff = new \DateTime($dropoffDate);

        $response = Http::timeout(60)
            ->get(self::BASE_URL . 'JsonRez.aspx', [
                'Key_Hack' => self::KEY_HACK,
                'User_Name' => self::USERNAME,
                'User_Pass' => self::PASSWORD,
                'Pickup_ID' => $pickupId,
                'Drop_Off_ID' => $dropoffId,
                'Pickup_Day' => $pickup->format('d'),
                'Pickup_Month' => $pickup->format('m'),
                'Pickup_Year' => $pickup->format('Y'),
                'Drop_Off_Day' => $dropoff->format('d'),
                'Drop_Off_Month' => $dropoff->format('m'),
                'Drop_Off_Year' => $dropoff->format('Y'),
                'Pickup_Hour' => $pickup->format('H'),
                'Pickup_Min' => $pickup->format('i'),
                'Drop_Off_Hour' => $dropoff->format('H'),
                'Drop_Off_Min' => $dropoff->format('i'),
                'Currency' => $currency,
            ]);

        if (! $response->successful()) {
            Log::error('Xdrive API: Failed to fetch available cars', [
                'status' => $response->status(),
                'pickup_id' => $pickupId,
                'dropoff_id' => $dropoffId,
            ]);
            return [];
        }

        return $this->parseResponse($response);
    }

    /**
     * Fetch available cars for multiple stations concurrently.
     *
     * @param array<string, int> $stationToBranchMap station_id => branch_id
     * @param string $pickupDate
     * @param string $dropoffDate
     * @param string $currency
     * @param int $concurrency
     * @return array<int, array<string, array>> branch_id => group_id => priceData
     */
    public function getAvailableCarsForStations(
        array $stationToBranchMap,
        string $pickupDate,
        string $dropoffDate,
        string $currency = 'TL',
        int $concurrency = 10,
        ?\Closure $onChunkProcessed = null
    ): array {
        if (empty($stationToBranchMap)) {
            return [];
        }

        $pickup = new \DateTime($pickupDate);
        $dropoff = new \DateTime($dropoffDate);

        $baseParams = [
            'Key_Hack' => self::KEY_HACK,
            'User_Name' => self::USERNAME,
            'User_Pass' => self::PASSWORD,
            'Pickup_Day' => $pickup->format('d'),
            'Pickup_Month' => $pickup->format('m'),
            'Pickup_Year' => $pickup->format('Y'),
            'Drop_Off_Day' => $dropoff->format('d'),
            'Drop_Off_Month' => $dropoff->format('m'),
            'Drop_Off_Year' => $dropoff->format('Y'),
            'Pickup_Hour' => $pickup->format('H'),
            'Pickup_Min' => $pickup->format('i'),
            'Drop_Off_Hour' => $dropoff->format('H'),
            'Drop_Off_Min' => $dropoff->format('i'),
            'Currency' => $currency,
        ];

        $url = self::BASE_URL . 'JsonRez.aspx';
        $results = [];
        $stationIds = array_keys($stationToBranchMap);

        foreach (array_chunk($stationIds, $concurrency) as $chunk) {
            try {
                $responses = Http::pool(function (Pool $pool) use ($chunk, $url, $baseParams) {
                    foreach ($chunk as $stationId) {
                        $params = array_merge($baseParams, [
                            'Pickup_ID' => $stationId,
                            'Drop_Off_ID' => $stationId,
                        ]);
                        $pool->as((string) $stationId)->timeout($this->requestTimeout)->get($url, $params);
                    }
                });
            } catch (\Exception $e) {
                Log::error('Xdrive API: Concurrent price fetch failed', ['error' => $e->getMessage()]);
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

                $cars = $this->parseResponse($response);

                if (! empty($cars)) {
                    $branchId = $stationToBranchMap[$stationId];
                    $results[$branchId] = $this->deduplicateCarsByGroup($cars);
                }
            }

            if ($onChunkProcessed !== null) {
                $onChunkProcessed(count($chunk));
            }
        }

        return $results;
    }

    /**
     * Set the HTTP request timeout in seconds.
     */
    public function setTimeout(int $seconds): void
    {
        $this->requestTimeout = max(1, $seconds);
    }

    /**
     * Save a reservation to Xdrive.
     *
     * @param array<string, mixed> $params
     * @return array<string, mixed>
     */
    public function saveReservation(array $params): array
    {
        $defaults = [
            'Key_Hack' => self::KEY_HACK,
            'User_Name' => self::USERNAME,
            'User_Pass' => self::PASSWORD,
        ];

        $response = Http::timeout(60)
            ->get(self::BASE_URL . 'JsonRez_Save.aspx', array_merge($defaults, $params));

        if (! $response->successful()) {
            Log::error('Xdrive API: Failed to save reservation', [
                'status' => $response->status(),
            ]);
            return [];
        }

        $data = $this->parseResponse($response);
        return $data[0] ?? $data;
    }

    /**
     * Cancel a reservation in Xdrive.
     *
     * @param string $rezId Reservation ID of the car
     * @param string $id    ID value given when registered
     * @return array<string, mixed>
     */
    public function cancelReservation(string $rezId, string $id): array
    {
        $response = Http::timeout(30)
            ->get(self::BASE_URL . 'JsonCancel.aspx', [
                'Key_Hack' => self::KEY_HACK,
                'Rez_ID' => $rezId,
                'ID' => $id,
                'User_Name' => self::USERNAME,
                'User_Pass' => self::PASSWORD,
            ]);

        if (! $response->successful()) {
            Log::error('Xdrive API: Failed to cancel reservation', [
                'status' => $response->status(),
            ]);
            return [];
        }

        $data = $this->parseResponse($response);
        return $data[0] ?? $data;
    }

    /**
     * Parse an HTTP response body into an array.
     *
     * @param \Illuminate\Http\Client\Response $response
     * @return array<int, array>
     */
    private function parseResponse($response): array
    {
        $body = $response->body();
        $contentType = $response->header('Content-Type') ?? '';

        // Attempt JSON decode regardless of Content-Type header
        $data = json_decode($body, true);

        if (! is_array($data)) {
            Log::warning('Xdrive API: Unexpected response format', [
                'content_type' => $contentType,
                'body_snippet' => substr($body, 0, 200),
            ]);
            return [];
        }

        // If it's a sequential array, return directly
        if (array_keys($data) === range(0, count($data) - 1)) {
            return $data;
        }

        // Check if all keys are numeric (sometimes JSON objects have numeric string keys)
        $allNumeric = true;
        foreach (array_keys($data) as $key) {
            if (! is_int($key) && ! is_numeric($key)) {
                $allNumeric = false;
                break;
            }
        }
        if ($allNumeric) {
            return array_values($data);
        }

        // Common wrapper keys
        foreach (['Table', 'table', 'Results', 'results', 'Data', 'data', 'Items', 'items'] as $key) {
            if (isset($data[$key])) {
                $inner = $data[$key];
                if (is_array($inner)) {
                    return array_values($inner) === $inner ? $inner : [$inner];
                }
                return [];
            }
        }

        // Single record with known fields -> wrap in array
        if (isset($data['location_id']) || isset($data['group_id']) || isset($data['rez_id'])) {
            return [$data];
        }

        return [$data];
    }

    /**
     * Deduplicate available cars by Group_ID, keeping the first occurrence.
     * Extracts price data into a normalized structure.
     *
     * @param array<int, array> $cars
     * @return array<string, array> group_id => priceData
     */
    private function deduplicateCarsByGroup(array $cars): array
    {
        $prices = [];

        foreach ($cars as $car) {
            $gid = (string) ($car['group_id'] ?? '');
            if (empty($gid) || isset($prices[$gid])) {
                continue;
            }

            $prices[$gid] = [
                'day_value' => $this->parsePrice($car['daily_rental'] ?? 0),
                'total_value' => $this->parsePrice($car['total_rental'] ?? 0),
                'currency' => $car['currency'] ?? 'TL',
                'days' => (int) ($car['days'] ?? 1),
                'image_path' => $car['image_path'] ?? null,
                'rez_id' => $car['rez_id'] ?? null,
                'cars_park_id' => $car['cars_park_id'] ?? null,
                'km_limit' => $car['km_limit'] ?? null,
                'provision' => $this->parsePrice($car['provision'] ?? 0),
            ];
        }

        return $prices;
    }

    /**
     * Parse a price value, handling comma decimal separators.
     *
     * @param mixed $value
     * @return float
     */
    private function parsePrice(mixed $value): float
    {
        if (is_numeric($value)) {
            return (float) $value;
        }

        $str = (string) $value;
        $str = str_replace(',', '.', $str);

        return is_numeric($str) ? (float) $str : 0.0;
    }
}

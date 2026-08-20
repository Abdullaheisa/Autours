<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RentlyApiService
{
    private const BASE_URL = 'https://api.rentlynetwork.com';
    private const USERNAME = 'autours';
    private const PASSWORD = '_xY4Df3cz8VcXriXtgEn';
    private const CLIENT_ID = 'RentlyAPI';

    /**
     * Get the Bearer token for authentication.
     * Uses cache to avoid repeated token requests (valid for 1 hour).
     *
     * @return string|null
     */
    public function getToken(): ?string
    {
        return Cache::remember('rently_api_token', 3500, function () {
            try {
                $response = Http::withoutVerifying()->asForm()->post(self::BASE_URL . '/connect/token', [
                    'username' => self::USERNAME,
                    'password' => self::PASSWORD,
                    'grant_type' => 'password',
                    'client_id' => self::CLIENT_ID,
                ]);

                if ($response->successful()) {
                    return $response->json('access_token');
                }

                Log::error('Rently API: Failed to obtain token', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            } catch (\Exception $e) {
                Log::error('Rently API: Token request exception', ['error' => $e->getMessage()]);
            }

            return null;
        });
    }

    /**
     * Fetch all available locations from Rently.
     *
     * @return array<int, array>
     */
    public function getLocations(): array
    {
        $token = $this->getToken();
        if (!$token) {
            return [];
        }

        try {
            $response = Http::withoutVerifying()->withToken($token)
                ->timeout(30)
                ->get(self::BASE_URL . '/api/Locations');

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Rently API: Failed to fetch locations', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        } catch (\Exception $e) {
            Log::error('Rently API: Locations request exception', ['error' => $e->getMessage()]);
        }

        return [];
    }

    /**
     * Fetch all car categories (models and specifications).
     *
     * @return array<int, array>
     */
    public function getCategories(): array
    {
        $token = $this->getToken();
        if (!$token) {
            return [];
        }

        try {
            $response = Http::withoutVerifying()->withToken($token)
                ->timeout(30)
                ->get(self::BASE_URL . '/api/Categories');

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Rently API: Failed to fetch categories', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
        } catch (\Exception $e) {
            Log::error('Rently API: Categories request exception', ['error' => $e->getMessage()]);
        }

        return [];
    }

    /**
     * Fetch availability for a specific location and date range.
     *
     * @param string $pickupLocation  IATA code
     * @param string $dropoffLocation IATA code
     * @param string $fromDate        Format: yyyy-MM-dd HH:mm
     * @param string $toDate          Format: yyyy-MM-dd HH:mm
     * @return array<int, array>
     */
    public function getAvailability(
        string $pickupLocation,
        string $dropoffLocation,
        string $fromDate,
        string $toDate
    ): array {
        $token = $this->getToken();
        if (!$token) {
            return [];
        }

        try {
            $response = Http::withoutVerifying()->withToken($token)
                ->timeout(60)
                ->get(self::BASE_URL . '/api/Availability', [
                    'DeliveryLocation' => $pickupLocation,
                    'DropoffLocation' => $dropoffLocation,
                    'From' => $fromDate,
                    'To' => $toDate,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Rently API: Failed to fetch availability', [
                'status' => $response->status(),
                'pickup' => $pickupLocation,
                'from' => $fromDate,
                'to' => $toDate,
                'body' => $response->body(),
            ]);
        } catch (\Exception $e) {
            Log::error('Rently API: Availability request exception', [
                'pickup' => $pickupLocation,
                'error' => $e->getMessage(),
            ]);
        }

        return [];
    }
}

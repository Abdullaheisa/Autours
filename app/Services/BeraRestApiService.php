<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BeraRestApiService
{
    private string $baseUrl;
    private string $username;
    private string $password;
    private ?string $token = null;

    public function __construct(string $username, string $password)
    {
        $this->username = $username;
        $this->password = $password;
        // User must set this in their .env
        $this->baseUrl = rtrim(env('BERA_API_BASE_URL') ?: 'https://racapi.beraotokiralama.com', '/');
    }

    private function authenticate(): bool
    {
        if ($this->token !== null) {
            return true;
        }

        $response = Http::post("{$this->baseUrl}/users/authenticate", [
            'username' => $this->username,
            'password' => $this->password,
        ]);

        if ($response->successful() && $response->json('success') === true) {
            $this->token = $response->json('data.token');
            return true;
        }

        Log::error('BeraRestApi: Authentication failed', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return false;
    }

    public function getLocations(): array
    {
        if (!$this->authenticate()) {
            return [];
        }

        $response = Http::withToken($this->token)
            ->get("{$this->baseUrl}/locations", [
                'languageCode' => 'EN'
            ]);

        if ($response->successful() && $response->json('success') === true) {
            return $response->json('data') ?? [];
        }

        Log::error('BeraRestApi: getLocations failed', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return [];
    }

    public function getVehicles(
        string $pickupLocationId,
        string $returnLocationId,
        string $pickupDate, // dd.mm.yyyy
        string $returnDate, // dd.mm.yyyy
        string $pickupTime, // hh:mm
        string $returnTime, // hh:mm
        string $currencyCode = 'TRY'
    ): array {
        if (!$this->authenticate()) {
            return [];
        }

        $response = Http::withToken($this->token)
            ->get("{$this->baseUrl}/vehicles", [
                'pickupLocationId' => $pickupLocationId,
                'returnLocationId' => $returnLocationId,
                'pickupDate' => $pickupDate,
                'returnDate' => $returnDate,
                'pickupTime' => $pickupTime,
                'returnTime' => $returnTime,
                'currencyCode' => $currencyCode,
                'languageCode' => 'EN'
            ]);

        if ($response->successful() && $response->json('success') === true) {
            return $response->json('data') ?? [];
        }

        Log::error('BeraRestApi: getVehicles failed', [
            'status' => $response->status(),
            'body' => $response->body(),
            'request' => compact('pickupLocationId', 'returnLocationId', 'pickupDate', 'returnDate', 'pickupTime', 'returnTime'),
        ]);

        return [];
    }
    public function createReservation(array $payload): ?array
    {
        if (!$this->authenticate()) {
            return null;
        }

        $response = Http::withToken($this->token)
            ->post("{$this->baseUrl}/reservations/save", $payload);

        if ($response->successful()) {
            if ($response->json('success') === true) {
                return $response->json('data');
            } else {
                $body = $response->json();
                $msg = $body['message'] ?? 'Unknown API Error';
                if (!empty($body['serviceMessage'])) {
                    $svc = json_decode($body['serviceMessage'], true);
                    if (!empty($svc['errors'])) {
                        $msg .= ' | ' . json_encode($svc['errors']);
                    }
                }
                throw new \Exception("Bera API Error: " . $msg);
            }
        }

        Log::error('BeraRestApi: createReservation failed', [
            'status' => $response->status(),
            'body' => $response->body(),
            'request' => $payload,
        ]);

        throw new \Exception("Bera API connection failed (HTTP " . $response->status() . ")");
    }

    public function cancelReservation(string $reservationNumber, string $customerEmail, string $cancelNote): bool
    {
        if (!$this->authenticate()) {
            return false;
        }

        $response = Http::withToken($this->token)
            ->post("{$this->baseUrl}/reservations/cancel", [
                'reservationNumber' => $reservationNumber,
                'customerEmail' => $customerEmail,
                'cancelNote' => $cancelNote,
            ]);

        if ($response->successful() && $response->json('success') === true) {
            return true;
        }

        Log::error('BeraRestApi: cancelReservation failed', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        return false;
    }
}

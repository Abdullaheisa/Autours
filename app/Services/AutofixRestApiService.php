<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AutofixRestApiService
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
        $this->baseUrl = rtrim(env('AUTOFIX_API_BASE_URL') ?: 'https://api.kolaycar.com', '/');
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

        Log::error('AutofixRestApi: Authentication failed', [
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

        Log::error('AutofixRestApi: getLocations failed', [
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
        string $returnTime // hh:mm
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
                'currencyCode' => 'EUR',
                'languageCode' => 'EN'
            ]);

        if ($response->successful() && $response->json('success') === true) {
            return $response->json('data') ?? [];
        }

        Log::error('AutofixRestApi: getVehicles failed', [
            'status' => $response->status(),
            'body' => $response->body(),
            'request' => compact('pickupLocationId', 'returnLocationId', 'pickupDate', 'returnDate', 'pickupTime', 'returnTime'),
        ]);

        return [];
    }
}

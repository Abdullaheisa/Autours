<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FleetrezApiService
{
    private const BASE_URL = 'https://booking.h-lead.gr/api/v2';
    
    private int $requestTimeout = 30;
    private string $username;
    private string $password;

    public function __construct(string $username, string $password)
    {
        $this->username = $username;
        $this->password = $password;
    }

    /**
     * Send a JSON request to the FleetRez API.
     */
    private function sendRequest(string $endpoint, array $params = []): array
    {
        $params['username'] = $this->username;
        $params['password'] = $this->password;
        
        $url = self::BASE_URL . $endpoint;
        
        $response = Http::timeout($this->requestTimeout)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ])
            ->post($url, $params);
            
        if (!$response->successful()) {
            Log::error("Fleetrez API: {$endpoint} request failed", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            
            // Try to parse the error message if any
            $errorData = json_decode($response->body(), true);
            $errorMsg = $errorData['message'] ?? $errorData['error'] ?? 'Unknown API error';
            throw new \Exception("Fleetrez API error: {$errorMsg}");
        }
        
        $data = $response->json();
        
        // FleetRez typically returns status = "Success" or "Error" for some calls, check it
        if (isset($data['status']) && strtolower($data['status']) !== 'success') {
            $errorMsg = $data['message'] ?? 'API returned error status';
            Log::error("Fleetrez API returned error: {$errorMsg}");
            throw new \Exception("Fleetrez API error: {$errorMsg}");
        }
        
        return $data ?? [];
    }

    /**
     * Search for available vehicles.
     *
     * @param int $pickUpId
     * @param int $dropOffId
     * @param string $pickUpDate
     * @param string $dropOffDate
     * @param string $pickUpTime
     * @param string $dropOffTime
     * @param int $driverAge
     * @param string $rateType
     * @return array
     */
    public function search(
        int $pickUpId,
        int $dropOffId,
        string $pickUpDate,
        string $dropOffDate,
        string $pickUpTime,
        string $dropOffTime,
        int $driverAge = 30,
        string $rateType = 'Pay On Arrival'
    ): array {
        $params = [
            'pickUpId'            => $pickUpId,
            'dropOffId'           => $dropOffId,
            'pickUpDate'          => $pickUpDate,
            'dropOffDate'         => $dropOffDate,
            'pickUpTime'          => $pickUpTime,
            'dropOffTime'         => $dropOffTime,
            'driverAge'           => $driverAge,
            'pickUpLocationType'  => 'rental',
            'dropOffLocationType' => 'rental',
            'rateType'            => $rateType,
        ];

        return $this->sendRequest('/vehicle/car/search', $params);
    }
    
    /**
     * Confirm the latest price for a vehicle before booking.
     *
     * @param int $searchId
     * @param int $vehicleId
     * @param int $pricingId
     * @param int $pickUpId
     * @param int $dropOffId
     * @return array
     */
    public function reprice(
        int $searchId,
        int $vehicleId,
        int $pricingId,
        int $pickUpId,
        int $dropOffId
    ): array {
        $params = [
            'searchId'                => $searchId,
            'vehicleId'               => $vehicleId,
            'pricingId'               => $pricingId,
            'pickUpRentalLocationId'  => $pickUpId,
            'dropOffRentalLocationId' => $dropOffId,
        ];

        return $this->sendRequest('/vehicle/car/reprice', $params);
    }
    
    /**
     * Create a confirmed booking.
     *
     * @param array $params
     * @return array
     */
    public function book(array $params): array
    {
        return $this->sendRequest('/vehicle/car/book', $params);
    }
    
    /**
     * Cancel an existing booking.
     *
     * @param string $bookingRef
     * @param string $reason
     * @return array
     */
    public function cancel(string $bookingRef, string $reason = 'Cancelled by customer'): array
    {
        $params = [
            'bookingRef' => $bookingRef,
            'reason'     => $reason,
        ];
        
        return $this->sendRequest('/booking/cancel', $params);
    }
    
    /**
     * Retrieve all rental locations.
     *
     * @return array
     */
    public function getLocations(): array
    {
        return $this->sendRequest('/location/rentalLocation/getAll', []);
    }
}

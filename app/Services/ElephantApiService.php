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
        $xml = '<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <InsertintoResXML xmlns="http://tempuri.org/">
      <myusername>' . htmlspecialchars($this->username) . '</myusername>
      <mypassword>' . htmlspecialchars($this->password) . '</mypassword>
      <ClientName>' . htmlspecialchars(($data['firstname'] ?? '') . ' ' . ($data['lastname'] ?? '')) . '</ClientName>
      <CountryOfOrigin></CountryOfOrigin>
      <Group>' . htmlspecialchars($data['vehiclegroup'] ?? '') . '</Group>
      <CheckOutDate>' . htmlspecialchars(explode('T', $data['dateTimeFrom'] ?? '')[0] . 'T00:00:00') . '</CheckOutDate>
      <CheckOutTime>' . htmlspecialchars('1900-01-01T' . (explode('T', $data['dateTimeFrom'] ?? 'T00:00:00')[1])) . '</CheckOutTime>
      <CheckInDate>' . htmlspecialchars(explode('T', $data['dateTimeTo'] ?? '')[0] . 'T00:00:00') . '</CheckInDate>
      <CheckInTime>' . htmlspecialchars('1900-01-01T' . (explode('T', $data['dateTimeTo'] ?? 'T00:00:00')[1])) . '</CheckInTime>
      <DelPlace>' . htmlspecialchars($data['pickupplace'] ?? '') . '</DelPlace>
      <RetPlace>' . htmlspecialchars($data['dropoffplace'] ?? '') . '</RetPlace>
      <FlightNo>' . htmlspecialchars($data['flightnumber'] ?? '') . '</FlightNo>
      <Remarks>' . htmlspecialchars($data['remarks'] ?? '') . '</Remarks>
      <Equip></Equip>
      <RefNo>' . htmlspecialchars($data['ref_no'] ?? uniqid('AUT-')) . '</RefNo>
      <PaymentMethod>' . htmlspecialchars($data['pm'] ?? 'L') . '</PaymentMethod>
    </InsertintoResXML>
  </soap:Body>
</soap:Envelope>';

        $response = Http::withHeaders([
            'SOAPAction' => 'http://tempuri.org/InsertintoResXML'
        ])->withBody($xml, 'text/xml; charset=utf-8')
          ->post('https://backoffice.cycarrental.com/xml/CarhireWebService.asmx');

        if (!$response->successful()) {
            Log::error('Elephant API: InsertReservation (SOAP) failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        $body = $response->body();
        if (preg_match('/<ConfID[^>]*ID="([^"]+)"/', $body, $matches)) {
            return ['RefNo' => $matches[1]];
        }
        
        if (preg_match('/<ReservationRef>(.*?)<\/ReservationRef>/', $body, $matches)) {
            return ['RefNo' => $matches[1]];
        }
        
        if (preg_match('/<ErrorMessage>(.*?)<\/ErrorMessage>/', $body, $matches)) {
            return ['Message' => $matches[1]];
        }

        return ['Message' => 'Unknown error parsing SOAP response: ' . $body];
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

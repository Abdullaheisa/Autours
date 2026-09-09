<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use SimpleXMLElement;

class WheelsysApiService
{
    private const BASE_URL = 'https://endpoint.wheelsys.io/10421/link/v3';
    private const LINK_CODE = 'WL0AT';
    private const AGENT_CODE = 'AU0WL';

    /**
     * Country-specific rate codes and CDPs required by the Wheelsys API.
     * Each country must be configured separately with its own RATECODE and CDP.
     * Without these, the API returns "stop sale" / "No Rental Rate" errors.
     */
    private const COUNTRY_CONFIG = [
        'EG' => ['ratecode' => 'EGYRC', 'cdp' => 'EGYPOA'],
        'MA' => ['ratecode' => 'MORRC', 'cdp' => 'MORPOA'],
        // Turkey will be added once T&Cs are finalised:
        // 'TR' => ['ratecode' => 'TURRC', 'cdp' => 'TURPOA'],
    ];

    private int $requestTimeout = 30;

    /**
     * Set the HTTP request timeout in seconds.
     */
    public function setTimeout(int $seconds): void
    {
        $this->requestTimeout = max(1, $seconds);
    }

    /**
     * Check availability for a specific pickup and dropoff station.
     *
     * @param string $pickupStation
     * @param string $returnStation
     * @param string $pickupDate (DD/MM/YYYY)
     * @param string $pickupTime (HH:mm)
     * @param string $dropoffDate (DD/MM/YYYY)
     * @param string $dropoffTime (HH:mm)
     * @return array<string, mixed>
     */
    public function getAvailability(
        string $pickupStation,
        string $returnStation,
        string $pickupDate,
        string $pickupTime,
        string $dropoffDate,
        string $dropoffTime,
        ?string $country = null
    ): array {
        $url = self::BASE_URL . "/price-quote_" . self::LINK_CODE . ".html";

        $params = [
            'agent' => self::AGENT_CODE,
            'DATE_FROM' => $pickupDate,
            'TIME_FROM' => $pickupTime,
            'DATE_TO' => $dropoffDate,
            'TIME_TO' => $dropoffTime,
            'PICKUP_STATION' => $pickupStation,
            'RETURN_STATION' => $returnStation,
            'TRACING' => 'ON',
        ];

        // Append country-specific RATECODE and CDP when configured
        if ($country) {
            $countryCode = strtoupper(trim($country));
            if (isset(self::COUNTRY_CONFIG[$countryCode])) {
                $params['RATECODE'] = self::COUNTRY_CONFIG[$countryCode]['ratecode'];
                $params['CDP'] = self::COUNTRY_CONFIG[$countryCode]['cdp'];
            }
        }



        $response = Http::timeout($this->requestTimeout)
            ->withOptions(['verify' => false])
            ->get($url, $params);

        if (! $response->successful()) {
            Log::error('Wheelsys API: Availability request failed', [
                'status' => $response->status(),
                'pickup' => $pickupStation,
                'body' => $response->body(),
            ]);
            return [];
        }

        return $this->parsePriceQuoteXml($response->body());
    }

    /**
     * Parse the XML response from the price-quote endpoint.
     */
    private function parsePriceQuoteXml(string $xmlContent): array
    {
        try {
            // Suppress warnings for malformed XML and handle errors manually
            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($xmlContent);
            
            if ($xml === false) {
                Log::error('Wheelsys API: Failed to parse XML', ['errors' => libxml_get_errors()]);
                libxml_clear_errors();
                return [];
            }

            $currency = (string) $xml['currency'] ?: 'EUR';
            $duration = (int) $xml['duration'];

            $categories = [];

            if (isset($xml->rates->category)) {
                foreach ($xml->rates->category as $category) {
                    // Check availability
                    if ((string)$category['availability'] !== 'AVAILABLE') {
                        continue;
                    }

                    $groupId = (string) $category['code'];
                    $totalRateCent = (int) $category['totalrate'];
                    
                    // The API returns prices like "26468" for 264.68
                    $price = $totalRateCent > 0 ? $totalRateCent / 100 : 0;

                    $inclusions = [];
                    if (isset($category->options->option)) {
                        foreach ($category->options->option as $option) {
                            if ((string)$option['inclusive'] === 'true') {
                                $inclusions[] = (string)$option['code'];
                            }
                        }
                    }

                    $categories[$groupId] = [
                        'group_id' => $groupId,
                        'name' => (string) $category['model'],
                        'category_name' => (string) $category['cat'],
                        'acriss' => (string) $category['acriss'],
                        'pax' => (string) $category['pax'],
                        'doors' => (string) $category['doors'],
                        'bags' => (string) $category['bags'],
                        'suitcases' => (string) $category['suitcases'],
                        'price' => $price,
                        'currency' => $currency,
                        'duration' => $duration,
                        'inclusions' => $inclusions,
                        'imageurl' => (string) $category['imageurl'],
                    ];
                }
            }

            return $categories;
        } catch (\Exception $e) {
            Log::error('Wheelsys API: Exception while parsing XML', ['exception' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Fetch all available stations/branches from the Wheelsys API.
     *
     * @return array<int, array>
     */
    public function getStations(): array
    {
        $url = self::BASE_URL . "/stations_" . self::LINK_CODE . ".html";

        $params = [
            'agent' => self::AGENT_CODE,
        ];

        $response = Http::timeout($this->requestTimeout)
            ->withOptions(['verify' => false])
            ->get($url, $params);

        if (! $response->successful()) {
            Log::error('Wheelsys API: Stations request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $this->parseStationsXml($response->body());
    }

    /**
     * Parse the stations XML response.
     */
    private function parseStationsXml(string $xmlContent): array
    {
        try {
            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($xmlContent);
            
            if ($xml === false) {
                Log::error('Wheelsys API: Failed to parse Stations XML', ['errors' => libxml_get_errors()]);
                libxml_clear_errors();
                return [];
            }

            $stations = [];

            if (isset($xml->station)) {
                foreach ($xml->station as $stationNode) {
                    $code = (string) $stationNode['code'];
                    $name = (string) $stationNode['name'];
                    $lat = (string) $stationNode['lat'];
                    $long = (string) $stationNode['long'];
                    $country = (string) $stationNode['country'];

                    $info = $stationNode->StationInformation;
                    $address = $info ? (string) $info['Address'] : '';
                    $city = $info ? (string) $info['City'] : '';
                    $phone = $info ? (string) $info['Phone'] : '';
                    $zip = $info ? (string) $info['ZipCode'] : '';

                    $stations[] = [
                        'code' => $code,
                        'name' => $name,
                        'lat' => $lat,
                        'long' => $long,
                        'country' => $country,
                        'address' => $address,
                        'city' => $city,
                        'phone' => $phone,
                        'zip' => $zip,
                    ];
                }
            }

            return $stations;
        } catch (\Exception $e) {
            Log::error('Wheelsys API: Exception while parsing Stations XML', ['exception' => $e->getMessage()]);
            return [];
        }
    }
    /**
     * Make a new reservation
     */
    public function makeReservation(array $params, ?string $countryCode = null): array
    {
        $url = self::BASE_URL . "/new-res_" . self::LINK_CODE . ".html";
        $params['agent'] = self::AGENT_CODE;

        // Append country-specific RATECODE and CDP when configured
        if ($countryCode) {
            $code = strtoupper(trim($countryCode));
            if (isset(self::COUNTRY_CONFIG[$code])) {
                $params['RATECODE'] = self::COUNTRY_CONFIG[$code]['ratecode'];
                $params['CDP'] = self::COUNTRY_CONFIG[$code]['cdp'];
            }
        }

        $response = Http::timeout($this->requestTimeout)
            ->withOptions(['verify' => false])
            ->get($url, $params);

        if (! $response->successful()) {
            Log::error('Wheelsys API: Make Reservation request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception("Wheelsys API: Make Reservation request failed with status " . $response->status());
        }

        return $this->parseReservationResponseXml($response->body(), 'makeReservation');
    }

    /**
     * Cancel an existing reservation
     */
    public function cancelReservation(string $reservationNo, string $referenceNo): array
    {
        $url = self::BASE_URL . "/cancel-res_" . self::LINK_CODE . ".html";
        $params = [
            'agent' => self::AGENT_CODE,
            'irn' => $reservationNo,
            'refrno' => $referenceNo,
        ];

        $response = Http::timeout($this->requestTimeout)
            ->withOptions(['verify' => false])
            ->get($url, $params);

        if (! $response->successful()) {
            Log::error('Wheelsys API: Cancel Reservation request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception("Wheelsys API: Cancel Reservation request failed with status " . $response->status());
        }

        return $this->parseReservationResponseXml($response->body(), 'cancelReservation');
    }

    /**
     * Parse the reservation XML response.
     */
    private function parseReservationResponseXml(string $xmlContent, string $context): array
    {
        try {
            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($xmlContent);

            if ($xml === false) {
                Log::error("Wheelsys API: Failed to parse XML for {$context}", ['errors' => libxml_get_errors()]);
                libxml_clear_errors();
                throw new \Exception("Wheelsys API: Failed to parse XML response for {$context}");
            }

            if (isset($xml->Status) && str_starts_with((string)$xml->Status, 'ERR')) {
                $status = (string)$xml->Status;
                $msg = isset($xml->Message) ? (string)$xml->Message : 'Unknown error';
                throw new \Exception("Wheelsys API Error [{$status}]: {$msg}");
            }

            if (isset($xml->reservation)) {
                $resNode = $xml->reservation;
                $status = (string) $resNode['status'];
                if (str_starts_with($status, 'ERR')) {
                    throw new \Exception("Wheelsys API Reservation Error: {$status}");
                }
                
                return [
                    'irn' => (string) $resNode['irn'],
                    'status' => $status,
                    'refno' => (string) $resNode['refno'],
                    'bookedgroup' => (string) $resNode['bookedgroup'],
                ];
            }

            throw new \Exception("Wheelsys API: Missing reservation data in response");
        } catch (\Exception $e) {
            Log::error("Wheelsys API: Exception while parsing {$context} XML", ['exception' => $e->getMessage(), 'xml' => $xmlContent]);
            throw $e;
        }
    }
}

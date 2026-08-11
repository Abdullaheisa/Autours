<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GreenMotionApiService
{
    private const BASE_URL = 'https://gmvrl.fusemetrix.com/bespoke/GMWebService.php';
    private const API_VERSION = '1.5';

    private int $requestTimeout = 30;
    private string $username;
    private string $password;

    public function __construct(string $username, string $password)
    {
        $this->username = $username;
        $this->password = $password;
    }

    /**
     * Send an XML request to the Green Motion API.
     */
    private function sendRequest(string $method, array $params = []): array
    {
        $body = '<?xml version="1.0" encoding="utf-8"?>' . "\n";
        $body .= "<gm_webservice>\n";
        $body .= "  <header>\n";
        $body .= "    <username>" . htmlspecialchars($this->username) . "</username>\n";
        $body .= "    <password>" . htmlspecialchars($this->password) . "</password>\n";
        $body .= "    <version>" . self::API_VERSION . "</version>\n";
        $body .= "  </header>\n";
        
        if (empty($params)) {
            $body .= "  <request type=\"{$method}\" />\n";
        } else {
            $body .= "  <request type=\"{$method}\">\n";
            foreach ($params as $key => $value) {
                // simple key value generation
                $body .= "    <{$key}>" . htmlspecialchars((string)$value) . "</{$key}>\n";
            }
            $body .= "  </request>\n";
        }
        $body .= "</gm_webservice>";

        $response = Http::timeout($this->requestTimeout)
            ->withHeaders([
                'Content-Type' => 'text/xml; charset=utf-8',
            ])
            ->withBody($body, 'text/xml; charset=utf-8')
            ->post(self::BASE_URL);

        if (!$response->successful()) {
            Log::error("Green Motion API: {$method} request failed", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $this->parseResponse($response->body());
    }

    /**
     * Parse the XML response and return as an array.
     */
    private function parseResponse(string $xmlContent): array
    {
        try {
            // Suppress errors and load XML
            $xml = @simplexml_load_string($xmlContent, 'SimpleXMLElement', LIBXML_NOCDATA);
            
            if ($xml === false) {
                Log::error('Green Motion API: Failed to parse XML response', ['xml' => $xmlContent]);
                return [];
            }

            // Check for errors
            if (isset($xml->response->errors)) {
                $errorMsg = (string) $xml->response->errors->message;
                $errorCode = (string) $xml->response->errors->error_code;
                Log::error("Green Motion API returned error: [{$errorCode}] {$errorMsg}");
                return [];
            }

            if (!isset($xml->response)) {
                return [];
            }

            // Convert SimpleXMLElement to JSON then to associative array
            $json = json_encode($xml->response);
            $array = json_decode($json, true);

            return $array ?? [];
        } catch (\Exception $e) {
            Log::error('Green Motion API: Exception parsing response', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Fetch all countries.
     */
    public function getCountryList(): array
    {
        $response = $this->sendRequest('GetCountryList');
        // Structure is <country><countryID>...</countryID>...</country>
        // Depending on one or multiple, it might be an associative array or array of associative arrays
        $countries = $response['country'] ?? [];
        
        // Normalize to always be a list of arrays
        if (isset($countries['countryID'])) {
            $countries = [$countries];
        }
        
        return $countries;
    }

    /**
     * Fetch service areas (locations) for a specific country.
     */
    public function getServiceAreas(int $countryId): array
    {
        $response = $this->sendRequest('GetServiceAreas', ['country_id' => $countryId]);
        
        $serviceAreas = $response['servicearea'] ?? [];
        
        if (isset($serviceAreas['locationID'])) {
            $serviceAreas = [$serviceAreas];
        }
        
        return $serviceAreas;
    }

    /**
     * Fetch available vehicles for given locations and dates.
     *
     * @param int $locationId Pickup Location ID
     * @param string $startDate Format: Y-m-d
     * @param string $startTime Format: H:i
     * @param string $endDate Format: Y-m-d
     * @param string $endTime Format: H:i
     * @param string $currency Currency code e.g. GBP
     */
    public function getVehicles(
        int $locationId,
        string $startDate,
        string $startTime,
        string $endDate,
        string $endTime,
        int $age = 30,
        string $currency = 'GBP'
    ): array {
        $params = [
            'location_id' => $locationId,
            'start_date' => $startDate,
            'start_time' => $startTime,
            'end_date' => $endDate,
            'end_time' => $endTime,
            'age' => $age,
            'currency' => $currency,
        ];

        $response = $this->sendRequest('GetVehicles', $params);
        
        $vehicles = $response['vehicles']['vehicle'] ?? [];
        
        if (isset($vehicles['@attributes']) || isset($vehicles['total'])) {
            $vehicles = [$vehicles];
        }
        
        return $vehicles;
    }
}

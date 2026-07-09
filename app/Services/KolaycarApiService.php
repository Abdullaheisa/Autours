<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KolaycarApiService
{
    private const BASE_URL = 'https://resws.kolaycar.com/service.asmx';
    private const DEFAULT_API_KEY = 'U512MCczch8mDe9c3x/Ekw==';
    private const DEFAULT_API_PASSWORD = 'KzzZZ894tH84.!Eu';
    private const LANG_ISO_CODE = 'EN';
    private const CURRENCY_ISO_CODE = 'EUR';

    private int $requestTimeout = 30;
    private string $apiKey;
    private string $apiPassword;

    public function __construct(?string $apiKey = null, ?string $apiPassword = null)
    {
        $this->apiKey = $apiKey ?? self::DEFAULT_API_KEY;
        $this->apiPassword = $apiPassword ?? self::DEFAULT_API_PASSWORD;
    }

    /**
     * Send a SOAP request to the Kolaycar API.
     */
    private function sendSoapRequest(string $method, array $params): array
    {
        $body = '<?xml version="1.0" encoding="utf-8"?>';
        $body .= '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">';
        $body .= '<soapenv:Header/>';
        $body .= '<soapenv:Body>';
        $body .= "<tem:{$method}>";

        // Append credentials
        $body .= '<tem:APIKEY>' . htmlspecialchars($this->apiKey) . '</tem:APIKEY>';
        $body .= '<tem:APIPASSWORD>' . htmlspecialchars($this->apiPassword) . '</tem:APIPASSWORD>';
        $body .= '<tem:LANGISOCODE>' . htmlspecialchars(self::LANG_ISO_CODE) . '</tem:LANGISOCODE>';
        $body .= '<tem:CURRENCYISOCODE>' . htmlspecialchars(self::CURRENCY_ISO_CODE) . '</tem:CURRENCYISOCODE>';

        foreach ($params as $key => $value) {
            $body .= "<tem:{$key}>" . htmlspecialchars((string) $value) . "</tem:{$key}>";
        }

        $body .= "</tem:{$method}>";
        $body .= '</soapenv:Body>';
        $body .= '</soapenv:Envelope>';

        $response = Http::timeout($this->requestTimeout)
            ->withHeaders([
                'SOAPAction' => "http://tempuri.org/{$method}",
            ])
            ->withBody($body, 'text/xml; charset=utf-8')
            ->post(self::BASE_URL);

        if (!$response->successful()) {
            Log::error("Kolaycar API: {$method} request failed", [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return [];
        }

        return $this->parseResponse($response->body(), "{$method}Result");
    }

    /**
     * Parse the SOAP XML response and extract the JSON result.
     */
    private function parseResponse(string $xmlContent, string $resultKey): array
    {
        try {
            // Remove namespaces for easier parsing
            $xmlContent = preg_replace('/(<\/?)(\w+):([^>]*>)/', '$1$2$3', $xmlContent);
            $xml = simplexml_load_string($xmlContent);

            if ($xml === false) {
                Log::error('Kolaycar API: Failed to parse XML response');
                return [];
            }

            // Path to result depends on the structure, usually Body -> MethodResponse -> MethodResult
            $jsonString = '';
            foreach ($xml->xpath("//*[local-name()='{$resultKey}']") as $node) {
                $jsonString = (string) $node;
                break;
            }

            if (empty($jsonString)) {
                Log::error("Kolaycar API: Could not find {$resultKey} in response. Raw XML:", ['xml' => $xmlContent]);
                return [];
            }

            $data = json_decode($jsonString, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('Kolaycar API: Invalid JSON in response', ['error' => json_last_error_msg()]);
                return [];
            }

            // Return empty array if RETURNCODE is not '0'
            if (isset($data['RETURNCODE']) && (string) $data['RETURNCODE'] !== '0') {
                Log::error('Kolaycar API: API returned error', [
                    'returncode' => $data['RETURNCODE'] ?? 'unknown',
                    'message' => $data['MESSAGE'] ?? 'No message provided'
                ]);
                return [];
            }

            return $data;
        } catch (\Exception $e) {
            Log::error('Kolaycar API: Exception parsing response', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Fetch all locations.
     */
    public function getLocations(): array
    {
        $params = [
            'TOKEN' => '',
            'PARAM1' => '',
            'PARAM2' => '',
            'PARAM3' => '',
            'PARAM4' => '',
            'PARAM5' => '',
            'PARAM6' => '',
        ];

        return $this->sendSoapRequest('GET_LOCATIONS_V2', $params);
    }

    /**
     * Fetch available vehicles for given locations and dates.
     *
     * @param string $pickupId    Pickup Location ID
     * @param string $dropoffId   Drop-off Location ID
     * @param string $pickupDate  Format: d.m.Y (e.g. 20.12.2016)
     * @param string $dropoffDate Format: d.m.Y
     * @param string $pickupTime  Format: H:i (e.g. 15:00)
     * @param string $dropoffTime Format: H:i
     */
    public function getVehicles(
        string $pickupId,
        string $dropoffId,
        string $pickupDate,
        string $dropoffDate,
        string $pickupTime,
        string $dropoffTime
    ): array {
        $params = [
            'PICKUPLOCATIONID' => $pickupId,
            'RETURNLOCATIONID' => $dropoffId,
            'PICKUPDATE' => $pickupDate,
            'RETURNDATE' => $dropoffDate,
            'PICKUPTIME' => $pickupTime,
            'RETURNTIME' => $dropoffTime,
            'TOKEN' => '',
            'PARAM1' => '',
            'PARAM2' => '',
            'PARAM3' => '',
            'PARAM4' => '',
            'PARAM5' => '',
            'PARAM6' => '',
        ];

        return $this->sendSoapRequest('GET_VEHICLES_V2', $params);
    }
}

<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use SimpleXMLElement;

class JimpisoftApiService
{
    private const BASE_URL = 'https://drivus-uae-ws-api.jimpisoft.com/';
    private const COMPANY_CODE = '300013';
    private const CUSTOMER_CODE = '45';
    private const USERNAME = 'AutoursPOA';
    private const PASSWORD = 'webxml@autourPOA';

    private bool $logRawResponses = false;
    private array $rawResponseLog = [];

    public function setLogRawResponses(bool $log): void
    {
        $this->logRawResponses = $log;
    }

    public function getRawResponseLog(): array
    {
        return $this->rawResponseLog;
    }

    /* ---------------------------------------------------------------------- */
    /*  Per-endpoint config (from WSDL)                                       */
    /* ---------------------------------------------------------------------- */

    private const ENDPOINT_GROUPS = [
        'url' => 'getGroups.asmx',
        'method' => 'getGroups',
        'namespace' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getGroups',
        'soap_action' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getGroups/getGroups',
        'result_tag' => 'getGroupsResult',
    ];

    private const ENDPOINT_GROUP_DETAILS = [
        'url' => 'getGroupDetails.asmx',
        'method' => 'GroupDetails',
        'namespace' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getGroupDetails',
        'soap_action' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getGroupDetails/GroupDetails',
        'result_tag' => 'GroupDetailsResult',
    ];

    private const ENDPOINT_MULTIPLE_PRICES = [
        'url' => 'getMultiplePrices.asmx',
        'method' => 'MultiplePrices',
        'namespace' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getMultiplePrices',
        'soap_action' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getMultiplePrices/MultiplePrices',
        'result_tag' => 'MultiplePricesResult',
    ];

    private const ENDPOINT_STATIONS = [
        'url' => 'getStations.asmx',
        'method' => 'getStations',
        'namespace' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getStations',
        'soap_action' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getStations/getStations',
        'result_tag' => 'getStationsResult',
    ];

    private const ENDPOINT_PRICE_QUOTE = [
        'url' => 'getPriceQuote.asmx',
        'method' => 'PriceQuote',
        'namespace' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getPriceQuote',
        'soap_action' => 'http://www.jimpisoft.pt/Rentway_Reservations_WS/getPriceQuote/PriceQuote',
        'result_tag' => 'PriceQuoteResult',
    ];

    /* ---------------------------------------------------------------------- */
    /*  Public API methods                                                    */
    /* ---------------------------------------------------------------------- */

    /**
     * Fetch all available vehicle groups.
     *
     * @return array<int, array>
     */
    public function getGroups(): array
    {
        $xml = $this->buildSoapEnvelope(self::ENDPOINT_GROUPS, [
            'companyCode' => self::COMPANY_CODE,
            'customerCode' => self::CUSTOMER_CODE,
        ], wrapInObjRequest: true);

        $response = $this->sendSoapRequest(self::ENDPOINT_GROUPS, $xml);

        if (empty($response)) {
            return [];
        }

        return $this->parseDataset($response, self::ENDPOINT_GROUPS['result_tag']);
    }

    /**
     * Fetch detailed information for a specific group.
     *
     * @param string $groupId
     * @return array<string, mixed>
     */
    public function getGroupDetails(string $groupId): array
    {
        $xml = $this->buildSoapEnvelope(self::ENDPOINT_GROUP_DETAILS, [
            'companyCode' => self::COMPANY_CODE,
            'groupID' => $groupId,
        ], wrapInObjRequest: true);

        $response = $this->sendSoapRequest(self::ENDPOINT_GROUP_DETAILS, $xml);

        if (empty($response)) {
            return [];
        }

        // getGroupDetails returns a single record directly under the result tag
        return $this->parseSingleRecord($response, self::ENDPOINT_GROUP_DETAILS['result_tag']);
    }

    /**
     * Fetch prices for multiple groups in a single call.
     *
     * @param array<int, string> $groupIds
     * @param string $pickupDate  Format: yyyy-MM-dd HH:mm
     * @param string $dropoffDate Format: yyyy-MM-dd HH:mm
     * @param string $stationId   Rental Station ID
     * @return array<string, array> Keyed by GroupID
     */
    public function getMultiplePrices(
        ?array $groupIds,
        string $pickupDate,
        string $dropoffDate,
        string $stationId
    ): array {
        $params = [
            'companyCode' => self::COMPANY_CODE,
            'customerCode' => self::CUSTOMER_CODE,
            'username' => self::USERNAME,
            'password' => self::PASSWORD,
            'pickUp' => [
                'Date' => $pickupDate,
                'rentalStation' => $stationId,
            ],
            'dropOff' => [
                'Date' => $dropoffDate,
                'rentalStation' => $stationId,
            ],
        ];

        if (! empty($groupIds)) {
            $params['groupID'] = implode(',', $groupIds);
        }

        $xml = $this->buildSoapEnvelope(self::ENDPOINT_MULTIPLE_PRICES, $params, wrapInObjRequest: true);

        $response = $this->sendSoapRequest(self::ENDPOINT_MULTIPLE_PRICES, $xml);

        if (empty($response)) {
            return [];
        }

        $rows = $this->parseDataset($response, self::ENDPOINT_MULTIPLE_PRICES['result_tag']);

        // Check for the explicit "no rate" error code returned by Jimpisoft
        if (empty($rows) && str_contains($response, 'NO RATE IS AVAILABLE')) {
            Log::warning('Jimpisoft API: No rates configured for this company/customer combination.', [
                'companyCode' => self::COMPANY_CODE,
                'customerCode' => self::CUSTOMER_CODE,
                'stationId' => $stationId,
                'pickupDate' => $pickupDate,
                'dropoffDate' => $dropoffDate,
            ]);
            return [];
        }

        return $this->parsePriceRows($response);
    }

    /**
     * Fetch a single price quote for a specific group and station.
     *
     * @param string $groupId
     * @param string $pickupDate  Format: yyyy-MM-dd HH:mm
     * @param string $dropoffDate Format: yyyy-MM-dd HH:mm
     * @param string $stationId   Rental Station ID
     * @return array<string, mixed>
     */
    public function getPriceQuote(string $groupId, string $pickupDate, string $dropoffDate, string $stationId): array
    {
        $xml = $this->buildSoapEnvelope(self::ENDPOINT_PRICE_QUOTE, [
            'companyCode' => self::COMPANY_CODE,
            'customerCode' => (int) self::CUSTOMER_CODE,
            'groupID' => $groupId,
            'username' => self::USERNAME,
            'password' => self::PASSWORD,
            'pickUp' => [
                'Date' => $pickupDate,
                'rentalStation' => $stationId,
            ],
            'dropOff' => [
                'Date' => $dropoffDate,
                'rentalStation' => $stationId,
            ],
            'includeHourlyRates' => false,
        ], wrapInObjRequest: true);

        $response = $this->sendSoapRequest(self::ENDPOINT_PRICE_QUOTE, $xml);

        if (empty($response)) {
            return [];
        }

        return $this->parseSingleRecord($response, self::ENDPOINT_PRICE_QUOTE['result_tag']);
    }

    /**
     * Fetch prices for multiple stations concurrently.
     *
     * @param array<int, string> $groupIds
     * @param string $pickupDate
     * @param string $dropoffDate
     * @param array<string, int> $stationToBranchMap  station_id => branch_id
     * @param int $concurrency
     * @return array<int, array<string, array>>  branch_id => groupId => priceData
     */
    public function getMultiplePricesForStations(
        ?array $groupIds,
        string $pickupDate,
        string $dropoffDate,
        array $stationToBranchMap,
        int $concurrency = 5
    ): array {
        if (empty($stationToBranchMap)) {
            return [];
        }

        $url = rtrim(self::BASE_URL, '/') . '/' . self::ENDPOINT_MULTIPLE_PRICES['url'];
        $soapAction = '"' . self::ENDPOINT_MULTIPLE_PRICES['soap_action'] . '"';

        // Pre-build all SOAP envelopes
        $envelopes = [];
        foreach ($stationToBranchMap as $stationId => $branchId) {
            $params = [
                'companyCode' => self::COMPANY_CODE,
                'customerCode' => self::CUSTOMER_CODE,
                'username' => self::USERNAME,
                'password' => self::PASSWORD,
                'pickUp' => ['Date' => $pickupDate, 'rentalStation' => (string) $stationId],
                'dropOff' => ['Date' => $dropoffDate, 'rentalStation' => (string) $stationId],
            ];

            if (! empty($groupIds)) {
                $params['groupID'] = implode(',', $groupIds);
            }

            $envelopes[$stationId] = $this->buildSoapEnvelope(self::ENDPOINT_MULTIPLE_PRICES, $params, wrapInObjRequest: true);
        }

        $results = [];
        $stationIds = array_keys($stationToBranchMap);

        foreach (array_chunk($stationIds, $concurrency) as $chunk) {
            try {
                $responses = Http::pool(function (Pool $pool) use ($chunk, $url, $soapAction, $envelopes) {
                    foreach ($chunk as $stationId) {
                        $pool->as((string) $stationId)
                            ->withHeaders([
                                'Content-Type' => 'text/xml; charset=utf-8',
                                'SOAPAction' => $soapAction,
                            ])
                            ->timeout(60)
                            ->withOptions(['verify' => false])
                            ->send('POST', $url, ['body' => $envelopes[$stationId]]);
                    }
                });
            } catch (\Exception $e) {
                Log::error('Jimpisoft concurrent price fetch failed', ['error' => $e->getMessage()]);
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

                $body = $response->body();

                if (str_contains($body, 'soap:Fault') || str_contains($body, '<Fault>')) {
                    continue;
                }

                $prices = $this->parsePriceRows($body);

                if (! empty($prices)) {
                    $branchId = $stationToBranchMap[$stationId];
                    $results[$branchId] = $prices;
                }
            }
        }

        return $results;
    }

    /**
     * Fetch all available rental stations.
     *
     * @return array<int, array>
     */
    public function getStations(): array
    {
        $xml = $this->buildSoapEnvelope(self::ENDPOINT_STATIONS, [
            'companyCode' => self::COMPANY_CODE,
            'customerCode' => self::CUSTOMER_CODE,
        ], wrapInObjRequest: true);

        $response = $this->sendSoapRequest(self::ENDPOINT_STATIONS, $xml);

        if (empty($response)) {
            return [];
        }

        return $this->parseDataset($response, self::ENDPOINT_STATIONS['result_tag']);
    }

    /* ---------------------------------------------------------------------- */
    /*  SOAP / XML helpers                                                    */
    /* ---------------------------------------------------------------------- */

    /**
     * Build a SOAP 1.1 envelope from an array of parameters.
     *
     * @param array<string, mixed> $endpointConfig
     * @param array<string, mixed> $params
     * @param bool $wrapInObjRequest
     * @return string
     */
    private function buildSoapEnvelope(array $endpointConfig, array $params, bool $wrapInObjRequest = false): string
    {
        $method = $endpointConfig['method'];
        $namespace = $endpointConfig['namespace'];

        if ($wrapInObjRequest) {
            $body = "<objRequest>" . $this->arrayToXml($params) . "</objRequest>";
        } else {
            $body = $this->arrayToXml($params);
        }

        return '<?xml version="1.0" encoding="utf-8"?>'
            . '<soap:Envelope '
            . 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
            . 'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '
            . 'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
            . '<soap:Body>'
            . "<{$method} xmlns=\"{$namespace}\">"
            . $body
            . "</{$method}>"
            . '</soap:Body>'
            . '</soap:Envelope>';
    }

    /**
     * Recursively convert an associative array to XML string.
     *
     * @param array<string, mixed> $data
     * @return string
     */
    private function arrayToXml(array $data): string
    {
        $xml = '';
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $xml .= "<{$key}>" . $this->arrayToXml($value) . "</{$key}>";
            } else {
                $xml .= "<{$key}>" . htmlspecialchars((string) $value, ENT_XML1, 'UTF-8') . "</{$key}>";
            }
        }
        return $xml;
    }

    /**
     * Send the SOAP request and return the raw response body.
     *
     * @param array<string, mixed> $endpointConfig
     * @param string $xmlBody
     * @return string|null
     */
    private function sendSoapRequest(array $endpointConfig, string $xmlBody): ?string
    {
        $url = rtrim(self::BASE_URL, '/') . '/' . $endpointConfig['url'];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'text/xml; charset=utf-8',
                'SOAPAction' => '"' . $endpointConfig['soap_action'] . '"',
            ])
                ->timeout(60)
                ->withOptions([
                    'verify' => false,
                ])
                ->send('POST', $url, ['body' => $xmlBody]);

            if (! $response->successful()) {
                Log::error("Jimpisoft API HTTP error", [
                    'endpoint' => $endpointConfig['url'],
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            $body = $response->body();

            if (str_contains($body, 'soap:Fault') || str_contains($body, '<Fault>')) {
                Log::error("Jimpisoft API SOAP Fault", [
                    'endpoint' => $endpointConfig['url'],
                    'response' => $body,
                ]);
                return null;
            }

            if ($this->logRawResponses) {
                $this->rawResponseLog[] = [
                    'endpoint' => $endpointConfig['url'],
                    'timestamp' => now()->toIso8601String(),
                    'xml' => $body,
                ];
            }

            return $body;
        } catch (\Exception $e) {
            Log::error("Jimpisoft API request exception", [
                'endpoint' => $endpointConfig['url'],
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /* ---------------------------------------------------------------------- */
    /*  XML parsing helpers                                                   */
    /* ---------------------------------------------------------------------- */

    /**
     * Strip namespace prefixes and declarations from XML for easier parsing.
     *
     * @param string $xmlString
     * @return string
     */
    private function stripXmlNamespaces(string $xmlString): string
    {
        // Remove namespace declarations
        $xmlString = preg_replace('/\s+xmlns(:\w+)?="[^"]*"/', '', $xmlString);
        // Remove namespace prefixes
        $xmlString = preg_replace('/<([\w-]+):/', '<', $xmlString);
        $xmlString = preg_replace('/<\/([\w-]+):/', '</', $xmlString);
        return $xmlString;
    }

    /**
     * Parse a DataSet returned inside a SOAP response.
     *
     * Handles diffgram/NewDataSet/{Table|MultiplePrices|...} patterns.
     *
     * @param string $xmlString
     * @param string $resultTag
     * @return array<int, array<string, mixed>>
     */
    private function parseDataset(string $xmlString, string $resultTag): array
    {
        try {
            $cleanXml = $this->stripXmlNamespaces($xmlString);
            libxml_use_internal_errors(true);
            $xml = new SimpleXMLElement($cleanXml);

            // Strategy 1: Look for diffgram/NewDataSet/Table (most common)
            $tables = $xml->xpath('//diffgram/NewDataSet/Table');
            if (! empty($tables)) {
                return $this->simpleXmlElementsToArray($tables);
            }

            // Strategy 2: Look for diffgram/NewDataSet/MultiplePrices (getMultiplePrices)
            $tables = $xml->xpath('//diffgram/NewDataSet/MultiplePrices');
            if (! empty($tables)) {
                return $this->simpleXmlElementsToArray($tables);
            }

            // Strategy 3: Look for any child under diffgram/NewDataSet
            $newDataSet = $xml->xpath('//diffgram/NewDataSet');
            if (! empty($newDataSet[0])) {
                $rows = [];
                foreach ($newDataSet[0]->children() as $child) {
                    $name = $child->getName();
                    if ($name === 'schema') {
                        continue;
                    }
                    $rows[] = $child;
                }
                if (! empty($rows)) {
                    return $this->simpleXmlElementsToArray($rows);
                }
            }

            // Strategy 4: Look for any Table element under the result tag
            $tables = $xml->xpath("//{$resultTag}//Table");
            if (! empty($tables)) {
                return $this->simpleXmlElementsToArray($tables);
            }

            // Strategy 5: Look for Table anywhere
            $tables = $xml->xpath('//Table');
            if (! empty($tables)) {
                return $this->simpleXmlElementsToArray($tables);
            }

            return [];
        } catch (\Exception $e) {
            Log::error("Jimpisoft XML parse error (dataset)", [
                'resultTag' => $resultTag,
                'error' => $e->getMessage(),
                'xml_snippet' => substr($xmlString, 0, 500),
            ]);
            return [];
        }
    }

    /**
     * Parse a single-record response (e.g. getGroupDetails).
     *
     * @param string $xmlString
     * @param string $resultTag
     * @return array<string, mixed>
     */
    private function parseSingleRecord(string $xmlString, string $resultTag): array
    {
        try {
            $cleanXml = $this->stripXmlNamespaces($xmlString);
            libxml_use_internal_errors(true);
            $xml = new SimpleXMLElement($cleanXml);

            $resultNodes = $xml->xpath("//{$resultTag}");
            if (empty($resultNodes)) {
                return [];
            }

            $row = [];
            foreach ($resultNodes[0]->children() as $child) {
                $name = $child->getName();
                // Skip schema definitions
                if ($name === 'schema') {
                    continue;
                }
                $row[$name] = (string) $child;
            }

            return $row;
        } catch (\Exception $e) {
            Log::error("Jimpisoft XML parse error (single record)", [
                'resultTag' => $resultTag,
                'error' => $e->getMessage(),
                'xml_snippet' => substr($xmlString, 0, 500),
            ]);
            return [];
        }
    }

    /**
     * Convert an array of SimpleXMLElement objects to associative arrays.
     *
     * @param array<int, SimpleXMLElement> $elements
     * @return array<int, array<string, string>>
     */
    private function simpleXmlElementsToArray(array $elements): array
    {
        $rows = [];
        foreach ($elements as $element) {
            $row = [];
            foreach ($element->children() as $child) {
                $row[$child->getName()] = (string) $child;
            }
            if (! empty($row)) {
                $rows[] = $row;
            }
        }
        return $rows;
    }

    /**
     * Safely convert a value to float.
     *
     * @param mixed $value
     * @return float
     */
    private function toFloat(mixed $value): float
    {
        if (is_numeric($value)) {
            return (float) $value;
        }
        return 0.0;
    }

    /**
     * Parse price rows from a raw SOAP response body.
     *
     * @param string $response
     * @return array<string, array>
     */
    private function parsePriceRows(string $response): array
    {
        $rows = $this->parseDataset($response, self::ENDPOINT_MULTIPLE_PRICES['result_tag']);

        $inclusionsByGroup = [];
        try {
            $cleanXml = $this->stripXmlNamespaces($response);
            libxml_use_internal_errors(true);
            $xml = new SimpleXMLElement($cleanXml);
            $extras = $xml->xpath('//AllExtras');
            if (!empty($extras)) {
                $extrasArray = $this->simpleXmlElementsToArray($extras);
                foreach ($extrasArray as $ext) {
                    if (($ext['extra_Included'] ?? '') === 'true') {
                        $gid = $ext['groupID'] ?? $ext['GroupID'] ?? null;
                        if ($gid) {
                            $inclusionsByGroup[$gid][] = $ext['extra'] ?? $ext['extraID'];
                        }
                    }
                }
            }
        } catch (\Exception $e) {}

        if (empty($rows)) {
            return [];
        }

        $prices = [];
        foreach ($rows as $row) {
            $gid = $row['GroupID'] ?? $row['groupID'] ?? null;
            if ($gid === null) {
                continue;
            }
            $prices[(string) $gid] = [
                'day_value' => $this->toFloat($row['dayValue'] ?? $row['dayvalue'] ?? 0),
                'preview_value' => $this->toFloat($row['previewValue'] ?? $row['previewvalue'] ?? 0),
                'value_without_tax' => $this->toFloat($row['valueWithoutTax'] ?? $row['valuewithouttax'] ?? $row['valueWithotTax'] ?? $row['valuewithottax'] ?? 0),
                'currency' => $row['currency'] ?? $row['Currency'] ?? null,
                'nr_days' => (int) ($row['nrDays'] ?? $row['nrdays'] ?? 1),
                'inclusions' => $inclusionsByGroup[(string) $gid] ?? [],
            ];
        }

        return $prices;
    }
}

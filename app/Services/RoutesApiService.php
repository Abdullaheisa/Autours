<?php

declare(strict_types=1);

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RoutesApiService
{
    private const BASE_URL = 'https://routesrez.com/api/service/';
    
    private string $customerNumber = '1066';
    private string $passcode = 'A(uT@0^8*';
    private string $senderId = 'ROUTES';
    private string $tradingPartnerCode = 'OTA01';
    
    private int $requestTimeout = 30;

    /**
     * Send REQLOC request to fetch locations.
     *
     * @return array
     */
    public function getLocations(): array
    {
        $xml = $this->buildBaseXml('REQLOC', 'Request Location');
        
        $response = $this->sendRequest($xml);
        
        if (!$response) {
            return [];
        }
        
        // Parse locations from RSPLOC
        // Since I don't have the exact structure of location_response, I'll attempt to parse <Location> or similar
        // We will log the response so we can inspect if it fails.
        return $this->parseLocations($response);
    }

    /**
     * Send REQRAT request to fetch rates/vehicles.
     */
    public function getRates(string $locationCode, Carbon $pickupDate, Carbon $dropoffDate, string $rateSource = 'Domestic'): array
    {
        $xml = $this->buildRatesXml($locationCode, $pickupDate, $dropoffDate, $rateSource);
        
        $response = $this->sendRequest($xml);
        
        if (!$response) {
            return [];
        }
        
        return $this->parseRates($response);
    }

    private function sendRequest(string $xml): ?\SimpleXMLElement
    {
        $response = Http::timeout($this->requestTimeout)
            ->withHeaders([
                'Content-Type' => 'text/xml',
            ])
            ->send('POST', self::BASE_URL, [
                'body' => $xml
            ]);

        if (!$response->successful()) {
            Log::error('Routes API: Request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'request' => $xml
            ]);
            return null;
        }

        try {
            $parsed = simplexml_load_string($response->body());
            if ($parsed === false) {
                throw new \Exception('Failed to parse XML');
            }
            return $parsed;
        } catch (\Exception $e) {
            Log::error('Routes API: Invalid XML response', [
                'body' => $response->body(),
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    private function buildBaseXml(string $messageId, string $messageDesc = ''): string
    {
        $dateStr = now()->timezone('UTC')->format('mdY h:i A');
        $descTag = $messageDesc ? "<MessageDesc>{$messageDesc}</MessageDesc>" : '';
        
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<TRNXML Version="1.0.0">
    <Dategmtime TimeZone="UTC">{$dateStr}</Dategmtime>
    <Sender>
        <SenderID>{$this->senderId}</SenderID>
    </Sender>
    <Recipient>
        <RecipientID>TRN</RecipientID>
    </Recipient>
    <TradingPartner>
        <TradingPartnerCode>{$this->tradingPartnerCode}</TradingPartnerCode>
    </TradingPartner>
    <Customer>
        <CustomerNumber>{$this->customerNumber}</CustomerNumber>
        <Passcode>{$this->passcode}</Passcode>
    </Customer>
    <Message>
        <MessageID>{$messageId}</MessageID>
        {$descTag}
    </Message>
</TRNXML>
XML;
    }

    private function buildRatesXml(string $locationCode, Carbon $pickupDate, Carbon $dropoffDate, string $rateSource): string
    {
        $dateStr = now()->timezone('UTC')->format('mdY h:i A');
        $pickupStr = $pickupDate->format('mdY h:i A');
        $dropoffStr = $dropoffDate->format('mdY h:i A');
        
        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<TRNXML Version="1.0.0">
    <Dategmtime TimeZone="UTC">{$dateStr}</Dategmtime>
    <Sender>
        <SenderID>{$this->senderId}</SenderID>
    </Sender>
    <Recipient>
        <RecipientID>TRN</RecipientID>
    </Recipient>
    <TradingPartner>
        <TradingPartnerCode>{$this->tradingPartnerCode}</TradingPartnerCode>
    </TradingPartner>
    <Customer>
        <CustomerNumber>{$this->customerNumber}</CustomerNumber>
        <Passcode>{$this->passcode}</Passcode>
    </Customer>
    <Message>
        <MessageID>REQRAT</MessageID>
        <MessageDesc>Request Rates</MessageDesc>
    </Message>
    <Payload>
        <RentalLocationID>{$locationCode}</RentalLocationID>
        <ReturnLocationID>{$locationCode}</ReturnLocationID>
        <PickupDateTime>{$pickupStr}</PickupDateTime>
        <ReturnDateTime>{$dropoffStr}</ReturnDateTime>
        <RateSource>{$rateSource}</RateSource>
        <CompanyNumber>{$this->customerNumber}</CompanyNumber>
        <TotalPricing>N</TotalPricing>
    </Payload>
</TRNXML>
XML;
    }

    private function parseLocations(\SimpleXMLElement $xml): array
    {
        $locations = [];
        if (isset($xml->locationDetails)) {
            foreach ($xml->locationDetails as $loc) {
                $locations[] = [
                    'LocationCode' => (string)$loc->LocationCode,
                    'LocationName' => (string)$loc->LocationName,
                    'Address' => (string)$loc->Address,
                    'ContactNumber' => (string)$loc->ContactNumber,
                    'Currency' => (string)$loc->Currency,
                    'Latitude' => (string)$loc->Latitude,
                    'Longitude' => (string)$loc->Longitude,
                ];
            }
        }
        return $locations;
    }

    private function parseRates(\SimpleXMLElement $xml): array
    {
        $rates = [];
        if (isset($xml->Payload) && isset($xml->Payload->RateProduct)) {
            foreach ($xml->Payload->RateProduct as $rate) {
                $rates[] = [
                    'ClassCode' => (string)$rate->ClassCode,
                    'ClassDesc' => (string)$rate->ClassDesc,
                    'ModelDesc' => (string)$rate->ModelDesc,
                    'RateCode' => (string)$rate->RateCode,
                    'RateAmount' => (string)$rate->RateAmount,
                    'CurrencyCode' => (string)$rate->CurrencyCode,
                    'TotalCharge' => isset($rate->TotalPricing->TotalCharges) ? (string)$rate->TotalPricing->TotalCharges : null,
                ];
            }
        }
        return $rates;
    }
}

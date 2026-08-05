<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NorthcarApiService
{
    private string $baseUrl = 'https://rms.carrentalsbooking.uk/api/autours';
    private int $requestTimeout = 30;

    /**
     * Fetch all locations from Northcar API.
     *
     * @return array<int, array>
     */
    public function getLocations(): array
    {
        $xml = $this->getBaseXml('REQLOC', 'Request Locations');
        $response = $this->sendRequest($xml);

        if (!$response) {
            return [];
        }

        // Expected to have <locationDetails> nodes
        $locations = [];
        if (isset($response->locationDetails)) {
            // SimpleXML converts single nodes to objects, multiple to arrays of objects
            $nodes = is_array($response->locationDetails) || $response->locationDetails instanceof \Traversable
                ? $response->locationDetails
                : [$response->locationDetails];

            foreach ($nodes as $loc) {
                $locations[] = [
                    'LocationCode' => (string) ($loc->LocationCode ?? ''),
                    'LocationName' => (string) ($loc->LocationName ?? ''),
                    'Address' => (string) ($loc->Address ?? ''),
                    'Latitude' => (string) ($loc->Latitude ?? ''),
                    'Longitude' => (string) ($loc->Longitude ?? ''),
                    'Currency' => (string) ($loc->Currency ?? ''),
                ];
            }
        }
        return $locations;
    }

    /**
     * Fetch rates for a specific pickup and dropoff.
     */
    public function getAvailability(
        string $pickupLocationCode,
        string $returnLocationCode,
        string $pickupDateTime,
        string $returnDateTime,
        string $rateSource = 'Inclusive'
    ): array {
        $payload = <<<XML
    <RentalLocationID>{$pickupLocationCode}</RentalLocationID> 
    <ReturnLocationID>{$returnLocationCode}</ReturnLocationID> 
    <PickupDateTime>{$pickupDateTime}</PickupDateTime> 
    <ReturnDateTime>{$returnDateTime}</ReturnDateTime> 
    <RateSource>{$rateSource}</RateSource> 
XML;

        $xml = $this->getBaseXml('REQRAT', 'Request rates', $payload);
        $response = $this->sendRequest($xml);

        if (!$response) {
            return [];
        }

        $messageId = (string) ($response->Message->MessageID ?? '');
        if ($messageId === 'RSPERR') {
            Log::info("Northcar API: Rate request error", [
                'description' => (string) ($response->Message->MessageDescription ?? '')
            ]);
            return [];
        }

        // Assuming payload has Rate or Vehicle structures, we will return the whole parsed simpleXML as array
        // Since we don't have a successful payload to model against yet, we return the parsed XML object
        // and let the command handle it or extract what we can.
        
        return $this->xmlToArray($response);
    }

    public function setTimeout(int $seconds): void
    {
        $this->requestTimeout = max(1, $seconds);
    }

    private function getBaseXml(string $messageId, string $messageDesc = '', string $payload = ''): string
    {
        $date = gmdate('mdY H:i A'); // Using UTC
        $messageDescTag = $messageDesc ? "<MessageDesc>{$messageDesc}</MessageDesc>" : "";
        $payloadTag = $payload ? "<Payload>{$payload}</Payload>" : "";

        return <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<TRNXML Version="1.0.0">
  <Dategmtime TimeZone="UTC">{$date}</Dategmtime>
  <Sender>
    <SenderID>AUTOURS</SenderID>
  </Sender>
  <Recipient>
    <RecipientID>AUTOURS</RecipientID>
  </Recipient>
  <TradingPartner>
    <TradingPartnerCode>TRN</TradingPartnerCode>
  </TradingPartner>
  <Customer>
    <CustomerNumber>CRB1062</CustomerNumber>
    <Passcode>A@u#t@0u#r@s</Passcode>
  </Customer>
  <Message>
    <MessageID>{$messageId}</MessageID>
    {$messageDescTag}
  </Message>
  {$payloadTag}
</TRNXML>
XML;
    }

    private function sendRequest(string $xmlBody): ?\SimpleXMLElement
    {
        try {
            $response = Http::timeout($this->requestTimeout)
                ->withHeaders(['Content-Type' => 'application/xml'])
                ->withOptions(['verify' => false])
                ->send('POST', $this->baseUrl, [
                    'body' => $xmlBody
                ]);

            if (!$response->successful()) {
                Log::error('Northcar API: Request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            $body = $response->body();
            
            // The API wraps responses in <PRE>...</PRE>. Remove it if present.
            $body = preg_replace('/^.*?<PRE>/is', '', $body);
            $body = preg_replace('/<\/PRE>.*?$/is', '', $body);
            $body = trim($body);

            // Sometimes the XML is malformed or has multiple roots if <PRE> is removed but there's no single root.
            // But looking at the response, it's just <TRNXML> or elements like <DateTimeStamp> alongside <TRNXML>.
            // Let's wrap it in a dummy root if it doesn't start with <TRNXML>.
            if (!str_starts_with($body, '<TRNXML') && !str_starts_with($body, '<?xml')) {
                $body = "<ROOT>{$body}</ROOT>";
            } else if (str_contains($body, '<DateTimeStamp') && !str_starts_with($body, '<ROOT>')) {
                // If it has multiple sibling tags like the location response did, wrap it
                // Location Response had <TRNXML .../> and <DateTimeStamp> as siblings
                $body = "<ROOT>{$body}</ROOT>";
            }

            libxml_use_internal_errors(true);
            $xml = simplexml_load_string($body);

            if ($xml === false) {
                Log::error('Autours API: Failed to parse XML', [
                    'errors' => libxml_get_errors(),
                    'body' => $body
                ]);
                return null;
            }

            return $xml;

        } catch (\Exception $e) {
            Log::error('Autours API: Exception during request', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Convert SimpleXMLElement to array
     */
    private function xmlToArray(\SimpleXMLElement $xml): array
    {
        $array = json_decode(json_encode($xml), true);
        return is_array($array) ? $array : [];
    }
}

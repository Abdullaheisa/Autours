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

    /**
     * Fetch terms and conditions (policy).
     */
    public function getPolicy(string $rentalLocationCode, string $classCode = 'ECAH'): array
    {
        $payload = <<<XML
    <RentalLocationID>{$rentalLocationCode}</RentalLocationID>
    <ClassCode>{$classCode}</ClassCode>
XML;

        $xml = $this->getBaseXml('REQPOL', 'Request Policy', $payload);
        $response = $this->sendRequest($xml);

        if (!$response) {
            return [];
        }

        $messageId = (string) ($response->Message->MessageID ?? '');
        if ($messageId === 'RSPERR') {
            Log::info("Northcar API: Policy request error", [
                'description' => (string) ($response->Message->MessageDescription ?? '')
            ]);
            return [];
        }

        return $this->xmlToArray($response);
    }

    /**
     * Fetch extras.
     */
    public function getExtras(
        string $pickupLocationCode,
        string $returnLocationCode,
        string $pickupDateTime,
        string $returnDateTime
    ): array {
        $payload = <<<XML
    <RentalLocationID>{$pickupLocationCode}</RentalLocationID> 
    <ReturnLocationID>{$returnLocationCode}</ReturnLocationID> 
    <PickupDateTime>{$pickupDateTime}</PickupDateTime> 
    <ReturnDateTime>{$returnDateTime}</ReturnDateTime> 
XML;

        $xml = $this->getBaseXml('REQEXT', '', $payload);
        $response = $this->sendRequest($xml);

        if (!$response) {
            return [];
        }

        $messageId = (string) ($response->Message->MessageID ?? '');
        if ($messageId === 'RSPERR') {
            Log::info("Northcar API: Extras request error", [
                'description' => (string) ($response->Message->MessageDescription ?? '')
            ]);
            return [];
        }

        return $this->xmlToArray($response);
    }

    /**
     * Request Reservation Details.
     */
    public function requestReservation(string $confirmNum): array
    {
        $payload = <<<XML
    <ConfirmNum>{$confirmNum}</ConfirmNum>
XML;

        $xml = $this->getBaseXml('REQREZ', 'Reservation Details', $payload);
        $response = $this->sendRequest($xml);

        if (!$response) {
            return [];
        }

        return $this->xmlToArray($response);
    }

    /**
     * Add Reservation.
     */
    public function addReservation(array $data): array
    {
        $payload = "\n    <SupplierName>" . ($data['SupplierName'] ?? 'NorthCarRental') . "</SupplierName>\n";
        $payload .= "    <RentalLocationID>" . ($data['RentalLocationID'] ?? '') . "</RentalLocationID>\n";
        $payload .= "    <ReturnLocationID>" . ($data['ReturnLocationID'] ?? '') . "</ReturnLocationID>\n";
        $payload .= "    <PickupDateTime>" . ($data['PickupDateTime'] ?? '') . "</PickupDateTime>\n";
        $payload .= "    <ReturnDateTime>" . ($data['ReturnDateTime'] ?? '') . "</ReturnDateTime>\n";
        $payload .= "    <RateID>" . ($data['RateID'] ?? '') . "</RateID>\n";
        $payload .= "    <ClassCode>" . ($data['ClassCode'] ?? '') . "</ClassCode>\n";
        $payload .= "    <RenterFirst>" . ($data['RenterFirst'] ?? '') . "</RenterFirst>\n";
        $payload .= "    <RenterLast>" . ($data['RenterLast'] ?? '') . "</RenterLast>\n";
        $payload .= "    <EmailAddress>" . ($data['EmailAddress'] ?? '') . "</EmailAddress>\n";
        $payload .= "    <RenterHomePhone>" . ($data['RenterHomePhone'] ?? '') . "</RenterHomePhone>\n";
        $payload .= "    <RenterAddress1>" . ($data['RenterAddress1'] ?? '') . "</RenterAddress1>\n";
        $payload .= "    <RenterCity>" . ($data['RenterCity'] ?? '') . "</RenterCity>\n";
        $payload .= "    <RenterCountry>" . ($data['RenterCountry'] ?? '') . "</RenterCountry>\n";
        $payload .= "    <CurrencyCode>" . ($data['CurrencyCode'] ?? '') . "</CurrencyCode>\n";

        if (isset($data['TotalPricing']) && is_array($data['TotalPricing'])) {
            $payload .= "    <TotalPricing>\n";
            $payload .= "        <RentalDays>" . ($data['TotalPricing']['RentalDays'] ?? '') . "</RentalDays>\n";
            $payload .= "        <RateCharge>" . ($data['TotalPricing']['RateCharge'] ?? '') . "</RateCharge>\n";
            $payload .= "        <TotalExtras>" . ($data['TotalPricing']['TotalExtras'] ?? '0.00') . "</TotalExtras>\n";
            $payload .= "        <TotalCharges>" . ($data['TotalPricing']['TotalCharges'] ?? '') . "</TotalCharges>\n";
            
            if (isset($data['TotalPricing']['DailyExtra'])) {
                $extras = isset($data['TotalPricing']['DailyExtra']['ExtraCode']) ? [$data['TotalPricing']['DailyExtra']] : $data['TotalPricing']['DailyExtra'];
                
                foreach ($extras as $extra) {
                    $payload .= "        <DailyExtra>\n";
                    $payload .= "          <ExtraCode>" . ($extra['ExtraCode'] ?? '') . "</ExtraCode>\n";
                    $payload .= "          <ExtraDesc>" . ($extra['ExtraDesc'] ?? '') . "</ExtraDesc>\n";
                    $payload .= "          <ExtraAmount>" . ($extra['ExtraAmount'] ?? '') . "</ExtraAmount>\n";
                    $payload .= "          <ExtraAutoApply>" . ($extra['ExtraAutoApply'] ?? 'FALSE') . "</ExtraAutoApply>\n";
                    $payload .= "          <ExtraOnRequest>" . ($extra['ExtraOnRequest'] ?? 'FALSE') . "</ExtraOnRequest>\n";
                    $payload .= "        </DailyExtra>\n";
                }
            }
            $payload .= "    </TotalPricing>\n";
        }

        $xml = $this->getBaseXml('ADDREZ', 'Add Reservation', $payload);
        $response = $this->sendRequest($xml);

        if (!$response) {
            return [];
        }

        return $this->xmlToArray($response);
    }

    /**
     * Cancel Reservation.
     */
    public function cancelReservation(string $confirmNum): array
    {
        $payload = <<<XML
    <ConfirmNum>{$confirmNum}</ConfirmNum>
XML;

        $xml = $this->getBaseXml('CANREZ', 'Cancel Reservation', $payload);
        $response = $this->sendRequest($xml);

        if (!$response) {
            return [];
        }

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
            throw new \Exception("Northcar API Error: HTTP " . $response->status());
        }

        $body = $response->body();
        
        $body = preg_replace('/^.*?<PRE>/is', '', $body);
        $body = preg_replace('/<\/PRE>.*?$/is', '', $body);
        $body = trim($body);

        if (!str_starts_with($body, '<TRNXML') && !str_starts_with($body, '<?xml')) {
            $body = "<ROOT>{$body}</ROOT>";
        } else if (str_contains($body, '<DateTimeStamp') && !str_starts_with($body, '<ROOT>')) {
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

        $messageId = (string) ($xml->Message->MessageID ?? $xml->TRNXML->Message->MessageID ?? '');
        if ($messageId === 'RSPERR') {
            $errorDesc = (string) ($xml->Message->MessageDescription ?? $xml->TRNXML->Message->MessageDescription ?? 'Unknown API Error');
            Log::error('Northcar API: RSPERR returned', ['description' => $errorDesc, 'body' => $body]);
            throw new \Exception("Northcar API Error: " . $errorDesc);
        }

        return $xml;
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

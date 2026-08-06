<?php
$url = 'https://rms.carrentalsbooking.uk/api/autours';

$xmlRate = '<?xml version="1.0" encoding="UTF-8"?>
<TRNXML Version="1.0.0">
  <Dategmtime TimeZone="UTC">' . gmdate('mdY H:i A') . '</Dategmtime>
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
    <MessageID>REQRAT</MessageID>
    <MessageDesc>Request rates</MessageDesc>
  </Message>
  <Payload> 
    <RentalLocationID>SDQNC</RentalLocationID> 
    <ReturnLocationID>SDQNC</ReturnLocationID> 
    <PickupDateTime>09202026 11:00 AM</PickupDateTime> 
    <ReturnDateTime>09212026 11:00 AM</ReturnDateTime> 
    <RateSource>Inclusive</RateSource> 
  </Payload> 
</TRNXML>';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlRate);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/xml'
]);

$response2 = curl_exec($ch);
curl_close($ch);

echo "Rate Response:\n";
echo substr($response2, 0, 5000) . "\n";

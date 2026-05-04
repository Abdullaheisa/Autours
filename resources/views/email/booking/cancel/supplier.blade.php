Dear {{json_decode($body)?->supplier?->name}},<br>
<br>
I hope this message finds you well.<br>
<br>
I would like to inform you that a customer has canceled their car reservation. Please find the details below:<br>
<br>
Reservation Details:<br>
- Reservation Number: {{json_decode($body)->order_number}}<br>
- Supplier Name: {{json_decode($body)?->supplier?->name}}<br>
- Car Model:  {{json_decode($body)->vehicle->name}}<br>
- Category:  {{json_decode($body)->category->name}}<br>
- Pick-Up Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->start_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->start_time)->toDateString()}}<br>
- Return Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->end_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->end_time)->toDateString()}}<br>
<br>
Important Information:<br>
- The booking has been canceled. If you have any questions or require further assistance, please let us know.<br>
<br>
Thank you for your attention to this matter.<br>
<br>
Best regards,<br>
<br>
Autours

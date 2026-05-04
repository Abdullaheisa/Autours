Dear Admin,<br>
<br>
I hope this message finds you well.<br>
<br>
We would like to inform you that a customer has canceled their reservation. Please find the details below:<br>
<br>
Reservation Details:
- Reservation Number: {{json_decode($body)->order_number}}<br>
- Supplier Name: {{json_decode($body)?->supplier?->name}}<br>
- Car Model: {{json_decode($body)->vehicle->name}}<br>
- Category:  {{json_decode($body)->vehicle->name}}<br>
-  Pick-Up Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->start_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->start_time)->toDateString()}}<br>
-  Return Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->end_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->end_time)->toDateString()}}<br>
<br>
Important Information:<br>
- The customer has canceled their booking. Please update your records accordingly.<br>
- Should you have any questions or require further assistance, please feel free to contact our customer service.<br>
<br>
Thank you for your understanding.<br>
<br>
Best regards,<br>
<br>
Autours

<html>
Dear {{json_decode($body)->customer->name}},<br>

Thank you for contacting Autours.<br> We are pleased to confirm that your booking has been successfully modified. <br>Below are the updated details of your reservation:<br>
Updated Booking Details:<br>
•	Reservation Number: {{json_decode($body)->order_number}}<br>
•	Original Pick-Up Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->old_rental->start_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->old_rental->start_time)->toTimeString()}}<br>
•	New Pick-Up Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->start_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->start_time)->toTimeString()}}<br>
•	Original Return Date & Time:{{\Carbon\Carbon::parse(json_decode($body)->old_rental->end_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->old_rental->end_time)->toTimeString()}}<br>
•	New Return Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->end_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->end_time)->toTimeString()}}<br>
•	Pick-Up Location: {{json_decode($body)->branch->adresse}}<br>
•	Car Model: {{json_decode($body)->vehicle->name}}<br>
•	For any questions or further modifications to your booking, feel free to contact us at admin@autors.net or call us at 1255.<br>
Thank you for choosing Autours. We look forward to serving you and wish you a pleasant journey.<br>
Best regards,<br>

Autours Team<br>
</html>

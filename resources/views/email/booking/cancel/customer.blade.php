<html>
Dear {{json_decode($body)->customer->name}},<br>
We regret to inform you that your car rental booking with Autours has been successfully canceled. Below are the details of your canceled reservation:<br>
Booking Details:<br>
•	Reservation Number: {{json_decode($body)->order_number}}<br>
•	Supplier Name: {{json_decode($body)?->supplier?->name}}<br>
•	Original Pick-Up Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->start_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->start_time)->toDateString()}}<br>
•	Original Return Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->end_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->end_time)->toDateString()}}<br>
•	Pick-Up Location: {{json_decode($body)?->branch?->adresse}}<br>
•	Car Model: {{json_decode($body)->vehicle->name}}<br>
Cancellation Policy:<br>
•	No cancellation fees have been applied since the cancellation was made within the allowed period.<br>
•	Any payments made will be refunded according to our refund policy. Please allow {{json_decode($body)->number_of_days}} business days for the refund to be processed.<br>
•	For any questions or further assistance, feel free to contact us at admin@autors.net or call us at 12555.<br>
We apologize for any inconvenience this may have caused. We hope to serve you in the future and assist you with any car rental needs.<br>
Best regards,<br>
Autours Team<br>
</html>

<html>
Dear Admin,<br>

We have received a new car rental booking on the website. Below are the details of the booking:<br>

Customer Details:<br>

Name: {{json_decode($body)->customer->name}}<br>
Email: {{json_decode($body)->customer->email}}<br>
Phone Number: {{json_decode($body)->customer->phone_num}}<br>
Booking Details:<br>

Reservation Number: {{json_decode($body)->order_num}}<br>
Pick-Up Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->start_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->start_time)->toTimeString()}}<br>
Return Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->end_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->end_time)->toTimeString()}}<br>
Company Details:<br>

Supplier Name: {{json_decode($body)->supplier->name}}<br>
Supplier Contact: {{json_decode($body)->supplier->phone_num}}<br>
Pick-Up Location: {{json_decode($body)->branch->adresse}}<br>
Return Location: {{json_decode($body)->branch->adresse}}<br>
Car Details:<br>

Car Model: {{json_decode($body)->vehicle->name}}<br>
Car Category: {{json_decode($body)->vehicle->category->name}}<br>
Please ensure that the supplier is informed and all arrangements are confirmed.<br>
</html>

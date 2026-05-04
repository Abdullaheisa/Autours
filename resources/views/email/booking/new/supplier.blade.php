<html>
Dear {{json_decode($body)->supplier->name}} !,<br>

We hope this message finds you well. We would like to inform you of a new booking request that requires your immediate<br>
attention. Below are the details of the booking:<br>

Booking Details:<br>

Reservation Number: {{json_decode($body)->order_number}}<br>
Customer's Name: {{json_decode($body)->customer->name}}<br>
Car Model: {{json_decode($body)->vehicle->name}}<br>
Pick-Up Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->start_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->start_time)->toTimeString()}}<br>
Drop off Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->end_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->end_time)->toTimeString()}}<br>
Pick-Up Location: {{json_decode($body)->branch->adresse}}<br>
Rental Amount: {{json_decode($body)->supplier_price . ' ' . json_decode($body)->branch->currency}}<br>
Action Required:<br>

Please confirm the availability of the requested vehicle and provide any necessary details or documentation required to<br>
fulfill this booking. We kindly request your confirmation by 12 hours to ensure smooth processing and customer<br>
satisfaction.<br>

Should you have any questions or need further information, do not hesitate to contact us at admin@autours.net or 122263.<br>

We appreciate your prompt attention to this booking and look forward to your confirmation.<br>
Payment Information:<br>
• Please note that the full rental amount has been paid directly to Autours. Ensure the car is prepared and available at the designated pickup address.<br>
Important Information:<br>


@isset(json_decode($body)->paymentMethod)
    @if(json_decode($body)->paymentMethod?->id == 2)
        <div>
            - Pay in Full:<br>
            The full rental amount has been paid directly to Autours. Please ensure the car is prepared and available at the designated pickup address.<br>
        </div>
    @endif
    @if(json_decode($body)->paymentMethod?->id == 3)
        <div>
            - Pay Partially:<br>
            A portion of the rental amount has been paid to Autours.<br>
            The remaining balance of  {{json_decode($body)->supplier_price . ' ' . json_decode($body)->branch->currency}} is to be collected from the customer upon pickup.<br>
        </div>
    @endif
    @if(json_decode($body)->paymentMethod?->id == 1)
        <div>
            - Pay on Arrival:<br>
            The customer will pay the full rental amount of  {{json_decode($body)->price . ' ' . json_decode($body)->branch->currency}} directly at the time of pickup.<br>
            Please ensure you collect the payment accordingly.<br><br>
        </div>
    @endif
@endisset


{{--• The customer has selected the Free Cancellation option, allowing them to cancel up to  {{count(json_decode($body)->cancelationPolicy) && json_decode($body)->cancelationPolicy[0]->id == 48 ? '48' : '' }} {{ json_decode($body)->cancelationPolicy->id == 1 ? '24' : ''}} hours before the pick-up time.<br>--}}
• Please confirm that the car will be ready as per the booking details provided.<br>
If you have any questions or require additional information, please do not hesitate to contact us.<br>
Thank you for your continued partnership.<br>
Best regards,<br>
Autours Team<br>
Best regards,<br>
</html>

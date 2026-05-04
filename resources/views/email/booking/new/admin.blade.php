<html>
Dear Admin !,<br>

We hope this message finds you well. We would like to inform you of a new booking request that requires your immediate<br>
attention. Below are the details of the booking:<br>

Booking Details:<br>

- Reservation Number: {{json_decode($body)->order_number}}<br>
- Customer's Name: {{json_decode($body)->customer->name}}<br>
- Supplier Name: {{json_decode($body)->supplier->name}}<br>
- Car Model: {{json_decode($body)->vehicle->name}}<br>
- Pick-Up Date & Time: {{\Carbon\Carbon::parse(json_decode($body)->start_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->start_time)->toTimeString()}}<br>
- Drop-off Date and Time: {{\Carbon\Carbon::parse(json_decode($body)->end_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->end_time)->toTimeString()}}<br>
- Pick-Up Location: {{json_decode($body)->branch->adresse}}<br>

- Total Amount :  {{ round( json_decode($body)->price, 2)  . ' ' . json_decode($body)->currency }}<br>
- Supplier Amount :  {{ ceil( json_decode($body)->supplier_price)  . ' ' . json_decode($body)->branch->currency }}<br>
- Profit Percentage: {{ json_decode($body)->profit_margin . '%' }}<br>
- Profit Amount: {{ round(json_decode($body)->price - (json_decode($body)->price / ((json_decode($body)->profit_margin / 100) + 1) ), 2 ) . ' ' . json_decode($body)->currency }}<br>

Action Required:<br>
<br><br>
Payment Information:<br>

@isset(json_decode($body)->paymentMethod)
    @if(json_decode($body)->paymentMethod?->id == 2)
        <div>
            - Pay in Full:<br>
            The customer has successfully completed the payment for this booking via the Autours platform.<br>
        </div>
    @endif
    @if(json_decode($body)->paymentMethod?->id == 3)
        <div>
            - Pay Partially:<br>
            The customer has made a partial payment via Autours.<br>
            The remaining balance is {{json_decode($body)->supplier_price . ' ' . json_decode($body)->branch->currency}} and should be collected from the customer upon pickup.<br><br>
        </div>
    @endif
    @if(json_decode($body)->paymentMethod?->id == 1)
        <div>
            - Pay on Arrival:<br>
            The customer will pay the full rental amount of {{json_decode($body)->price . ' ' . json_decode($body)->branch->currency}} directly to the supplier upon pickup.
        </div>
    @endif
@endisset

Additional Information:<br>
• The customer has selected the Free Cancellation option, allowing them to cancel up to {{json_decode($body)->cancelationPolicy?->id == 48 ? '48' : '' }} {{ json_decode($body)->cancelationPolicy?->id == 1 ? '24' : ''}} hours before the pick-up time.<br>
Please ensure that the booking is recorded in the system, and everything is in order for a smooth transaction with the supplier.<br>
Should you require any further information, please do not hesitate to contact me.<br>
Best regards,<br>
Autours Team<br>
<a href="{{url('/')}}">Autours.net</a>
</html>

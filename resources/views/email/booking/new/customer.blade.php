<html>

Dear {{json_decode($body)->customer->name}},<br>

Thank you for booking with Autours! Your reservation has been confirmed.<br>

Booking Details:<br>
• Reservation Number: {{json_decode($body)->order_number}}<br>
• Car Model: {{json_decode($body)->vehicle->name}}<br>
• Pickup Date and
Time: {{\Carbon\Carbon::parse(json_decode($body)->start_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->start_time)->toTimeString()}}
<br>
• Drop-off Date and
Time: {{\Carbon\Carbon::parse(json_decode($body)->end_date)->toDateString()}} {{\Carbon\Carbon::parse(json_decode($body)->end_time)->toTimeString()}}
<br>
• Pickup Location: {{json_decode($body)->branch->adresse}}<br>
• Address: {{json_decode($body)->branch->adresse}}<br>
• Rental
Duration: {{\Carbon\Carbon::parse(json_decode($body)->start_date)->diffInDays(\Carbon\Carbon::parse(json_decode($body)->end_date)) . ' days' }}
<br>
• Supplier Name: {{json_decode($body)->supplier->name}}<br>
• Amount : {{ ceil( json_decode($body)->price ) . ' ' . json_decode($body)->currency }}<br>
<br>
If you have any questions or need further assistance, please contact our customer service.<br>
Important Information:<br>

Payment Information:<br><br>

@isset(json_decode($body)->paymentMethod)
    @if(json_decode($body)->paymentMethod?->id == 2)
        <div>
            - Pay in Full:<br>
            ◦ The full payment for your reservation has been processed successfully.<br>
            ◦ No further payment will be required at the time of car pickup.<br>
            ◦ A receipt for the payment has been sent to your email. Please keep it for reference.<br><br>
        </div>
    @endif
    @if(json_decode($body)->paymentMethod?->id == 3)
        <div>
            - Pay Partially:<br>
            ◦ A partial payment has been made to confirm your booking.<br>
            ◦ The remaining balance must be paid directly to the supplier upon car pickup.<br>
            ◦ Please ensure you have the remaining amount ready in cash or by card (based on the supplier's accepted
            payment methods).<br><br>
        </div>
    @endif
    @if(json_decode($body)->paymentMethod?->id == 1)
        <div>
            - Pay on Arrival:<br>
            ◦ No payment has been made yet.<br>
            ◦ The full payment for your reservation will be due at the time of car pickup.<br>
            ◦ Accepted payment methods at the pickup location may include cash or card (subject to the supplier’s
            policies).<br><br>
        </div>
    @endif
    Important Notes:<br>
    • Ensure you have a valid ID, credit card, or any required documentation as per the supplier's terms.<br>
    • Contact customer support if you need assistance regarding payment methods or policies.<br>
@endisset


{{--• The customer has selected the Free Cancellation option, allowing them to cancel up to  {{count(json_decode($body)->cancelationPolicy) && json_decode($body)->cancelationPolicy[0]->id == 48 ? '48' : '' }} {{ json_decode($body)->cancelationPolicy->id == 1 ? '24' : ''}} hours before the pick-up time.<br>--}}
• Car Model Notice: The car model you have booked is subject to availability. You may receive a similar vehicle based on
the supplier’s fleet at the time of pickup.
Should you have any questions or require further assistance, please feel free to contact our customer service.<br>
Best regards,<br><br>
Autours Team<br><br>
</html>

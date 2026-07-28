export interface FAQItem {
  q: string;
  a: string;
  category?: string; // Adding category so we can group them on the dedicated FAQ page
}

export const defaultFaqs: FAQItem[] = [
  {
    category: "General",
    q: "Can I receive a specific color of the car model?",
    a: `The cars displayed online are just examples of the vehicles the customer may get, and unfortunately, we cannot guarantee the exact make or model, or aspects such as the color of the car.

Autours guarantee the category of the car, seating capacity, transmission and boot space. The model of vehicle the customer will receive will depend on availability in the rental supplier's fleet at the collection time.`
  },
  {
    category: "Requirements",
    q: "What do I need to bring to collect the car?",
    a: `When collecting your rental car from Autours, please ensure you have the following items:

• Booking Confirmation: Make sure to have your booking confirmation details handy, either in print or on your mobile device.

• Driving License: Bring a valid driving license issued from your country of residence. International customers should also carry a valid international driver's permit (IDP) if required.

• Payment Method: Have a credit card in the primary driver's name for any necessary payments.

• Additional Driver's Information: If you plan to add an additional driver, ensure they meet all required criteria and have their driving license ready. These items are essential to facilitate a smooth and efficient car collection process.`
  },
  {
    category: "Booking",
    q: "Can I change the booking to different date & time?",
    a: `Yes, many car rental companies allow customers to change their booking to a different date and time, although this may depend on the company's policies and the terms and conditions of the rental agreement.

At Autours, you have the flexibility to modify your booking to a different date and time:
• Easy Modifications: Log into your account and navigate to your bookings. Select the reservation you wish to modify and choose your new preferred date and time.
• No Hidden Fees: Enjoy the convenience of changing your booking without worrying about hidden fees. Please note that changes are subject to availability and any difference in rental rates.`
  },
  {
    category: "Booking",
    q: "What is an instant confirmation?",
    a: `At Autours, we value your time and strive to provide a seamless booking experience. With our instant confirmation feature, you can book with confidence and get on the road faster.

• Immediate Assurance: Once you complete your booking, you will receive an immediate confirmation email. This email will include all the necessary details of your reservation.
• No Waiting: There's no need to wait for hours or days to know if your booking is confirmed. As soon as you finish the booking process, your confirmation is generated instantly.`
  },
  {
    category: "Booking",
    q: "What is the cancellation policy?",
    a: `Our cancellation policy at Autours is designed to provide flexibility and convenience:

• Free Cancellation: You can cancel your booking free of charge up to 24 hours.
• Late Cancellation: Cancellations made less than 24 hours before pick-up may incur a cancellation fee.
• No-shows: If you do not collect your rental car and do not cancel the booking in advance, a no-show fee may apply.`
  },
  {
    category: "Insurance",
    q: "What is an insurance excess?",
    a: `Insurance excess, also known as a deductible, is the amount you are liable to pay towards the cost of any damage or loss to the rental vehicle during the rental period.

• How it Works: If there is damage to the car, the insurance excess is the maximum amount you would have to pay out of pocket before the insurance coverage kicks in.
• Example: If the insurance excess is $500 and there is $1,000 worth of damage to the vehicle, you would pay $500 and the insurance would cover the remaining $500.
• Coverage Options: Some rental agreements offer options to reduce the excess through additional insurance or waivers, which can be purchased for added peace of mind.`
  },
  {
    category: "Requirements",
    q: "What are the driving license requirements?",
    a: `To rent a car with Autours, you need to meet the following driving license requirements:

• Minimum Age: You must be at least 21 years old.
• Valid Driving License: You must possess a valid driver's license issued from your country of residence.
• International Drivers: International customers must present a valid international driver's permit (IDP) along with their original driver's license.`
  },
  {
    category: "Booking",
    q: "How do I cancel my booking?",
    a: `To cancel your booking with Autours, follow these simple steps:

1. Visit Our Website: Log in to your account on our website.
2. Find Your Booking: Navigate to the bookings section where your reservation is listed.
3. Initiate Cancellation: Select the booking to cancel and follow the prompts to initiate the process.

Please note:
- Cancellations made at least 24 hours before your scheduled pick-up time are typically free of charge.
- Late cancellations may incur fees as per our cancellation policy.`
  },
  {
    category: "Insurance",
    q: "What is Collision Damage Waiver (CDW)?",
    a: `Collision Damage Waiver (CDW) is an optional insurance coverage that reduces the renter's financial responsibility (excess) in case of damage to the rental vehicle.

• Coverage: CDW typically covers damage to the rental vehicle due to collision, theft, and vandalism.
• Financial Protection: By purchasing CDW, the renter can often reduce their liability to pay the full cost of damages down to a lower amount or eliminate it altogether.
• Exclusions: CDW may not cover certain damages, such as those resulting from negligent use of the vehicle or driving under the influence.`
  },
  {
    category: "Requirements",
    q: "What is an additional driver?",
    a: `An additional driver is a person other than the primary renter who is authorized to drive a rental car. When you offer an additional driver option, it means that customers can have someone else drive the car besides the person who made the reservation.

At Autours, we proudly offer a "Free Additional Driver" option, allowing you to share the driving experience without any extra cost. Both the primary and additional drivers must meet all rental requirements, including age and license validity.`
  },
  {
    category: "Insurance",
    q: "What is Theft Waiver (THW)?",
    a: `Theft Protection is a type of cover for hire cars. It limits the driver's liability if the rental car is stolen. This means that the hire car company will not charge you the whole cost if the car gets stolen while you have it.

There is almost always an excess, which means you will pay the first part of any repair or replacement costs. The specifics of what Theft Protection includes depends on the car hire company and where you hire the car.`
  },
  {
    category: "Insurance",
    q: "What is Person Accident Insurance (PAI)?",
    a: `A Personal Accident Insurance (PAI) is an optional insurance and it pays the hospital fees if you or any passengers in the hire car are injured.

This coverage provides financial protection for medical expenses resulting from accidents during the rental period. It's designed to give you peace of mind while traveling, ensuring that you and your passengers are protected in case of unexpected incidents on the road.`
  }
];

'use client';

import RegistrationLayout from '@/components/shared/auth/RegistrationLayout';

export default function BeSupplierPage() {
  const contentText = (
    <>
      <p className="text-[17px] leading-relaxed">
        Become a car rental supplier! Autours is a company operating in the tourism field
        since its establishment in 2005, with car rental bookings being our main area of
        expertise. We provide you a great chance to increase the business, as through our
        multilingual www.autours.net millions of customers from different countries book their
        car rental. We have a huge affiliate and reseller network worldwide, who send us high
        amount of car bookings in different countries and destinations. It is an opportunity
        for you to expand your business in different markets. If you are a car rental company,
        small or big, and you want to increase the volume of your car rental reservations, you
        are welcome to join our car rental partner network.
      </p>

      <div className="border-t border-black/15 pt-6 space-y-4">
        <p
          className="font-black text-gray-900 text-lg md:text-xl mb-4"
          style={{ fontFamily: 'var(--title-font)' }}
        >
          Benefits from joining the car rental network of www.autours.net
        </p>
        <ul className="space-y-3 pl-1">
          {[
            "No financial risk at all. The customers pay directly to you upon the arrival.",
            "Immediate increase of your car rental sales.",
            "No entry/administration fee or other costs.",
            "Access to our agent area for special offers, stop sales, statistics, information and evaluation results from customers.",
            "The results from the feedback and evaluation will help you and improve your service.",
            "Smart reservation procedure for confirming via e-mail or Dashboard for your admin interface.",
            "Flexible system for amendments, cancellations and one-way rentals.",
            "Guaranteed bookings and very low volume of no-show customers.",
            "Our team will assist you, proposing rates, car groups purchase, changes and tips."
          ].map((benefit, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px]">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/80 shrink-0" />
              <span className="leading-relaxed font-bold text-gray-900">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-black/15 pt-6">
        <p className="font-extrabold text-gray-900 text-[15px] leading-relaxed italic">
          Please fill in the Supplier Application Form in order to get more information on how you can become an www.autours.net Supplier.
        </p>
      </div>
    </>
  );

  return (
    <RegistrationLayout 
      supplierMode={true}
      leftContent={contentText}
      formTitle="Supplier Registration"
      loginLinkText="Manage My Booking"
    />
  );
}
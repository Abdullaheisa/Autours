'use client';

import { useState, useEffect } from 'react';
import { X, HelpCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQProps {
  data?: { q: string; a: string }[];
  title?: string;
}

export default function FAQ({ data, title = "FAQ" }: FAQProps = {}) {
  const defaultFaqs = [
    {
      q: 'Can I receive a specific color of the car model?',
      a: `The cars displayed online are just examples of the vehicles the customer may get, and unfortunately, we cannot guarantee the exact make or model, or aspects such as the color of the car.

Autours guarantee the category of the car, seating capacity, transmission and boot space. The model of vehicle the customer will receive will depend on availability in the rental supplier's fleet at the collection time.`
    },
    {
      q: 'What do I need to bring to collect the car?',
      a: `When collecting your rental car from Autours, please ensure you have the following items:

• Booking Confirmation: Make sure to have your booking confirmation details handy, either in print or on your mobile device.

• Driving License: Bring a valid driving license issued from your country of residence. International customers should also carry a valid international driver's permit (IDP) if required.

• Payment Method: Have a credit card in the primary driver's name for any necessary payments.

• Additional Driver's Information: If you plan to add an additional driver, ensure they meet all required criteria and have their driving license ready. These items are essential to facilitate a smooth and efficient car collection process. If you have any specific inquiries about what to bring when collecting your car, please don't hesitate to contact us.`
    },
    {
      q: 'Can I change the booking to different date & time?',
      a: `Yes, many car rental companies allow customers to change their booking to a different date and time, although this may depend on the company's policies and the terms and conditions of the rental agreement.

At Autours, you have the flexibility to modify your booking to a different date and time. Here's how it works:

• Easy Modifications: Log into your account and navigate to your bookings. Select the reservation you wish to modify and choose your new preferred date and time.

• No Hidden Fees: Enjoy the convenience of changing your booking without worrying about hidden fees. Please note that changes are subject to availability and any difference in rental rates.

• Customer Support: If you need assistance, our customer support team is here to help. Contact us via email or phone, and we'll guide you through the process.`
    },
    {
      q: 'What is an instant confirmation?',
      a: `At Autours, we value your time and strive to provide a seamless booking experience. With our instant confirmation feature, you can book with confidence and get on the road faster.

Here's what you need to know:

• Immediate Assurance: Once you complete your booking, you will receive an immediate confirmation email. This email will include all the necessary details of your reservation.

• No Waiting: There's no need to wait for hours or days to know if your booking is confirmed. As soon as you finish the booking process, your confirmation is generated instantly.

• Detailed Information: Your confirmation email will contain important information such as your reservation number, pick-up and drop-off locations, dates and times, vehicle category, and any additional services you've selected.`
    },
    {
      q: 'What is the cancellation policy?',
      a: `Our cancellation policy at Autours is designed to provide flexibility and convenience:

• Free Cancellation: You can cancel your booking free of charge up to 24 hours.

• Late Cancellation: Cancellations made less than 24 hours before pick-up may incur a cancellation fee.

• No-shows: If you do not collect your rental car and do not cancel the booking in advance, a no-show fee may apply.

Please review the specific terms and conditions related to cancellations during the booking process. For further assistance or to cancel a booking, please contact our customer support team.`
    },
    {
      q: 'What is an insurance excess?',
      a: `Insurance excess, also known as a deductible, is the amount you are liable to pay towards the cost of any damage or loss to the rental vehicle during the rental period.

• How it Works: If there is damage to the car, the insurance excess is the maximum amount you would have to pay out of pocket before the insurance coverage kicks in.

• Example: If the insurance excess is $500 and there is $1,000 worth of damage to the vehicle, you would pay $500 and the insurance would cover the remaining $500.

• Coverage Options: Some rental agreements offer options to reduce the excess through additional insurance or waivers, which can be purchased for added peace of mind.

It's important to review your rental agreement to understand the specific terms and conditions related to insurance excess. If you have any questions regarding insurance coverage or excess, feel free to contact us for clarification.`
    },
    {
      q: 'What are the driving license requirements?',
      a: `To rent a car with Autours, you need to meet the following driving license requirements:

• Minimum Age: You must be at least 21 years old.

• Valid Driving License: You must possess a valid driver's license issued from your country of residence.

• International Drivers: International customers must present a valid international driver's permit (IDP) along with their original driver's license.`
    },
    {
      q: 'How do I cancel my booking?',
      a: `To cancel your booking with Autours, follow these simple steps:

1. Visit Our Website: Log in to your account on our website.

2. Find Your Booking: Navigate to the bookings section where your reservation is listed.

3. Initiate Cancellation: Select the booking to cancel and follow the prompts to initiate the process.

4. Contact Customer Support: If you encounter any issues, please contact our customer support team.

Please note:
- Cancellations made at least 24 hours before your scheduled pick-up time are typically free of charge.
- Late cancellations may incur fees as per our cancellation policy.`
    },
    {
      q: 'What is Collision Damage Waiver (CDW)?',
      a: `Collision Damage Waiver (CDW) is an optional insurance coverage that reduces the renter's financial responsibility (excess) in case of damage to the rental vehicle.

• Coverage: CDW typically covers damage to the rental vehicle due to collision, theft, and vandalism.

• Financial Protection: By purchasing CDW, the renter can often reduce their liability to pay the full cost of damages down to a lower amount or eliminate it altogether, depending on the terms of the waiver.

• Exclusions: CDW may not cover certain damages, such as those resulting from negligent use of the vehicle or driving under the influence.

It's important to carefully review the terms and conditions of the CDW offered by Autours to understand the coverage limits, exclusions, and any additional fees associated with this option. For more information or to add CDW to your rental, please contact our customer support team.`
    },
    {
      q: 'What is an additional driver?',
      a: `An additional driver is a person other than the primary renter who is authorized to drive a rental car. When you offer an additional driver option, it means that customers can have someone else drive the car besides the person who made the reservation. This is especially useful for longer trips or when multiple people in a group need to share driving responsibilities.

At Autours, we proudly offer a "Free Additional Driver" option, allowing you to share the driving experience without any extra cost. Both the primary and additional drivers must meet all rental requirements, including age and license validity.`
    },
    {
      q: 'What is Theft Waiver (THW)?',
      a: `Theft Protection is a type of cover for hire cars. It limits the driver's liability if the rental car is stolen. This means that the hire car company will not charge you the whole cost if the car gets stolen while you have it.

There is almost always an excess, which means you will pay the first part of any repair or replacement costs. The specifics of what Theft Protection includes depends on the car hire company and where you hire the car.

Theft Protection only works if you stick to the terms of the rental agreement (which you'll sign when you collect the car). This means that if (for example) you leave the car unlocked and it is stolen, you will be liable for the whole cost of repair or replacement, not just an excess.`
    },
    {
      q: 'What is Person Accident Insurance (PAI)?',
      a: `A Personal Accident Insurance (PAI) is an optional insurance and it pays the hospital fees if you or any passengers in the hire car are injured.

This coverage provides financial protection for medical expenses resulting from accidents during the rental period. It's designed to give you peace of mind while traveling, ensuring that you and your passengers are protected in case of unexpected incidents on the road.`
    },
  ];

  const faqs = data || defaultFaqs;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    setOpenIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setOpenIndex(null);
    document.body.style.overflow = 'unset';
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <section id="faq" className=" bg-gradient-to-br from-primary via-primary-300 to-primary-600 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-600 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="max-w-6xl mb-10 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className="text-center my-10">

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-gray-800 tracking-tight mt-1"
          >
            {title}
          </motion.h3>
        </div>

        {/* FAQ Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal(i)}
              className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-400/20 border border-gray-100 cursor-pointer hover:shadow-xl hover:shadow-gray-400/30 transition-shadow group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-xs font-black text-gray-900 shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Question</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-primary-600 transition-colors">
                    {faq.q}
                  </h4>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary transition-colors shrink-0 mt-1">
                  <ChevronRight size={16} className="text-gray-500 group-hover:text-gray-900 transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-primary px-6 py-5 flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-primary">{openIndex + 1}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-black text-gray-900 leading-snug">
                    {faqs[openIndex].q}
                  </h3>
                </div>
                <button 
                  onClick={closeModal}
                  className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors shrink-0"
                >
                  <X size={18} className="text-primary" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="prose prose-sm max-w-none">
                  <div className="space-y-4">
                    {faqs[openIndex].a.split('\n\n').map((paragraph, idx) => (
                      <div key={idx}>
                        {paragraph.startsWith('•') || paragraph.startsWith('-') || /^\d+\./.test(paragraph) ? (
                          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-gray-900">
                                {paragraph.match(/^\d+/)?.[0] ?? '✓'}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed">
                              {paragraph.replace(/^[•\-\d]+\.\s*/, '')}
                            </p>
                          </div>
                        ) : paragraph.startsWith('Here') || paragraph.startsWith('At ') || paragraph.startsWith('To ') || paragraph.startsWith('Yes') || paragraph.startsWith('Our ') || paragraph.startsWith('Insurance') || paragraph.startsWith('Collision') || paragraph.startsWith('An additional') || paragraph.startsWith('Theft') || paragraph.startsWith('A Personal') ? (
                          <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                            {paragraph}
                          </p>
                        ) : (
                          <p className="text-sm font-medium text-gray-600 leading-relaxed">
                            {paragraph}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

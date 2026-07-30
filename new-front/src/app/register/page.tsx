'use client';

import RegistrationLayout from '@/components/shared/auth/RegistrationLayout';

export default function RegisterPage() {
  const contentText = (
    <>
      <p className="text-[17px] leading-relaxed">
        Welcome to Autours! Create an account to easily manage your car rental bookings, track your reservations, and get access to exclusive offers.
      </p>

      <div className="border-t border-black/15 pt-6 space-y-4">
        <p
          className="font-black text-gray-900 text-lg md:text-xl mb-4"
          style={{ fontFamily: 'var(--title-font)' }}
        >
          Benefits of creating an account
        </p>
        <ul className="space-y-3 pl-1">
          {[
            "Manage and view all your past and upcoming bookings in one place.",
            "Faster checkout process for future rentals.",
            "Easy access to amend or cancel your reservations.",
            "Receive special discounts and promotions.",
            "Keep your personal details securely saved."
          ].map((benefit, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px]">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/80 shrink-0" />
              <span className="leading-relaxed font-bold text-gray-900">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <RegistrationLayout 
      supplierMode={false}
      leftContent={contentText}
      formTitle="Create Account"
      loginLinkText="Already have an account? Log in"
    />
  );
}

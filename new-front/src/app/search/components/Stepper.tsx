import Link from 'next/link';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  vehicleId?: string | number;
  bookId?: string | number;
  hasExtras?: boolean;
}

const ALL_STEPS = [
  { id: 1, label: 'Choose Your Location', line1: 'Choose Your', line2: 'Location' },
  { id: 2, label: 'Choose Your Car', line1: 'Choose Your', line2: 'Car' },
  { id: 3, label: 'Choose Your Options', line1: 'Choose Your', line2: 'Options' },
  { id: 4, label: 'Reserve Your Car', line1: 'Reserve', line2: 'Your Car' },
];

export default function Stepper({ currentStep, vehicleId, bookId, hasExtras }: StepperProps) {
  const steps = hasExtras === false ? ALL_STEPS.filter((s) => s.id !== 3) : ALL_STEPS;

  const getStepHref = (stepId: number) => {
    if (stepId === 1 || stepId === 2) return '/search';
    if (stepId === 3) {
      if (hasExtras === false) return undefined;
      if (vehicleId || bookId) {
        return `/options?vehicleId=${vehicleId || ''}&bookId=${bookId || ''}`;
      }
      return '/search';
    }
    return undefined;
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-[1400px] xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-1.5 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 w-full">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id || (hasExtras === false && currentStep >= 4 && step.id === 4);
            const href = isCompleted ? getStepHref(step.id) : undefined;
            const stepNumber = idx + 1;

            const content = (
              <div
                className={`w-full flex-1 min-w-0 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 px-1 sm:px-2 md:px-4 py-1.5 md:py-2.5 rounded-lg transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-[#9e8b4f] text-white shadow-sm'
                    : 'bg-[#f9d602] text-gray-950'
                } ${isCompleted && href ? 'hover:brightness-95 active:scale-[0.99] cursor-pointer' : ''}`}
              >
                {/* Step Number / Check Circle */}
                <div
                  className={`w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] md:text-xs font-bold shrink-0 border-[1.5px] md:border-2 ${
                    isActive
                      ? 'border-white text-white'
                      : 'border-gray-950 text-gray-950'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <Check size={10} strokeWidth={2.5} className="md:hidden" />
                      <Check size={12} strokeWidth={2.5} className="hidden md:block" />
                    </>
                  ) : (
                    <span className="leading-none">{stepNumber}</span>
                  )}
                </div>

                {/* Step Label: Full text on all viewports */}
                <div className="flex flex-col items-center justify-center text-center leading-tight md:hidden">
                  <span className="text-[10.5px] sm:text-[11px] font-bold tracking-tight">
                    {step.line1}
                  </span>
                  <span className="text-[10.5px] sm:text-[11px] font-bold tracking-tight">
                    {step.line2}
                  </span>
                </div>

                {/* Desktop/Tablet single line full text */}
                <span className="hidden md:inline text-xs lg:text-sm font-bold text-center leading-normal whitespace-nowrap tracking-normal antialiased">
                  {step.label}
                </span>

                {/* Checkmark for completed on wide desktop screens */}
                {isCompleted && (
                  <Check size={14} strokeWidth={2.5} className="hidden xl:block shrink-0 ml-0.5 text-gray-950" />
                )}
              </div>
            );

            if (href) {
              return (
                <Link key={step.id} href={href} className="flex-1 min-w-0 flex">
                  {content}
                </Link>
              );
            }

            return (
              <div key={step.id} className="flex-1 min-w-0 flex">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

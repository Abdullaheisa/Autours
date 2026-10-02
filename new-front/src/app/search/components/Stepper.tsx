import Link from 'next/link';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  vehicleId?: string | number;
  bookId?: string | number;
  hasExtras?: boolean;
}

const ALL_STEPS = [
  { id: 1, label: 'Choose Your Location', shortLabel: 'Location' },
  { id: 2, label: 'Choose Your Car', shortLabel: 'Car' },
  { id: 3, label: 'Choose Your Options', shortLabel: 'Options' },
  { id: 4, label: 'Reserve Your Car', shortLabel: 'Reserve' },
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
      <div className="max-w-[1400px] xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-4 py-2">
        <div className="flex items-stretch gap-1.5 sm:gap-2 md:gap-3">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id || (hasExtras === false && currentStep >= 4 && step.id === 4);
            const href = isCompleted ? getStepHref(step.id) : undefined;
            const stepNumber = idx + 1;

            const content = (
              <div
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-1.5 sm:px-2 md:px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-[#9e8b4f] text-white shadow-sm'
                    : 'bg-[#f9d602] text-gray-900'
                } ${isCompleted && href ? 'hover:brightness-95 cursor-pointer' : ''}`}
              >
                {/* Step Number / Check */}
                <div
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shrink-0 border-2 ${
                    isActive
                      ? 'border-white text-white'
                      : 'border-gray-900 text-gray-900 bg-transparent'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Label */}
                <span className="text-[10px] sm:text-[11px] md:text-sm font-bold text-center leading-tight">
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </span>

                {/* Checkmark for completed */}
                {isCompleted && (
                  <Check size={14} strokeWidth={3} className="hidden md:block shrink-0" />
                )}
              </div>
            );

            if (href) {
              return (
                <Link key={step.id} href={href} className="flex-1 flex">
                  {content}
                </Link>
              );
            }

            return (
              <div key={step.id} className="flex-1 flex">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

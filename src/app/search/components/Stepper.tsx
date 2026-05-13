'use client';

import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
}

const STEPS = [
  { id: 1, label: 'Choose Your Location' },
  { id: 2, label: 'Choose Your Car' },
  { id: 3, label: 'Reserve Your Car' },
];

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-[1400px] mx-auto px-4 py-2">
        <div className="flex items-stretch gap-2 md:gap-3">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 px-2 md:px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-[#9e8b4f] text-white shadow-sm'
                    : 'bg-[#f9d602] text-gray-900'
                }`}
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
                    step.id
                  )}
                </div>

                {/* Step Label */}
                <span className="text-[11px] md:text-sm font-bold text-center leading-tight">
                  {step.label}
                </span>

                {/* Checkmark for completed */}
                {isCompleted && (
                  <Check size={14} strokeWidth={3} className="hidden md:block shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
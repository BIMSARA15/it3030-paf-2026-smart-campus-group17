import { ChevronRight } from 'lucide-react';

export default function StepProgressBar({ currentStep, theme }) {
  const steps = ['Select Resource', 'Booking Details', 'Request Submitted'];

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const active = currentStep === stepNum;
        const done = currentStep > stepNum;
        
        return (
          <div key={label} className="flex items-center gap-2 whitespace-nowrap">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
              done ? 'bg-emerald-100 text-emerald-700' :
              active ? theme.activeStep : 'bg-gray-100 text-gray-400'
            }`}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs border border-current">
                {done ? '✓' : stepNum}
              </span>
              {label}
            </div>
            {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
          </div>
        );
      })}
    </div>
  );
}
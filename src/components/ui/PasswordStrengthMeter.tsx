import React from 'react';

interface PasswordStrengthMeterProps {
  value: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ value }) => {
  // Calculate checklist items
  const criteria = [
    { label: 'At least 8 characters', met: value.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(value) },
    { label: 'At least one lowercase letter', met: /[a-z]/.test(value) },
    { label: 'At least one number', met: /[0-9]/.test(value) },
    { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(value) },
  ];

  // Calculate score
  const metCount = criteria.filter((item) => item.met).length;

  // Determine strength label and color
  let label = 'Very Weak';
  let colorClass = 'bg-red-500';
  let textClass = 'text-red-500';
  let score = 0;

  if (value.length > 0) {
    if (metCount <= 1) {
      label = 'Very Weak';
      colorClass = 'bg-red-500';
      textClass = 'text-red-500';
      score = 1;
    } else if (metCount === 2) {
      label = 'Weak';
      colorClass = 'bg-amber-500';
      textClass = 'text-amber-500';
      score = 2;
    } else if (metCount === 3) {
      label = 'Medium';
      colorClass = 'bg-yellow-500';
      textClass = 'text-yellow-500';
      score = 3;
    } else if (metCount === 4) {
      label = 'Strong';
      colorClass = 'bg-emerald-500';
      textClass = 'text-emerald-500';
      score = 4;
    } else {
      label = 'Very Strong';
      colorClass = 'bg-emerald-600';
      textClass = 'text-emerald-600 dark:text-emerald-400';
      score = 5;
    }
  }

  return (
    <div className="flex flex-col gap-3 mt-1.5 p-3.5 bg-slate-50 dark:bg-[#0f1422] border border-slate-200 dark:border-navy-border rounded-xl transition-all duration-200">
      <div className="flex justify-between items-center text-xs font-bold">
        <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password Strength</span>
        <span className={`font-extrabold uppercase tracking-wide ${value ? textClass : 'text-slate-400'}`}>
          {value ? label : 'Enter Password'}
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`h-full rounded-full transition-all duration-300 ${
              index <= score ? colorClass : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-1.5 mt-1">
        {criteria.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs transition-colors duration-200">
            {item.met ? (
              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-slate-350 dark:border-slate-600 shrink-0" />
            )}
            <span className={item.met ? 'text-slate-650 dark:text-slate-300 line-through decoration-emerald-500/20' : 'text-slate-500 dark:text-slate-400'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;

import React, { forwardRef } from 'react';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, helperText, className = '', id, maxLength, onChange, value, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      // Remove all non-digits
      val = val.replace(/\D/g, '');
      
      // Enforce max length
      if (maxLength !== undefined && val.length > maxLength) {
        val = val.slice(0, maxLength);
      }
      
      if (onChange) {
        onChange(val);
      }
    };

    return (
      <div className={`w-full flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label htmlFor={id} className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          className={`w-full px-3.5 py-2 border rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none focus:ring-4 text-sm
            ${props.disabled
              ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-60 border-slate-200 dark:border-slate-700'
              : 'bg-white dark:bg-[#0f1422]'
            }
            ${error 
              ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
              : 'border-slate-300 dark:border-navy-border focus:ring-accent-500/25 focus:border-accent-500'
            }`}
          {...props}
        />
        {error ? (
          <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-slate-400 mt-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';
export default NumberInput;

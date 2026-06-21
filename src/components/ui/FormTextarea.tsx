import React, { forwardRef } from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    return (
      <div className={`w-full flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label htmlFor={id} className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={`w-full px-3.5 py-2 bg-white dark:bg-[#0f1422] border ${
            error 
              ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500' 
              : 'border-slate-300 dark:border-navy-border focus:ring-accent-500/25 focus:border-accent-500'
          } rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none focus:ring-4 text-xs font-medium`}
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

FormTextarea.displayName = 'FormTextarea';
export default FormTextarea;

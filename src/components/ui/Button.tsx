import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide uppercase text-xs transition-all duration-200 rounded-lg focus:outline-none disabled:cursor-not-allowed active:scale-[0.98] select-none';
  
  const variants = {
    primary: 'bg-accent-600 hover:bg-accent-700 text-white disabled:bg-slate-200 disabled:text-slate-700 dark:disabled:bg-navy-card/45 dark:disabled:text-slate-500 shadow-sm hover:shadow border border-transparent',
    secondary: 'bg-white hover:bg-slate-100/50 text-slate-700 border border-slate-200 hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 dark:bg-navy-card dark:hover:bg-slate-200/5 dark:text-slate-200 dark:border-navy-border dark:disabled:bg-navy-950/20 dark:disabled:text-slate-600 dark:disabled:border-navy-border/40',
    danger: 'bg-red-650 hover:bg-red-700 text-white disabled:bg-slate-200 disabled:text-slate-500 dark:disabled:bg-navy-card/45 dark:disabled:text-slate-600 shadow-sm hover:shadow border border-transparent',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-950 disabled:text-slate-400 dark:text-slate-400 dark:hover:bg-slate-200/5 dark:hover:text-slate-100 dark:disabled:text-slate-600 border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
};

export default Button;

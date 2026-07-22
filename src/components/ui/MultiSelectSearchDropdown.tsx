import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface MultiSelectSearchDropdownProps {
  label?: string;
  value: string[]; // array of selected values
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  required?: boolean;
  options: DropdownOption[];
  helperText?: string;
  disabled?: boolean;
}

export const MultiSelectSearchDropdown: React.FC<MultiSelectSearchDropdownProps> = ({
  label,
  value = [],
  onChange,
  placeholder = 'Select options',
  error,
  className = '',
  required = false,
  options = [],
  helperText,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && !disabled && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, disabled]);

  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleToggleOption = (val: string) => {
    if (disabled) return;
    const newValue = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange(newValue);
  };

  const handleRemoveValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(value.filter((v) => v !== val));
  };

  return (
    <div className={`relative w-full flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <span className="text-[10px] md:text-xs font-bold text-slate-550 dark:text-slate-400 capitalize tracking-wider flex items-center gap-0.5">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </span>
      )}

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex flex-wrap items-center justify-between gap-1.5 px-3.5 py-2 border rounded-lg text-left text-xs min-h-[38px] transition-all duration-200 cursor-pointer
          ${disabled
            ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-60 border-slate-205 dark:border-slate-700'
            : 'bg-white dark:bg-[#0f1422]'
          }
          ${error
            ? 'border-red-500 focus-within:ring-red-500/25 focus-within:border-red-500'
            : 'border-slate-300 dark:border-navy-border focus-within:ring-accent-500/25 focus-within:border-accent-500'
          }`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {value.length > 0 ? (
            value.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-300 border border-accent-105 dark:border-accent-900/30 rounded-lg text-[10px] font-bold"
                >
                  {opt ? opt.label : val}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveValue(val, e)}
                    className="hover:text-accent-900 dark:hover:text-accent-100 shrink-0 font-extrabold focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-xs py-0.5">{placeholder}</span>
          )}
        </div>

        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 top-full bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-lg shadow-xl shadow-slate-200/60 dark:shadow-none overflow-hidden flex flex-col max-h-60">
          <div className="p-2 border-b border-slate-100 dark:border-navy-border" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              ref={searchInputRef}
              disabled={disabled}
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-border focus:border-accent-600 rounded text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-505 outline-none transition-colors"
            />
          </div>

          <div className="overflow-y-auto flex-1 max-h-40 custom-scrollbar bg-white dark:bg-navy-card">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleToggleOption(opt.value)}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors hover:bg-accent-50 dark:hover:bg-slate-800 hover:text-accent-700 dark:hover:text-slate-105 flex items-center justify-between
                      ${isSelected
                        ? 'bg-accent-50 dark:bg-[#1a233b] text-accent-600 dark:text-accent-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                      }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-xs text-slate-400 text-center dark:text-slate-500">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {error && <span className="text-xs font-medium text-red-550 mt-0.5">{error}</span>}
      {helperText && !error && <span className="text-xs font-medium text-slate-505 mt-0.5">{helperText}</span>}
    </div>
  );
};

export default MultiSelectSearchDropdown;

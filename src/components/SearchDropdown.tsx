import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface SearchDropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative w-full flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      {label && (
        <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2 bg-white dark:bg-[#0f1422] border ${
          error
            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
            : 'border-slate-300 dark:border-navy-border focus:ring-accent-500/25 focus:border-accent-500'
        } rounded-lg text-left text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200 outline-none focus:ring-4`}
      >
        <span className={selectedOption ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 top-full bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-lg shadow-xl shadow-slate-200/60 dark:shadow-none overflow-hidden flex flex-col max-h-60">
          <div className="p-2 border-b border-slate-100 dark:border-navy-border">
            <input
              type="text"
              ref={searchInputRef}
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-border focus:border-accent-600 rounded text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-colors"
            />
          </div>
          <div className="overflow-y-auto flex-1 max-h-40 custom-scrollbar bg-white dark:bg-navy-card">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-accent-50 dark:hover:bg-slate-800 hover:text-accent-700 dark:hover:text-slate-100 flex items-center justify-between ${
                    option.value === value ? 'bg-accent-50 dark:bg-slate-850 text-accent-600 dark:text-accent-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <svg className="w-3.5 h-3.5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="p-3 text-xs text-slate-400 text-center dark:text-slate-500">No options found</div>
            )}
          </div>
        </div>
      )}
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
    </div>
  );
};

export default SearchDropdown;

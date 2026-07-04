import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface SearchDropdownProps<T = any> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;

  options?: DropdownOption[];

  items?: T[];
  getValue?: (item: T) => string;
  getLabel?: (item: T) => string;
  searchMode?: 'client' | 'server';
  onSearch?: (searchTerm: string) => void;
  searchPlaceHolder?: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  helperText?: string;
  disabled?: boolean;
  selectedLabel?: string;
}

export function SearchDropdown<T = any>({
  label,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  className = '',
  options,
  items,
  getValue,
  getLabel,
  searchMode,
  onSearch,
  searchPlaceHolder = 'Search...',
  isLoading = false,
  hasMore = false,
  onLoadMore,
  helperText,
  disabled = false,
  selectedLabel,
}: SearchDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && !disabled && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, disabled]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  const itemsToUse = React.useMemo<any[]>(() => {
    return options ? options : items || [];
  }, [options, items]);

  const getValueToUse = React.useMemo(() => {
    return options
      ? (opt: any) => opt.value
      : getValue || ((item: any) => String(item));
  }, [options, getValue]);

  const getLabelToUse = React.useMemo(() => {
    return options
      ? (opt: any) => opt.label
      : getLabel || ((item: any) => String(item));
  }, [options, getLabel]);

  const searchModeToUse = React.useMemo(() => {
    return options ? 'client' : searchMode || 'server';
  }, [options, searchMode]);

  const selectedItem = itemsToUse.find(
    (item) => getValueToUse(item) === value
  );
  const filteredItems = React.useMemo(() => {
    if (searchModeToUse === 'client') {
      return itemsToUse.filter((item) =>
        getLabelToUse(item)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    return itemsToUse;
  }, [
    itemsToUse,
    searchModeToUse,
    searchTerm,
    getLabelToUse,
  ]);

  const handleSelect = (itemValue: string) => {
    if (disabled) return;

    onChange(itemValue);
    setIsOpen(false);
    setSearchTerm('');

    if (searchModeToUse === 'server' && onSearch) {
      onSearch('');
    }
  };

  const handleSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (disabled) return;

    const val = e.target.value;
    setSearchTerm(val);

    if (searchModeToUse === 'server' && onSearch) {
      onSearch(val);
    }
  };

  const handleScroll = (
    e: React.UIEvent<HTMLDivElement>
  ) => {
    const target = e.currentTarget;

    if (
      target.scrollHeight - target.scrollTop <=
      target.clientHeight + 10
    ) {
      if (hasMore && !isLoading && onLoadMore) {
        onLoadMore();
      }
    }
  };

  return (
    <div
      className={`relative w-full flex flex-col gap-1.5 ${className}`}
      ref={containerRef}
    >
      {label && (
        <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 border rounded-lg text-left text-sm transition-all duration-200 outline-none
          ${disabled
            ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-60 border-slate-200 dark:border-slate-700'
            : 'bg-white dark:bg-[#0f1422]'
          }
          ${error
            ? 'border-red-500 focus:ring-red-500/25 focus:border-red-500'
            : 'border-slate-300 dark:border-navy-border focus:ring-accent-500/25 focus:border-accent-500'
          }`}
      >
        <span
          className={
            selectedItem || selectedLabel
              ? 'text-slate-800 dark:text-slate-200'
              : 'text-slate-400 dark:text-slate-500'
          }
        >
          {selectedItem
            ? getLabelToUse(selectedItem)
            : selectedLabel
            ? selectedLabel
            : placeholder}
        </span>

        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 top-full bg-white dark:bg-navy-card border border-slate-200 dark:border-navy-border rounded-lg shadow-xl shadow-slate-200/60 dark:shadow-none overflow-hidden flex flex-col max-h-60">
          <div className="p-2 border-b border-slate-100 dark:border-navy-border">
            <input
              type="text"
              ref={searchInputRef}
              disabled={disabled}
              placeholder={searchPlaceHolder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-border focus:border-accent-600 rounded text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="overflow-y-auto flex-1 max-h-40 custom-scrollbar bg-white dark:bg-navy-card"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const itemValue = getValueToUse(item);
                const itemLabel = getLabelToUse(item);
                const isSelected = itemValue === value;

                return (
                  <button
                    key={itemValue}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      !disabled &&
                      handleSelect(itemValue)
                    }
                    className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-accent-50 dark:hover:bg-slate-800 hover:text-accent-700 dark:hover:text-slate-100 flex items-center justify-between
                      ${isSelected
                        ? 'bg-accent-50 dark:bg-slate-850 text-accent-600 dark:text-accent-400 font-medium'
                        : 'text-slate-700 dark:text-slate-300'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span>{itemLabel}</span>

                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 text-accent-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              !isLoading && (
                <div className="p-3 text-xs text-slate-400 text-center dark:text-slate-500">
                  No options found
                </div>
              )
            )}

            {isLoading && (
              <div className="p-3 text-xs text-slate-400 text-center dark:text-slate-500 flex items-center justify-center gap-1.5 animate-pulse">
                Loading...
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="text-xs font-medium text-red-500 mt-0.5">
          {error}
        </span>
      )}

      {helperText && !error && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          {helperText}
        </span>
      )}
    </div>
  );
}

export default SearchDropdown;
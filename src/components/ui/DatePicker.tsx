import React, { useState, useEffect, useRef } from 'react';
import {
  Popover,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface DatePickerProps {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  disableFuture?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
  placeholder = 'DD/MM/YYYY',
  className = '',
  error,
  disableFuture = true,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [isYearView, setIsYearView] = useState(false);
  const [localError, setLocalError] = useState('');

  // Convert YYYY-MM-DD database format to DD/MM/YYYY display format
  const getDisplayValue = (val: string) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return val;
  };

  const [inputValue, setInputValue] = useState(() => getDisplayValue(value));

  // Parse YYYY-MM-DD
  const parseDate = (val: string) => {
    if (!val) return new Date();
    const parts = val.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date();
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? parseDate(value) : null);
  const [viewYear, setViewYear] = useState(() => (selectedDate || new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selectedDate || new Date()).getMonth());

  const yearListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const parsed = parseDate(value);
      setSelectedDate(parsed);
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
      setInputValue(getDisplayValue(value));
      setLocalError('');
    } else {
      setSelectedDate(null);
      setInputValue('');
      setLocalError('');
    }
  }, [value]);

  // Scroll active year into view when entering year view
  useEffect(() => {
    if (isYearView && yearListRef.current) {
      const activeEl = yearListRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [isYearView]);

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only open if click is not on clear button
    const target = event.target as HTMLElement;
    if (target.closest('.clear-btn')) return;
    setAnchorEl(event.currentTarget);
    setIsYearView(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation();
    onChange('');
    setInputValue('');
    handleClose();
  };

  const handleDaySelect = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    handleClose();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleYearSelect = (year: number) => {
    setViewYear(year);
    setIsYearView(false);
  };

  const getMaskedValue = (digits: string) => {
    const d = digits.substring(0, 2);
    const m = digits.substring(2, 4);
    const y = digits.substring(4, 8);
    
    let dayPart = d;
    if (d.length === 0) dayPart = 'DD';
    else if (d.length === 1) dayPart = d + 'D';
    
    let monthPart = m;
    if (m.length === 0) monthPart = 'MM';
    else if (m.length === 1) monthPart = m + 'M';
    
    let yearPart = y;
    if (y.length === 0) yearPart = 'YYYY';
    else if (y.length === 1) yearPart = y + 'YYY';
    else if (y.length === 2) yearPart = y + 'YY';
    else if (y.length === 3) yearPart = y + 'Y';
    
    return `${dayPart}/${monthPart}/${yearPart}`;
  };

  const getCursorPos = (digitsLen: number) => {
    if (digitsLen === 0) return 0;
    if (digitsLen === 1) return 1;
    if (digitsLen === 2) return 3; // after 'DD/'
    if (digitsLen === 3) return 4; // after 'DD/M'
    if (digitsLen === 4) return 6; // after 'DD/MM/'
    return digitsLen + 2; // after 'DD/MM/Y...'
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    let clean = rawVal.replace(/\D/g, ''); // Digits only
    if (clean.length > 8) {
      clean = clean.substring(0, 8);
    }

    if (clean.length === 0) {
      setInputValue('');
      onChange('');
      setSelectedDate(null);
      setLocalError('');
      return;
    }

    // Always show/maintain the masked template structure
    const masked = getMaskedValue(clean);
    setInputValue(masked);

    // Adjust cursor position on next tick to avoid jumping to the end
    const nextCursor = getCursorPos(clean.length);
    requestAnimationFrame(() => {
      if (e.target) {
        e.target.setSelectionRange(nextCursor, nextCursor);
      }
    });

    // Validate segments dynamically as they type
    let err = '';
    if (clean.length >= 2) {
      const day = parseInt(clean.substring(0, 2), 10);
      if (day < 1 || day > 31) {
        err = 'Invalid day (01-31)';
      }
    }
    if (clean.length >= 4 && !err) {
      const day = parseInt(clean.substring(0, 2), 10);
      const month = parseInt(clean.substring(2, 4), 10);
      if (month < 1 || month > 12) {
        err = 'Invalid month (01-12)';
      } else {
        const yearFallback = clean.length === 8 ? parseInt(clean.substring(4, 8), 10) : 2020;
        const maxDays = new Date(yearFallback, month, 0).getDate();
        if (day > maxDays) {
          err = `Invalid day for this month (max ${maxDays})`;
        }
      }
    }
    if (clean.length === 8 && !err) {
      const day = parseInt(clean.substring(0, 2), 10);
      const month = parseInt(clean.substring(2, 4), 10);
      const year = parseInt(clean.substring(4, 8), 10);
      if (year < 1900) {
        err = 'Invalid year';
      } else {
        const cellDate = new Date(year, month - 1, day);
        if (disableFuture && cellDate > new Date()) {
          err = 'Date cannot be in the future';
        }
      }
    }
    setLocalError(err);

    // Jump calendar month and year as they type month & year parts
    if (clean.length >= 4) {
      const m = parseInt(clean.substring(2, 4), 10);
      if (m >= 1 && m <= 12) {
        setViewMonth(m - 1);
      }
    }
    if (clean.length === 8) {
      const y = parseInt(clean.substring(4, 8), 10);
      if (y >= 1900 && y <= new Date().getFullYear() + 5) {
        setViewYear(y);
      }
    }

    // Sync state only if fully typed and valid
    if (clean.length === 8 && !err) {
      const day = parseInt(clean.substring(0, 2), 10);
      const month = parseInt(clean.substring(2, 4), 10);
      const year = parseInt(clean.substring(4, 8), 10);
      const formattedMonth = String(month).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

      const newDate = new Date(year, month - 1, day);
      setSelectedDate(newDate);
      onChange(dateStr);
    } else {
      onChange('');
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const maxSelectableYear = disableFuture ? currentYear : currentYear + 5;
  const years = Array.from({ length: 120 }, (_, i) => maxSelectableYear - i);

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const isDark = document.documentElement.classList.contains('dark');
  const accentColor = isDark ? '#ffffff' : '#ab8e6d';

  return (
    <div className={`w-full ${className}`}>
      <div onClick={handleOpen} className="cursor-pointer">
        <TextField
          fullWidth
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          error={!!error || !!localError}
          helperText={error || localError}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {value ? (
                    <IconButton onClick={handleClear} size="small" className="clear-btn" sx={{ mr: 0.5 }}>
                      <CloseIcon sx={{ fontSize: '1rem', color: isDark ? '#94a3b8' : '#64748b' }} />
                    </IconButton>
                  ) : null}
                  <CalendarTodayIcon sx={{ fontSize: '1.1rem', color: isDark ? '#94a3b8' : '#64748b' }} />
                </InputAdornment>
              ),
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '0.5rem',
              backgroundColor: isDark ? '#0f1422' : '#ffffff',
              fontSize: '0.875rem',
              color: isDark ? '#f1f5f9' : '#0f172a',
              '& fieldset': {
                borderColor: isDark ? '#1c1e35' : '#cbd5e1',
              },
              '&:hover fieldset': {
                borderColor: isDark ? '#ab8e6d' : '#ab8e6d',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ab8e6d',
                borderWidth: '1.5px',
              },
            },
            '& .MuiFormHelperText-root': {
              mx: 0,
              mt: 0.5,
              fontSize: '0.75rem',
            },
          }}
        />
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableAutoFocus
        disableEnforceFocus
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              width: 320,
              borderRadius: '0.75rem',
              boxShadow: isDark
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.6)'
                : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              border: `1px solid ${isDark ? '#2e2e2e' : '#e2e8f0'}`,
              color: isDark ? '#ffffff' : '#000000',
              fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
            },
          }
        }}
      >
        {/* MUI DatePicker Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '16px' }}>
          {/* Month/Year selector toggle */}
          <div
            onClick={() => setIsYearView(!isYearView)}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            className="hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: isDark ? '#ffffff' : '#2e2e2e' }}>
              {months[viewMonth]} {viewYear}
            </Typography>
            <ArrowDropDownIcon
              sx={{
                color: isDark ? '#94a3b8' : '#64748b',
                transform: isYearView ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
                ml: 0.5,
              }}
            />
          </div>

          {/* Previous/Next buttons (only shown in calendar grid view) */}
          {!isYearView && (
            <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
              <IconButton onClick={handlePrevMonth} size="small" sx={{ color: isDark ? '#ffffff' : '#5f6368' }}>
                <ChevronLeftIcon />
              </IconButton>
              <IconButton onClick={handleNextMonth} size="small" sx={{ color: isDark ? '#ffffff' : '#5f6368' }}>
                <ChevronRightIcon />
              </IconButton>
            </div>
          )}
        </div>

        {isYearView ? (
          /* Year Select List */
          <div
            ref={yearListRef}
            style={{
              height: '240px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingRight: '4px',
            }}
          >
            {years.map((y) => {
              const isActive = y === viewYear;
              return (
                <div
                  key={y}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => handleYearSelect(y)}
                  style={{
                    padding: '8px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 700 : 400,
                    backgroundColor: isActive ? (isDark ? '#333333' : '#f1f5f9') : 'transparent',
                    color: isActive ? accentColor : (isDark ? '#e0e0e0' : '#424242'),
                  }}
                  className="hover:bg-slate-100 dark:hover:bg-neutral-800"
                >
                  {y}
                </div>
              );
            })}
          </div>
        ) : (
          /* Calendar Grid view */
          <div>
            {/* Days of Week Labels using CSS Grid directly to prevent layout collapses */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '2px',
                textAlign: 'center',
                marginBottom: '8px',
              }}
            >
              {daysOfWeek.map((day, idx) => (
                <Typography
                  key={`${day}-${idx}`}
                  variant="caption"
                  sx={{
                    fontWeight: 500,
                    color: isDark ? '#888888' : '#757575',
                    fontSize: '0.75rem',
                  }}
                >
                  {day}
                </Typography>
              ))}
            </div>

            {/* Days Grid using CSS Grid directly to ensure exactly 7-columns alignment */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                justifyItems: 'center',
              }}
            >
              {/* Pad leading days of month */}
              {Array.from({ length: firstDay }).map((_, idx) => (
                <div key={`pad-${idx}`} style={{ width: 32, height: 32 }} />
              ))}

              {/* Day numbers */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const isSelected =
                  selectedDate &&
                  selectedDate.getFullYear() === viewYear &&
                  selectedDate.getMonth() === viewMonth &&
                  selectedDate.getDate() === dayNum;

                const cellDate = new Date(viewYear, viewMonth, dayNum);
                const isFuture = disableFuture && cellDate > new Date();

                return (
                  <div key={`day-${dayNum}`} style={{ width: 32, height: 32 }}>
                    <div
                      onClick={() => !isFuture && handleDaySelect(dayNum)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 32,
                        width: 32,
                        borderRadius: '50%',
                        cursor: isFuture ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 400,
                        transition: 'all 0.1s ease',
                        border: isSelected
                          ? `1px solid ${isDark ? '#ffffff' : '#000000'}`
                          : '1px solid transparent',
                        backgroundColor: isSelected
                          ? 'transparent'
                          : 'transparent',
                        color: isFuture
                          ? (isDark ? '#444444' : '#cccccc')
                          : isSelected
                            ? (isDark ? '#ffffff' : '#000000')
                            : (isDark ? '#e0e0e0' : '#424242'),
                      }}
                      className={
                        isFuture
                          ? ''
                          : isSelected
                            ? ''
                            : 'hover:bg-slate-100 dark:hover:bg-neutral-800'
                      }
                    >
                      {dayNum}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Popover>
    </div>
  );
};

export default DatePicker;

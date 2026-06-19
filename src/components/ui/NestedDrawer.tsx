import React, { useEffect } from 'react';

interface NestedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  stackIndex?: number; // 0 for primary, 1 for secondary/nested
  isTopMost?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const NestedDrawer: React.FC<NestedDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  stackIndex = 0,
  isTopMost = true,
  size = 'md'
}) => {
  // Close on Escape key press (only if this drawer is the top-most open one)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && isTopMost) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isTopMost, onClose]);

  if (!isOpen) return null;

  // Size constraints
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md md:max-w-lg',
    lg: 'max-w-lg md:max-w-2xl',
  };

  // Stack positioning
  const stackOffsetClass = stackIndex > 0
    ? 'translate-x-0 z-[110]'
    : !isTopMost
      ? '-translate-x-8 opacity-75 z-[100] scale-[0.97] origin-right pointer-events-none'
      : 'translate-x-0 z-[100]';

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      {/* Backdrop (overlay matches depth) */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          stackIndex > 0 ? 'bg-slate-900/25 z-[105]' : 'z-[95]'
        }`}
      />

      {/* Drawer Container */}
      <div
        className={`fixed inset-y-0 right-0 w-full ${sizes[size]} bg-white dark:bg-navy-card border-l border-slate-200 dark:border-navy-border flex flex-col shadow-2xl transition-all duration-300 ease-out transform ${stackOffsetClass}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-navy-border bg-white/80 dark:bg-navy-card/85 backdrop-blur-md sticky top-0 z-10">
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default NestedDrawer;

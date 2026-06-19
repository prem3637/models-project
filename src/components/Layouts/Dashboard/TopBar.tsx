import React from 'react';

interface User {
  name?: string;
  fullName?: string;
  email: string;
  role?: {
    id: string;
    name: string;
    description: string;
  };
}

interface TopBarProps {
  onToggleSidebar: () => void;
  pageTitle: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: User | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  pageTitle,
  darkMode,
  onToggleDarkMode,
  user
}) => {
  return (
    <header className="h-16 bg-white/80 dark:bg-navy-card/80 backdrop-blur-md border-b border-slate-200 dark:border-navy-border flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-950 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-slate-100">{pageTitle}</h1>
      </div>

      {/* User Controls / Dynamic Role Selector */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-navy-card border border-slate-200 dark:border-navy-border transition-all duration-200 cursor-pointer"
          title="Toggle Theme"
        >
          {darkMode ? (
            // Sun Icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            // Moon Icon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* User Role Display */}
        {user && user.role && (
          <div className="flex items-center gap-2 bg-slate-105 dark:bg-navy-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-border text-slate-700 dark:text-slate-300 transition-colors duration-200">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Role:
            </span>
            <span className="text-xs text-accent-600 dark:text-accent-400 font-extrabold pr-1">
              {user.role.name}
            </span>
          </div>
        )}

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-navy-border">
          <div className="w-8 h-8 rounded-full bg-accent-50 dark:bg-accent-950 text-accent-600 dark:text-accent-300 border border-accent-200 dark:border-accent-800/40 flex items-center justify-center font-bold text-xs shadow-sm">
            {user ? (user.fullName ?? user.name ?? 'U').charAt(0) : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-3">{user ? (user.fullName ?? user.name ?? 'User') : 'User'}</p>
            <span className="text-[10px] text-slate-500 dark:text-slate-450 font-medium">{user ? user.email : 'user@agency.com'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

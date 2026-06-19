import React from 'react';

interface SidebarFooterProps {
  sidebarOpen: boolean;
  onLogout: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ sidebarOpen, onLogout }) => {
  return (
    <div className="p-4 border-t border-slate-200 dark:border-navy-border">
      <button
        onClick={onLogout}
        className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300 transition-colors ${
          !sidebarOpen && 'md:justify-center'
        }`}
      >
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        {sidebarOpen && <span className="whitespace-nowrap font-medium">Logout</span>}
      </button>
    </div>
  );
};

export default SidebarFooter;

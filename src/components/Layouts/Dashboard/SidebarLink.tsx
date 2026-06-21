import React from 'react';
import { Link } from 'react-router-dom';

export interface NavChildItem {
  id: string;
  title: string;
  path: string;
}

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  action: string;
  subject: string;
  children?: NavChildItem[];
}

interface SidebarLinkProps {
  item: NavItem;
  isActive: boolean;
  sidebarOpen: boolean;
  settingsExpanded: boolean;
  onToggleSettings: () => void;
  currentPathname: string;
}

// Simple SVG mapping for navigation icons
export const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Dashboard':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      );
    case 'People':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'Users':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'Roles':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'Settings':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
  }
};

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  item,
  isActive,
  sidebarOpen,
  settingsExpanded,
  onToggleSettings,
  currentPathname
}) => {
  const hasChildren = !!item.children;

  if (hasChildren) {
    return (
      <div className="flex flex-col">
        <button
          onClick={onToggleSettings}
          className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
            isActive
              ? 'bg-slate-200/60 dark:bg-white/10 text-slate-800 dark:text-white font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/35 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className={`shrink-0 ${isActive ? 'text-slate-700 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
              {getIcon(item.icon)}
            </span>
            {sidebarOpen && <span className="whitespace-nowrap">{item.title}</span>}
          </div>
          {sidebarOpen && (
            <svg className={`w-4 h-4 transition-transform duration-200 ${settingsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
        {settingsExpanded && sidebarOpen && (
          <div className="pl-9 mt-1 space-y-1">
            {item.children!.map(child => {
              const isChildActive = currentPathname === child.path;
              return (
                <Link
                  key={child.id}
                  to={child.path}
                  className={`flex items-center gap-4 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                    isChildActive
                      ? 'bg-slate-200/60 dark:bg-white/10 text-slate-800 dark:text-white font-semibold border-r-4 border-accent-600 dark:border-white'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/35 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{child.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-4 px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
        isActive
          ? 'bg-slate-200/60 dark:bg-white/10 text-slate-800 dark:text-white font-semibold border-r-4 border-accent-600 dark:border-white'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/35 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <span className={`shrink-0 ${isActive ? 'text-slate-700 dark:text-accent-400' : 'text-slate-400 dark:text-slate-500'}`}>
        {getIcon(item.icon)}
      </span>
      {sidebarOpen && <span className="whitespace-nowrap">{item.title}</span>}
    </Link>
  );
};

export default SidebarLink;

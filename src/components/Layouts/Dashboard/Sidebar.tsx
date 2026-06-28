import React from 'react';
import SidebarLink, { NavItem } from './SidebarLink';
import SidebarFooter from './SidebarFooter';

interface SidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  filteredNavItems: NavItem[];
  settingsExpanded: boolean;
  onToggleSettings: () => void;
  currentPathname: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  onToggleSidebar,
  filteredNavItems,
  settingsExpanded,
  onToggleSettings,
  currentPathname,
  onLogout
}) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-slate-100 dark:bg-navy-card border-r border-slate-200 dark:border-navy-border flex flex-col z-50 transition-all duration-300 overflow-hidden ${
        sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0 md:w-20'
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-navy-border relative justify-center">
        <div className="flex items-center justify-center overflow-hidden w-full">
          {sidebarOpen ? (
            <img src="/logo.png" alt="Pizlio Models Logo" className="h-8 object-contain dark:invert select-none" />
          ) : (
            <img src="/favicon.ico" alt="Pizlio Models" className="w-8 h-8 object-contain dark:invert select-none" />
          )}
        </div>
        {sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-950 md:hidden cursor-pointer transition-colors"
            title="Close Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Sidebar Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map(item => {
          const hasChildren = !!item.children;
          const isSettingsActive = currentPathname.startsWith('/settings');
          const isActive = hasChildren
            ? isSettingsActive
            : (currentPathname === item.path || (item.path !== '/dashboard' && currentPathname.startsWith(item.path)));

          return (
            <SidebarLink
              key={item.id}
              item={item}
              isActive={isActive}
              sidebarOpen={sidebarOpen}
              settingsExpanded={settingsExpanded}
              onToggleSettings={onToggleSettings}
              currentPathname={currentPathname}
            />
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <SidebarFooter sidebarOpen={sidebarOpen} onLogout={onLogout} />
    </aside>
  );
};

export default Sidebar;

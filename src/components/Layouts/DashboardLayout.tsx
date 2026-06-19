import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/auth';
import { toggleSidebar, toggleDarkMode } from '../../redux/slices/ui';
import { useAppAbility } from '../../context/AbilityContext';
import navigationData from '../../routes/navigation.json';
import Sidebar from './Dashboard/Sidebar';
import TopBar from './Dashboard/TopBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const ability = useAppAbility();
  
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarOpen, darkMode } = useAppSelector((state) => state.ui);

  const [settingsExpanded, setSettingsExpanded] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Filter navigation items by CASL ability
  const filteredNavItems = navigationData.filter(item => {
    return ability.can(item.action as any, item.subject as any);
  });

  const getPageTitle = () => {
    if (location.pathname === '/settings/profile' || location.pathname === '/settings') return 'Profile';
    if (location.pathname === '/roles') return 'Role Configuration';
    if (location.pathname.startsWith('/models/')) return 'Talent Profile Details';
    const matched = navigationData.find(item => item.path === location.pathname);
    if (matched) return matched.title;
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-200 flex font-sans overflow-x-hidden transition-colors duration-200">
      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => dispatch(toggleSidebar())}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar Component */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => dispatch(toggleSidebar())}
        filteredNavItems={filteredNavItems}
        settingsExpanded={settingsExpanded}
        onToggleSettings={() => setSettingsExpanded(!settingsExpanded)}
        currentPathname={location.pathname}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'pl-0 md:pl-64' : 'pl-0 md:pl-20'
        }`}
      >
        {/* TopBar Component */}
        <TopBar
          onToggleSidebar={() => dispatch(toggleSidebar())}
          pageTitle={getPageTitle()}
          darkMode={darkMode}
          onToggleDarkMode={() => dispatch(toggleDarkMode())}
          user={user}
        />

        {/* Dashboard Pages Content */}
        <main className="flex-1 p-6 bg-slate-50 dark:bg-navy-950 overflow-y-auto min-w-0 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

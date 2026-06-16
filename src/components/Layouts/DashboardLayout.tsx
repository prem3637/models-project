import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { setRole, logout, UserRole } from '../../store/authSlice';
import { toggleSidebar, toggleDarkMode } from '../../store/uiSlice';
import { useAppAbility } from '../../context/AbilityContext';
import navigationData from '../../routes/navigation.json';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const ability = useAppAbility();
  
  const { user, role } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen, darkMode } = useSelector((state: RootState) => state.ui);

  const [settingsExpanded, setSettingsExpanded] = useState(true);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    dispatch(setRole(newRole));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Filter navigation items by CASL ability
  const filteredNavItems = navigationData.filter(item => {
    return ability.can(item.action as any, item.subject as any);
  });

  // Simple SVG mapping for navigation icons
  const getIcon = (iconName: string) => {
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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white dark:bg-navy-card border-r border-slate-200 dark:border-navy-border flex flex-col z-50 transition-all duration-300 overflow-hidden ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-navy-border justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center text-white font-extrabold shrink-0 shadow-md">
              R
            </div>
            {sidebarOpen && (
              <span className="font-extrabold text-sm tracking-wider text-slate-800 dark:text-slate-100 whitespace-nowrap uppercase">
                RBC Models
              </span>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-950 md:hidden cursor-pointer transition-colors"
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
            const isSettingsActive = location.pathname.startsWith('/settings');
            const isActive = hasChildren
              ? isSettingsActive
              : (location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)));

            if (hasChildren) {
              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    onClick={() => setSettingsExpanded(!settingsExpanded)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-accent-50 dark:bg-white/10 text-accent-700 dark:text-white font-semibold'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`shrink-0 ${isActive ? 'text-accent-600 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
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
                        const isChildActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.id}
                            to={child.path}
                            className={`flex items-center gap-4 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${
                              isChildActive
                                ? 'bg-accent-50 dark:bg-white/10 text-accent-700 dark:text-white font-semibold border-r-4 border-accent-600 dark:border-white'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
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
                key={item.id}
                to={item.path}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-50 dark:bg-white/10 text-accent-700 dark:text-white font-semibold border-r-4 border-accent-600 dark:border-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-accent-600 dark:text-accent-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {getIcon(item.icon)}
                </span>
                {sidebarOpen && <span className="whitespace-nowrap">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-navy-border">
          <button
            onClick={handleLogout}
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
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${
          sidebarOpen ? 'pl-0 md:pl-64' : 'pl-0 md:pl-20'
        }`}
      >
        {/* Header */}
        <header className="h-16 bg-white/80 dark:bg-navy-card/80 backdrop-blur-md border-b border-slate-200 dark:border-navy-border flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-950 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-slate-100">{getPageTitle()}</h1>
          </div>

          {/* User Controls / Dynamic Role Selector */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg bg-slate-50 dark:bg-navy-950 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-card border border-slate-200 dark:border-navy-border transition-all duration-200"
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

            {/* Dynamic Role Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-navy-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-border text-slate-700 dark:text-slate-300 transition-colors duration-200">
              <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Role:
              </span>
              <select
                value={role}
                onChange={handleRoleChange}
                className="bg-transparent text-xs text-accent-600 dark:text-accent-400 font-extrabold focus:outline-none cursor-pointer pr-1 border-none outline-none"
              >
                <option value="admin" className="bg-white dark:bg-navy-card text-slate-800 dark:text-slate-200">Admin</option>
                <option value="editor" className="bg-white dark:bg-navy-card text-slate-800 dark:text-slate-200">Editor</option>
                <option value="viewer" className="bg-white dark:bg-navy-card text-slate-800 dark:text-slate-200">Viewer</option>
              </select>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-navy-border">
              <div className="w-8 h-8 rounded-full bg-accent-50 dark:bg-accent-950 text-accent-600 dark:text-accent-300 border border-accent-200 dark:border-accent-800/40 flex items-center justify-center font-bold text-xs shadow-sm">
                {user && user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-3">{user ? user.name : 'User'}</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-450 font-medium">{user ? user.email : 'user@agency.com'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Content */}
        <main className="flex-1 p-6 bg-slate-50 dark:bg-navy-950 overflow-y-auto min-w-0 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { setRole, logout, UserRole } from '../../store/authSlice';
import { toggleSidebar } from '../../store/uiSlice';
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
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
    const matched = navigationData.find(item => item.path === location.pathname);
    if (matched) return matched.title;
    if (location.pathname.startsWith('/models/')) return 'Talent Profile Details';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans overflow-x-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col z-35 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center text-white font-extrabold shrink-0 shadow-md">
              R
            </div>
            {sidebarOpen && (
              <span className="font-extrabold text-sm tracking-wider text-slate-800 whitespace-nowrap uppercase">
                RBC Models
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-50 text-accent-700 font-semibold border-r-4 border-accent-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-accent-600' : 'text-slate-400'}`}>
                  {getIcon(item.icon)}
                </span>
                {sidebarOpen && <span className="whitespace-nowrap">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors ${
              !sidebarOpen && 'justify-center'
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
          sidebarOpen ? 'pl-64' : 'pl-20'
        }`}
      >
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base md:text-lg font-extrabold text-slate-800">{getPageTitle()}</h1>
          </div>

          {/* User Controls / Dynamic Role Selector */}
          <div className="flex items-center gap-4">
            {/* Dynamic Role Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
              <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wide">
                Role:
              </span>
              <select
                value={role}
                onChange={handleRoleChange}
                className="bg-transparent text-xs text-accent-600 font-extrabold focus:outline-none cursor-pointer pr-1"
              >
                <option value="admin" className="bg-white text-slate-800">Admin</option>
                <option value="editor" className="bg-white text-slate-800">Editor</option>
                <option value="viewer" className="bg-white text-slate-800">Viewer</option>
              </select>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-accent-50 text-accent-600 border border-accent-200 flex items-center justify-center font-bold text-xs shadow-sm">
                {user ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-extrabold text-slate-800 leading-3">{user ? user.name : 'User'}</p>
                <span className="text-[10px] text-slate-500 font-medium">{user ? user.email : 'user@agency.com'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Content */}
        <main className="flex-1 p-6 bg-slate-50 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { Actions, Subjects } from '../context/ability';
import { useAppAbility } from '../context/AbilityContext';
import AuthLayout from '../components/Layouts/AuthLayout';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import routesConfig, { RouteConfig } from './routesConfig';

// Private Route Guard
interface GuardProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<GuardProps> = ({ children }) => {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Guard (redirects to /dashboard if already logged in)
const PublicRoute: React.FC<GuardProps> = ({ children }) => {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// CASL Permission Gate Guard for Page Routes
interface GateProps {
  action: Actions;
  subject: Subjects;
  children: React.ReactNode;
}

const PermissionGate: React.FC<GateProps> = ({ action, subject, children }) => {
  const ability = useAppAbility();
  
  if (ability.can(action, subject)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto mt-10 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-550 flex items-center justify-center mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-base font-extrabold text-slate-800 mb-1">Access Restricted</h2>
      <p className="text-xs text-slate-500">
        Your current role does not possess the CASL permissions required to view this module.
      </p>
      <p className="text-[10px] text-accent-600 font-bold mt-4 uppercase tracking-wider">
        TIP: Switch your role to "Admin" in the top header selector to override limits.
      </p>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {routesConfig.map((route: RouteConfig) => {
        const Component = route.element;
        
        let content = <Component />;
        if (route.requiredPermission) {
          content = (
            <PermissionGate
              action={route.requiredPermission.action}
              subject={route.requiredPermission.subject}
            >
              {content}
            </PermissionGate>
          );
        }

        if (route.isPrivate) {
          content = (
            <PrivateRoute>
              <DashboardLayout>{content}</DashboardLayout>
            </PrivateRoute>
          );
        } else {
          content = (
            <PublicRoute>
              <AuthLayout>{content}</AuthLayout>
            </PublicRoute>
          );
        }

        return <Route key={route.path} path={route.path} element={content} />;
      })}

      {/* Static Redirections */}
      <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

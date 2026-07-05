import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import AuthLayout from '../components/Layouts/AuthLayout';
import DashboardLayout from '../components/Layouts/DashboardLayout';
import routesConfig, { RouteConfig } from './routesConfig';
import PermissionGate from '../components/ui/PermissionGate';
import { flattenRoutes } from '../utils/helperfunction';

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

export const AppRoutes: React.FC = () => {
  const flatRoutes = flattenRoutes(routesConfig);

  return (
    <Routes>
      {flatRoutes.map((route: RouteConfig) => {
        const Component = route.element!;
        const action = route.requiredPermission?.action;
        const subject = route.requiredPermission?.subject;

        let content = <Component />;
        if (action && subject) {
          content = (
            <PermissionGate
              action={action}
              subject={subject}
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
        } else if (route.bypassAuthGuard) {
          // Render the component directly without Auth guards or layouts
          content = <>{content}</>;
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

import React from 'react';
import { Actions, Subjects } from '../context/ability';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ModelDashboard from '../pages/models/ModelDashboard';
import ModelList from '../pages/models/ModelList';
import ModelDetails from '../pages/models/ModelDetails';
import UserManagement from '../pages/users/UserManagement';
import RoleConfiguration from '../pages/roles/RoleConfiguration';
import Profile from '../pages/admin/Profile';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  isPrivate?: boolean;
  requiredPermission?: {
    action: Actions;
    subject: Subjects;
  };
}

export const routesConfig: RouteConfig[] = [
  {
    path: '/login',
    element: Login,
    isPrivate: false
  },
  {
    path: '/forgot-password',
    element: ForgotPassword,
    isPrivate: false
  },
  {
    path: '/dashboard',
    element: ModelDashboard,
    isPrivate: true
  },
  {
    path: '/models',
    element: ModelList,
    isPrivate: true
  },
  {
    path: '/models/:id',
    element: ModelDetails,
    isPrivate: true,
    requiredPermission: {
      action: 'read',
      subject: 'Model'
    }
  },
  {
    path: '/users',
    element: UserManagement,
    isPrivate: true,
    requiredPermission: {
      action: 'read',
      subject: 'User'
    }
  },
  {
    path: '/roles',
    element: RoleConfiguration,
    isPrivate: true,
    requiredPermission: {
      action: 'read',
      subject: 'User'
    }
  },
  {
    path: '/settings/profile',
    element: Profile,
    isPrivate: true,
    requiredPermission: {
      action: 'manage',
      subject: 'Settings'
    }
  }
];

export default routesConfig;

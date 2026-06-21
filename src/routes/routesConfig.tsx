import React from 'react';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ModelDashboard from '../pages/models/ModelDashboard';
import ModelList from '../pages/models/ModelList';
import ModelDetails from '../pages/models/ModelDetails';
import ModelCreatePage from '../pages/models/ModelCreatePage';
import ModelEditPage from '../pages/models/ModelEditPage';
import UserManagement from '../pages/users/UserManagement';
import UserCreatePage from '../pages/users/UserCreatePage';
import UserEditPage from '../pages/users/UserEditPage';
import RoleConfiguration from '../pages/roles/RoleConfiguration';
import RoleCreatePage from '../pages/roles/RoleCreatePage';
import RoleEditPage from '../pages/roles/RoleEditPage';
import RoleViewPage from '../pages/roles/RoleViewPage';
import Profile from '../pages/admin/Profile';

export interface RouteConfig {
  path?: string;
  element?: React.ComponentType;
  isPrivate?: boolean;
  requiredPermission?: {
    action: string;
    subject: string;
  };
  sidebar?: {
    id: string;
    title: string;
    icon?: string;
  };
  children?: RouteConfig[];
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
    isPrivate: true,
    requiredPermission: {
      action: 'browse',
      subject: 'dashboard'
    },
    sidebar: {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'Dashboard'
    }
  },
  {
    path: '/models',
    element: ModelList,
    isPrivate: true,
    requiredPermission: {
      action: 'browse',
      subject: 'models'
    },
    sidebar: {
      id: 'models',
      title: 'Model Management',
      icon: 'People'
    }
  },
  {
    path: '/models/new',
    element: ModelCreatePage,
    isPrivate: true,
    requiredPermission: {
      action: 'create',
      subject: 'models'
    }
  },
  {
    path: '/models/:id/edit',
    element: ModelEditPage,
    isPrivate: true,
    requiredPermission: {
      action: 'update',
      subject: 'models'
    }
  },
  {
    path: '/models/:id',
    element: ModelDetails,
    isPrivate: true,
    requiredPermission: {
      action: 'read',
      subject: 'models'
    }
  },
  {
    path: '/users',
    element: UserManagement,
    isPrivate: true,
    requiredPermission: {
      action: 'browse',
      subject: 'users'
    },
    sidebar: {
      id: 'users',
      title: 'Users',
      icon: 'Users'
    }
  },
  {
    path: '/users/new',
    element: UserCreatePage,
    isPrivate: true,
    requiredPermission: {
      action: 'create',
      subject: 'users'
    }
  },
  {
    path: '/users/:id/edit',
    element: UserEditPage,
    isPrivate: true,
    requiredPermission: {
      action: 'update',
      subject: 'users'
    }
  },
  {
    path: '/roles',
    element: RoleConfiguration,
    isPrivate: true,
    requiredPermission: {
      action: 'browse',
      subject: 'roles'
    },
    sidebar: {
      id: 'roles',
      title: 'Roles',
      icon: 'Roles'
    }
  },
  {
    path: '/roles/new',
    element: RoleCreatePage,
    isPrivate: true,
    requiredPermission: {
      action: 'create',
      subject: 'roles'
    }
  },
  {
    path: '/roles/:id/edit',
    element: RoleEditPage,
    isPrivate: true,
    requiredPermission: {
      action: 'update',
      subject: 'roles'
    }
  },
  {
    path: '/roles/:id',
    element: RoleViewPage,
    isPrivate: true,
    requiredPermission: {
      action: 'read',
      subject: 'roles'
    }
  },
  {
    isPrivate: true,
    sidebar: {
      id: 'settings',
      title: 'Settings',
      icon: 'Settings'
    },
    children: [
      {
        path: '/settings/profile',
        element: Profile,
        isPrivate: true,
        requiredPermission: {
          action: 'browse',
          subject: 'settings'
        },
        sidebar: {
          id: 'profile',
          title: 'Profile'
        }
      }
    ]
  }
];

export default routesConfig;

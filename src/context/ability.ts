import { AbilityBuilder, PureAbility, AbilityClass } from '@casl/ability';

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Subjects = 'Model' | 'Dashboard' | 'Settings' | 'User' | 'Roles' | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

export const DEFAULT_PERMISSIONS = {
  admin: {
    Dashboard: { read: true },
    Model: { read: true, create: true, update: true, delete: true },
    User: { read: true, create: true, update: true, delete: true },
    Roles: { read: true, create: true, update: true, delete: true },
    Settings: { read: true, update: true }
  },
  editor: {
    Dashboard: { read: true },
    Model: { read: true, create: false, update: true, delete: false },
    User: { read: true, create: false, update: false, delete: false },
    Roles: { read: false, create: false, update: false, delete: false },
    Settings: { read: false, update: false }
  },
  viewer: {
    Dashboard: { read: true },
    Model: { read: true, create: false, update: false, delete: false },
    User: { read: true, create: false, update: false, delete: false },
    Roles: { read: false, create: false, update: false, delete: false },
    Settings: { read: false, update: false }
  }
};

export function defineRulesFor(role: string, user?: any) {
  const { can, rules } = new AbilityBuilder<AppAbility>(AppAbility);

  // If user has specific API-driven permissions, parse them (e.g. "subject.action")
  if (user && Array.isArray(user.permissions) && user.permissions.length > 0) {
    if (role === 'admin' || role === 'Super Admin' || user.permissions.includes('*.*')) {
      can('manage', 'all');
      return rules;
    }

    user.permissions.forEach((perm: string) => {
      const parts = perm.split('.');
      if (parts.length === 2) {
        let [apiSubject, apiAction] = parts;
        
        // Map API actions to CASL actions
        let mappedAction = apiAction;
        if (apiAction === 'browse') {
          mappedAction = 'read';
        }
        
        // Map API subjects to CASL subjects
        let mappedSubject = '';
        if (apiSubject === 'dashboard') {
          mappedSubject = 'Dashboard';
        } else if (apiSubject === 'user') {
          mappedSubject = 'User';
        } else if (apiSubject === 'models') {
          mappedSubject = 'Model';
        } else if (apiSubject === 'roles') {
          mappedSubject = 'Roles';
        } else if (apiSubject === 'settings') {
          mappedSubject = 'Settings';
        }

        if (mappedSubject) {
          can(mappedAction as any, mappedSubject as any);

          // Special case: Roles page checks 'User' subject in routesConfig.
          // Therefore, if the user has roles.read or roles.browse permission,
          // they must be allowed to read/browse User subject so the route guard allows it.
          if (apiSubject === 'roles') {
            can(mappedAction as any, 'User');
          }
        }
      }
    });
    return rules;
  }

  // Fallback to role-based rules (local storage or defaults)
  const saved = localStorage.getItem('rbc_role_permissions');
  let permissions: any = DEFAULT_PERMISSIONS;
  if (saved) {
    try {
      permissions = JSON.parse(saved);
    } catch {
      // Fallback
    }
  }

  // Admin role overrides
  if (role === 'admin' || role === 'Super Admin') {
    can('manage', 'all');
    return rules;
  }

  const roleRules = permissions[role] || permissions.viewer;

  if (roleRules) {
    // Map modules & operations to CASL
    Object.entries(roleRules).forEach(([subject, actions]: [string, any]) => {
      Object.entries(actions).forEach(([action, isAllowed]) => {
        if (isAllowed) {
          can(action as any, subject as any);
        }
      });
    });
  }

  return rules;
}

export function buildAbilityFor(role: string, user?: any): AppAbility {
  return new AppAbility(defineRulesFor(role, user), {
    detectSubjectType: (item: any) => {
      if (item && item.type) return item.type;
      return 'all';
    }
  });
}

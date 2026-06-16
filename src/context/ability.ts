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

export function defineRulesFor(role: string) {
  const { can, rules } = new AbilityBuilder<AppAbility>(AppAbility);

  // Read dynamic permissions from localStorage
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
  if (role === 'admin') {
    can('manage', 'all');
    return rules;
  }

  const roleRules = permissions[role] || permissions.viewer;

  // Map modules & operations to CASL
  Object.entries(roleRules).forEach(([subject, actions]: [string, any]) => {
    Object.entries(actions).forEach(([action, isAllowed]) => {
      if (isAllowed) {
        can(action as any, subject as any);
      }
    });
  });

  return rules;
}

export function buildAbilityFor(role: string): AppAbility {
  return new AppAbility(defineRulesFor(role), {
    detectSubjectType: (item: any) => {
      if (item && item.type) return item.type;
      return 'all';
    }
  });
}

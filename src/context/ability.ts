import { AbilityBuilder, PureAbility, AbilityClass, subject } from '@casl/ability';

export type Actions = string;
export type Subjects = string;

export type AppAbility = PureAbility<[Actions, Subjects]>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

// Re-export subject helper for creating typed subjects
export { subject };

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

// Custom conditions matcher for field-level permissions
export const conditionsMatcher = (conditions: unknown) => {
  return (object: Record<string, unknown>) => {
    if (!conditions || typeof conditions !== "object") {
      return true;
    }
    const conditionsObj = conditions as Record<string, unknown>;
    return Object.keys(conditionsObj).every((field) => {
      return conditionsObj[field] === object[field];
    });
  };
};

export const createEmptyAbility = (): AppAbility => {
  return new PureAbility<[Actions, Subjects]>([]);
};

export function buildAbilityFor(user?: any): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(AppAbility);

  if (!user) {
    return createEmptyAbility();
  }

  // Build abilities ONLY from user.permissions - no static module logic
  // This ensures dynamic, permission-driven access control
  (user.permissions || []).forEach((perm: string) => {
    // Handle wildcard admin permission
    if (perm === "*" || perm === "*.*") {
      can("manage", "all");
      return;
    }

    // Parse 'module.action' format (e.g., 'orders.browse', 'users.edit')
    const match = perm.match(/^([^.]+)\.([^.]+)$/);
    if (!match) {
      // If format doesn't match, skip this permission
      return;
    }

    const moduleName = match[1];
    const actionName = match[2];
    
    // Grant the permission dynamically
    can(actionName, moduleName);
  });

  // Special restrictions - prevent certain actions even with permissions
  // Users cannot delete themselves
  cannot("delete", "users", { id: user.id });

  return build({
    conditionsMatcher,
    detectSubjectType: (item: any) => {
      if (item && item.type) return item.type;
      return 'all';
    }
  });
}

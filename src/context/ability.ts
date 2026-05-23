import { AbilityBuilder, PureAbility, AbilityClass } from '@casl/ability';

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type Subjects = 'Model' | 'Dashboard' | 'Settings' | 'User' | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

export function defineRulesFor(role: string) {
  const { can, rules } = new AbilityBuilder<AppAbility>(AppAbility);

  if (role === 'admin') {
    can('manage', 'all');
  } else if (role === 'editor') {
    can('read', 'Dashboard');
    can('read', 'Model');
    can('update', 'Model');
    can('read', 'User');
  } else {
    // viewer
    can('read', 'Dashboard');
    can('read', 'Model');
    can('read', 'User');
  }

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

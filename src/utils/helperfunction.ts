import { RouteConfig } from '../routes/routesConfig';

export interface NavItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  action: string;
  subject: string;
  children?: {
    id: string;
    title: string;
    path: string;
    action: string;
    subject: string;
  }[];
}

/**
 * Recursively flattens nested RouteConfig arrays into a single-level RouteConfig array.
 * Propagates inherited properties like isPrivate and requiredPermission to child routes.
 */
export const flattenRoutes = (
  configs: RouteConfig[],
  inheritedPrivate = false,
  inheritedPermission?: { action: string; subject: string }
): RouteConfig[] => {
  const list: RouteConfig[] = [];
  configs.forEach(config => {
    const isPrivate = config.isPrivate !== undefined ? config.isPrivate : inheritedPrivate;
    const requiredPermission = config.requiredPermission || inheritedPermission;

    if (config.path && config.element) {
      list.push({
        ...config,
        isPrivate,
        requiredPermission
      });
    }
    if (config.children) {
      list.push(...flattenRoutes(config.children, isPrivate, requiredPermission));
    }
  });
  return list;
};

/**
 * Transforms route configurations into a structured format suitable for the navigation sidebar.
 */
export const generateNavigationData = (configs: RouteConfig[]): NavItem[] => {
  return configs
    .filter(route => route.sidebar)
    .map(route => {
      const parentAction = route.requiredPermission?.action;
      const parentSubject = route.requiredPermission?.subject;

      return {
        id: route.sidebar!.id,
        title: route.sidebar!.title,
        path: route.path || (route.children && route.children[0]?.path) || '',
        icon: route.sidebar!.icon || 'Settings',
        action: parentAction || 'browse',
        subject: parentSubject || 'all',
        children: route.children?.map((child: RouteConfig) => ({
          id: child.sidebar!.id,
          title: child.sidebar!.title,
          path: child.path!,
          action: child.requiredPermission?.action || parentAction || 'browse',
          subject: child.requiredPermission?.subject || parentSubject || 'all'
        }))
      };
    });
};

/**
 * Filters the generated navigation data based on the user's CASL abilities.
 * Keeps parent categories visible if at least one of their children is permitted.
 */
export const filterNavigationItems = (
  navItems: NavItem[],
  ability: { can: (action: string, subject: string) => boolean }
): NavItem[] => {
  return navItems
    .map(item => {
      const newItem = { ...item };
      if (newItem.children && newItem.children.length > 0) {
        newItem.children = newItem.children.filter(child =>
          ability.can(child.action, child.subject)
        );
      }
      return newItem;
    })
    .filter(item => {
      if (item.children && item.children.length > 0) {
        return true;
      }
      const parentAction = item.action || 'browse';
      const parentSubject = item.subject || 'all';
      return ability.can(parentAction, parentSubject);
    });
};


export const formatInchesToFeetInches = (totalInches: number): string => {
  if (isNaN(totalInches) || totalInches < 0) return '0 ft 0 in';
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  const adjustedInches = inches === 12 ? 0 : inches;
  const adjustedFeet = inches === 12 ? feet + 1 : feet;
  return `${adjustedFeet} ft ${adjustedInches} in`;
};

export const formatCmToFeetInches = (cm: number): string => {
  if (!cm || isNaN(cm) || cm <= 0) return '0 ft 0 in';
  const totalInches = cm / 2.54;
  return formatInchesToFeetInches(totalInches);
};

export const formatDate = (
  date: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string => {
  if (!date) return '';
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return '';
  return parsedDate.toLocaleDateString(undefined, options);
};

export const parsePhoneString = (phoneStr: string) => {
  const clean = phoneStr.replace(/\s+/g, '');
  if (!clean.startsWith('+')) {
    return { countryCode: '91', phone: clean };
  }
  
  const withoutPlus = clean.substring(1);
  const commonCodes = ['91', '1', '44', '33', '49', '61', '55', '86', '7', '81', '39', '34', '31', '41'];
  const matchedCode = commonCodes.find(code => withoutPlus.startsWith(code));
  
  if (matchedCode) {
    return {
      countryCode: matchedCode,
      phone: withoutPlus.substring(matchedCode.length)
    };
  }
  
  return {
    countryCode: withoutPlus.substring(0, 2),
    phone: withoutPlus.substring(2)
  };
};

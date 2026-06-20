import React from 'react';
import { Actions, Subjects } from '../../context/ability';
import { useAppAbility } from '../../context/AbilityContext';
import Unauthorized from './Unauthorized';

export interface PermissionGateProps {
  action: Actions;
  subject: Subjects;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({ action, subject, children }) => {
  const ability = useAppAbility();
  
  if (ability.can(action, subject)) {
    return <>{children}</>;
  }

  return <Unauthorized message="You do not have the required permissions to view this module." />;
};

export default PermissionGate;

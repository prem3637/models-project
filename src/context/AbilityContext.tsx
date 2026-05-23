import React, { createContext, useContext, useEffect, useState } from 'react';
import { createContextualCan } from '@casl/react';
import { AppAbility, buildAbilityFor } from './ability';
import { useSelector } from 'react-redux';

export const AbilityContext = createContext<AppAbility>(null!);

export const Can = createContextualCan(AbilityContext.Consumer);

export const useAppAbility = () => useContext(AbilityContext);

interface AbilityProviderProps {
  children: React.ReactNode;
}

export const AbilityProvider: React.FC<AbilityProviderProps> = ({ children }) => {
  const role = useSelector((state: any) => state.auth.role) || 'viewer';
  
  const [ability, setAbility] = useState<AppAbility>(() => buildAbilityFor(role));

  useEffect(() => {
    // Update ability whenever user role changes in state
    setAbility(buildAbilityFor(role));
  }, [role]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};

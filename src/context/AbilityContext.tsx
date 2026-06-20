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
  const user = useSelector((state: any) => state.auth?.user);
  
  const [ability, setAbility] = useState<AppAbility>(() => buildAbilityFor(user));

  useEffect(() => {
    // Update ability whenever user permissions change in state
    setAbility(buildAbilityFor(user));
  }, [user]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};

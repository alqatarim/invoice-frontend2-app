
 'use client'

 import React, { createContext, useContext, useMemo } from 'react';
import { useSession } from 'next-auth/react';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const { data: session, status } = useSession();

  const permissions = useMemo(() => {
    if (status === 'loading' || !session?.user) {

      return null;
    }

    const { role, permissionRes } = session.user;
// console.log('session:', session)
    if (permissionRes?.allModules) {

      return {
        isAdmin: true,
        modules: {}, // Admin has access to all, can customize if needed
      };
    }

    const modules = permissionRes?.modules?.reduce((acc, module) => {
      acc[module.module] = module.permissions;
      return acc;
    }, {});

    return {
      isAdmin: false,
      modules: modules || {},
    };
  }, [session, status]);

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionsContext);
};

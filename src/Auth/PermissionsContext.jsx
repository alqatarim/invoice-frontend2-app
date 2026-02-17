
'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

const EMPTY_MODULES = Object.freeze({});
const FALLBACK_PERMISSIONS = Object.freeze({
  isAdmin: false,
  modules: EMPTY_MODULES,
  hasPermission: () => false,
});

const PermissionsContext = createContext(FALLBACK_PERMISSIONS);

export const PermissionsProvider = ({ children }) => {
  const { data: session, status } = useSession();

  const [stablePermissions, setStablePermissions] = useState(FALLBACK_PERMISSIONS);

  const nextPermissions = useMemo(() => {
    const permissionRes = session?.user?.permissionRes;
    if (!permissionRes) return null;

    if (permissionRes.allModules) {
      return {
        isAdmin: true,
        modules: EMPTY_MODULES,
        hasPermission: () => true,
      };
    }

    const modules = (permissionRes.modules || []).reduce((acc, module) => {
      acc[module.module] = module.permissions || {};
      return acc;
    }, {});

    return {
      isAdmin: false,
      modules,
      hasPermission: (module, action) => Boolean(modules?.[module]?.[action]),
    };
  }, [session?.user?.permissionRes]);

  useEffect(() => {
    if (nextPermissions) {
      setStablePermissions(nextPermissions);
      return;
    }

    // Keep previous permissions during loading to avoid app-wide permission flicker.
    if (status === 'unauthenticated') {
      setStablePermissions(FALLBACK_PERMISSIONS);
    }
  }, [nextPermissions, status]);

  return (
    <PermissionsContext.Provider value={stablePermissions}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionsContext);
};


'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/Auth/SessionContext';
import {
  getCanonicalModuleName,
  getCanonicalPermissionAction,
  normalizePermissionFlags,
  normalizePermissionModules,
} from '@/common/allModules';

const EMPTY_MODULES = Object.freeze({});
const FALLBACK_PERMISSIONS = Object.freeze({
  isAdmin: false,
  modules: EMPTY_MODULES,
  hasPermission: () => false,
  isReady: false,
  isLoading: true,
  status: 'loading',
});
const NO_ACCESS_PERMISSIONS = Object.freeze({
  isAdmin: false,
  modules: EMPTY_MODULES,
  hasPermission: () => false,
  isReady: true,
  isLoading: false,
  status: 'unauthenticated',
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
        isReady: true,
        isLoading: false,
        status: 'authenticated',
      };
    }

    const modules = normalizePermissionModules(permissionRes.modules || []).reduce((acc, module) => {
      acc[module.module] = normalizePermissionFlags(module.permissions);
      return acc;
    }, {});

    return {
      isAdmin: false,
      modules,
      hasPermission: (module, action) => {
        const moduleKey = getCanonicalModuleName(module);
        const actionKey = getCanonicalPermissionAction(action);
        const modulePermissions = modules?.[moduleKey];

        if (!modulePermissions) return false;

        return Boolean(modulePermissions.all || modulePermissions[actionKey]);
      },
      isReady: true,
      isLoading: false,
      status: 'authenticated',
    };
  }, [session?.user?.permissionRes]);

  useEffect(() => {
    if (nextPermissions) {
      setStablePermissions(nextPermissions);
      return;
    }

    if (status === 'unauthenticated') {
      setStablePermissions(NO_ACCESS_PERMISSIONS);
    }
  }, [nextPermissions, status]);

  const contextValue = useMemo(
    () => ({
      ...stablePermissions,
      status,
      isLoading: !stablePermissions.isReady && status !== 'unauthenticated',
    }),
    [stablePermissions, status]
  );

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionsContext);
};

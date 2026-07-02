'use client'

import { useMemo } from 'react'
import { usePermissions } from '@/Auth/PermissionsContext'

const CRUD_ACTIONS = Object.freeze(['create', 'update', 'view', 'delete'])

export const usePermission = (module, action) => {
  const permissions = usePermissions()

  return Boolean(permissions?.hasPermission?.(module, action))
}

export const useModulePermissions = moduleName => {
  const permissions = usePermissions()

  return useMemo(() => {
    const can = action => Boolean(permissions?.hasPermission?.(moduleName, action))
    const modulePermissions = CRUD_ACTIONS.reduce((acc, action) => {
      acc[`can${action.charAt(0).toUpperCase()}${action.slice(1)}`] = can(action)
      return acc
    }, {})

    return {
      ...modulePermissions,
      hasAny: Object.values(modulePermissions).some(Boolean),
    }
  }, [moduleName, permissions])
}

export const usePosAccess = () => {
  const permissions = usePermissions()

  return useMemo(() => {
    const canViewInvoice = Boolean(permissions?.hasPermission?.('invoice', 'view'))
    const canCreateInvoice = Boolean(permissions?.hasPermission?.('invoice', 'create'))

    return {
      canAccessPos: canViewInvoice || canCreateInvoice,
      canCreatePosSale: canCreateInvoice,
      canViewInvoice,
      canCreateInvoice,
      isReady: Boolean(permissions?.isReady),
      isLoading: Boolean(permissions?.isLoading),
    }
  }, [permissions])
}

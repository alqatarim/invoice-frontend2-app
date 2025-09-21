// src/hooks/usePermission.js
import { usePermissions } from '@/Auth/PermissionsContext'

export const usePermission = (module, action) => {
  const permissions = usePermissions()

  if (!permissions) return false

  if (permissions.isAdmin) return true

  const modulePermissions = permissions.modules[module]

  if (!modulePermissions) return false

  return modulePermissions[action] || false
}

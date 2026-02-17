// Permission checking hook
import { usePermissions } from '@/Auth/PermissionsContext'

export const usePermission = (module, action) => {
  const permissions = usePermissions()

  if (!permissions) return false

  if (typeof permissions.hasPermission === 'function') {
    return permissions.hasPermission(module, action)
  }

  // Fallback for legacy context shape
  if (permissions.isAdmin) return true
  const modulePermissions = permissions.modules?.[module]
  return Boolean(modulePermissions?.[action])
}

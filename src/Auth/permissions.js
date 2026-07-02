import {
  getCanonicalModuleName,
  getCanonicalPermissionAction,
  normalizePermissionFlags,
  normalizePermissionModules,
} from '@/common/allModules'

const EMPTY_MODULES = Object.freeze({})
const CRUD_ACTIONS = Object.freeze(['create', 'update', 'view', 'delete'])

export const buildPermissionModulesMap = permissionRes => {
  if (!permissionRes || permissionRes.allModules) return EMPTY_MODULES

  return normalizePermissionModules(permissionRes.modules || []).reduce((acc, module) => {
    acc[module.module] = normalizePermissionFlags(module.permissions)
    return acc
  }, {})
}

export const hasPermission = (permissionRes, moduleName, actionName) => {
  if (!permissionRes) return false
  if (permissionRes.allModules) return true

  const modules = buildPermissionModulesMap(permissionRes)
  const modulePermissions = modules?.[getCanonicalModuleName(moduleName)]
  const actionKey = getCanonicalPermissionAction(actionName)

  return Boolean(modulePermissions?.all || modulePermissions?.[actionKey])
}

export const getModulePermissions = (permissionRes, moduleName) => {
  if (permissionRes?.allModules) {
    return normalizePermissionFlags({ all: true })
  }

  const modules = buildPermissionModulesMap(permissionRes)
  return normalizePermissionFlags(modules?.[getCanonicalModuleName(moduleName)])
}

export const getCrudPermissions = (permissionRes, moduleName) => {
  const modulePermissions = getModulePermissions(permissionRes, moduleName)

  return CRUD_ACTIONS.reduce((acc, action) => {
    acc[`can${action.charAt(0).toUpperCase()}${action.slice(1)}`] = Boolean(
      modulePermissions.all || modulePermissions[action]
    )
    return acc
  }, {})
}

export const hasAnyCrudPermission = (permissionRes, moduleName) => {
  const permissions = getCrudPermissions(permissionRes, moduleName)
  return Object.values(permissions).some(Boolean)
}

export const getPosAccess = permissionRes => {
  const canViewInvoice = hasPermission(permissionRes, 'invoice', 'view')
  const canCreateInvoice = hasPermission(permissionRes, 'invoice', 'create')

  return {
    canAccessPos: canViewInvoice || canCreateInvoice,
    canCreatePosSale: canCreateInvoice,
    canViewInvoice,
    canCreateInvoice,
  }
}

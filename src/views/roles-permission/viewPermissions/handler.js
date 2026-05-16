'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'

import { updatePermissions } from '@/app/(dashboard)/roles-permission/actions'
import {
  buildDefaultPermissionModules,
  isAlwaysEnabledModule,
  normalizePermissionModules,
} from '@/common/allModules'

const normalizePermissionState = (permissionState) => {
  const baseModules = permissionState?.modules?.length
    ? permissionState.modules
    : buildDefaultPermissionModules()

  return {
    ...permissionState,
    allModules: Boolean(permissionState?.allModules),
    modules: normalizePermissionModules(baseModules)
  }
}

const hasAllModulesEnabled = (modules) => {
  return (modules || []).every(module => {
    if (isAlwaysEnabledModule(module.module)) return true

    return Boolean(module.permissions?.all)
  })
}

export const usePermissionsHandler = (initialPermissions) => {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [permissions, setPermissions] = useState(
    normalizePermissionState(
      initialPermissions || {
        allModules: false,
        modules: []
      }
    )
  )
  const [loading, setLoading] = useState(false)

  const handleAllModulesChange = useCallback((checked) => {
    setPermissions(prev => {
      const normalizedState = normalizePermissionState(prev)
      const modules = normalizePermissionModules(
        normalizedState.modules.map(module => {
          if (isAlwaysEnabledModule(module.module)) {
            return module
          }

          return {
            ...module,
            permissions: {
              create: checked,
              update: checked,
              view: checked,
              delete: checked,
              all: checked
            }
          }
        })
      )

      return {
        ...normalizedState,
        allModules: checked,
        modules
      }
    })
  }, [])

  const handleModuleAllChange = useCallback((moduleIndex, checked) => {
    setPermissions(prev => {
      const normalizedState = normalizePermissionState(prev)
      const modules = normalizePermissionModules(
        normalizedState.modules.map((module, index) => {
          if (index !== moduleIndex || isAlwaysEnabledModule(module.module)) {
            return module
          }

          return {
            ...module,
            permissions: {
              create: checked,
              update: checked,
              view: checked,
              delete: checked,
              all: checked
            }
          }
        })
      )

      return {
        ...normalizedState,
        allModules: hasAllModulesEnabled(modules),
        modules
      }
    })
  }, [])

  const handlePermissionChange = useCallback((moduleIndex, permissionType, checked) => {
    setPermissions(prev => {
      const normalizedState = normalizePermissionState(prev)
      const targetModule = normalizedState.modules[moduleIndex]
      if (!targetModule || isAlwaysEnabledModule(targetModule.module)) {
        return normalizedState
      }

      const nextModules = [...normalizedState.modules]
      nextModules[moduleIndex] = {
        ...targetModule,
        permissions: {
          ...targetModule.permissions,
          [permissionType]: checked
        }
      }

      const modules = normalizePermissionModules(nextModules)

      return {
        ...normalizedState,
        allModules: hasAllModulesEnabled(modules),
        modules
      }
    })
  }, [])

  const isAdmin = permissions?.allModules === true

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('permissionId', permissions._id)
      formData.append('allModules', permissions.allModules)
      formData.append('modules', JSON.stringify(permissions.modules))

      const result = await updatePermissions(formData)

      if (result.success) {
        enqueueSnackbar(result.message || 'Permissions updated successfully', {
          variant: 'success'
        })
        router.push('/roles-permission/roles-permission-list')
      } else {
        enqueueSnackbar(result.error || 'Failed to update permissions', {
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Error updating permissions:', error)
      enqueueSnackbar('An error occurred while updating permissions', {
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar, permissions, router])

  const handleBack = useCallback(() => {
    router.push('/roles-permission/roles-permission-list')
  }, [router])

  return {
    permissions,
    loading,
    isAdmin,
    handleAllModulesChange,
    handleModuleAllChange,
    handlePermissionChange,
    handleSubmit,
    handleBack
  }
}

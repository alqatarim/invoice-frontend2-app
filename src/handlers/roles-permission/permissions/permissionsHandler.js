'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { updatePermissions } from '@/app/(dashboard)/roles-permission/actions'

export const usePermissionsHandler = (initialPermissions) => {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [permissions, setPermissions] = useState(initialPermissions || {
    allModules: false,
    modules: []
  })
  const [loading, setLoading] = useState(false)

  // Toggle all modules
  const handleAllModulesChange = useCallback((checked) => {
    setPermissions(prev => ({
      ...prev,
      allModules: checked,
      modules: prev.modules.map(module => ({
        ...module,
        permissions: {
          create: checked,
          update: checked,
          view: checked,
          delete: checked,
          all: checked
        }
      }))
    }))
  }, [])

  // Toggle module's "allow all" permission
  const handleModuleAllChange = useCallback((moduleIndex, checked) => {
    setPermissions(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex
          ? {
              ...module,
              permissions: {
                create: checked,
                update: checked,
                view: checked,
                delete: checked,
                all: checked
              }
            }
          : module
      )
    }))
  }, [])

  // Toggle individual permission
  const handlePermissionChange = useCallback((moduleIndex, permissionType, checked) => {
    setPermissions(prev => {
      const newModules = [...prev.modules]
      newModules[moduleIndex] = {
        ...newModules[moduleIndex],
        permissions: {
          ...newModules[moduleIndex].permissions,
          [permissionType]: checked
        }
      }

      // Update "all" checkbox if all permissions are checked/unchecked
      const module = newModules[moduleIndex]
      const allChecked = module.permissions.create && 
                        module.permissions.update && 
                        module.permissions.view && 
                        module.permissions.delete
      
      newModules[moduleIndex].permissions.all = allChecked

      // Update allModules if all modules have all permissions
      const allModulesChecked = newModules.every(m => 
        m.permissions.create && m.permissions.update && 
        m.permissions.view && m.permissions.delete
      )

      return {
        allModules: allModulesChecked,
        modules: newModules
      }
    })
  }, [])

  // Check if user has admin privileges
  const isAdmin = permissions?.allModules === true

  // Handle form submission
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
  }, [permissions, enqueueSnackbar, router])

  // Handle back navigation
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
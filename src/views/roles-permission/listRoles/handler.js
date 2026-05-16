'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'

import { addRole, getFilteredRoles, updateRole } from '@/app/(dashboard)/roles-permission/actions'

export const useRolesListHandlers = ({
  initialRoles = [],
  initialCardCounts = {}
} = {}) => {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const cardCounts = initialCardCounts
  const filteredInitialRoles = initialRoles.filter(role => !role.isDeleted)
  const [roles, setRoles] = useState(filteredInitialRoles)
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(filteredInitialRoles.length)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState({
    roleName: [],
    fromDate: '',
    toDate: '',
  })
  const [openDialog, setOpenDialog] = useState(false)
  const [editData, setEditData] = useState(null)
  const [dialogLoading, setDialogLoading] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [editingIcon, setEditingIcon] = useState('')
  const [inlineLoading, setInlineLoading] = useState(false)
  const [editingMode, setEditingMode] = useState(null)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null)
  const [columns] = useState([
    { key: 'id', label: 'ID', visible: true },
    { key: 'roleName', label: 'Role Name', visible: true },
    { key: 'createdAt', label: 'Created On', visible: true },
    { key: 'action', label: 'Actions', visible: true }
  ])

  const loadRoles = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getFilteredRoles(
        searchQuery,
        paginationModel.page + 1,
        paginationModel.pageSize
      )

      setRoles(result.roles || [])
      setTotalCount(result.totalCount || 0)
    } catch (error) {
      console.error('Error loading roles:', error)
      enqueueSnackbar('Error loading roles', { variant: 'error' })
      setRoles([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [enqueueSnackbar, paginationModel.page, paginationModel.pageSize, searchQuery])

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value)
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    setTimeout(() => {
      if (value || searchQuery) {
        loadRoles()
      }
    }, 300)
  }, [loadRoles, searchQuery])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    if (searchQuery) {
      loadRoles()
    }
  }, [loadRoles, searchQuery])

  const handleFilterValueChange = useCallback((field, value) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleFilterApply = useCallback((values) => {
    setFilterValues(values)
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    console.log('Applying filters:', values)
    loadRoles()
  }, [loadRoles])

  const handleFilterReset = useCallback(() => {
    const resetValues = {
      roleName: [],
      fromDate: '',
      toDate: '',
    }
    setFilterValues(resetValues)
    setSearchQuery('')
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    loadRoles()
  }, [loadRoles])

  const handlePageChange = useCallback((newPage) => {
    setPaginationModel(prev => ({ ...prev, page: newPage }))
    if (searchQuery || newPage > 0) {
      loadRoles()
    }
  }, [loadRoles, searchQuery])

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPaginationModel({ page: 0, pageSize: newPageSize })
    if (searchQuery) {
      loadRoles()
    }
  }, [loadRoles, searchQuery])

  const handleStartNameEdit = useCallback((role) => {
    if (role.roleName === 'Super Admin') {
      enqueueSnackbar('Super Admin role cannot be edited', { variant: 'warning' })
      return
    }

    setEditingRoleId(role._id)
    setEditingValue(role.roleName)
    setEditingMode('name')
  }, [enqueueSnackbar])

  const handleIconChange = useCallback(async (role, iconValue) => {
    if (role.roleName === 'Super Admin') {
      enqueueSnackbar('Super Admin role cannot be edited', { variant: 'warning' })
      return
    }

    const originalRole = roles.find(currentRole => currentRole._id === role._id)
    const iconToSave = iconValue || 'mdi:account-circle'

    if (originalRole?.roleIcon === iconToSave) {
      return
    }

    setInlineLoading(true)
    try {
      const formData = new FormData()
      formData.append('_id', role._id)
      formData.append('roleName', originalRole.roleName)
      formData.append('roleIcon', iconToSave)

      const result = await updateRole(formData)

      if (result.success) {
        enqueueSnackbar('Role icon updated successfully', { variant: 'success' })

        setRoles(prev => prev.map(currentRole =>
          currentRole._id === role._id
            ? { ...currentRole, roleIcon: iconToSave }
            : currentRole
        ))
      } else {
        enqueueSnackbar(result.error || 'Failed to update role icon', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error updating role icon:', error)
      enqueueSnackbar('An error occurred while updating role icon', { variant: 'error' })
    } finally {
      setInlineLoading(false)
    }
  }, [enqueueSnackbar, roles])

  const handleInlineEditChange = useCallback((value) => {
    setEditingValue(value)
  }, [])

  const handleSaveNameEdit = useCallback(async (autoSave = false) => {
    if (!editingRoleId || !editingValue?.trim()) {
      if (!autoSave) {
        enqueueSnackbar('Role name cannot be empty', { variant: 'error' })
      }
      return
    }

    const trimmedValue = editingValue.trim()
    const originalRole = roles.find(role => role._id === editingRoleId)

    if (originalRole?.roleName === trimmedValue) {
      setEditingRoleId(null)
      setEditingValue('')
      setEditingMode(null)
      return
    }

    setInlineLoading(true)
    try {
      const formData = new FormData()
      formData.append('_id', editingRoleId)
      formData.append('roleName', trimmedValue)

      const result = await updateRole(formData)

      if (result.success) {
        enqueueSnackbar('Role name updated successfully', { variant: 'success' })

        setRoles(prev => prev.map(role =>
          role._id === editingRoleId
            ? { ...role, roleName: trimmedValue }
            : role
        ))

        setEditingRoleId(null)
        setEditingValue('')
        setEditingMode(null)
      } else {
        enqueueSnackbar(result.error || 'Failed to update role name', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error updating role name:', error)
      enqueueSnackbar('An error occurred while updating role name', { variant: 'error' })
    } finally {
      setInlineLoading(false)
    }
  }, [editingRoleId, editingValue, enqueueSnackbar, roles])

  const handleCancelInlineEdit = useCallback(() => {
    setEditingRoleId(null)
    setEditingValue('')
    setEditingIcon('')
    setEditingMode(null)
  }, [])

  const handleViewPermissions = useCallback((roleId) => {
    const role = roles.find(currentRole => currentRole._id === roleId)
    if (role) {
      setSelectedRoleForPermissions(role)
      setPermissionsDialogOpen(true)
    }
  }, [roles])

  const handleClosePermissionsDialog = useCallback(() => {
    setPermissionsDialogOpen(false)
    setSelectedRoleForPermissions(null)
  }, [])

  const handleAdd = useCallback(() => {
    setEditData(null)
    setOpenDialog(true)
  }, [])

  const handleEdit = useCallback((role) => {
    setEditData(role)
    setOpenDialog(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)
    setEditData(null)
  }, [])

  const handleSubmit = useCallback(async (formData) => {
    setDialogLoading(true)
    try {
      const result = editData
        ? await updateRole(formData)
        : await addRole(formData)

      if (result.success) {
        enqueueSnackbar(result.message, { variant: 'success' })
        handleCloseDialog()
        router.refresh()
        return true
      }

      enqueueSnackbar(result.error || 'Operation failed', { variant: 'error' })
      return false
    } catch (error) {
      console.error('Error submitting role:', error)
      enqueueSnackbar('An error occurred', { variant: 'error' })
      return false
    } finally {
      setDialogLoading(false)
    }
  }, [editData, enqueueSnackbar, handleCloseDialog, router])

  return {
    roles,
    loading,
    totalCount,
    cardCounts,
    paginationModel,
    handlePageChange,
    handlePageSizeChange,
    searchQuery,
    handleSearchChange,
    clearSearch,
    filterValues,
    handleFilterValueChange,
    handleFilterApply,
    handleFilterReset,
    openDialog,
    editData,
    dialogLoading,
    handleAdd,
    handleEdit,
    handleCloseDialog,
    handleSubmit,
    editingRoleId,
    editingValue,
    editingIcon,
    editingMode,
    inlineLoading,
    handleStartNameEdit,
    handleInlineEditChange,
    handleIconChange,
    handleSaveNameEdit,
    handleCancelInlineEdit,
    permissionsDialogOpen,
    selectedRoleForPermissions,
    handleViewPermissions,
    handleClosePermissionsDialog,
    columns,
  }
}

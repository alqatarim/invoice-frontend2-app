'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { getFilteredRoles, addRole, updateRole } from '@/app/(dashboard)/roles-permission/actions'

export const useRolesListHandlers = (initialData = { roles: [], cardCounts: {} }) => {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  
  // Extract initial data
  const { roles: initialRoles = [], cardCounts = {} } = initialData
  
  // State for data management
  const filteredInitialRoles = initialRoles.filter(role => !role.isDeleted)
  const [roles, setRoles] = useState(filteredInitialRoles)
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(filteredInitialRoles.length)
  
  // Pagination state
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterValues, setFilterValues] = useState({
    roleName: [],
    fromDate: '',
    toDate: '',
  })
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false)
  const [editData, setEditData] = useState(null)
  const [dialogLoading, setDialogLoading] = useState(false)
  
  // Inline editing state
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [editingIcon, setEditingIcon] = useState('')
  const [inlineLoading, setInlineLoading] = useState(false)
  
  // Separate editing modes
  const [editingMode, setEditingMode] = useState(null) // 'name' | 'icon' | null
  
  // Permissions dialog state
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null)
  
  // Column state
  const [columns] = useState([
    { key: 'id', label: 'ID', visible: true },
    { key: 'roleName', label: 'Role Name', visible: true },
    { key: 'createdAt', label: 'Created On', visible: true },
    { key: 'action', label: 'Actions', visible: true }
  ])
  
  // Load filtered roles
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
  }, [searchQuery, paginationModel.page, paginationModel.pageSize, enqueueSnackbar])
  
  // Search handlers
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value)
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    // Debounce search if needed
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
  
  // Filter handlers
  const handleFilterValueChange = useCallback((field, value) => {
    setFilterValues(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])
  
  const handleFilterApply = useCallback((values) => {
    setFilterValues(values)
    setPaginationModel(prev => ({ ...prev, page: 0 }))
    // Apply filters - you can extend this to actual API calls
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
  
  // Pagination handlers
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
  
  // Immediate action handlers
  const handleStartNameEdit = useCallback((role) => {
    // Prevent editing Super Admin role
    if (role.roleName === 'Super Admin') {
      enqueueSnackbar('Super Admin role cannot be edited', { variant: 'warning' })
      return
    }
    
    setEditingRoleId(role._id)
    setEditingValue(role.roleName)
    setEditingMode('name')
  }, [enqueueSnackbar])

  // No separate icon edit mode - just handle icon selection directly
  const handleIconChange = useCallback(async (role, iconValue) => {
    // Prevent editing Super Admin role
    if (role.roleName === 'Super Admin') {
      enqueueSnackbar('Super Admin role cannot be edited', { variant: 'warning' })
      return
    }

    const originalRole = roles.find(r => r._id === role._id)
    const iconToSave = iconValue || 'mdi:account-circle'
    
    if (originalRole?.roleIcon === iconToSave) {
      // No changes made
      return
    }

    setInlineLoading(true)
    try {
      const formData = new FormData()
      formData.append('_id', role._id)
      formData.append('roleName', originalRole.roleName) // Keep existing name
      formData.append('roleIcon', iconToSave)
      
      const result = await updateRole(formData)

      if (result.success) {
        enqueueSnackbar('Role icon updated successfully', { variant: 'success' })
        
        // Update local state optimistically
        setRoles(prev => prev.map(r => 
          r._id === role._id 
            ? { ...r, roleIcon: iconToSave }
            : r
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
  }, [roles, enqueueSnackbar])
  
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
      // No changes made
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
        
        // Update local state optimistically
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
  }, [editingRoleId, editingValue, roles, enqueueSnackbar])


  
  const handleCancelInlineEdit = useCallback(() => {
    setEditingRoleId(null)
    setEditingValue('')
    setEditingIcon('')
    setEditingMode(null)
  }, [])
  
  // Permissions dialog handlers
  const handleViewPermissions = useCallback((roleId) => {
    const role = roles.find(r => r._id === roleId)
    if (role) {
      setSelectedRoleForPermissions(role)
      setPermissionsDialogOpen(true)
    }
  }, [roles])
  
  const handleClosePermissionsDialog = useCallback(() => {
    setPermissionsDialogOpen(false)
    setSelectedRoleForPermissions(null)
  }, [])
  
  // Dialog handlers
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
      } else {
        enqueueSnackbar(result.error || 'Operation failed', { variant: 'error' })
        return false
      }
    } catch (error) {
      console.error('Error submitting role:', error)
      enqueueSnackbar('An error occurred', { variant: 'error' })
      return false
    } finally {
      setDialogLoading(false)
    }
  }, [editData, enqueueSnackbar, handleCloseDialog, router])
  
  // Memoized visible columns
  const visibleColumns = useMemo(() => 
    columns.filter(col => col.visible),
    [columns]
  )
  
  return {
    // Data
    roles,
    loading,
    totalCount,
    cardCounts,
    
    // Pagination
    paginationModel,
    handlePageChange,
    handlePageSizeChange,
    
    // Search
    searchQuery,
    handleSearchChange,
    clearSearch,
    
    // Filters
    filterValues,
    handleFilterValueChange,
    handleFilterApply,
    handleFilterReset,
    
    // Dialog
    openDialog,
    editData,
    dialogLoading,
    handleAdd,
    handleEdit,
    handleCloseDialog,
    handleSubmit,
    
    // Inline editing
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
    
    // Permissions dialog
    permissionsDialogOpen,
    selectedRoleForPermissions,
    handleViewPermissions,
    handleClosePermissionsDialog,
    
    // Columns
    columns,
    visibleColumns,
  }
}
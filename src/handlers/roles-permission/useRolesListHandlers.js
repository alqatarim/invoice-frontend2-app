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
  const [inlineLoading, setInlineLoading] = useState(false)
  
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
  
  // Inline editing handlers
  const handleStartInlineEdit = useCallback((role) => {
    // Prevent editing Super Admin role
    if (role.roleName === 'Super Admin') {
      enqueueSnackbar('Super Admin role cannot be edited', { variant: 'warning' })
      return
    }
    
    setEditingRoleId(role._id)
    setEditingValue(role.roleName)
  }, [enqueueSnackbar])
  
  const handleInlineEditChange = useCallback((value) => {
    setEditingValue(value)
  }, [])
  
  const handleSaveInlineEdit = useCallback(async () => {
    if (!editingRoleId || !editingValue?.trim()) {
      enqueueSnackbar('Role name cannot be empty', { variant: 'error' })
      return
    }

    const trimmedValue = editingValue.trim()
    const originalRole = roles.find(role => role._id === editingRoleId)
    
    if (originalRole?.roleName === trimmedValue) {
      // No changes made
      setEditingRoleId(null)
      setEditingValue('')
      return
    }

    setInlineLoading(true)
    try {
      const formData = new FormData()
      formData.append('_id', editingRoleId)
      formData.append('roleName', trimmedValue)
      
      const result = await updateRole(formData)

      if (result.success) {
        enqueueSnackbar(result.message, { variant: 'success' })
        
        // Update local state optimistically
        setRoles(prev => prev.map(role => 
          role._id === editingRoleId 
            ? { ...role, roleName: trimmedValue }
            : role
        ))
        
        setEditingRoleId(null)
        setEditingValue('')
        
        // Optionally refresh data from server
        router.refresh()
      } else {
        enqueueSnackbar(result.error || 'Failed to update role', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error updating role:', error)
      enqueueSnackbar('An error occurred while updating role', { variant: 'error' })
    } finally {
      setInlineLoading(false)
    }
  }, [editingRoleId, editingValue, roles, enqueueSnackbar, router])
  
  const handleCancelInlineEdit = useCallback(() => {
    setEditingRoleId(null)
    setEditingValue('')
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
    inlineLoading,
    handleStartInlineEdit,
    handleInlineEditChange,
    handleSaveInlineEdit,
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
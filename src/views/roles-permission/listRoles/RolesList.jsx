'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import {
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Grid,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { usePermission } from '@/Auth/usePermission'

import RolesHead from './rolesHead'
import CustomListTable from '@/components/custom-components/CustomListTable'
import RoleDialog from '@/components/dialogs/role-dialog'
import PermissionsDialog from '@/components/dialogs/permissions-dialog'
import { useRolesListHandlers } from '@/handlers/roles-permission/useRolesListHandlers'
import AppSnackbar from '@/components/shared/AppSnackbar'
import rolesColumns from './rolesColumns'

const RolesList = ({ initialData }) => {
  const theme = useTheme()
  const handlers = useRolesListHandlers(initialData)

  // Permissions
  const permissions = {
    canCreate: usePermission('role', 'create'),
    canUpdate: usePermission('role', 'update'),
    canView: usePermission('role', 'view'),
    canDelete: usePermission('role', 'delete'),
  }

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  // Column state management
  const [columnsState, setColumns] = useState(handlers.columns || [])
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false)

  // Column actions
  const columnActions = {
    open: () => setManageColumnsOpen(true),
    close: () => setManageColumnsOpen(false),
    save: () => {
      setManageColumnsOpen(false)
      // You can add logic here to save column preferences
    },
  }

  // Handle column checkbox changes
  const handleColumnCheckboxChange = (columnKey, checked) => {
    setColumns(prev => 
      prev.map(col => 
        col.key === columnKey ? { ...col, visible: checked } : col
      )
    )
  }

  // Format roles data for table
  const formattedRoles = Array.isArray(handlers.roles) ? handlers.roles.map((role, index) => ({
    ...role,
    id: index + 1 + (handlers.paginationModel?.page || 0) * (handlers.paginationModel?.pageSize || 10),
  })) : []

  // Get column definitions with inline editing handlers
  const columnDefs = rolesColumns({
    handleEdit: handlers.handleEdit,
    handleViewPermissions: handlers.handleViewPermissions,
    canEdit: permissions.canUpdate,
    // Inline editing props
    editingRoleId: handlers.editingRoleId,
    editingValue: handlers.editingValue,
    editingIcon: handlers.editingIcon,
    editingMode: handlers.editingMode,
    inlineLoading: handlers.inlineLoading,
    handleStartNameEdit: handlers.handleStartNameEdit,
    handleInlineEditChange: handlers.handleInlineEditChange,
    handleIconChange: handlers.handleIconChange,
    handleSaveNameEdit: handlers.handleSaveNameEdit,
    handleCancelInlineEdit: handlers.handleCancelInlineEdit,
  })

  // Build table columns with visible filter
  const tableColumns = useMemo(() =>
    columnDefs.filter(col => 
      columnsState.some(vc => vc.key === col.key && vc.visible)
    ),
    [columnDefs, columnsState]
  )

  // Filter values for the filter component
  const filterValues = {
    roleName: [],
    fromDate: '',
    toDate: '',
  }

  // Filter handlers
  const handleFilterValueChange = (field, value) => {
    // Handle filter value changes
  }

  const handleFilterApply = (values) => {
    // Handle filter apply
  }

  const handleFilterReset = () => {
    // Handle filter reset
  }

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <RolesHead cardCounts={handlers.cardCounts} />

      <Grid container spacing={3}>
        {/* Roles Table */}
        <Grid item size={12}>
          <CustomListTable
            title="Roles"
            addRowButton={
              permissions.canCreate && (
                <Button
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                  onClick={handlers.handleAdd}
                >
                  New Role
                </Button>
              )
            }
            columns={tableColumns}
            rows={formattedRoles}
            loading={handlers.loading}
            pagination={{
              page: handlers.paginationModel?.page || 0,
              pageSize: handlers.paginationModel?.pageSize || 10,
              total: handlers.totalCount || 0
            }}
            onPageChange={handlers.handlePageChange}
            onRowsPerPageChange={handlers.handlePageSizeChange}
            noDataText="No roles found."
            rowKey={(row) => row._id || row.id}
            showSearch
            searchValue={handlers.searchQuery || ''}
            onSearchChange={handlers.handleSearchChange}
            searchPlaceholder="Search roles..."
            onRowClick={
              permissions.canView
                ? (row) => handlers.handleViewPermissions(row._id)
                : undefined
            }
            enableHover
          />
        </Grid>
      </Grid>

      {/* Manage Columns Dialog */}
      <Dialog open={manageColumnsOpen} onClose={columnActions.close}>
        <DialogTitle>Select Columns</DialogTitle>
        <DialogContent>
          <FormGroup>
            {columnsState.map((column) => (
              <FormControlLabel
                key={column.key}
                control={
                  <Checkbox
                    checked={column.visible}
                    onChange={(e) => handleColumnCheckboxChange(column.key, e.target.checked)}
                  />
                }
                label={column.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={columnActions.close}>Cancel</Button>
          <Button onClick={columnActions.save} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Dialog for Adding New Roles */}
      <RoleDialog
        open={handlers.openDialog}
        onClose={handlers.handleCloseDialog}
        data={handlers.editData}
        onSubmit={handlers.handleSubmit}
        loading={handlers.dialogLoading}
      />

      {/* Permissions Dialog */}
      <PermissionsDialog
        open={handlers.permissionsDialogOpen}
        onClose={handlers.handleClosePermissionsDialog}
        roleId={handlers.selectedRoleForPermissions?._id}
        roleName={handlers.selectedRoleForPermissions?.roleName}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
      />
    </div>
  )
}

export default RolesList
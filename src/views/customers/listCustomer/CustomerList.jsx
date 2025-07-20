'use client'

import React, { useState, useMemo, useCallback, useRef } from 'react'
import { Snackbar, Alert, useTheme, Button, Card, CardContent, Box } from '@mui/material'
import CustomListTable from '@/components/custom-components/CustomListTable'
import { AddCustomerDrawer } from '../addCustomer'
import { getCustomerColumns } from './customerColumns'
import { usePermission } from '@/Auth/usePermission'
import { useCustomerListHandlers } from '@/handlers/customers/useCustomerListHandlers'
import CustomerHead from '@/views/customers/listCustomer/customerHead'

/**
 * CustomerList Component - Now using TanStack Table like template with proper search integration
 */
const CustomerList = ({
  initialCustomers = [],
  pagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts = { totalCustomers: 0, activeCustomers: 0, inactiveCustomers: 0 },
}) => {
  // Permissions
  const permissions = {
    canCreate: usePermission('customer', 'create'),
    canEdit: usePermission('customer', 'edit'),
    canView: usePermission('customer', 'view'),
    canDelete: usePermission('customer', 'delete'),
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

  // Use refs for notification handlers to ensure stable references
  const onErrorRef = useRef()
  const onSuccessRef = useRef()
  
  onErrorRef.current = (msg) => setSnackbar({ open: true, message: msg, severity: 'error' })
  onSuccessRef.current = (msg) => setSnackbar({ open: true, message: msg, severity: 'success' })

  // Stable callback wrappers
  const onError = useCallback((msg) => onErrorRef.current(msg), [])
  const onSuccess = useCallback((msg) => onSuccessRef.current(msg), [])

  const theme = useTheme()

  // Add Customer Drawer state
  const [customerUserOpen, setCustomerUserOpen] = useState(false)

  // Stable permissions object - only recreate when actual permissions change
  const stablePermissions = useMemo(() => ({
    canCreate: permissions.canCreate,
    canEdit: permissions.canEdit,
    canView: permissions.canView,
    canDelete: permissions.canDelete,
  }), [permissions.canCreate, permissions.canEdit, permissions.canView, permissions.canDelete])

  // Memoize columns with stable dependencies
  const columns = useMemo(() => {
    return getCustomerColumns({ theme, permissions: stablePermissions })
  }, [theme?.palette?.mode, stablePermissions]) // Only depend on theme mode, not entire theme object

  // Handlers - properly configured with all functionality
  const handlers = useCustomerListHandlers({
    initialCustomers: initialCustomers,
    initialPagination: pagination,
    initialSortBy: 'createdAt',
    initialSortDirection: 'desc',
    initialColumns: columns,
    onError,
    onSuccess,
  })

  // Build table columns with action handlers
  const tableColumns = useMemo(
    () =>
      columns.map(col => ({
        ...col,
        renderCell: col.renderCell
          ? (row, idx) =>
              col.renderCell(row, {
                handleDeleteClick: handlers.handleDeleteClick,
                handleActivateClick: handlers.handleActivateClick,
                handleDeactivateClick: handlers.handleDeactivateClick,
                handleEdit: handlers.handleEdit,
                handleView: handlers.handleView,
                permissions,
                pagination: handlers.pagination,
              })
          : undefined,
      })),
    [columns, handlers.handleDeleteClick, handlers.handleActivateClick, 
     handlers.handleDeactivateClick, handlers.handleEdit, handlers.handleView, 
     handlers.pagination, permissions]
  )

  return (
    <Box className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <CustomerHead
        customerListData={cardCounts}
        currencyData={'SAR'}
        isLoading={false}
      />

      {/* Main Customer Table - Properly connected to handlers */}
      <CustomListTable
        addRowButton={
          <Button
            variant='contained'
            color='primary'
            className=''
            startIcon={<i className='ri-add-line' />}
            onClick={() => setCustomerUserOpen(true)}
          >
            Add Customer
          </Button>
        }
        showSearch={true}
        searchValue={handlers.searchTerm || ''}
        onSearchChange={handlers.handleSearchInputChange}
        searchPlaceholder="Search customers..."
        columns={tableColumns}
        rows={handlers.customers}
        loading={handlers.loading}
        pagination={{
          page: handlers.pagination.current - 1,
          pageSize: handlers.pagination.pageSize,
          total: handlers.pagination.total,
        }}
        onPageChange={(newPage) => handlers.handlePageChange(newPage + 1)}
        onRowsPerPageChange={handlers.handlePageSizeChange}
        onSort={handlers.handleSortChange}
        sortBy={handlers.sortBy}
        sortDirection={handlers.sortDirection}
        noDataText='No customers found.'
        rowKey={row => row._id || row.id}
      />
 
      <AddCustomerDrawer
        open={customerUserOpen}
        handleClose={() => setCustomerUserOpen(false)}
        setData={() => {}}
        customerData={handlers.customers}
        onSuccess={onSuccess}
        onError={onError}
      />
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} className="w-full">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default CustomerList
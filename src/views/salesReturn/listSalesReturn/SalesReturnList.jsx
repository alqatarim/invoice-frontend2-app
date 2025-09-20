'use client'

import React, { useState, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Snackbar, Alert, useTheme, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, Typography } from '@mui/material'
import { Icon } from '@iconify/react'
import CustomListTable from '@/components/custom-components/CustomListTable'
import { getSalesReturnColumns } from './salesReturnColumns'
import { usePermission } from '@/Auth/usePermission'
import { useSalesReturnListHandlers } from '@/handlers/salesReturn/list/useSalesReturnListHandlers'

/**
 * SalesReturnList Component - Now using customer pattern with proper search integration
 */
const SalesReturnList = ({
  initialSalesReturns = [],
  pagination = { current: 1, pageSize: 10, total: 0 },
}) => {
  // Permissions
  const permissions = {
    canCreate: usePermission('creditNote', 'create'),
    canUpdate: usePermission('creditNote', 'update'),
    canView: usePermission('creditNote', 'view'),
    canDelete: usePermission('creditNote', 'delete'),
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

  // Stable permissions object - only recreate when actual permissions change
  const stablePermissions = useMemo(() => ({
    canCreate: permissions.canCreate,
    canUpdate: permissions.canUpdate,
    canView: permissions.canView,
    canDelete: permissions.canDelete,
  }), [permissions.canCreate, permissions.canUpdate, permissions.canView, permissions.canDelete])

  // Memoize columns with stable dependencies
  const columns = useMemo(() => {
    return getSalesReturnColumns({ theme, permissions: stablePermissions })
  }, [theme?.palette?.mode, stablePermissions]) // Only depend on theme mode, not entire theme object

  // Handlers - properly configured with all functionality
  const handlers = useSalesReturnListHandlers({
    initialSalesReturns: initialSalesReturns,
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
              handleView: handlers.handleView,
              handleEdit: handlers.handleEdit,
              handlePrintDownload: handlers.handlePrintDownload,
              handleProcessRefund: handlers.handleProcessRefund,
              permissions,
              pagination: handlers.pagination,
            })
          : undefined,
      })),
    [columns, handlers.handleDeleteClick, handlers.handleView, handlers.handleEdit,
      handlers.handlePrintDownload, handlers.handleProcessRefund, handlers.pagination, permissions]
  )

  return (
    <Box className='flex flex-col gap-5'>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <div className='bg-primary/12 text-primary bg-primaryLight w-12 h-12 rounded-full flex items-center justify-center'>
            <Icon icon="mdi:invoice-export-outline" fontSize={26} style={{ transform: 'scaleX(-1)' }} />
          </div>
          <Typography variant="h5" className="font-semibold text-primary">
            Sales Returns
          </Typography>
        </div>
      </div>

      {/* Main Sales Return Table - Properly connected to handlers */}
      <CustomListTable
        addRowButton={
          permissions.canCreate && (
            <Button
              variant='contained'
              color='primary'
              startIcon={<Icon icon="tabler:plus" />}
              component={Link}
              href="/sales-return/sales-return-add"
            >
              Add Sales Return
            </Button>
          )
        }
        showSearch={true}
        searchValue={handlers.searchTerm || ''}
        onSearchChange={handlers.handleSearchInputChange}
        searchPlaceholder="Search sales returns..."
        columns={tableColumns}
        rows={handlers.salesReturns}
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
        noDataText='No sales returns found.'
        rowKey={row => row._id || row.id}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={handlers.deleteDialogOpen}
        onClose={handlers.handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Sales Return</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this sales return? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handlers.handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default SalesReturnList
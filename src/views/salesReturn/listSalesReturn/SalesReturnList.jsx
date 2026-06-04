'use client'

import React, { useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useTheme, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box } from '@mui/material'
import { Icon } from '@iconify/react'
import CustomListTable from '@/components/custom-components/CustomListTable'
import { getSalesReturnColumns } from './salesReturnColumns'
import { usePermission } from '@/Auth/usePermission'
import { useSalesReturnListHandlers } from './handler'
import { useSnackbar } from 'notistack'
import SalesReturnHead from './salesReturnHead'

/**
 * SalesReturnList Component - Now using customer pattern with proper search integration
 */
const SalesReturnList = ({
  initialSalesReturns = [],
  pagination = { current: 1, pageSize: 10, total: 0 },
  initialCardCounts,
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar()

  // Permissions
  const permissions = {
    canCreate: usePermission('creditNote', 'create'),
    canUpdate: usePermission('creditNote', 'update'),
    canView: usePermission('creditNote', 'view'),
    canDelete: usePermission('creditNote', 'delete'),
  }

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' })
    }
  }, [enqueueSnackbar, initialErrorMessage])

  // Stable callback wrappers
  const onError = useCallback((msg) => enqueueSnackbar(msg, { variant: 'error' }), [enqueueSnackbar])
  const onSuccess = useCallback((msg) => enqueueSnackbar(msg, { variant: 'success' }), [enqueueSnackbar])

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
    initialCardCounts,
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
              handleSetAsPending: handlers.handleSetAsPending,
              permissions,
              pagination: handlers.pagination,
            })
          : undefined,
      })),
    [columns, handlers.handleDeleteClick, handlers.handleView, handlers.handleEdit,
      handlers.handlePrintDownload, handlers.handleProcessRefund, handlers.handleSetAsPending, handlers.pagination, permissions]
  )

  return (
    <Box className='flex flex-col gap-5'>
      {/* Header Section */}
      <SalesReturnHead salesReturnListData={handlers.cardCounts || initialCardCounts} />

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
        onPageChange={handlers.handlePageChange}
        onRowsPerPageChange={handlers.handlePageSizeChange}
        onSort={handlers.handleSortChange}
        sortBy={handlers.sortBy}
        sortDirection={handlers.sortDirection}
        noDataText='No sales returns found.'
        rowKey={row => row._id || row.id}
        onRowClick={
          permissions.canView
            ? (row) => handlers.handleView(row._id)
            : undefined
        }
        enableHover
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

    </Box>
  )
}

export default SalesReturnList
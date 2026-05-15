'use client'

import React, { useCallback, useMemo, useState } from 'react'
import {
  Box,
  Button,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  Paper,
  Popper,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import { useSnackbar } from 'notistack'
import CustomListTable from '@/components/custom-components/CustomListTable'
import { AddCustomerDrawer } from '../addCustomer'
import { getCustomerColumns } from './customerColumns'
import { usePermission } from '@/Auth/usePermission'
import CustomerHead from '@/views/customers/listCustomer/customerHead'
import { useCustomerListHandler } from './handler'
import { getDefaultCustomerSummary } from './customerSummary'

const CustomerList = ({
  initialCustomers = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSummary = getDefaultCustomerSummary(),
}) => {
  const theme = useTheme()
  const { enqueueSnackbar } = useSnackbar()

  const permissions = {
    canCreate: usePermission('customer', 'create'),
    canEdit: usePermission('customer', 'edit'),
    canView: usePermission('customer', 'view'),
    canDelete: usePermission('customer', 'delete'),
  }

  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false)

  const onError = useCallback(message => {
    enqueueSnackbar(message, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: true,
    })
  }, [enqueueSnackbar])

  const onSuccess = useCallback(message => {
    enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: 3000,
    })
  }, [enqueueSnackbar])

  const stablePermissions = useMemo(
    () => ({
      canCreate: permissions.canCreate,
      canEdit: permissions.canEdit,
      canView: permissions.canView,
      canDelete: permissions.canDelete,
    }),
    [permissions.canCreate, permissions.canDelete, permissions.canEdit, permissions.canView]
  )

  const handler = useCustomerListHandler({
    initialCustomers,
    initialPagination,
    initialSummary,
    initialSortBy: 'createdAt',
    initialSortDirection: 'desc',
    onError,
    onSuccess,
  })

  const columns = useMemo(
    () => getCustomerColumns({ theme, permissions: stablePermissions }),
    [stablePermissions, theme]
  )

  const tableColumns = useMemo(
    () =>
      columns.map(column => ({
        ...column,
        renderCell: column.renderCell
          ? row =>
              column.renderCell(row, {
                handleDeleteClick: handler.handleDeleteClick,
                handleActivateClick: handler.handleActivateClick,
                handleDeactivateClick: handler.handleDeactivateClick,
                handleEdit: handler.handleEdit,
                handleView: handler.handleView,
                permissions,
                pagination: handler.pagination,
              })
          : undefined,
      })),
    [columns, handler, permissions]
  )

  const tablePagination = useMemo(
    () => ({
      page: handler.pagination.current - 1,
      pageSize: handler.pagination.pageSize,
      total: handler.pagination.total,
    }),
    [handler.pagination]
  )

  return (
    <Box className='flex flex-col gap-5'>
      <CustomerHead
        summary={handler.summary}
      />

      <CustomListTable
        addRowButton={
          permissions.canCreate && (
            <Button
              onClick={() => setCustomerDrawerOpen(true)}
              variant="contained"
              startIcon={<Icon icon="tabler:plus" />}
            >
              New Customer
            </Button>
          )
        }
        columns={tableColumns}
        rows={handler.customers}
        loading={handler.loading}
        pagination={tablePagination}
        onPageChange={handler.handlePageChange}
        onRowsPerPageChange={handler.handlePageSizeChange}
        onSort={handler.handleSortChange}
        sortBy={handler.sortBy}
        sortDirection={handler.sortDirection}
        noDataText='No customers found.'
        rowKey={row => row._id || row.id}
        showSearch={true}
        searchValue={handler.searchTerm || ''}
        onSearchChange={handler.handleSearchInputChange}
        searchPlaceholder="Search customers..."
        onRowClick={permissions.canView ? row => handler.handleView(row) : undefined}
        enableHover
      />

      <AddCustomerDrawer
        open={customerDrawerOpen}
        handleClose={() => setCustomerDrawerOpen(false)}
        setData={() => {}}
        customerData={handler.customers}
        onSuccess={onSuccess}
        onError={onError}
        onCreated={handler.refreshData}
      />

      <Dialog
        open={handler.deleteDialogOpen}
        onClose={handler.handleDeleteCancel}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>Delete Customer</DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            Are you sure you want to delete this customer? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handler.handleDeleteCancel} color='primary'>
            Cancel
          </Button>
          <Button onClick={handler.handleDeleteConfirm} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Popper
        open={handler.activateDialogOpen}
        anchorEl={handler.activateAnchorEl}
        placement='bottom-start'
        transition
        disablePortal
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper className='max-w-xs border p-4 shadow-lg'>
              <ClickAwayListener onClickAway={handler.handleActivateCancel}>
                <Box>
                  <Typography variant='subtitle1' className='mb-2 font-medium'>
                    Are you sure you want to activate?
                  </Typography>
                  <Box className='flex justify-end gap-2'>
                    <Button size='small' onClick={handler.handleActivateCancel} color='primary'>
                      Cancel
                    </Button>
                    <Button size='small' onClick={handler.handleActivateConfirm} color='success' variant='contained'>
                      Activate
                    </Button>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>

      <Popper
        open={handler.deactivateDialogOpen}
        anchorEl={handler.deactivateAnchorEl}
        placement='bottom-start'
        transition
        disablePortal
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper className='max-w-xs border p-4 shadow-lg'>
              <ClickAwayListener onClickAway={handler.handleDeactivateCancel}>
                <Box>
                  <Typography variant='subtitle1' className='mb-2 font-medium'>
                    Are you sure you want to deactivate?
                  </Typography>
                  <Box className='flex justify-end gap-2'>
                    <Button size='small' onClick={handler.handleDeactivateCancel} color='primary'>
                      Cancel
                    </Button>
                    <Button size='small' onClick={handler.handleDeactivateConfirm} color='warning' variant='contained'>
                      Deactivate
                    </Button>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  )
}

export default CustomerList
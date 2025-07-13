'use client'

import React, { useState, useMemo } from 'react'
import { Snackbar, Alert, useTheme, Button, Card, CardContent, Box } from '@mui/material'
import CustomListTable from '@/components/custom-components/CustomListTable'
import { AddCustomerDrawer } from '../addCustomer'
import { getCustomerColumns } from './customerColumns'
import { usePermission } from '@/Auth/usePermission'
import { useCustomerListHandlers } from '@/handlers/customers/useCustomerListHandlers'
import CustomerHead from '@/views/customers/listCustomer/customerHead'
import CustomerFilter from './customerFilter'

/**
 * CustomerList Component - Now using TanStack Table like template
 */
const CustomerList = ({
  initialCustomers = [],
  pagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts = { totalCustomers: 0, activeCustomers: 0, inactiveCustomers: 0 },
}) => {
  // Permissions
  const permissions = {
    canCreate: usePermission('customer', 'create'),
    canUpdate: usePermission('customer', 'update'),
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

  // Notification handlers
  const onError = msg => setSnackbar({ open: true, message: msg, severity: 'error' })
  const onSuccess = msg => setSnackbar({ open: true, message: msg, severity: 'success' })

  const theme = useTheme()

  // Add Customer Drawer state
  const [customerUserOpen, setCustomerUserOpen] = useState(false)

  // Memoize columns
  const columns = useMemo(() => getCustomerColumns({ theme, permissions }), [theme, permissions])

  // Handlers (mimic InvoiceList pattern)
  const handlers = useCustomerListHandlers({
    initialCustomers: initialCustomers,
    initialPagination: { current: 1, pageSize: 10, total: initialCustomers.length },
    initialTab: 'ALL',
    initialFilters: {},
    initialSortBy: '',
    initialSortDirection: 'asc',
    initialColumns: columns,
    onError,
    onSuccess,
  })

  // Column state management
  const [columnsState, setColumns] = useState(columns)

  // Build table columns with action handlers
  const tableColumns = useMemo(
    () =>
      columnsState.map(col => ({
        ...col,
        renderCell: col.renderCell
          ? (row, idx) =>
              col.renderCell(row, {
                ...handlers,
                permissions,
                pagination: handlers.pagination,
              })
          : undefined,
      })),
    [columnsState, handlers, permissions, handlers.pagination]
  )

  // Filter/search state
  const [search, setSearch] = useState('')

  // Optionally filter the customers based on search
  const filteredCustomers = useMemo(() => {
    if (!search) return handlers.customers
    const lower = search.toLowerCase()
    return handlers.customers.filter(c =>
      c.name?.toLowerCase().includes(lower) ||
      c.email?.toLowerCase().includes(lower) ||
      c.phone?.toLowerCase().includes(lower)
    )
  }, [search, handlers.customers])

  return (
    <Box className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <CustomerHead
        customerListData={cardCounts}
        currencyData={'SAR'}
        isLoading={false}
      />

      {/* Main Customer Table - TanStack Implementation */}
    
      


       
        <CustomListTable
        addRowButton={<Button
            variant='contained'
            color='primary'
            className=''
            startIcon={<i className='ri-add-line' />}
            onClick={() => setCustomerUserOpen(true)}
          >
            Add Customer
          </Button>}
          showSearch={true}
          columns={tableColumns}
          rows={filteredCustomers}
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
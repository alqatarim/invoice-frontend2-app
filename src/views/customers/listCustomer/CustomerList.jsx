'use client'

import React, { useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

import { usePermission } from '@/Auth/usePermission'
import CustomerHead from '@/views/customers/listCustomer/customerHead'
import CustomerListTable from './CustomerListTable'

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

  return (
    <div className='flex flex-col gap-5'>
      {/* Header and Stats */}
      <CustomerHead
        customerListData={cardCounts}
        currencyData={'SAR'}
        isLoading={false}
      />

      {/* Main Customer Table - TanStack Implementation */}
      <CustomerListTable
        customerData={initialCustomers}
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
    </div>
  )
}

export default CustomerList
'use client'

import React, { useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import { usePermissions } from '@/Auth/PermissionsContext'
import AppSnackbarProvider from '@/components/shared/AppSnackbarProvider'

import LeftSection from './LeftSection'
import RightSection from './RightSection'

const ViewCustomer = ({ customerData, customerInvoiceData, customerId }) => {
  const router = useRouter()
  const permissionState = usePermissions()


  // Permissions
  const permissions = useMemo(
    () => ({
      canEdit: permissionState.hasPermission('customer', 'edit'),
      canView: permissionState.hasPermission('customer', 'view'),
      canCreateInvoice: permissionState.hasPermission('invoice', 'create'),
    }),
    [permissionState]
  )

  const invoiceCustomerData = customerInvoiceData?.customerDetails?.[0]
  const invoices = useMemo(() => invoiceCustomerData?.invoiceRecs || [], [invoiceCustomerData?.invoiceRecs])
  const cardDetails = useMemo(() => customerInvoiceData?.cardDetails?.[0] || {}, [customerInvoiceData?.cardDetails])
  const paymentTransactions = useMemo(
    () => customerInvoiceData?.paymentTransactions || [],
    [customerInvoiceData?.paymentTransactions]
  )

  // Handle customer update - refresh the page to get updated data
  const handleCustomerUpdate = useCallback((updatedCustomer) => {
    // Since this is a server component pattern, we refresh the page to get updated data
    router.refresh()
  }, [router])

  if (permissionState?.isLoading) {
    return (

      <Box className='flex flex-col items-center gap-4 py-12'>
        <CircularProgress size={32} />
      </Box>

    )
  }

  if (!permissions.canView) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center gap-4 py-12'>
          <div className='flex items-center gap-3'>
            <i className='ri-error-warning-line text-error text-2xl' />
            <Typography variant="h6" color="error" className='font-semibold'>
              Access Denied
            </Typography>
          </div>
          <Typography variant='body2' color='text.secondary' className='text-center'>
            You don't have permission to view customer details. Please contact your administrator.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Validate customer data exists
  if (!customerData || !customerData._id) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center gap-4 py-12'>
          <div className='flex items-center gap-3'>
            <i className='ri-user-unfollow-line text-secondary text-2xl' />
            <Typography variant="h6" color="text.secondary" className='font-semibold'>
              Customer Not Found
            </Typography>
          </div>
          <Typography variant='body2' color='text.secondary' className='text-center'>
            The requested customer data could not be found or loaded properly.
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <AppSnackbarProvider maxSnack={7}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          {/* <TopSection
            customerId={customerData._id}
            customer={customerData}
            permissions={permissions}
          /> */}
        </Grid>
        <Grid size={{ xs: 12, md: 3.5 }}>
          <LeftSection
            customerData={customerData}
            cardDetails={cardDetails}
            permissions={permissions}
            onCustomerUpdate={handleCustomerUpdate}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8.5 }}>
          <RightSection
            customerData={customerData}
            invoices={invoices}
            cardDetails={cardDetails}
            paymentTransactions={paymentTransactions}
            onCustomerUpdate={handleCustomerUpdate}
          />
        </Grid>
      </Grid>
    </AppSnackbarProvider>
  )
}

export default ViewCustomer
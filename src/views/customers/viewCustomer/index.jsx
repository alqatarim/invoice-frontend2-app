'use client'

import React, { useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { SnackbarProvider } from 'notistack'

// Component Imports
import { usePermission } from '@/Auth/usePermission'
import { formatCurrency } from '@/utils/currencyUtils'

// Dynamic imports for better performance
import dynamic from 'next/dynamic'

const TopSection = dynamic(() => import('./TopSection'), {
  loading: () => <div className="h-24 bg-gray-100 animate-pulse rounded-lg" />,
})

const LeftSection = dynamic(() => import('./LeftSection'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
})

const RightSection = dynamic(() => import('./RightSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
})



const ViewCustomer = ({ customerData, customerId }) => {
  const router = useRouter()


  // Permissions
  const permissions = {
    canEdit: usePermission('customer', 'edit'),
    canView: usePermission('customer', 'view'),
    canCreateInvoice: usePermission('invoice', 'create'),
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

  // Extract data from the provided structure - customerDetails array contains the customer info
  const customer = customerData?.customerDetails?.[0] || customerData?.customer || customerData
  const invoices = customer?.invoiceRecs || customerData?.invoices || []
  const cardDetails = useMemo(() =>
    customerData?.cardDetails?.[0] || {},
    [customerData?.cardDetails]
  )

  // Handle customer update - refresh the page to get updated data
  const handleCustomerUpdate = useCallback((updatedCustomer) => {
    // Since this is a server component pattern, we refresh the page to get updated data
    router.refresh()
  }, [router])

  // Validate customer data exists
  if (!customer || !customer._id) {
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
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={2000}
    >
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <TopSection
            customerId={customer._id}
            customer={customer}
            permissions={permissions}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeftSection
            customerData={customer}
            cardDetails={cardDetails}
            permissions={permissions}
            onCustomerUpdate={handleCustomerUpdate}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <RightSection
            customerData={customer}
            invoices={invoices}
            cardDetails={cardDetails}
            onCustomerUpdate={handleCustomerUpdate}
          />
        </Grid>
      </Grid>
    </SnackbarProvider>
  )
}

export default ViewCustomer
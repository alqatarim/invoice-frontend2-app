'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import { usePermission } from '@/Auth/usePermission'
import { formatCurrency } from '@/utils/currencyUtils'
import TopSection from './TopSection'
import LeftSection from './LeftSection'
import RightSection from './RightSection'



const ViewCustomer = ({ customerData, customerId }) => {
 


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
        />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <RightSection
          customerData={customer}
          invoices={invoices}
          cardDetails={cardDetails}
        />
      </Grid>
    </Grid>
  )
}

export default ViewCustomer
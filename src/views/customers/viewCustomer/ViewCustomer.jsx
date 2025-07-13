'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import { usePermission } from '@/Auth/usePermission'
import { formatCurrency } from '@/utils/currencyUtils'
import CustomerDetailsHeader from './CustomerDetailsHeader'
import CustomerLeftOverview from './CustomerLeftOverview'
import CustomerRight from './CustomerRight'

const ViewCustomer = ({ customerData, customerId }) => {
  const router = useRouter()

  // Permissions
  const permissions = {
    canUpdate: usePermission('customer', 'update'),
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
  const cardDetails = customerData?.cardDetails?.[0] || {}
  
  // Calculate totals from cardDetails
  const totalInvoices = cardDetails?.totalRecs?.[0]?.count || invoices?.length || 0
  const totalAmount = cardDetails?.totalRecs?.[0]?.amount || 0
  const outstandingAmount = cardDetails?.outStandingRecs?.[0]?.amount || 0
  const paidAmount = totalAmount - outstandingAmount

  // Transform customer data to match template format
  const templateCustomerData = {
    customer: customer?.name || 'N/A',
    customerId: customer?._id?.slice(-8) || customerId?.slice(-8) || 'N/A',
    email: customer?.email || 'No email provided',
    avatar: customer?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${customer.image}` : null,
    order: totalInvoices,
    totalSpent: outstandingAmount, // Outstanding amount for the customer
    country: customer?.billingAddress?.country || customer?.shippingAddress?.country || 'N/A',
    phone: customer?.phone || 'N/A',
    status: customer?.status || 'Active'
  }

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
        <CustomerDetailsHeader 
          customerId={customer._id} 
          customer={customer}
          permissions={permissions}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CustomerLeftOverview 
          customerData={templateCustomerData}
          originalCustomerData={customer}
          cardDetails={cardDetails}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <CustomerRight 
          customerData={customer}
          invoices={invoices}
          cardDetails={cardDetails}
        />
      </Grid>
    </Grid>
  )
}

export default ViewCustomer
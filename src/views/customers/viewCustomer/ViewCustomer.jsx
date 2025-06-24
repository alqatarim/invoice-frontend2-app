'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { usePermission } from '@/Auth/usePermission'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
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
        <CardContent>
          <Typography variant="h6" color="error">
            You don't have permission to view customer details
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Extract data from the correct structure
  const customer = customerData?.customerDetails?.[0] || customerData?.customer || customerData
  const invoices = customer?.invoiceRecs || customerData?.invoices || []
  const cardDetails = customerData?.cardDetails?.[0] || {}
  
  // Calculate totals from cardDetails or fallback to invoice calculations
  const totalInvoices = cardDetails?.totalRecs?.[0]?.count || invoices?.length || 0
  const totalAmount = cardDetails?.totalRecs?.[0]?.amount || invoices?.reduce((sum, invoice) => sum + (invoice.TotalAmount || 0), 0) || 0
  const totalPaid = totalAmount - (cardDetails?.outStandingRecs?.[0]?.amount || 0)
  const totalBalance = cardDetails?.outStandingRecs?.[0]?.amount || (totalAmount - totalPaid)

  // Transform customer data to match template format
  const templateCustomerData = {
    customer: customer?.name || 'N/A',
    customerId: customer?._id?.slice(-8) || 'N/A',
    email: customer?.email || 'No email',
    avatar: customer?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${customer.image}` : null,
    order: totalInvoices,
    totalSpent: totalBalance,
    country: customer?.billingAddress?.country || 'N/A',
    phone: customer?.phone || 'N/A',
    status: customer?.status || 'Active'
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CustomerDetailsHeader 
          customerId={customerId} 
          customer={customer}
          permissions={permissions}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CustomerLeftOverview customerData={templateCustomerData} />
      </Grid>
      <Grid item xs={12} md={8}>
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
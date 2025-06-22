'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Button,
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import { usePermission } from '@/Auth/usePermission'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder'
import CustomListTable from '@/components/custom-components/CustomListTable'
import moment from 'moment'

const ViewCustomer = ({ customerData, customerId }) => {
  const router = useRouter()
  const theme = useTheme()

  // Permissions
  const permissions = {
    canUpdate: usePermission('customer', 'update'),
    canView: usePermission('customer', 'view'),
    canCreateInvoice: usePermission('invoice', 'create'),
  }

  if (!permissions.canView) {
    return (
      <Card elevation={0} sx={{ border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'unpaid':
        return 'error'
      case 'partially_paid':
        return 'warning'
      case 'overdue':
        return 'error'
      case 'sent':
        return 'info'
      case 'drafted':
        return 'secondary'
      default:
        return 'default'
    }
  }

  // Column definitions for invoices table
  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice Number',
      renderCell: (row) => (
        <Link href={`/invoices/invoice-view/${row._id}`} passHref>
          <Typography
            className="cursor-pointer text-primary hover:underline font-medium"
            variant="body2"
          >
            {row.invoiceNumber || 'N/A'}
          </Typography>
        </Link>
      )
    },
    {
      key: 'invoiceDate',
      label: 'Created On',
      renderCell: (row) => (
        <Typography variant="body2">
          {moment(row.invoiceDate).format('DD MMM YY')}
        </Typography>
      )
    },
    {
      key: 'TotalAmount',
      label: 'Total Amount',
      renderCell: (row) => (
        <Typography variant="body2" className="font-medium">
          {formatCurrency(row.TotalAmount || 0)}
        </Typography>
      )
    },
    {
      key: 'paidAmount',
      label: 'Paid Amount',
      renderCell: (row) => (
        <Typography variant="body2" className="text-green-600">
          {formatCurrency(row.paidAmount || 0)}
        </Typography>
      )
    },
    {
      key: 'balance',
      label: 'Balance',
      renderCell: (row) => (
        <Typography variant="body2" className="text-red-600">
          {formatCurrency(row.balance || 0)}
        </Typography>
      )
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      renderCell: (row) => (
        <Typography variant="body2">
          {moment(row.dueDate).format('DD MMM YY')}
        </Typography>
      )
    },
    {
      key: 'status',
      label: 'Status',
      renderCell: (row) => (
        <Chip
          label={row.status || 'Unpaid'}
          size="small"
          color={getStatusColor(row.status)}
          variant="tonal"
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      renderCell: (row) => (
        <IconButton
          size="small"
          component={Link}
          href={`/invoices/invoice-view/${row._id}`}
        >
          <Icon icon="tabler:eye" />
        </IconButton>
      )
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card elevation={0} sx={{ border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Avatar className='bg-primary/12 text-primary w-12 h-12'>
                <Icon icon="tabler:user" fontSize={26} />
              </Avatar>
              <Typography variant="h5" className="font-semibold text-primary">
                Customer Details
              </Typography>
            </div>
          }
          action={
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Icon icon="tabler:arrow-left" />}
                onClick={() => router.back()}
              >
                Back
              </Button>
              {permissions.canUpdate && (
                <Button
                  variant="outlined"
                  startIcon={<Icon icon="tabler:edit" />}
                  component={Link}
                  href={`/customers/customer-edit/${customerId}`}
                >
                  Edit
                </Button>
              )}
              {permissions.canCreateInvoice && customer?.status === 'Active' && (
                <Button
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                  component={Link}
                  href={`/invoices/add?customerId=${customerId}`}
                >
                  Create Invoice
                </Button>
              )}
            </Box>
          }
        />
      </Card>

      {/* Customer Profile Card */}
      <Card elevation={0} sx={{ border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <CardContent className="p-6">
          <Grid container spacing={4}>
            {/* Profile Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Avatar
                  src={customer?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${customer.image}` : ''}
                  sx={{ width: 80, height: 80 }}
                >
                  {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
                </Avatar>
                <Box textAlign="center">
                  <Typography variant="h6" className="font-semibold mb-1">
                    {customer?.name || 'N/A'}
                  </Typography>
                  <Chip
                    label={customer?.status || 'Active'}
                    size="small"
                    color={customer?.status === 'Active' ? 'success' : 'default'}
                    variant="tonal"
                  />
                </Box>
              </Box>
            </Grid>

            {/* Contact Details */}
            <Grid item xs={12} sm={6} md={3}>
              <Box className="space-y-4">
                <Box display="flex" alignItems="center" gap={2}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <Icon icon="tabler:mail" className="text-primary" fontSize={20} />
                  </div>
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold">
                      Email Address
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer?.email || 'No email'}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <Icon icon="tabler:phone" className="text-primary" fontSize={20} />
                  </div>
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold">
                      Phone Number
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer?.phone || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Additional Info */}
            <Grid item xs={12} sm={6} md={3}>
              <Box className="space-y-4">
                <Box display="flex" alignItems="center" gap={2}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <Icon icon="tabler:world" className="text-primary" fontSize={20} />
                  </div>
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold">
                      Website
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer?.website || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <Icon icon="tabler:calendar" className="text-primary" fontSize={20} />
                  </div>
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold">
                      Customer Since
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(customer?.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Box className="space-y-4">
                <Box display="flex" alignItems="center" gap={2}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: alpha(theme.palette.success.main, 0.08) }}>
                    <Icon icon="tabler:credit-card" className="text-success" fontSize={20} />
                  </div>
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold">
                      Total Paid
                    </Typography>
                    <Typography variant="body2" className="text-green-600 font-medium">
                      {formatCurrency(totalPaid)}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: alpha(theme.palette.error.main, 0.08) }}>
                    <Icon icon="tabler:clock" className="text-error" fontSize={20} />
                  </div>
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold">
                      Outstanding
                    </Typography>
                    <Typography variant="body2" className="text-red-600 font-medium">
                      {formatCurrency(totalBalance)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Invoice Statistics Cards */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <HorizontalWithBorder
            title="Total Invoices"
            subtitle="No of Invoices"
            titleVariant='h5'
            subtitleVariant='body2'
            stats={totalInvoices.toLocaleString()}
            statsVariant='h4'
            trendNumber={totalInvoices || 0}
            trendNumberVariant='body1'
            avatarIcon='tabler:file-invoice'
            color="info"
            iconSize='30px'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HorizontalWithBorder
            title="Outstanding"
            subtitle="No of Outstanding"
            titleVariant='h5'
            subtitleVariant='body2'
            stats={formatCurrency(cardDetails?.outStandingRecs?.[0]?.amount || 0)}
            statsVariant='h4'
            trendNumber={cardDetails?.outStandingRecs?.[0]?.count || 0}
            trendNumberVariant='body1'
            avatarIcon='tabler:clock'
            color="warning"
            iconSize='30px'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HorizontalWithBorder
            title="Total Overdue"
            subtitle="No of Overdue"
            titleVariant='h5'
            subtitleVariant='body2'
            stats={formatCurrency(cardDetails?.overDueRecs?.[0]?.amount || 0)}
            statsVariant='h4'
            trendNumber={cardDetails?.overDueRecs?.[0]?.count || 0}
            trendNumberVariant='body1'
            avatarIcon='tabler:alert-circle'
            color="error"
            iconSize='30px'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <HorizontalWithBorder
            title="Drafts"
            subtitle="No of Drafts"
            titleVariant='h5'
            subtitleVariant='body2'
            stats={formatCurrency(cardDetails?.draftedRecs?.[0]?.amount || 0)}
            statsVariant='h4'
            trendNumber={cardDetails?.draftedRecs?.[0]?.count || 0}
            trendNumberVariant='body1'
            avatarIcon='tabler:edit'
            color="secondary"
            iconSize='30px'
          />
        </Grid>
      </Grid>

      {/* Customer Details and Address Information */}
      <Grid container spacing={6}>
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardHeader title="Customer Information" />
            <CardContent>
              <Grid container spacing={4}>
                {/* Notes */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {customer?.notes || 'No notes available'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Billing Address */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Billing Address
                  </Typography>
                  <Box className="space-y-1">
                    <Typography variant="body2">{customer?.billingAddress?.name || 'N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer?.billingAddress?.addressLine1 || 'N/A'}
                    </Typography>
                    {customer?.billingAddress?.addressLine2 && (
                      <Typography variant="body2" color="text.secondary">
                        {customer.billingAddress.addressLine2}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {[
                        customer?.billingAddress?.city,
                        customer?.billingAddress?.state,
                        customer?.billingAddress?.pincode
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer?.billingAddress?.country || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Shipping Address */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Shipping Address
                  </Typography>
                  <Box className="space-y-1">
                    <Typography variant="body2">{customer?.shippingAddress?.name || 'N/A'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer?.shippingAddress?.addressLine1 || 'N/A'}
                    </Typography>
                    {customer?.shippingAddress?.addressLine2 && (
                      <Typography variant="body2" color="text.secondary">
                        {customer.shippingAddress.addressLine2}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {[
                        customer?.shippingAddress?.city,
                        customer?.shippingAddress?.state,
                        customer?.shippingAddress?.pincode
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {customer?.shippingAddress?.country || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                {/* Bank Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Bank Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Bank Name: {customer?.bankDetails?.bankName || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Branch: {customer?.bankDetails?.branch || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Account Holder: {customer?.bankDetails?.accountHolderName || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Account Number: {customer?.bankDetails?.accountNumber || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        IFSC Code: {customer?.bankDetails?.IFSC || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Stats */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardHeader title="Summary" />
            <CardContent>
              <Box className="space-y-4">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Total Invoices
                  </Typography>
                  <Typography variant="h6" className="font-semibold">
                    {totalInvoices}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" className="font-semibold">
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Total Paid
                  </Typography>
                  <Typography variant="h6" className="font-semibold text-green-600">
                    {formatCurrency(totalPaid)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Outstanding Balance
                  </Typography>
                  <Typography variant="h6" className="font-semibold text-red-600">
                    {formatCurrency(totalBalance)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Customer Since
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(customer?.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoices Table */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardHeader 
              title={
                <div className="flex items-center gap-2">
                  <Avatar className='bg-primary/12 text-primary w-10 h-10'>
                    <Icon icon="tabler:file-invoice" fontSize={20} />
                  </Avatar>
                  <Typography variant="h6" className="font-semibold">
                    Customer Invoices ({totalInvoices})
                  </Typography>
                </div>
              }
              action={
                permissions.canCreateInvoice && customer?.status === 'Active' && (
                  <Button
                    variant="contained"
                    startIcon={<Icon icon="tabler:plus" />}
                    component={Link}
                    href={`/invoices/add?customerId=${customerId}`}
                  >
                    New Invoice
                  </Button>
                )
              }
            />
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <CustomListTable
                  columns={invoiceColumns}
                  rows={invoices}
                  loading={false}
                  pagination={{
                    page: 0,
                    pageSize: 10,
                    total: invoices.length
                  }}
                  onPageChange={() => {}}
                  onRowsPerPageChange={() => {}}
                  noDataText="No invoices found."
                  rowKey={(row) => row._id}
                />
              ) : (
                <Box textAlign="center" py={6}>
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full" style={{ backgroundColor: alpha(theme.palette.secondary.main, 0.1) }}>
                      <Icon icon="tabler:file-invoice" fontSize="3rem" className="text-secondary" />
                    </div>
                    <div>
                      <Typography variant="h6" color="text.secondary" className="mb-2">
                        No Invoices Found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="mb-4">
                        This customer doesn't have any invoices yet.
                      </Typography>
                    </div>
                    {permissions.canCreateInvoice && customer?.status === 'Active' && (
                      <Button
                        variant="contained"
                        startIcon={<Icon icon="tabler:plus" />}
                        component={Link}
                        href={`/invoices/add?customerId=${customerId}`}
                      >
                        Create First Invoice
                      </Button>
                    )}
                  </div>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default ViewCustomer
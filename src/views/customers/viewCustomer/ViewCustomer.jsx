'use client'

import React, { useState } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import { Icon } from '@iconify/react'
import { usePermission } from '@/Auth/usePermission'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'

const ViewCustomer = ({ customerData, customerId }) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState(null)

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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'unpaid':
        return 'error'
      case 'partially paid':
        return 'warning'
      case 'overdue':
        return 'error'
      default:
        return 'default'
    }
  }

  const customer = customerData?.customer || customerData
  const invoices = customerData?.invoices || []
  const totalInvoices = invoices?.length || 0
  const totalAmount = invoices?.reduce((sum, invoice) => sum + (invoice.TotalAmount || 0), 0) || 0
  const totalPaid = invoices?.reduce((sum, invoice) => sum + (invoice.paidAmount || 0), 0) || 0
  const totalBalance = totalAmount - totalPaid

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card>
        <CardHeader
          title={`Customer Details: ${customer?.name || 'Unknown'}`}
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
                  href={`/customers/edit/${customerId}`}
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

      <Grid container spacing={6}>
        {/* Customer Information */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader title="Customer Information" />
            <CardContent>
              <Grid container spacing={4}>
                {/* Profile Section */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={3} mb={3}>
                    <Avatar
                      src={customer?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${customer.image}` : ''}
                      sx={{ width: 80, height: 80 }}
                    >
                      {customer?.name?.charAt(0)?.toUpperCase() || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" className="font-semibold mb-1">
                        {customer?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" className="mb-1">
                        {customer?.email || 'No email'}
                      </Typography>
                      <Chip
                        label={customer?.status || 'Active'}
                        size="small"
                        color={customer?.status === 'Active' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Contact Information */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Contact Information
                  </Typography>
                  <Box className="space-y-2">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Icon icon="tabler:phone" className="text-gray-500" />
                      <Typography variant="body2">
                        {customer?.phone || 'N/A'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Icon icon="tabler:mail" className="text-gray-500" />
                      <Typography variant="body2">
                        {customer?.email || 'N/A'}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Icon icon="tabler:world" className="text-gray-500" />
                      <Typography variant="body2">
                        {customer?.website || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Notes */}
                <Grid item xs={12} sm={6}>
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
                        IFSC Code: {customer?.bankDetails?.ifscCode || 'N/A'}
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
          <Card>
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
          <Card>
            <CardHeader 
              title={`Invoices (${totalInvoices})`}
              action={
                permissions.canCreateInvoice && customer?.status === 'Active' && (
                  <Button
                    variant="outlined"
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
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice Number</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Paid</TableCell>
                        <TableCell align="right">Balance</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice._id}>
                          <TableCell>
                            <Typography variant="body2" className="font-medium">
                              {invoice.invoiceNumber || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(invoice.invoiceDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(invoice.dueDate)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" className="font-medium">
                              {formatCurrency(invoice.TotalAmount || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" className="text-green-600">
                              {formatCurrency(invoice.paidAmount || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" className="text-red-600">
                              {formatCurrency((invoice.TotalAmount || 0) - (invoice.paidAmount || 0))}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status || 'Unpaid'}
                              size="small"
                              color={getStatusColor(invoice.status)}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              component={Link}
                              href={`/invoices/invoice-view/${invoice._id}`}
                            >
                              <Icon icon="tabler:eye" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Icon icon="tabler:file-invoice" fontSize="3rem" className="text-gray-400 mb-2" />
                  <Typography variant="h6" color="text.secondary" className="mb-2">
                    No Invoices Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="mb-4">
                    This customer doesn't have any invoices yet.
                  </Typography>
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
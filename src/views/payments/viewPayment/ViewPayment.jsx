'use client';

import Link from 'next/link';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper
} from '@mui/material';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/helpers';
import { alpha } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'success':
      return 'success';
    case 'processing':
      return 'warning';
    case 'pending':
      return 'info';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const ViewPayment = ({ payment }) => {
  if (!payment) {
    return (
      <Card>
        <CardContent>
          <Typography variant='body1' color='error'>
            Payment details not found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={4}>
        {/* Header Section - Match AddPayment's header structure */}
        <Grid item xs={12} className='flex justify-start items-center gap-4'>
          <Typography variant='h5' color='primary.main'>
            View Payment
          </Typography>
        </Grid>

        {/* Main Content - Align with AddPayment's card structure */}
        <Grid item xs={12}>
          <Card>
            <CardContent>


              {/* Information Sections - Align grid structure with AddPayment */}
              <Grid container spacing={12}>
                {/* Payment Information Card */}
                <Grid item xs={12} md={12}>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 7 }}>


                      {/* Header */}


              <Box className='flex flex-col gap-2'>

                <Typography variant='h6'>
                  Payment Details
                </Typography>

                <Divider  variant='left' width='300px' />

              </Box>



                      {/* Field Grid */}
                      <Grid container spacing={3}>
                        {/* Payment Number */}
                        <Grid item xs={6} sm={6} md={4} key="payment-number">
                          <Box className='flex flex-col gap-3 p-3 bg-secondaryLighter rounded-md'>
                            <Typography variant='caption' color='textSecondary' className='text-[14px]'>
                              Payment Number
                            </Typography>
                            <Typography variant='h6'>
                              {payment.payment_number}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Amount */}
                        <Grid item xs={6} sm={6} md={4} key="amount">
                         <Box className='flex flex-col gap-3 p-3 bg-secondaryLighter rounded-md'>
                            <Typography variant='caption' color='textSecondary' className='text-[14px]'>
                              Amount
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant='h6'>{payment.amount}</Typography>
                             <Typography variant='h6'>SAR</Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Payment Method */}
                        <Grid item xs={6} sm={6} md={4} key="payment-method">
                          <Box className='flex flex-col gap-3 p-3 bg-secondaryLighter rounded-md'>
                            <Typography variant='caption' color='textSecondary' className='text-[14px]'>
                              Payment Method
                            </Typography>
                        <Typography variant='h6'>
                              {payment.payment_method}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Created Date */}
                         <Grid item xs={6} sm={6} md={4} key="created-date">
                        <Box className='flex flex-col gap-3 p-3 bg-secondaryLighter rounded-md'>
                            <Typography variant='caption' color='textSecondary' className='text-[14px]'>
                              Created Date
                            </Typography>
                          <Typography variant='h6'>
                              {formatDate(payment.createdAt)}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Updated Date */}
                         <Grid item xs={6} sm={6} md={4} key="updated-date">
                       <Box className='flex flex-col gap-3 p-3 bg-secondaryLighter rounded-md'>
                            <Typography variant='caption' color='textSecondary' className='text-[14px]'>
                              Updated Date
                            </Typography>
                            <Typography variant='h6'>
                              {formatDate(payment.updatedAt)}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Status */}
                        <Grid item xs={6} sm={6} md={4} key="status">
                          <Box className='flex flex-col gap-1 p-3 bg-secondaryLighter rounded-md'>
                            <Typography variant='caption' color='textSecondary' className='text-[14px]'>
                              Status
                            </Typography>
                            <Box sx={{ display: 'inline-block' }}>
                              <Chip
                                label={payment.status}
                                color={getStatusColor(payment.status)}
                                size='medium'
                                variant='tonal'

                              />
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                </Grid>

                {/* Invoice Information Card */}
                <Grid item xs={12} md={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {/* Header */}
                    <Box className='flex flex-col gap-2'>
                       <Typography variant='h6'>
                        Invoice Details
                      </Typography>

                      <Divider  variant='left' width='300px' />

                      </Box>

                    {/* Field Grid */}
                    <Grid container spacing={3}>
                      {/* Invoice Number */}
                      <Grid item xs={6} sm={6} md={4}>
                        <Box className='flex flex-col gap-3 p-3 bg-secondaryLighter rounded-md'>
                          <Typography variant='caption' color='textSecondary' className='text-[14px]'>
                            Invoice Number
                          </Typography>
                          <Link href={`/invoices/view/${payment.invoiceId}`} style={{ textDecoration: 'none' }}>
                            <Typography variant='h6' color='primary'>
                              {payment.invoiceId}
                            </Typography>
                          </Link>
                        </Box>
                      </Grid>

                      {/* Invoice Amount */}
                      <Grid item xs={6} sm={6} md={4}>
                        <Box className='flex flex-col gap-3 p-3 bg-secondaryLighter rounded-md'>
                          <Typography variant='caption' color='textSecondary' className='text-[14px]'>
                            Invoice Amount
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant='h6'>{payment.invoiceAmount}</Typography>
                            <Typography variant='h6'>SAR</Typography>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Customer */}
                      <Grid item xs={6} sm={6} md={4}>
                        <Box className='flex flex-col gap-3 p-3 bg-secondaryLighter rounded-md'>
                          <Typography variant='caption' color='textSecondary' className='text-[14px]'>
                            Customer
                          </Typography>

                            <Link
                              href={`/customers/view/${payment.customerDetail?.userId}`}
                              style={{ textDecoration: 'none' }}
                            >
                              <Typography variant='h6' color='primary'>
                                {payment.userId || 'Deleted Customer'}
                              </Typography>
                            </Link>

                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {/* Notes Section - Match AddPayment's item display */}
                {payment.notes && (
                  <Grid item xs={12}>
                    <Card sx={{
                      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.04),
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <CardContent>
                        <Typography variant='h6' sx={{ mb: 4 }}>
                          Notes
                        </Typography>
                        <Box sx={{
                          p: 3,
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant='body2'>
                            {payment.notes}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default ViewPayment;

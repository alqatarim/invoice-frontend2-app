'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme, alpha } from '@mui/material/styles';
import {
     Avatar,
     Box,
     Button,
     Card,
     CardContent,
     Chip,
     Grid,
     Paper,
     Table,
     TableBody,
     TableCell,
     TableContainer,
     TableHead,
     TableRow,
     Typography,
     useMediaQuery,
     Divider
} from '@mui/material';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/dateUtils';
import { formatNumber } from '@/utils/numberUtils';
import dayjs from 'dayjs';

const getStatusColor = (status) => {
     switch (status) {
          case 'Success':
               return 'success';
          case 'Failed':
               return 'error';
          case 'REFUND':
               return 'warning';
          default:
               return 'default';
     }
};

const ViewPaymentSummary = ({ paymentData, enqueueSnackbar, closeSnackbar }) => {
     const theme = useTheme();
     const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

     if (!paymentData) {
          return (
               <Box className="flex items-center justify-center h-96">
                    <Typography variant="h6" color="text.secondary">
                         Payment summary not found
                    </Typography>
               </Box>
          );
     }

     const getStatusColor = (status) => {
          switch (status) {
               case 'Success':
                    return 'success';
               case 'Failed':
                    return 'error';
               case 'REFUND':
                    return 'warning';
               default:
                    return 'default';
          }
     };

     const actionButtons = (
          <Box className='flex flex-row gap-2'>
               <Button
                    variant="outlined"
                    startIcon={<Icon icon="tabler:printer" width={20} />}
                    onClick={() => window.print()}
               >
                    Print
               </Button>
               <Button
                    variant="outlined"
                    startIcon={<Icon icon="tabler:download" width={20} />}
                    onClick={() => console.log('Export payment summary')}
               >
                    Export
               </Button>
          </Box>
     );

     return (
          <Grid container spacing={3}>
               <Grid item xs={12}>
                    <Card>
                         <CardContent>
                              <Box className='flex flex-row justify-between items-start mb-6'>
                                   <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                                             Payment Summary
                                        </Typography>
                                        <Typography variant="h6" color="primary.main">
                                             #{paymentData.transactionId || paymentData.paymentId || ''}
                                        </Typography>
                                   </Box>
                                   {actionButtons}
                              </Box>

                              {/* Payment Details */}
                              <Grid container spacing={4}>
                                   {/* Left Column - Payment Info */}
                                   <Grid item xs={12} md={6}>
                                        <Box className='mb-6'>
                                             <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                  Payment Details
                                             </Typography>

                                             <Box className='space-y-2'>
                                                  <Box className='flex justify-between'>
                                                       <Typography variant="body2" color="text.secondary">Transaction ID:</Typography>
                                                       <Typography variant="body2">#{paymentData.transactionId || paymentData.paymentId || 'N/A'}</Typography>
                                                  </Box>

                                                  <Box className='flex justify-between'>
                                                       <Typography variant="body2" color="text.secondary">Payment Date:</Typography>
                                                       <Typography variant="body2">{paymentData.paymentDate ? formatDate(paymentData.paymentDate) : formatDate(paymentData.createdAt)}</Typography>
                                                  </Box>

                                                  <Box className='flex justify-between'>
                                                       <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                                                       <Typography variant="body2">{paymentData.paymentMethod || 'N/A'}</Typography>
                                                  </Box>

                                                  <Box className='flex justify-between'>
                                                       <Typography variant="body2" color="text.secondary">Amount:</Typography>
                                                       <Typography variant="body2">{formatNumber(paymentData.amount || paymentData.paidAmount)}</Typography>
                                                  </Box>

                                                  <Box className='flex justify-between'>
                                                       <Typography variant="body2" color="text.secondary">Status:</Typography>
                                                       <Chip
                                                            label={paymentData.status}
                                                            size="small"
                                                            color={getStatusColor(paymentData.status)}
                                                            variant="tonal"
                                                       />
                                                  </Box>
                                             </Box>
                                        </Box>
                                   </Grid>

                                   {/* Right Column - Customer Info */}
                                   <Grid item xs={12} md={6}>
                                        <Box className='mb-6'>
                                             <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                  Customer Information
                                             </Typography>

                                             <Box className='space-y-2'>
                                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                       {paymentData.customerId?.name || 'N/A'}
                                                  </Typography>

                                                  <Typography variant="body2" color="text.secondary">
                                                       {paymentData.customerId?.email || ''}
                                                  </Typography>

                                                  <Typography variant="body2" color="text.secondary">
                                                       {paymentData.customerId?.phone || ''}
                                                  </Typography>

                                                  {paymentData.customerId?.billingAddress && (
                                                       <Box>
                                                            <Typography variant="body2" color="text.secondary">
                                                                 {paymentData.customerId.billingAddress.addressLine1 || ''}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                 {paymentData.customerId.billingAddress.city || ''} {paymentData.customerId.billingAddress.state || ''}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                 {paymentData.customerId.billingAddress.pincode || ''}
                                                            </Typography>
                                                       </Box>
                                                  )}
                                             </Box>
                                        </Box>
                                   </Grid>
                              </Grid>

                              <Divider sx={{ my: 4 }} />

                              {/* Invoice Details Table */}
                              {paymentData.invoiceId && (
                                   <Box className='mb-6'>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                             Invoice Details
                                        </Typography>

                                        <TableContainer component={Paper} variant="outlined">
                                             <Table>
                                                  <TableHead sx={{ backgroundColor: theme.palette.grey[50] }}>
                                                       <TableRow>
                                                            <TableCell>Invoice Number</TableCell>
                                                            <TableCell>Invoice Date</TableCell>
                                                            <TableCell align="right">Invoice Amount</TableCell>
                                                            <TableCell align="right">Paid Amount</TableCell>
                                                            <TableCell align="right">Remaining</TableCell>
                                                       </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                       <TableRow>
                                                            <TableCell>
                                                                 <Link href={`/invoices/invoice-view/${paymentData.invoiceId._id}`} passHref>
                                                                      <Typography
                                                                           className="cursor-pointer text-primary hover:underline"
                                                                      >
                                                                           {paymentData.invoiceId.invoiceNumber}
                                                                      </Typography>
                                                                 </Link>
                                                            </TableCell>
                                                            <TableCell>
                                                                 {formatDate(paymentData.invoiceId.invoiceDate)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                 {formatNumber(paymentData.invoiceId.TotalAmount)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                 {formatNumber(paymentData.amount || paymentData.paidAmount)}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                 {formatNumber((paymentData.invoiceId.TotalAmount || 0) - (paymentData.amount || paymentData.paidAmount || 0))}
                                                            </TableCell>
                                                       </TableRow>
                                                  </TableBody>
                                             </Table>
                                        </TableContainer>
                                   </Box>
                              )}

                              {/* Notes Section */}
                              {paymentData.notes && (
                                   <>
                                        <Divider sx={{ my: 4 }} />
                                        <Grid container spacing={4}>
                                             <Grid item xs={12} md={6}>
                                                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                                       Notes
                                                  </Typography>
                                                  <Typography variant="body2" color="text.secondary">
                                                       {paymentData.notes}
                                                  </Typography>
                                             </Grid>
                                        </Grid>
                                   </>
                              )}

                              {/* Back Button */}
                              <Box className='flex justify-start mt-6'>
                                   <Button
                                        variant="outlined"
                                        component={Link}
                                        href="/payment-summary/payment-summary-list"
                                        startIcon={<Icon icon="tabler:arrow-left" />}
                                   >
                                        Back to List
                                   </Button>
                              </Box>
                         </CardContent>
                    </Card>
               </Grid>
          </Grid>
     );
};

export default ViewPaymentSummary;

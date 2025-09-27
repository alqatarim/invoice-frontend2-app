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
     Divider,
     Stack
} from '@mui/material';
import { Icon } from '@iconify/react';
import { formatDate } from '@/utils/dateUtils';
import { formatNumber } from '@/utils/numberUtils';
import { amountFormat } from '@/utils/numberUtils';
import { paymentSummaryStatus } from '@/data/dataSets';
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

     // Extract payment details from the nested structure
     const payment = paymentData?.payment_details || paymentData;

     if (!payment) {
          return (
               <Box className="flex items-center justify-center h-96">
                    <Typography variant="h6" color="text.secondary">
                         Payment summary not found
                    </Typography>
               </Box>
          );
     }

     const getStatusColor = (status) => {
          const statusOption = paymentSummaryStatus.find(opt => opt.value === status);
          return statusOption?.color || 'default';
     };

     const handlePrint = () => {
          window.print();
     };

     const handleDownload = () => {
          // Create a downloadable version
          const printContent = document.getElementById('payment-summary-content');
          const newWindow = window.open('', '', 'width=800,height=600');
          newWindow.document.write(`
               <!DOCTYPE html>
               <html>
               <head>
                    <title>Payment Summary - ${payment.payment_number}</title>
                    <style>
                         body { font-family: Arial, sans-serif; margin: 20px; }
                         .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                         .details { margin: 20px 0; }
                         .row { display: flex; justify-content: space-between; margin: 10px 0; }
                         .label { font-weight: bold; }
                         .amount { font-size: 1.2em; font-weight: bold; color: #2e7d32; }
                         @media print { body { margin: 0; } }
                    </style>
               </head>
               <body>
                    ${printContent.innerHTML}
               </body>
               </html>
          `);
          newWindow.document.close();
          newWindow.print();
     };

     return (
          <Box className="max-w-7xl mx-auto">
               {/* Action Buttons - Only visible on screen */}
               <Box className='flex justify-between items-center mb-6 print:hidden'>
                    <Button
                         variant="outlined"
                         component={Link}
                         href="/payment-summary/payment-summary-list"
                         startIcon={<Icon icon="tabler:arrow-left" />}
                    >
                         Back to List
                    </Button>
                    <Box className='flex gap-2'>
                         <Button
                              variant="outlined"
                              startIcon={<Icon icon="tabler:printer" width={20} />}
                              onClick={handlePrint}
                         >
                              Print
                         </Button>
                         <Button
                              variant="contained"
                              startIcon={<Icon icon="tabler:download" width={20} />}
                              onClick={handleDownload}
                         >
                              Download PDF
                         </Button>
                    </Box>
               </Box>

               {/* Main Payment Summary Content - A4 Dimensions */}
               <Paper
                    id="payment-summary-content"
                    elevation={0}
                    className="mx-auto print:mx-0"
                    sx={{
                         width: '210mm', // A4 width
                         minHeight: '297mm', // A4 height
                         maxWidth: '210mm',
                         padding: '20mm', // Standard margins
                         border: `1px solid ${theme.palette.divider}`,
                         backgroundColor: 'white',
                         '@media print': {
                              border: 'none',
                              boxShadow: 'none',
                              margin: '0 !important',
                              padding: '15mm',
                              width: '210mm',
                              minHeight: '297mm',
                              maxWidth: 'none'
                         },
                         '@media (max-width: 210mm)': {
                              width: '100%',
                              maxWidth: '100%',
                              padding: '15px'
                         },
                         '@media (min-width: 211mm)': {
                              margin: '0 auto'
                         }
                    }}
               >
                    {/* Header Section */}
                    <Box className="text-center border-b-2 border-gray-300 pb-4 mb-6">
                         <Typography
                              variant="h4"
                              className="font-bold text-primary mb-1"
                              sx={{ fontSize: { xs: '1.8rem', print: '1.6rem' } }}
                         >
                              PAYMENT RECEIPT
                         </Typography>
                         <Typography
                              variant="h6"
                              color="text.secondary"
                              className="font-medium"
                              sx={{ fontSize: { xs: '1.1rem', print: '1rem' } }}
                         >
                              {payment.payment_number || 'N/A'}
                         </Typography>
                    </Box>

                    {/* Payment Summary Section */}
                    <Grid container spacing={3} className="mb-6">
                         {/* Left Column - Payment Details */}
                         <Grid item xs={12} md={6}>
                              <Paper
                                   elevation={0}
                                   className="p-3 bg-gray-50 print:bg-transparent print:border print:border-gray-300"
                              >
                                   <Typography
                                        variant="h6"
                                        className="font-bold mb-3 text-primary flex items-center gap-2"
                                        sx={{ fontSize: { xs: '1.1rem', print: '1rem' } }}
                                   >
                                        <Icon icon="tabler:credit-card" fontSize={20} />
                                        Payment Information
                                   </Typography>

                                   <Stack spacing={2}>
                                        <Box className="flex justify-between items-center">
                                             <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  className="font-medium"
                                                  sx={{ fontSize: '0.85rem' }}
                                             >
                                                  Payment Number:
                                             </Typography>
                                             <Typography
                                                  variant="body2"
                                                  className="font-semibold"
                                                  sx={{ fontSize: '0.9rem' }}
                                             >
                                                  {payment.payment_number || 'N/A'}
                                             </Typography>
                                        </Box>

                                        <Box className="flex justify-between items-center">
                                             <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  className="font-medium"
                                                  sx={{ fontSize: '0.85rem' }}
                                             >
                                                  Payment Date:
                                             </Typography>
                                             <Typography
                                                  variant="body2"
                                                  className="font-semibold"
                                                  sx={{ fontSize: '0.9rem' }}
                                             >
                                                  {payment.createdAt ? formatDate(payment.createdAt) : 'N/A'}
                                             </Typography>
                                        </Box>

                                        <Box className="flex justify-between items-center">
                                             <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  className="font-medium"
                                                  sx={{ fontSize: '0.85rem' }}
                                             >
                                                  Payment Method:
                                             </Typography>
                                             <Chip
                                                  label={payment.payment_method || 'N/A'}
                                                  size="small"
                                                  variant="outlined"
                                                  sx={{
                                                       fontWeight: 500,
                                                       fontSize: '0.75rem',
                                                       height: '24px'
                                                  }}
                                             />
                                        </Box>

                                        <Box className="flex justify-between items-center">
                                             <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  className="font-medium"
                                                  sx={{ fontSize: '0.85rem' }}
                                             >
                                                  Status:
                                             </Typography>
                                             <Chip
                                                  label={payment.status || 'N/A'}
                                                  size="small"
                                                  color={getStatusColor(payment.status)}
                                                  variant="tonal"
                                                  sx={{
                                                       fontWeight: 500,
                                                       fontSize: '0.75rem',
                                                       height: '24px'
                                                  }}
                                             />
                                        </Box>
                                   </Stack>
                              </Paper>
                         </Grid>

                         {/* Right Column - Customer Details */}
                         <Grid item xs={12} md={6}>
                              <Paper
                                   elevation={0}
                                   className="p-3 bg-blue-50 print:bg-transparent print:border print:border-gray-300"
                              >
                                   <Typography
                                        variant="h6"
                                        className="font-bold mb-3 text-primary flex items-center gap-2"
                                        sx={{ fontSize: { xs: '1.1rem', print: '1rem' } }}
                                   >
                                        <Icon icon="tabler:user" fontSize={20} />
                                        Customer Information
                                   </Typography>

                                   <Stack spacing={1.5}>
                                        <Typography
                                             variant="body1"
                                             className="font-semibold"
                                             sx={{ fontSize: '0.95rem' }}
                                        >
                                             {payment.customerDetail?.name || 'Customer Name Not Available'}
                                        </Typography>

                                        {payment.customerDetail?.email && (
                                             <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  className="flex items-center gap-1"
                                                  sx={{ fontSize: '0.8rem' }}
                                             >
                                                  <Icon icon="tabler:mail" fontSize={14} />
                                                  {payment.customerDetail.email}
                                             </Typography>
                                        )}

                                        {payment.customerDetail?.phone && (
                                             <Typography
                                                  variant="body2"
                                                  color="text.secondary"
                                                  className="flex items-center gap-1"
                                                  sx={{ fontSize: '0.8rem' }}
                                             >
                                                  <Icon icon="tabler:phone" fontSize={14} />
                                                  {payment.customerDetail.phone}
                                             </Typography>
                                        )}

                                        {payment.customerDetail?.billingAddress && (
                                             <Box>
                                                  <Typography
                                                       variant="body2"
                                                       color="text.secondary"
                                                       className="flex items-center gap-1 mb-1"
                                                       sx={{ fontSize: '0.8rem' }}
                                                  >
                                                       <Icon icon="tabler:map-pin" fontSize={14} />
                                                       Billing Address:
                                                  </Typography>
                                                  <Typography
                                                       variant="body2"
                                                       color="text.secondary"
                                                       className="ml-4"
                                                       sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
                                                  >
                                                       {payment.customerDetail.billingAddress.addressLine1}<br />
                                                       {payment.customerDetail.billingAddress.city}, {payment.customerDetail.billingAddress.state}<br />
                                                       {payment.customerDetail.billingAddress.pincode}, {payment.customerDetail.billingAddress.country}
                                                  </Typography>
                                             </Box>
                                        )}
                                   </Stack>
                              </Paper>
                         </Grid>
                    </Grid>

                    {/* Amount Details Section */}
                    <Paper
                         elevation={0}
                         className="p-4 bg-green-50 print:bg-transparent print:border print:border-gray-300 mb-5"
                    >
                         <Typography
                              variant="h6"
                              className="font-bold mb-3 text-primary flex items-center gap-2"
                              sx={{ fontSize: { xs: '1.1rem', print: '1rem' } }}
                         >
                              <Icon icon="tabler:currency-dollar" fontSize={20} />
                              Payment Summary
                         </Typography>

                         <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                   <Box className="flex justify-between items-center py-1.5 border-b border-gray-200">
                                        <Typography
                                             variant="body2"
                                             className="font-medium"
                                             sx={{ fontSize: '0.85rem' }}
                                        >
                                             Invoice Amount:
                                        </Typography>
                                        <Box className="flex items-center gap-1">
                                             <Icon icon="lucide:saudi-riyal" width="1rem" />
                                             <Typography
                                                  variant="body1"
                                                  className="font-bold"
                                                  sx={{ fontSize: '1rem' }}
                                             >
                                                  {amountFormat(payment.invoiceAmount || 0)}
                                             </Typography>
                                        </Box>
                                   </Box>
                              </Grid>

                              <Grid item xs={12} sm={6}>
                                   <Box className="flex justify-between items-center py-1.5 border-b border-gray-200">
                                        <Typography
                                             variant="body2"
                                             className="font-medium text-success-main"
                                             sx={{ fontSize: '0.85rem' }}
                                        >
                                             Amount Paid:
                                        </Typography>
                                        <Box className="flex items-center gap-1">
                                             <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.success.main} />
                                             <Typography
                                                  variant="body1"
                                                  className="font-bold text-success-main"
                                                  sx={{ fontSize: '1rem' }}
                                             >
                                                  {amountFormat(payment.amount || 0)}
                                             </Typography>
                                        </Box>
                                   </Box>
                              </Grid>

                              <Grid item xs={12}>
                                   <Box className="flex justify-between items-center py-2 mt-2 bg-primary-main bg-opacity-10 px-3 rounded">
                                        <Typography
                                             variant="body1"
                                             className="font-bold"
                                             sx={{ fontSize: '0.95rem' }}
                                        >
                                             Remaining Balance:
                                        </Typography>
                                        <Box className="flex items-center gap-1">
                                             <Icon icon="lucide:saudi-riyal" width="1.1rem" />
                                             <Typography
                                                  variant="h6"
                                                  className="font-bold"
                                                  sx={{ fontSize: '1.1rem' }}
                                             >
                                                  {amountFormat((payment.invoiceAmount || 0) - (payment.amount || 0))}
                                             </Typography>
                                        </Box>
                                   </Box>
                              </Grid>
                         </Grid>
                    </Paper>

                    {/* Invoice Reference */}
                    {payment.invoiceNumber && (
                         <Paper
                              elevation={0}
                              className="p-3 border border-gray-200 mb-4"
                         >
                              <Typography
                                   variant="body1"
                                   className="font-bold mb-2 flex items-center gap-2"
                                   sx={{ fontSize: '0.95rem' }}
                              >
                                   <Icon icon="tabler:file-invoice" fontSize={18} />
                                   Related Invoice
                              </Typography>
                              <Box className="flex justify-between items-center">
                                   <Typography
                                        variant="body2"
                                        sx={{ fontSize: '0.85rem' }}
                                   >
                                        Invoice Number: <strong>{payment.invoiceNumber?.trim() || 'N/A'}</strong>
                                   </Typography>
                                   <Button
                                        component={Link}
                                        href={`/invoices/invoice-view/${payment.invoiceId}`}
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Icon icon="tabler:eye" fontSize={16} />}
                                        className="print:hidden"
                                        sx={{ fontSize: '0.75rem', py: 0.5 }}
                                   >
                                        View Invoice
                                   </Button>
                              </Box>
                         </Paper>
                    )}

                    {/* Footer */}
                    <Box className="text-center mt-6 pt-4 border-t border-gray-300">
                         <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: '0.75rem' }}
                         >
                              This is a computer-generated payment receipt.
                         </Typography>
                         <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: '0.75rem' }}
                         >
                              Generated on {formatDate(new Date())}
                         </Typography>
                    </Box>
               </Paper>

               {/* Enhanced Print Styles for A4 */}
               <style jsx global>{`
                    @media print {
                         @page {
                              size: A4;
                              margin: 10mm;
                         }
                         
                         body {
                              margin: 0;
                              padding: 0;
                              font-size: 12pt;
                              line-height: 1.3;
                              -webkit-print-color-adjust: exact;
                              color-adjust: exact;
                         }
                         
                         body * {
                              visibility: hidden;
                         }
                         
                         #payment-summary-content,
                         #payment-summary-content * {
                              visibility: visible;
                         }
                         
                         #payment-summary-content {
                              position: absolute;
                              left: 0;
                              top: 0;
                              width: 210mm !important;
                              max-width: 210mm !important;
                              margin: 0 !important;
                              padding: 10mm !important;
                              background: white !important;
                              font-size: 11pt !important;
                         }
                         
                         .print\\:hidden {
                              display: none !important;
                         }
                         
                         .print\\:bg-transparent {
                              background-color: transparent !important;
                         }
                         
                         .print\\:border {
                              border: 1px solid #666 !important;
                         }
                         
                         .print\\:shadow-none {
                              box-shadow: none !important;
                         }
                         
                         .print\\:mx-0 {
                              margin-left: 0 !important;
                              margin-right: 0 !important;
                         }
                         
                         .print\\:p-4 {
                              padding: 10mm !important;
                         }
                         
                         .print\\:mb-6 {
                              margin-bottom: 6mm !important;
                         }
                         
                         /* Typography adjustments for print */
                         h1, h2, h3, h4, h5, h6 {
                              font-size: inherit !important;
                              line-height: 1.2 !important;
                              margin-bottom: 3mm !important;
                         }
                         
                         p, div, span {
                              font-size: inherit !important;
                              line-height: 1.3 !important;
                         }
                         
                         /* Grid spacing for print */
                         .MuiGrid-container {
                              margin: 0 !important;
                         }
                         
                         .MuiGrid-item {
                              padding: 2mm !important;
                         }
                         
                         /* Paper components for print */
                         .MuiPaper-root {
                              background-color: transparent !important;
                              box-shadow: none !important;
                              border: 1px solid #ddd !important;
                              margin-bottom: 4mm !important;
                         }
                         
                         /* Icons size adjustment */
                         svg {
                              width: 12pt !important;
                              height: 12pt !important;
                         }
                         
                         /* Chip components */
                         .MuiChip-root {
                              font-size: 9pt !important;
                              height: auto !important;
                              padding: 1mm 2mm !important;
                         }
                    }
               `}</style>
          </Box>
     );
};

export default ViewPaymentSummary;

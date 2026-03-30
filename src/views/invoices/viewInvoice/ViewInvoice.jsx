'use client';

import React from 'react';
import {
  Box,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import InvoiceStatusBadge from '@/components/custom-components/InvoiceStatusBadge';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrencyAmount } from '@/utils/numberUtils';

const ViewInvoice = ({
  invoiceData,
  companyData,
  currencyData,
  invoiceLogo,
  previewId,
}) => {
  const theme = useTheme();

  return (
    <Paper
      id={previewId}
      elevation={0}
      className='mx-auto w-full max-w-[220mm] rounded-2xl border border-solid border-[rgba(115,103,240,0.14)] bg-white p-6 shadow-sm print:max-w-full print:rounded-none print:border-0 print:p-0 print:shadow-none'
    >
      <Box className='flex flex-col gap-6'>
        <Box className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
          <Box className='flex items-start gap-4'>
            {invoiceLogo || companyData?.companyLogo ? (
              <Box
                component='img'
                src={invoiceLogo || companyData?.companyLogo}
                alt='Invoice logo'
                className='max-h-20 w-auto max-w-[180px] object-contain'
              />
            ) : (
              <Box
                className='flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[rgba(115,103,240,0.24)] text-center text-sm font-medium'
                sx={{ color: theme.palette.text.secondary }}
              >
                Logo
              </Box>
            )}
            <Box>
              <Typography variant='h4' className='font-semibold'>
                Invoice
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mt-1'>
                Standard invoice preview
              </Typography>
            </Box>
          </Box>

          <Paper
            elevation={0}
            className='min-w-[260px] rounded-xl border border-solid border-[rgba(115,103,240,0.12)] p-4'
            sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.03) }}
          >
            <Box className='mb-2 flex items-center justify-between gap-3'>
              <Typography variant='subtitle2' color='text.secondary'>
                Invoice No.
              </Typography>
              <Typography variant='h6' color='primary.main'>
                {invoiceData?.invoiceNumber || 'N/A'}
              </Typography>
            </Box>
            <Box className='mb-3 flex justify-end'>
              <InvoiceStatusBadge status={invoiceData?.status || 'DRAFTED'} />
            </Box>
            <Box className='flex items-start justify-between gap-4 py-1.5'>
              <Typography variant='body2' color='text.secondary'>Invoice Date</Typography>
              <Typography variant='body2' className='text-right font-medium'>
                {formatDate(invoiceData?.invoiceDate)}
              </Typography>
            </Box>
            <Box className='flex items-start justify-between gap-4 py-1.5'>
              <Typography variant='body2' color='text.secondary'>Due Date</Typography>
              <Typography variant='body2' className='text-right font-medium'>
                {formatDate(invoiceData?.dueDate)}
              </Typography>
            </Box>
            <Box className='flex items-start justify-between gap-4 py-1.5'>
              <Typography variant='body2' color='text.secondary'>Created At</Typography>
              <Typography variant='body2' className='text-right font-medium'>
                {formatDate(invoiceData?.createdAt)}
              </Typography>
            </Box>
            <Box className='flex items-start justify-between gap-4 py-1.5'>
              <Typography variant='body2' color='text.secondary'>Payment Method</Typography>
              <Typography variant='body2' className='text-right font-medium'>
                {invoiceData?.payment_method || 'N/A'}
              </Typography>
            </Box>
            <Box className='flex items-start justify-between gap-4 py-1.5'>
              <Typography variant='body2' color='text.secondary'>Reference No.</Typography>
              <Typography variant='body2' className='text-right font-medium'>
                {invoiceData?.referenceNo || 'N/A'}
              </Typography>
            </Box>
            <Box className='flex items-start justify-between gap-4 py-1.5'>
              <Typography variant='body2' color='text.secondary'>
                {invoiceData?.posMode ? 'Cashier' : 'Staff'}
              </Typography>
              <Typography variant='body2' className='text-right font-medium'>
                {invoiceData?.cashierName || 'N/A'}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} className='rounded-xl border border-solid border-[rgba(115,103,240,0.12)] p-4'>
              <Typography variant='subtitle2' className='mb-3 font-semibold'>
                From
              </Typography>
              <Typography variant='body1' className='font-semibold'>
                {companyData?.companyName || 'Company'}
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mt-2'>
                {[
                  companyData?.addressLine1,
                  companyData?.addressLine2,
                  companyData?.city,
                  companyData?.state,
                  companyData?.country,
                  companyData?.pincode,
                ].filter(Boolean).join(', ') || 'N/A'}
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mt-2'>
                {companyData?.email || 'N/A'}
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mt-1'>
                {companyData?.phone || 'N/A'}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} className='rounded-xl border border-solid border-[rgba(115,103,240,0.12)] p-4'>
              <Typography variant='subtitle2' className='mb-3 font-semibold'>
                Bill To
              </Typography>
              <Typography variant='body1' className='font-semibold'>
                {invoiceData?.customerId?.name ||
                  invoiceData?.walkInCustomer?.name ||
                  (invoiceData?.isWalkIn ? 'Walk-in Customer' : 'N/A')}
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mt-2'>
                {[
                  invoiceData?.customerId?.billingAddress?.addressLine1,
                  invoiceData?.customerId?.billingAddress?.addressLine2,
                  invoiceData?.customerId?.billingAddress?.city,
                  invoiceData?.customerId?.billingAddress?.state,
                  invoiceData?.customerId?.billingAddress?.country,
                  invoiceData?.customerId?.billingAddress?.pincode,
                ].filter(Boolean).join(', ') || 'N/A'}
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mt-2'>
                {invoiceData?.customerId?.email || invoiceData?.walkInCustomer?.email || 'N/A'}
              </Typography>
              <Typography variant='body2' color='text.secondary' className='mt-1'>
                {invoiceData?.customerId?.phone || invoiceData?.walkInCustomer?.phone || 'N/A'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box>
          <Typography variant='h6' className='mb-3 font-semibold'>
            Items
          </Typography>
          <TableContainer component={Paper} variant='outlined' className='rounded-xl'>
            <Table>
              <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align='center'>Qty</TableCell>
                  <TableCell align='center'>Unit</TableCell>
                  <TableCell align='right'>Rate</TableCell>
                  <TableCell align='right'>Discount</TableCell>
                  <TableCell align='right'>Tax</TableCell>
                  <TableCell align='right'>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(invoiceData?.items) && invoiceData.items.length > 0 ? (
                  invoiceData.items.map((item, index) => (
                    <TableRow key={item._id || `${invoiceData?.invoiceNumber || 'N/A'}-${index}`}>
                      <TableCell>
                        <Typography variant='body2' className='font-medium'>
                          {item.name || 'Item'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {item.description || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>{Number(item.quantity || 0)}</TableCell>
                      <TableCell align='center'>{item.unit || item.units || 'N/A'}</TableCell>
                      <TableCell align='right'>
                        {formatCurrencyAmount(currencyData || '$', Number(item.rate || 0))}
                      </TableCell>
                      <TableCell align='right'>
                        {formatCurrencyAmount(currencyData || '$', Number(item.discount || 0))}
                      </TableCell>
                      <TableCell align='right'>
                        {formatCurrencyAmount(currencyData || '$', Number(item.tax || 0))}
                      </TableCell>
                      <TableCell align='right'>
                        {formatCurrencyAmount(currencyData || '$', Number(item.amount || 0))}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align='center'>
                      <Typography variant='body2' color='text.secondary' className='py-6'>
                        No invoice items found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Box className='flex h-full flex-col gap-3'>
              <Paper elevation={0} className='rounded-xl border border-solid border-[rgba(115,103,240,0.12)] p-4'>
                <Typography variant='subtitle2' className='mb-3 font-semibold'>
                  Notes
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {invoiceData?.notes || 'No notes added for this invoice.'}
                </Typography>
              </Paper>

              <Paper elevation={0} className='rounded-xl border border-solid border-[rgba(115,103,240,0.12)] p-4'>
                <Typography variant='subtitle2' className='mb-3 font-semibold'>
                  Terms & Conditions
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {invoiceData?.termsAndCondition || 'No terms and conditions added.'}
                </Typography>
              </Paper>

              {[invoiceData?.bank?.bankName || invoiceData?.bank?.name, invoiceData?.bank?.branch, invoiceData?.bank?.accountNumber, invoiceData?.bank?.IFSCCode].some(
                value => value && value !== 'N/A'
              ) && (
                <Paper elevation={0} className='rounded-xl border border-solid border-[rgba(115,103,240,0.12)] p-4'>
                  <Typography variant='subtitle2' className='mb-3 font-semibold'>
                    Bank Details
                  </Typography>
                  <Box className='flex items-start justify-between gap-4 py-1.5'>
                    <Typography variant='body2' color='text.secondary'>Bank</Typography>
                    <Typography variant='body2' className='text-right font-medium'>
                      {invoiceData?.bank?.bankName || invoiceData?.bank?.name || 'N/A'}
                    </Typography>
                  </Box>
                  <Box className='flex items-start justify-between gap-4 py-1.5'>
                    <Typography variant='body2' color='text.secondary'>Branch</Typography>
                    <Typography variant='body2' className='text-right font-medium'>
                      {invoiceData?.bank?.branch || 'N/A'}
                    </Typography>
                  </Box>
                  <Box className='flex items-start justify-between gap-4 py-1.5'>
                    <Typography variant='body2' color='text.secondary'>Account Number</Typography>
                    <Typography variant='body2' className='text-right font-medium'>
                      {invoiceData?.bank?.accountNumber || 'N/A'}
                    </Typography>
                  </Box>
                  <Box className='flex items-start justify-between gap-4 py-1.5'>
                    <Typography variant='body2' color='text.secondary'>IFSC Code</Typography>
                    <Typography variant='body2' className='text-right font-medium'>
                      {invoiceData?.bank?.IFSCCode || 'N/A'}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={0} className='rounded-xl border border-solid border-[rgba(115,103,240,0.12)] p-4'>
              <Typography variant='subtitle2' className='mb-3 font-semibold'>
                Summary
              </Typography>
              <Box className='flex items-center justify-between py-1.5'>
                <Typography variant='body2' color='text.secondary'>Subtotal</Typography>
                <Typography variant='body2' className='font-medium'>
                  {formatCurrencyAmount(currencyData || '$', Number(invoiceData?.taxableAmount || 0))}
                </Typography>
              </Box>
              <Box className='flex items-center justify-between py-1.5'>
                <Typography variant='body2' color='text.secondary'>Discount</Typography>
                <Typography variant='body2' className='font-medium'>
                  {formatCurrencyAmount(currencyData || '$', Number(invoiceData?.totalDiscount || 0))}
                </Typography>
              </Box>
              <Box className='flex items-center justify-between py-1.5'>
                <Typography variant='body2' color='text.secondary'>VAT</Typography>
                <Typography variant='body2' className='font-medium'>
                  {formatCurrencyAmount(currencyData || '$', Number(invoiceData?.vat || 0))}
                </Typography>
              </Box>
              <Divider className='my-2' />
              <Box className='flex items-center justify-between py-1.5 pt-3'>
                <Typography variant='subtitle1' color='text.primary'>Total</Typography>
                <Typography variant='subtitle1' className='font-semibold'>
                  {formatCurrencyAmount(currencyData || '$', Number(invoiceData?.TotalAmount || 0))}
                </Typography>
              </Box>
              <Box className='flex items-center justify-between py-1.5'>
                <Typography variant='body2' color='text.secondary'>Paid</Typography>
                <Typography variant='body2' className='font-medium'>
                  {formatCurrencyAmount(currencyData || '$', Number(invoiceData?.paidAmount || 0))}
                </Typography>
              </Box>
              <Box className='flex items-center justify-between py-1.5'>
                <Typography variant='body2' color='text.secondary'>Balance</Typography>
                <Typography variant='body2' className='font-medium'>
                  {formatCurrencyAmount(
                    currencyData || '$',
                    Math.max(
                      Number(invoiceData?.TotalAmount || 0) - Number(invoiceData?.paidAmount || 0),
                      0
                    )
                  )}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ViewInvoice;

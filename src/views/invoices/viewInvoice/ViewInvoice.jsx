'use client';

import React from 'react';
import {
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InvoiceStatusBadge from '@/components/custom-components/InvoiceStatusBadge';
import { formatDate } from '@/utils/dateUtils';
import { RiyalIcon } from '@/utils/currencyUtils';

const INVOICE_TEXT = '#111827';
const INVOICE_MUTED = '#6b7280';
const INVOICE_BORDER = '#e5e7eb';
const INVOICE_PANEL = '#fafafa';

const getAddress = (...parts) => parts.filter(Boolean).join(', ') || 'N/A';
const formatAmount = value => Number(value || 0).toFixed(2);

const Money = ({ value, strong = false }) => (
  <Box className='inline-flex items-center justify-end gap-1 whitespace-nowrap'>
    <RiyalIcon width={12} color={INVOICE_TEXT} />
    <Typography
      component='span'
      variant='body2'
      sx={{ fontSize: 12.5, fontWeight: strong ? 700 : 500, color: INVOICE_TEXT }}
    >
      {formatAmount(value)}
    </Typography>
  </Box>
);

const DetailRow = ({ label, value, strong = false }) => (
  <Box className='flex items-start justify-between gap-5 py-1'>
    <Typography variant='body2' sx={{ fontSize: 12.5, color: INVOICE_MUTED }}>
      {label}
    </Typography>
    {React.isValidElement(value) ? (
      value
    ) : (
      <Typography
        variant='body2'
        className='text-right'
        sx={{ fontSize: 12.5, fontWeight: strong ? 700 : 500, color: INVOICE_TEXT }}
      >
        {value || 'N/A'}
      </Typography>
    )}
  </Box>
);

const SectionCard = ({ title, children }) => (
  <Paper
    elevation={0}
    className='rounded-lg border border-solid p-4'
    sx={{ borderColor: INVOICE_BORDER, backgroundColor: '#ffffff !important', color: INVOICE_TEXT }}
  >
    <Typography variant='subtitle2' className='mb-3 font-semibold' sx={{ color: INVOICE_TEXT }}>
      {title}
    </Typography>
    {children}
  </Paper>
);

const ViewInvoice = ({
  invoiceData,
  companyData,
  invoiceLogo,
  previewId,
}) => {
  const theme = useTheme();

  return (
    <Paper
      id={previewId}
      elevation={0}
      className='mx-auto w-full max-w-[190mm] rounded-xl border border-solid bg-white p-6 shadow-sm print:max-w-full print:rounded-none print:border-0 print:p-0 print:shadow-none'
      sx={{
        color: INVOICE_TEXT,
        backgroundColor: '#ffffff !important',
        borderColor: INVOICE_BORDER,
        '& .MuiTypography-root': {
          color: INVOICE_TEXT,
        },
        '& .MuiTableCell-root': {
          color: INVOICE_TEXT,
          borderColor: INVOICE_BORDER,
        },
        '& .MuiTableHead-root .MuiTableCell-root': {
          color: '#374151',
          backgroundColor: '#f9fafb',
        },
        '@media print': {
          boxShadow: 'none',
        },
      }}
    >
      <Box className='flex flex-col gap-5'>
        <Box className='flex flex-col gap-5 border-b border-solid pb-5 sm:flex-row sm:items-start sm:justify-between' sx={{ borderColor: INVOICE_BORDER }}>
          <Box className='flex items-start gap-4'>
            {invoiceLogo || companyData?.companyLogo ? (
              <Box
                component='img'
                src={invoiceLogo || companyData?.companyLogo}
                alt='Invoice logo'
                className='max-h-16 w-auto max-w-[150px] object-contain'
              />
            ) : (
              <Box
                className='flex h-16 w-16 items-center justify-center rounded-lg border border-dashed text-center text-xs font-medium'
                sx={{ color: INVOICE_MUTED, borderColor: '#d1d5db', backgroundColor: '#ffffff' }}
              >
                Logo
              </Box>
            )}
            <Box>
              <Typography variant='h4' className='font-semibold' sx={{ color: INVOICE_TEXT, lineHeight: 1.1 }}>
                Invoice
              </Typography>
              <Typography variant='body2' className='mt-2' sx={{ color: INVOICE_MUTED }}>
                {companyData?.companyName || 'Company'}
              </Typography>
            </Box>
          </Box>

          <Paper
            elevation={0}
            className='w-full rounded-lg border border-solid p-4 sm:w-[280px]'
            sx={{ backgroundColor: `${INVOICE_PANEL} !important`, borderColor: INVOICE_BORDER, color: INVOICE_TEXT }}
          >
            <Box className='mb-2 flex items-start justify-between gap-4'>
              <Typography variant='body2' sx={{ color: INVOICE_MUTED }}>
                Invoice No.
              </Typography>
              <Typography variant='subtitle1' className='text-right font-semibold' sx={{ color: INVOICE_TEXT }}>
                {invoiceData?.invoiceNumber || 'N/A'}
              </Typography>
            </Box>
            <Box className='mb-3 flex justify-end'>
              <InvoiceStatusBadge status={invoiceData?.status || 'DRAFTED'} />
            </Box>
            <DetailRow label='Invoice Date' value={formatDate(invoiceData?.invoiceDate)} />
            <DetailRow label='Due Date' value={formatDate(invoiceData?.dueDate)} />
            <DetailRow label='Payment Method' value={invoiceData?.payment_method || 'N/A'} />
            <DetailRow label='Reference No.' value={invoiceData?.referenceNo || 'N/A'} />
            <DetailRow
              label='Cashier'
              value={
                invoiceData?.cashierId?.fullname ||
                [invoiceData?.cashierId?.firstName, invoiceData?.cashierId?.lastName].filter(Boolean).join(' ') ||
                invoiceData?.cashierId?.userName ||
                invoiceData?.cashierId?.email ||
                'N/A'
              }
            />
          </Paper>
        </Box>

        <Box className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <SectionCard title='From'>
            <Typography variant='body1' className='font-semibold' sx={{ color: INVOICE_TEXT }}>
              {companyData?.companyName || 'Company'}
            </Typography>
            <Typography variant='body2' className='mt-2' sx={{ color: INVOICE_MUTED }}>
              {getAddress(
                companyData?.addressLine1,
                companyData?.addressLine2,
                companyData?.city,
                companyData?.state,
                companyData?.country,
                companyData?.pincode
              )}
            </Typography>
            <Typography variant='body2' className='mt-2' sx={{ color: INVOICE_MUTED }}>
              {companyData?.email || 'N/A'}
            </Typography>
            <Typography variant='body2' className='mt-1' sx={{ color: INVOICE_MUTED }}>
              {companyData?.phone || 'N/A'}
            </Typography>
          </SectionCard>

          <SectionCard title='Bill To'>
            <Typography variant='body1' className='font-semibold' sx={{ color: INVOICE_TEXT }}>
              {invoiceData?.customerId?.name ||
                invoiceData?.walkInCustomer?.name ||
                (invoiceData?.isWalkIn ? 'Walk-in Customer' : 'N/A')}
            </Typography>
            <Typography variant='body2' className='mt-2' sx={{ color: INVOICE_MUTED }}>
              {getAddress(
                invoiceData?.customerId?.billingAddress?.addressLine1,
                invoiceData?.customerId?.billingAddress?.addressLine2,
                invoiceData?.customerId?.billingAddress?.city,
                invoiceData?.customerId?.billingAddress?.state,
                invoiceData?.customerId?.billingAddress?.country,
                invoiceData?.customerId?.billingAddress?.pincode
              )}
            </Typography>
            <Typography variant='body2' className='mt-2' sx={{ color: INVOICE_MUTED }}>
              {invoiceData?.customerId?.email || invoiceData?.walkInCustomer?.email || 'N/A'}
            </Typography>
            <Typography variant='body2' className='mt-1' sx={{ color: INVOICE_MUTED }}>
              {invoiceData?.customerId?.phone || invoiceData?.walkInCustomer?.phone || 'N/A'}
            </Typography>
          </SectionCard>
        </Box>

        <Box>
          <Typography variant='subtitle1' className='mb-3 font-semibold' sx={{ color: INVOICE_TEXT }}>
            Items
          </Typography>
          <TableContainer
            component={Paper}
            variant='outlined'
            className='rounded-lg'
            sx={{ overflowX: 'hidden', backgroundColor: '#ffffff !important', borderColor: INVOICE_BORDER }}
          >
            <Table size='small' sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={{ width: '36%', fontWeight: 700 }}>Item</TableCell>
                  <TableCell align='center' sx={{ width: '12%', fontWeight: 700 }}>Qty</TableCell>
                  <TableCell align='right' sx={{ width: '16%', fontWeight: 700 }}>Rate</TableCell>
                  <TableCell align='right' sx={{ width: '14%', fontWeight: 700 }}>Tax</TableCell>
                  <TableCell align='right' sx={{ width: '22%', fontWeight: 700 }}>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(invoiceData?.items) && invoiceData.items.length > 0 ? (
                  invoiceData.items.map((item, index) => (
                    <TableRow key={item._id || `${invoiceData?.invoiceNumber || 'N/A'}-${index}`}>
                      <TableCell>
                        <Typography variant='body2' className='font-medium' sx={{ color: INVOICE_TEXT }}>
                          {item.name || 'Item'}
                        </Typography>
                        <Typography variant='caption' sx={{ color: INVOICE_MUTED }}>
                          {item.description || item.sku || ''}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>{Number(item.quantity || 0)}</TableCell>
                      <TableCell align='right'>
                        <Money value={item.rate} />
                      </TableCell>
                      <TableCell align='right'>
                        <Money value={item.tax} />
                      </TableCell>
                      <TableCell align='right'>
                        <Money value={item.amount} strong />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align='center'>
                      <Typography variant='body2' className='py-6' sx={{ color: INVOICE_MUTED }}>
                        No invoice items found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box className='grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]'>
          <Box className='flex flex-col gap-4'>
            <SectionCard title='Notes'>
              <Typography variant='body2' sx={{ color: INVOICE_MUTED }}>
                {invoiceData?.notes || 'No notes added for this invoice.'}
              </Typography>
            </SectionCard>

            <SectionCard title='Terms & Conditions'>
              <Typography variant='body2' sx={{ color: INVOICE_MUTED }}>
                {invoiceData?.termsAndCondition || 'No terms and conditions added.'}
              </Typography>
            </SectionCard>

            {[invoiceData?.bank?.bankName || invoiceData?.bank?.name, invoiceData?.bank?.branch, invoiceData?.bank?.accountNumber, invoiceData?.bank?.IFSCCode].some(
              value => value && value !== 'N/A'
            ) && (
              <SectionCard title='Bank Details'>
                <DetailRow label='Bank' value={invoiceData?.bank?.bankName || invoiceData?.bank?.name || 'N/A'} />
                <DetailRow label='Branch' value={invoiceData?.bank?.branch || 'N/A'} />
                <DetailRow label='Account Number' value={invoiceData?.bank?.accountNumber || 'N/A'} />
                <DetailRow label='IFSC Code' value={invoiceData?.bank?.IFSCCode || 'N/A'} />
              </SectionCard>
            )}
          </Box>

          <SectionCard title='Summary'>
            <DetailRow label='Subtotal' value={<Money value={invoiceData?.taxableAmount} />} />
            <DetailRow label='Discount' value={<Money value={invoiceData?.totalDiscount} />} />
            <DetailRow label='VAT' value={<Money value={invoiceData?.vat} />} />
            <Divider className='my-2' />
            <DetailRow
              label='Total'
              value={<Money value={invoiceData?.TotalAmount} strong />}
              strong
            />
            <DetailRow label='Paid' value={<Money value={invoiceData?.paidAmount} />} />
            <DetailRow
              label='Balance'
              value={<Money value={Math.max(Number(invoiceData?.TotalAmount || 0) - Number(invoiceData?.paidAmount || 0), 0)} strong />}
              strong
            />
          </SectionCard>
        </Box>
      </Box>
    </Paper>
  );
};

export default ViewInvoice;

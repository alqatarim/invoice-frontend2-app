'use client';

import React, { useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Image from 'next/image';
import dayjs from 'dayjs';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currencyUtils';
import { alpha } from '@mui/material/styles';

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'object') return 0;

  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCustomer = (data) => {
  if (data?.customerInfo && typeof data.customerInfo === 'object') {
    return data.customerInfo;
  }

  if (data?.customerId && typeof data.customerId === 'object' && data.customerId.name) {
    return data.customerId;
  }

  return null;
};

const getLinkedInvoice = (data) => {
  if (data?.invoiceInfo && typeof data.invoiceInfo === 'object' && data.invoiceInfo._id) {
    return data.invoiceInfo;
  }

  return null;
};

const formatDisplayDate = (value) => {
  if (!value) return '—';
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD MMM YYYY') : '—';
};

const SummaryRow = ({ label, value, strong = false }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
    <Typography
      className={strong ? 'text-[16px]' : 'text-[14px]'}
      fontWeight={strong ? 600 : 400}
      color={strong ? 'text.primary' : 'text.secondary'}
    >
      {label}
    </Typography>
    <Box sx={{ textAlign: 'right' }}>
      {typeof value === 'number' || typeof value === 'string'
        ? formatCurrency(toNumber(value))
        : value}
    </Box>
  </Box>
);

const ViewSalesReturn = ({ salesReturnData, loading }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;

    const pages = contentElement.querySelectorAll('.sales-return-page');
    pages.forEach((page) => {
      const pageHeight = page.offsetHeight;
      if (pageHeight > 1123) {
        // Handle content overflow if needed
      }
    });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  const customer = getCustomer(salesReturnData);
  const linkedInvoice = getLinkedInvoice(salesReturnData);
  const salesReturnNumber = salesReturnData?.credit_note_id || salesReturnData?.salesReturnNumber || '—';
  const salesReturnDate = salesReturnData?.credit_note_date || salesReturnData?.salesReturnDate;
  const dueDate = salesReturnData?.due_date || salesReturnData?.dueDate;
  const bank = salesReturnData?.bank && typeof salesReturnData.bank === 'object' ? salesReturnData.bank : null;
  const vatRate = salesReturnData?.tax || salesReturnData?.items?.[0]?.form_updated_tax || salesReturnData?.items?.[0]?.tax;

  const customerLines = [
    customer?.name,
    customer?.billingAddress?.addressLine1 || customer?.addressLine1,
    customer?.billingAddress?.city || customer?.city,
    customer?.email,
    customer?.phone,
  ].filter(Boolean);

  return (
    <div ref={contentRef}>
      <Card
        className="previewCard sales-return-page"
        sx={{
          width: '210mm',
          minHeight: '297mm',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent
          sx={{
            display: 'box',
            margin: '30px',
            padding: '0px',
            border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)} `,
            borderRadius: 1,
            height: 'calc(100% - 70px)',
            flex: 1,
          }}
        >
          <Grid
            container
            sx={{
              alignItems: 'start',
              display: 'flex',
              flexDirection: 'column',
              '& > *': { width: '100%' },
            }}
          >
            <Grid
              item
              sx={{
                borderRadius: '4px 4px 0 0',
                backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.075),
              }}
            >
              <Grid
                container
                className="flex justify-between p-4"
                mb={2}
                sx={{ alignItems: 'center' }}
              >
                <Grid item xs={2}>
                  <Grid container className="flex justify-between" spacing={1}>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Image
                        src="/images/illustrations/objects/store-2.png"
                        alt="Company Logo"
                        width="80"
                        height="80"
                        priority
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Typography variant="h6" color="text.secondary">
                        Store details
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={5}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="text.secondary">
                        SALES RETURN
                      </Typography>
                      {linkedInvoice ? (
                        <Typography variant="h6" color="text.secondary">
                          Invoice #
                        </Typography>
                      ) : null}
                      <Typography variant="h6" color="text.secondary">
                        Return Date
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        Due Date
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sx={{ textAlign: 'left' }}>
                      <Typography variant="h6" fontWeight={500}>
                        #{salesReturnNumber}
                      </Typography>
                      {linkedInvoice ? (
                        <Typography variant="h6" fontWeight={500}>
                          <Link
                            href={`/invoices/invoice-view/${linkedInvoice._id}`}
                            className="text-primary hover:underline"
                          >
                            {linkedInvoice.invoiceNumber}
                          </Link>
                        </Typography>
                      ) : null}
                      <Typography variant="h6" fontWeight={500}>
                        {formatDisplayDate(salesReturnDate)}
                      </Typography>
                      <Typography variant="h6" fontWeight={500}>
                        {formatDisplayDate(dueDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item>
              <Grid
                container
                borderBottom={(theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)} `}
                padding={4}
                mb={4}
                className="flex justify-between"
              >
                <Grid item xs="auto" sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>
                    Return From:
                  </Typography>
                  {customerLines.length > 0 ? (
                    customerLines.map((line, index) => (
                      <Typography key={`${line}-${index}`} className="text-[14px]">
                        {line}
                      </Typography>
                    ))
                  ) : (
                    <Typography className="text-[14px]" color="text.secondary">
                      —
                    </Typography>
                  )}
                </Grid>

                <Grid item xs="auto" sx={{ textAlign: 'left' }}>
                  <Grid container className="flex">
                    <Grid item xs="auto" sx={{ textAlign: 'left' }}>
                      <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>
                        Pay To:
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Grid container className="flex flex-row justify-center gap-3">
                        <Grid item xs={5} sx={{ textAlign: 'right' }} className="flex flex-col gap-0.5">
                          <Typography variant="body2">Name:</Typography>
                          <Typography variant="body2">Bank Name:</Typography>
                          <Typography variant="body2">Account No:</Typography>
                          <Typography variant="body2">Branch:</Typography>
                        </Grid>

                        <Grid item xs="auto" sx={{ textAlign: 'left' }} className="flex flex-col gap-0.5">
                          <Typography className="text-[14px]" fontWeight={500}>
                            {bank?.name || '—'}
                          </Typography>
                          <Typography className="text-[14px]" fontWeight={500}>
                            {bank?.bankName || '—'}
                          </Typography>
                          <Typography className="text-[14px]" fontWeight={500}>
                            {bank?.accountNumber || '—'}
                          </Typography>
                          <Typography className="text-[14px]" fontWeight={500}>
                            {bank?.branch || '—'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid item padding={5}>
              <Box
                borderColor={(theme) => alpha(theme.palette.secondary.main, 0.15)}
                className="overflow-x-auto border rounded"
              >
                <Table
                  size="small"
                  sx={{
                    '& .MuiTableCell-root': {
                      borderColor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                    },
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell className="!bg-transparent">#</TableCell>
                      <TableCell className="!bg-transparent">Item</TableCell>
                      <TableCell className="!bg-transparent">Qty</TableCell>
                      <TableCell className="!bg-transparent">Price</TableCell>
                      <TableCell className="!bg-transparent">Discount</TableCell>
                      <TableCell className="!bg-transparent">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesReturnData?.items?.map((item, index) => (
                      <TableRow key={item._id || `${item.productId || 'item'}-${index}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(toNumber(item.rate))}</TableCell>
                        <TableCell>{formatCurrency(toNumber(item.discount))}</TableCell>
                        <TableCell>{formatCurrency(toNumber(item.amount))}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid>

            <Grid item padding={5}>
              <Grid container spacing={4} className="justify-between">
                <Grid item xs={7}>
                  <Typography variant="subtitle2" gutterBottom>
                    Terms & Conditions:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {salesReturnData?.termsAndCondition || '—'}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes:
                  </Typography>
                  <Typography variant="body2">{salesReturnData?.notes || '—'}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, minWidth: 240 }}>
                    <SummaryRow label="Subtotal:" value={salesReturnData?.taxableAmount} />
                    <SummaryRow label="Discount:" value={salesReturnData?.totalDiscount} />
                    <SummaryRow
                      label={`VAT${vatRate ? ` (${toNumber(vatRate).toFixed(2)}%)` : ''}:`}
                      value={salesReturnData?.vat}
                    />
                    <Divider sx={{ my: 0.5 }} />
                    <SummaryRow label="Total:" value={salesReturnData?.TotalAmount} strong />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewSalesReturn;

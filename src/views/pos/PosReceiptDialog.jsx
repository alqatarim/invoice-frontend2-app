'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import SubmittedDialog from '@/components/dialogs/submitted-dialog';
import { formatDateTime } from '@/utils/dateUtils';

const formatAmount = (value) => Number(value || 0).toFixed(2);
const RECEIPT_TEXT = '#111827';
const RECEIPT_MUTED_TEXT = '#4b5563';
const RECEIPT_DISABLED_TEXT = '#9ca3af';

const PosReceiptDialog = ({ open, onClose, receiptData, onNewSale }) => {
  const theme = useTheme();

  const resolvedReceipt = useMemo(() => {
    if (!receiptData) return null;
    return receiptData.receipt
      ? { ...receiptData, ...receiptData.receipt }
      : receiptData;
  }, [receiptData]);

  const items = useMemo(() => {
    const raw = Array.isArray(resolvedReceipt?.items) ? resolvedReceipt.items : [];
    return raw.map((item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.rate || 0);
      const lineTotal = qty * price;
      const taxRate = item.taxInfo?.taxRate ?? 15;
      const lineTax = Number(item.tax || (lineTotal * (taxRate / 100)));
      const totalWithTax = lineTotal + lineTax;
      return { ...item, lineTotal, lineTax, totalWithTax, taxRate };
    });
  }, [resolvedReceipt?.items]);

  const subtotal = Number(resolvedReceipt?.taxableAmount || 0);
  const vatTotal = formatAmount(resolvedReceipt?.vat);
  const total = formatAmount(resolvedReceipt?.TotalAmount || resolvedReceipt?.totalAmount);
  const invoiceNumber = resolvedReceipt?.invoiceNumber || '—';

  return (
    <SubmittedDialog
      open={open}
      onClose={onClose}
      onPrimaryAction={onNewSale}
      maxWidth="xs"
      fullWidth={false}
      paperSx={{ maxHeight: '90vh' }}
      primaryLabel="New Sale"
      primaryIcon="mdi:plus-circle-outline"
      printTitle={resolvedReceipt?.receiptNumber || invoiceNumber || 'POS Receipt'}
      printWindowFeatures="width=420,height=720"
      printPageStyle="@page { size: 80mm auto; margin: 8mm; }"
      contentSx={{ p: 2 }}
      previewSx={{
        width: '300px',
        maxWidth: '300px',
        backgroundColor: '#ffffff',
        color: RECEIPT_TEXT,
        py: 2,
        px: 5.5,
        borderRadius: 0.5,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        '& .MuiTypography-root': {
          color: RECEIPT_TEXT,
        },
      }}
    >
          <Box
            sx={{
              textAlign: 'center',
              mb: 1,
              pb: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.success.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1,
              }}
            >
              <Icon icon="mdi:check-circle" width={24} color={theme.palette.success.main} />
            </Box>
            <Typography fontWeight={700} sx={{ fontSize: '14px', color: RECEIPT_TEXT, mb: 0.5 }}>
              Simplified Tax Invoice
            </Typography>
            <Typography sx={{ fontSize: '10px', color: RECEIPT_MUTED_TEXT }}>
              Invoice No: {invoiceNumber}
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_MUTED_TEXT }}>Branch:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.branchName || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_MUTED_TEXT }}>Customer:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.customerName || 'Walk-in Customer'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_MUTED_TEXT }}>Payment:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.paymentMethod || resolvedReceipt?.payment_method || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_MUTED_TEXT }}>Receipt:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.receiptNumber || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_MUTED_TEXT }}>Cashier:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.cashierName || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_MUTED_TEXT }}>Date:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {formatDateTime(resolvedReceipt?.invoiceDate)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_MUTED_TEXT }}>Items:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.itemCount || items.length || 0}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ borderTop: '1px dashed #ccc' }} />
            <Box sx={{ display: 'flex', py: 0.75 }}>
              <Box sx={{ flex: 2 }}>
                <Typography sx={{ fontSize: '8px', fontWeight: 600 }}>Products</Typography>
              </Box>
              <Box sx={{ flex: 0.6 }}>
                <Typography sx={{ fontSize: '8px', fontWeight: 600, textAlign: 'center' }}>Qty</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '8px', fontWeight: 600, textAlign: 'center' }}>Price</Typography>
              </Box>
              <Box sx={{ flex: 0.8 }}>
                <Typography sx={{ fontSize: '8px', fontWeight: 600, textAlign: 'center' }}>VAT</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '8px', fontWeight: 600, textAlign: 'center' }}>Total</Typography>
              </Box>
            </Box>
            <Box sx={{ borderTop: '1px dashed #ccc' }} />

            {items.map((item, index) => (
              <Box key={`${item.productId || item.name}-${index}`} sx={{ display: 'flex', py: 0.6 }}>
                <Box sx={{ flex: 2 }}>
                  <Typography sx={{ fontSize: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name || 'Item'}
                  </Typography>
                </Box>
                <Box sx={{ flex: 0.6 }}>
                  <Typography sx={{ fontSize: '8px', textAlign: 'center' }}>{item.quantity}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '8px', textAlign: 'center' }}>{Number(item.rate || 0).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ flex: 0.8 }}>
                  <Typography sx={{ fontSize: '8px', textAlign: 'center' }}>{item.lineTax.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '8px', textAlign: 'center' }}>{item.totalWithTax.toFixed(2)}</Typography>
                </Box>
              </Box>
            ))}

            <Box sx={{ borderTop: '1px dashed #ccc' }} />
          </Box>

          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_TEXT }}>Total Taxable Amount</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_TEXT }}>Discount</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {formatAmount(resolvedReceipt?.totalDiscount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: RECEIPT_TEXT }}>VAT</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>{vatTotal}</Typography>
            </Box>

            {resolvedReceipt?.tenderedAmount > 0 ? (
              <>
                <Box sx={{ borderTop: '1px dashed #ccc', my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography sx={{ fontSize: '10px', color: RECEIPT_TEXT }}>Tendered</Typography>
                  <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                    {formatAmount(resolvedReceipt.tenderedAmount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography sx={{ fontSize: '10px', color: RECEIPT_TEXT }}>Change</Typography>
                  <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                    {formatAmount(resolvedReceipt.changeAmount)}
                  </Typography>
                </Box>
              </>
            ) : null}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, mt: 0.5 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: RECEIPT_TEXT }}>
                Total (Incl. VAT)
              </Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: RECEIPT_TEXT }}>
                {total}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', py: 1.5 }}>
            <Typography sx={{ fontSize: '7px', color: RECEIPT_DISABLED_TEXT, letterSpacing: 1 }}>
              {'>'}{'>'}{'>'}{'>'}{'>'}{'>'}{'>'}{'>'}{'>'} Invoice Close {'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}
            </Typography>
          </Box>
    </SubmittedDialog>
  );
};

export default PosReceiptDialog;

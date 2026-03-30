'use client';

import React, { useMemo, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

const formatAmount = (value) => Number(value || 0).toFixed(2);

const formatReceiptDate = (value) => {
  if (!value) return '—';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';

  return parsed.toLocaleString();
};

const PosReceiptDialog = ({ open, onClose, receiptData, onNewSale }) => {
  const theme = useTheme();
  const receiptRef = useRef(null);

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

  const handlePrint = () => {
    if (typeof window === 'undefined' || !receiptRef.current) return;

    const printWindow = window.open('', '_blank', 'width=420,height=720');
    if (!printWindow) return;

    const printTitle = resolvedReceipt?.receiptNumber || invoiceNumber || 'POS Receipt';

    printWindow.document.write(`
      <html>
        <head>
          <title>${printTitle}</title>
          <style>
            @page { size: 80mm auto; margin: 8mm; }
            html, body { margin: 0; padding: 0; background: #fff; }
            body { font-family: Arial, sans-serif; padding: 12px; color: #111; }
            * { box-sizing: border-box; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>${receiptRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();

    const finalizePrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (error) {
        printWindow.close();
      }
    };

    printWindow.onafterprint = () => {
      printWindow.close();
    };
    printWindow.onload = finalizePrint;
    window.setTimeout(finalizePrint, 250);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      PaperProps={{
        sx: {
          // backgroundColor: alpha(theme.palette.primary.main, 0.02),
          maxHeight: '90vh',
          borderRadius: 3,
        },
      }}
    >
      <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Box
          ref={receiptRef}
          sx={{
            width: '300px',
            maxWidth: '300px',
            backgroundColor: '#ffffff',
            py: 2,
            px: 5.5,
            borderRadius: 0.5,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
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
            <Typography fontWeight={700} sx={{ fontSize: '14px', color: 'text.primary', mb: 0.5 }}>
              Simplified Tax Invoice
            </Typography>
            <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>
              Invoice No: {invoiceNumber}
            </Typography>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Branch:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.branchName || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Customer:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.customerName || 'Walk-in Customer'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Payment:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.paymentMethod || resolvedReceipt?.payment_method || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Receipt:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.receiptNumber || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Cashier:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {resolvedReceipt?.cashierName || '—'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Date:</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {formatReceiptDate(resolvedReceipt?.invoiceDate)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Items:</Typography>
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
              <Typography sx={{ fontSize: '10px', color: 'text.primary' }}>Total Taxable Amount</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: 'text.primary' }}>Discount</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                {formatAmount(resolvedReceipt?.totalDiscount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography sx={{ fontSize: '10px', color: 'text.primary' }}>VAT</Typography>
              <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>{vatTotal}</Typography>
            </Box>

            {resolvedReceipt?.tenderedAmount > 0 ? (
              <>
                <Box sx={{ borderTop: '1px dashed #ccc', my: 0.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography sx={{ fontSize: '10px', color: 'text.primary' }}>Tendered</Typography>
                  <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                    {formatAmount(resolvedReceipt.tenderedAmount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography sx={{ fontSize: '10px', color: 'text.primary' }}>Change</Typography>
                  <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>
                    {formatAmount(resolvedReceipt.changeAmount)}
                  </Typography>
                </Box>
              </>
            ) : null}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, mt: 0.5 }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.primary' }}>
                Total (Incl. VAT)
              </Typography>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.primary' }}>
                {total}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', py: 1.5 }}>
            <Typography sx={{ fontSize: '7px', color: 'text.disabled', letterSpacing: 1 }}>
              {'>'}{'>'}{'>'}{'>'}{'>'}{'>'}{'>'}{'>'}{'>'} Invoice Close {'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1.5,
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          gap: 1,
        }}
      >
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={handlePrint}
          startIcon={<Icon icon="mdi:printer-outline" width={18} />}
        >
          Print
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onNewSale}
          startIcon={<Icon icon="mdi:plus-circle-outline" width={18} />}
        >
          New Sale
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PosReceiptDialog;

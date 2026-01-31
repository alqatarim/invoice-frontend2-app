'use client';

import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Print, Download, QrCode2 } from '@mui/icons-material';
import Image from 'next/image';
import dayjs from 'dayjs';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatCurrency } from '@/utils/currencyUtils'; // Assuming you have this utility function
import { alpha } from '@mui/material/styles';
import tableStyles from '@core/styles/table.module.css'
import { getCompanySettings } from '@/app/(dashboard)/settings/actions';

const toBase64 = (value) => {
  if (typeof window === 'undefined') return '';
  return window.btoa(unescape(encodeURIComponent(value)));
};

const utf8ToBytes = (value) => {
  const encoded = unescape(encodeURIComponent(value));
  const bytes = [];
  for (let i = 0; i < encoded.length; i += 1) {
    bytes.push(encoded.charCodeAt(i));
  }
  return bytes;
};

const encodeTLV = (tag, value) => {
  const bytes = utf8ToBytes(value);
  return [tag, bytes.length, ...bytes];
};

const buildZatcaPayload = (sellerName, vatNumber, timestamp, total, vatTotal) => {
  const bytes = [
    ...encodeTLV(1, sellerName),
    ...encodeTLV(2, vatNumber),
    ...encodeTLV(3, timestamp),
    ...encodeTLV(4, total),
    ...encodeTLV(5, vatTotal),
  ];
  const raw = String.fromCharCode(...bytes);
  return toBase64(raw);
};

const ViewInvoice = ({ invoiceData, loading }) => {
  const contentRef = useRef(null);
  const [zatcaOpen, setZatcaOpen] = useState(false);
  const [companySettings, setCompanySettings] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [zatcaSnackbar, setZatcaSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = dayjs();
    const due = dayjs(dueDate);
    return due.diff(today, 'day');
  };

  useEffect(() => {
    // Handle page breaks after component mounts
    const contentElement = contentRef.current;
    if (contentElement) {
      const pages = contentElement.querySelectorAll('.invoice-page');
      pages.forEach((page) => {
        const pageHeight = page.offsetHeight;
        if (pageHeight > 1123) {
          // Handle content overflow if needed
        }
      });
    }
  }, []);

  useEffect(() => {
    const fetchCompany = async () => {
      setCompanyLoading(true);
      try {
        const result = await getCompanySettings();
        if (result?.success) {
          setCompanySettings(result.data || {});
        } else {
          setZatcaSnackbar({
            open: true,
            message: result?.message || 'Unable to load company settings',
            severity: 'error',
          });
        }
      } catch (error) {
        setZatcaSnackbar({
          open: true,
          message: error.message || 'Unable to load company settings',
          severity: 'error',
        });
      } finally {
        setCompanyLoading(false);
      }
    };

    fetchCompany();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    handleDownloadInvoice();
  };

  const sellerName = companySettings?.companyName || companySettings?.company_name || 'Company';
  const vatNumber = companySettings?.vat_number || companySettings?.vatNo || companySettings?.vat || companySettings?.taxNumber || 'N/A';
  const timestamp = invoiceData?.invoiceDate ? new Date(invoiceData.invoiceDate).toISOString() : new Date().toISOString();
  const invoiceCounter = invoiceData?.invoiceNumber || 'N/A';
  const zatcaUuid = invoiceData?._id || 'N/A';
  const total = Number(invoiceData?.TotalAmount || 0).toFixed(2);
  const vatTotal = Number(invoiceData?.vat || 0).toFixed(2);
  const invoiceHash = toBase64(`${invoiceCounter}|${total}|${timestamp}`);

  const tlvBase64 = useMemo(
    () => buildZatcaPayload(sellerName, vatNumber, timestamp, total, vatTotal),
    [sellerName, vatNumber, timestamp, total, vatTotal]
  );

  const subtotal = Number(invoiceData?.taxableAmount || 0);
  const discount = Number(invoiceData?.totalDiscount || 0);
  const address = [companySettings?.addressLine1, companySettings?.city].filter(Boolean).join(', ') || '';
  const sellerCr = companySettings?.crNumber || companySettings?.commercialRegistrationNumber || companySettings?.cr_no || 'N/A';
  const buyerName = invoiceData?.customerId?.name || 'Walk-in Customer';
  const buyerVat = invoiceData?.customerId?.vat_number || invoiceData?.customerId?.vatNo || invoiceData?.customerId?.taxNumber || 'N/A';
  const buyerAddress = [
    invoiceData?.customerId?.billingAddress?.addressLine1,
    invoiceData?.customerId?.billingAddress?.city,
  ].filter(Boolean).join(', ') || 'N/A';

  // Calculate items with tax for ZATCA format
  const itemsWithTax = useMemo(() => {
    return (invoiceData?.items || []).map((item) => {
      const qty = Number(item.quantity || 0);
      const price = Number(item.rate || 0);
      const lineTotal = qty * price;
      const lineTax = Number(item.tax || (lineTotal * 0.15));
      const totalWithTax = lineTotal + lineTax;
      return { ...item, lineTotal, lineTax, totalWithTax };
    });
  }, [invoiceData?.items]);

  // Generate ZATCA-compliant receipt text (English)
  const generateZatcaReceiptText = () => {
    const lines = [
      '════════════════════════════════════════════',
      '         SIMPLIFIED TAX INVOICE',
      '════════════════════════════════════════════',
      '',
      `Invoice Reference: ${invoiceCounter}`,
      `Date & Time: ${dayjs(timestamp).format('YYYY/MM/DD HH:mm')}`,
      '────────────────────────────────────────────',
      `Seller: ${sellerName}`,
      `Seller Address: ${address || 'N/A'}`,
      `VAT No: ${vatNumber || 'N/A'}`,
      `CR No: ${sellerCr}`,
      '────────────────────────────────────────────',
      `Buyer: ${buyerName}`,
      `Buyer VAT: ${buyerVat}`,
      `Buyer Address: ${buyerAddress}`,
      '────────────────────────────────────────────',
      'ITEMS:',
      '────────────────────────────────────────────',
      'Item            Qty    Price      VAT    Total',
      ...itemsWithTax.map((item) =>
        `${(item.name || '').padEnd(15).slice(0, 15)} ${String(item.quantity).padStart(3)} ${item.lineTotal.toFixed(2).padStart(8)} ${item.lineTax.toFixed(2).padStart(8)} ${item.totalWithTax.toFixed(2).padStart(8)}`
      ),
      '────────────────────────────────────────────',
      '',
      `Invoice Taxable Amount: SAR ${subtotal.toFixed(2)}`,
      `VAT Amount (15%):       SAR ${vatTotal}`,
      '════════════════════════════════════════════',
      `TOTAL (Incl. VAT):      SAR ${total}`,
      '════════════════════════════════════════════',
      '',
      'QR Code Data (Base64):',
      tlvBase64,
      '',
      '────────────────────────────────────────────',
      '      Thank you for your purchase!',
      '────────────────────────────────────────────',
    ];
    return lines.join('\n');
  };

  const handleCopyZatca = async () => {
    const receiptText = generateZatcaReceiptText();

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(receiptText);
        setZatcaSnackbar({ open: true, message: 'Receipt copied to clipboard', severity: 'success' });
        return;
      }
      throw new Error('Clipboard not available');
    } catch (error) {
      setZatcaSnackbar({
        open: true,
        message: error.message || 'Failed to copy receipt',
        severity: 'error',
      });
    }
  };

  // Download receipt (thermal size)
  const handleDownloadReceipt = async () => {
    const element = document.getElementById('zatca-receipt');
    if (!element) {
      setZatcaSnackbar({ open: true, message: 'Unable to find receipt content', severity: 'error' });
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 80; // 80mm thermal receipt width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, imgHeight],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`ZATCA_Receipt_${invoiceCounter}_${Date.now()}.pdf`);
      setZatcaSnackbar({ open: true, message: 'Receipt downloaded as PDF', severity: 'success' });
    } catch (error) {
      console.error('PDF download failed:', error);
      setZatcaSnackbar({ open: true, message: 'Failed to download PDF', severity: 'error' });
    }
  };

  // Download invoice (A4 size)
  const handleDownloadInvoice = async () => {
    const element = document.getElementById('zatca-invoice-main');
    if (!element) {
      setZatcaSnackbar({ open: true, message: 'Unable to find invoice content', severity: 'error' });
      return;
    }

    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Handle multi-page if content exceeds A4 height
      const pageHeight = 297; // A4 height in mm
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Tax_Invoice_${invoiceCounter}_${Date.now()}.pdf`);
      setZatcaSnackbar({ open: true, message: 'Invoice downloaded as PDF', severity: 'success' });
    } catch (error) {
      console.error('PDF download failed:', error);
      setZatcaSnackbar({ open: true, message: 'Failed to download PDF', severity: 'error' });
    }
  };

  // Calculate items with extended tax info for Full Invoice (7-column format)
  const itemsWithFullTax = useMemo(() => {
    return (invoiceData?.items || []).map((item) => {
      const qty = Number(item.quantity || 0);
      const unitPrice = Number(item.rate || 0);
      const subtotalExclVat = qty * unitPrice;
      const taxRate = 15;
      const taxAmount = Number(item.tax || (subtotalExclVat * 0.15));
      const totalInclVat = subtotalExclVat + taxAmount;
      return { ...item, unitPrice, subtotalExclVat, taxRate, taxAmount, totalInclVat };
    });
  }, [invoiceData?.items]);

  // ZATCA Full Tax Invoice (B2B format) - A4 printable format
  const renderInvoice = (id) => {
    return (
      <Box
        id={id}
        sx={{
          width: '210mm',
          minHeight: '297mm',
          backgroundColor: '#ffffff',
          p: 4,
          mx: 'auto',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          '@media print': {
            boxShadow: 'none',
            p: 3,
          },
        }}
      >
        {/* Header Row: QR Code + Title + Reference */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, pageBreakInside: 'avoid' }}>
          {/* QR Code at TOP-LEFT */}
          <Box
            sx={{
              width: 90,
              height: 90,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid #e0e0e0',
            }}
          >
            <QrCode2 sx={{ fontSize: 60, color: 'text.secondary' }} />
          </Box>

          {/* Right side: Title and reference info */}
          <Box sx={{ flex: 1 }}>
            <Typography
              fontWeight={700}
              sx={{
                fontSize: '22px',
                color: 'primary.main',
                mb: 2,
                textAlign: 'center',
              }}
            >
              Tax Invoice
            </Typography>
            <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: 0.25 }}>Invoice Reference</Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{invoiceCounter}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '11px', color: 'text.secondary', mb: 0.25 }}>Date & Time</Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{dayjs(timestamp).format('YYYY/MM/DD - HH:mm')}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Seller & Buyer Information - Side by Side */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, pageBreakInside: 'avoid' }}>
          {/* Seller Information */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'primary.main',
                mb: 1.5,
                pb: 0.5,
                borderBottom: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              Seller Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Name</Typography>
                <Typography sx={{ fontSize: '12px' }}>{sellerName}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Address</Typography>
                <Typography sx={{ fontSize: '12px' }}>{address || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>VAT Registration No</Typography>
                <Typography sx={{ fontSize: '12px' }}>{vatNumber}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>CR Number</Typography>
                <Typography sx={{ fontSize: '12px' }}>{sellerCr}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Buyer Information */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'primary.main',
                mb: 1.5,
                pb: 0.5,
                borderBottom: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              Buyer Information
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Name</Typography>
                <Typography sx={{ fontSize: '12px' }}>{buyerName}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Address</Typography>
                <Typography sx={{ fontSize: '12px' }}>{buyerAddress}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>VAT Registration No</Typography>
                <Typography sx={{ fontSize: '12px' }}>{buyerVat}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>CR Number</Typography>
                <Typography sx={{ fontSize: '12px' }}>{invoiceData?.customerId?.crNumber || 'N/A'}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Items Table - 7 columns */}
        <Box sx={{ mb: 4 }}>
          <Table size="small" sx={{ borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha('#000', 0.03) }}>
                <TableCell sx={{ fontSize: '11px', fontWeight: 600, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>Product</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 600, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>Unit Price</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 600, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>Qty</TableCell>
                <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 600, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>Subtotal (excl. VAT)</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 600, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>Tax %</TableCell>
                <TableCell align="center" sx={{ fontSize: '11px', fontWeight: 600, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>Tax Amount</TableCell>
                <TableCell align="center" sx={{ fontSize: '10px', fontWeight: 600, py: 1.5, borderBottom: '1px solid #e0e0e0' }}>Total (incl. VAT)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemsWithFullTax.map((item, index) => (
                <TableRow key={`${item.productId || item.name}-${index}`} sx={{ pageBreakInside: 'avoid' }}>
                  <TableCell sx={{ fontSize: '11px', py: 1.25, borderBottom: '1px solid #f0f0f0' }}>{item.name}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', py: 1.25, borderBottom: '1px solid #f0f0f0' }}>{item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', py: 1.25, borderBottom: '1px solid #f0f0f0' }}>{item.quantity}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', py: 1.25, borderBottom: '1px solid #f0f0f0' }}>{item.subtotalExclVat.toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', py: 1.25, borderBottom: '1px solid #f0f0f0' }}>{item.taxRate}%</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', py: 1.25, borderBottom: '1px solid #f0f0f0' }}>{item.taxAmount.toFixed(2)}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '11px', py: 1.25, borderBottom: '1px solid #f0f0f0' }}>{item.totalInclVat.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Totals Section */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pageBreakInside: 'avoid' }}>
          <Box sx={{ width: '280px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>Subtotal (excl. VAT)</Typography>
              <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>VAT (15%)</Typography>
              <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>{vatTotal}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, mt: 1, backgroundColor: 'primary.main', px: 2, borderRadius: 0.5 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Total (incl. VAT)</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{total}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  // ZATCA Simplified Tax Invoice Receipt (B2C format) - Clean minimal layout
  const renderReceipt = (id) => {
    return (
      <Box
        id={id}
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
        {/* Title */}
        <Typography fontWeight={700} sx={{ fontSize: '14px', color: 'text.primary', textAlign: 'center', mb: 0.5 }}>
          Simplified Tax Invoice
        </Typography>
        <Typography sx={{ fontSize: '10px', color: 'text.secondary', textAlign: 'center', mb: 1.5 }}>
          Invoice No: {invoiceCounter}
        </Typography>

        {/* Seller Info */}
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'text.primary', textAlign: 'center', mb: 0.5 }}>
          {sellerName}
        </Typography>
        <Typography sx={{ fontSize: '10px', color: 'text.secondary', textAlign: 'center', mb: 1.5 }}>
          {address || 'N/A'}
        </Typography>

        {/* Date and VAT Registration - flex start with gap */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>Date:</Typography>
            <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>{dayjs(timestamp).format('YYYY/MM/DD')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '10px', color: 'text.secondary' }}>VAT Registration No:</Typography>
            <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>{vatNumber || 'N/A'}</Typography>
          </Box>
        </Box>

        {/* Items Table with dashed borders */}
        <Box sx={{ mb: 1.5 }}>
          {/* Top dashed border */}
          <Box sx={{ borderTop: '1px dashed #ccc' }} />

          {/* Table Header */}
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

          {/* Header bottom dashed border */}
          <Box sx={{ borderTop: '1px dashed #ccc' }} />

          {/* Table Rows */}
          {itemsWithTax.map((item, index) => (
            <Box key={`${item.productId || item.name}-${index}`} sx={{ display: 'flex', py: 0.6 }}>
              <Box sx={{ flex: 2 }}>
                <Typography sx={{ fontSize: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</Typography>
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

          {/* Bottom dashed border */}
          <Box sx={{ borderTop: '1px dashed #ccc' }} />
        </Box>

        {/* Totals Section - no borders */}
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
            <Typography sx={{ fontSize: '10px', color: 'text.primary' }}>Total Taxable Amount</Typography>
            <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>{subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
            <Typography sx={{ fontSize: '10px', color: 'text.primary' }}>VAT (15%)</Typography>
            <Typography sx={{ fontSize: '10px', fontWeight: 500 }}>{vatTotal}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: 'text.primary' }}>Total (Incl. VAT)</Typography>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.primary' }}>{total}</Typography>
          </Box>
        </Box>

        {/* Footer Line */}
        <Box sx={{ textAlign: 'center', py: 1.5 }}>
          <Typography sx={{ fontSize: '7px', color: 'text.disabled', letterSpacing: 1 }}>
            {'>'}{'>'}{'>'}{'>'}{'>'}{'>'}{'>'}{'>'}{'>'} Invoice Close {'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}
          </Typography>
        </Box>

        {/* QR Code Section - at BOTTOM */}
        <Box sx={{ textAlign: 'center', py: 1 }}>
          <Box
            sx={{
              width: 70,
              height: 70,
              mx: 'auto',
              border: '1px solid #999',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
            }}
          >
            <QrCode2 sx={{ fontSize: 50, color: 'text.secondary' }} />
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <div ref={contentRef}>
      <Box className="flex flex-row justify-end gap-2 mb-4 print:hidden">
        <Button variant="outlined" color="secondary" startIcon={<Print />} onClick={handlePrint}>
          Print
        </Button>
        <Button variant="outlined" color="primary" startIcon={<Download />} onClick={handleDownload}>
          Download
        </Button>
        <Button variant="contained" color="primary" startIcon={<QrCode2 />} onClick={() => setZatcaOpen(true)}>
          View Receipt
        </Button>
      </Box>
      <Box
        className="previewCard invoice-page"
        sx={{
          width: '100%',
          maxWidth: '220mm',
          margin: '0 auto',
          '@media print': {
            maxWidth: '100%',
            boxShadow: 'none',
          },
        }}
      >
        {renderInvoice('zatca-invoice-main')}
      </Box>
      <Dialog
        open={zatcaOpen}
        onClose={() => setZatcaOpen(false)}
        maxWidth="xs"
        PaperProps={{
          sx: {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
            maxHeight: '90vh',
          }
        }}
      >
        <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          {companyLoading ? (
            <Box className="flex items-center justify-center py-8">
              <CircularProgress size={32} color="primary" />
            </Box>
          ) : renderReceipt('zatca-receipt')}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02), gap: 1 }}>
          <Button variant="outlined" color="secondary" onClick={() => setZatcaOpen(false)}>
            Close
          </Button>
          <Button variant="outlined" color="primary" onClick={handleCopyZatca}>
            Share
          </Button>
          <Button variant="contained" color="primary" onClick={handleDownloadReceipt} startIcon={<Download />}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={zatcaSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setZatcaSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setZatcaSnackbar((prev) => ({ ...prev, open: false }))}
          severity={zatcaSnackbar.severity}
          className="w-full"
        >
          {zatcaSnackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ViewInvoice;
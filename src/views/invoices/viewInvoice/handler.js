'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { exportElementToPdf, exportTextToPdf } from '@/utils/pdfExport';
import { buildInvoiceReceiptText } from '@/utils/zatca';

const STANDARD_INVOICE_PREVIEW_ID = 'standard-invoice-preview';
const DEFAULT_SNACKBAR_STATE = {
  open: false,
  message: '',
  severity: 'success',
};

export function useInvoiceViewHandler({
  invoiceData = null,
  companyData = null,
}) {
  const [currencyData, setCurrencyData] = useState('$');
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [snackbar, setSnackbar] = useState(DEFAULT_SNACKBAR_STATE);

  const openSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedCurrency = window.localStorage.getItem('currencyData');

    if (storedCurrency) {
      setCurrencyData(storedCurrency);
    }
  }, []);

  const receiptText = useMemo(() => {
    if (!invoiceData) return '';

    const company = companyData || {};
    const customer = invoiceData.customerId || null;
    const walkInCustomer = invoiceData.walkInCustomer || null;
    const customerAddress = customer?.billingAddress || {};

    const sellerAddress =
      [
        company.addressLine1,
        company.addressLine2,
        company.city,
        company.state,
        company.country,
        company.pincode,
      ]
        .filter(Boolean)
        .join(', ') || 'N/A';
    const buyerAddress =
      [
        customerAddress.addressLine1,
        customerAddress.addressLine2,
        customerAddress.city,
        customerAddress.state,
        customerAddress.country,
        customerAddress.pincode,
      ]
        .filter(Boolean)
        .join(', ') || 'N/A';

    const invoiceNumber = invoiceData.invoiceNumber || 'N/A';
    const sellerName = company.companyName || 'Company';
    const buyerName =
      customer?.name ||
      walkInCustomer?.name ||
      (invoiceData.isWalkIn ? 'Walk-in Customer' : 'N/A');
    const timestamp = invoiceData.invoiceDate
      ? new Date(invoiceData.invoiceDate).toISOString()
      : new Date().toISOString();

    return buildInvoiceReceiptText({
      invoiceNumber,
      timestamp,
      sellerName,
      sellerAddress,
      vatNumber: 'N/A',
      buyerName,
      buyerVat: 'N/A',
      buyerAddress,
      currencySymbol: currencyData,
      subtotal: Number(invoiceData.taxableAmount || 0),
      discount: Number(invoiceData.totalDiscount || 0),
      vatTotal: Number(invoiceData.vat || 0),
      total: Number(invoiceData.TotalAmount || 0),
    }).receiptText;
  }, [companyData, currencyData, invoiceData]);

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  const handleDownloadInvoice = useCallback(async () => {
    const element = typeof document !== 'undefined'
      ? document.getElementById(STANDARD_INVOICE_PREVIEW_ID)
      : null;

    try {
      await exportElementToPdf({
        element,
        fileName: `Invoice_${invoiceData?.invoiceNumber || 'N/A'}_${Date.now()}.pdf`,
      });
      openSnackbar('Invoice downloaded successfully');
    } catch (downloadError) {
      console.error('Invoice download failed:', downloadError);
      openSnackbar(downloadError.message || 'Failed to download invoice', 'error');
    }
  }, [invoiceData?.invoiceNumber, openSnackbar]);

  const handleCopyReceipt = useCallback(async () => {
    if (!receiptText) {
      openSnackbar('Receipt data is unavailable', 'error');
      return;
    }

    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard is unavailable');
      }

      await navigator.clipboard.writeText(receiptText);
      openSnackbar('Receipt copied to clipboard');
    } catch (copyError) {
      openSnackbar(copyError.message || 'Unable to copy the receipt', 'error');
    }
  }, [openSnackbar, receiptText]);

  const handleDownloadReceipt = useCallback(() => {
    if (!receiptText) {
      openSnackbar('Receipt data is unavailable', 'error');
      return;
    }

    try {
      exportTextToPdf({
        text: receiptText,
        fileName: `Receipt_${invoiceData?.invoiceNumber || 'N/A'}_${Date.now()}.pdf`,
      });
      openSnackbar('Receipt downloaded successfully');
    } catch (downloadError) {
      console.error('Receipt download failed:', downloadError);
      openSnackbar(downloadError.message || 'Failed to download receipt', 'error');
    }
  }, [invoiceData?.invoiceNumber, openSnackbar, receiptText]);

  const closeSnackbar = useCallback(() => {
    setSnackbar(current => ({
      ...current,
      open: false,
    }));
  }, []);

  const openReceipt = useCallback(() => {
    setReceiptOpen(true);
  }, []);

  const closeReceipt = useCallback(() => {
    setReceiptOpen(false);
  }, []);

  return {
    currencyData,
    previewId: STANDARD_INVOICE_PREVIEW_ID,
    receiptText,
    receiptOpen,
    snackbar,
    openReceipt,
    closeReceipt,
    closeSnackbar,
    handlePrint,
    handleDownloadInvoice,
    handleCopyReceipt,
    handleDownloadReceipt,
  };
}

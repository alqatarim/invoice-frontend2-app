'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { exportElementToPdf } from '@/utils/pdfExport';
import { buildInvoiceReceiptData } from '@/utils/buildInvoiceReceiptData';

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

  const receiptData = useMemo(
    () => buildInvoiceReceiptData(invoiceData, companyData),
    [companyData, invoiceData]
  );

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
    receiptData,
    receiptOpen,
    snackbar,
    openReceipt,
    closeReceipt,
    closeSnackbar,
    handlePrint,
    handleDownloadInvoice,
  };
}

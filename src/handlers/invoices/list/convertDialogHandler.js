'use client'

import { useState, useCallback } from 'react';

/**
 * Dialog handler for converting invoices to sales returns.
 */
export function convertDialogHandler({ handleConvertToSalesReturn, onError, onSuccess }) {
  const [dialogState, setDialogState] = useState({
    open: false,
    invoice: null
  });

  const openConvertDialog = useCallback((invoice) => {
    setDialogState({ open: true, invoice });
  }, []);

  const closeConvertDialog = useCallback(() => {
    setDialogState({ open: false, invoice: null });
  }, []);

  const confirmConvertToSalesReturn = useCallback(async () => {
    const { invoice } = dialogState;
    if (!invoice) return;

    try {
      await handleConvertToSalesReturn(invoice.id || invoice._id);
      closeConvertDialog();
      onSuccess?.('Invoice converted to sales return successfully.');
    } catch (error) {
      onError?.(error.message || 'Failed to convert invoice to sales return.');
    }
  }, [dialogState.invoice, handleConvertToSalesReturn, closeConvertDialog, onSuccess, onError]);

  return {
    convertDialogOpen: dialogState.open,
    invoiceToConvert: dialogState.invoice,
    openConvertDialog,
    closeConvertDialog,
    confirmConvertToSalesReturn,
  };
}

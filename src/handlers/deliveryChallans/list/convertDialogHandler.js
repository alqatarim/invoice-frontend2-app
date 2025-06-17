'use client';

import { useState, useCallback, useMemo } from 'react';

/**
 * Dialog handler for converting delivery challans to invoices.
 */
export function convertDialogHandler({ handleConvertToInvoice, onError, onSuccess }) {
  const [dialogState, setDialogState] = useState({
    open: false,
    deliveryChallan: null,
    convertOptions: {
      isRecurring: false,
      recurringCycle: 'monthly'
    }
  });

  const openConvertDialog = useCallback((deliveryChallan) => {
    setDialogState(prev => ({
      ...prev,
      open: true,
      deliveryChallan,
      convertOptions: {
        isRecurring: false,
        recurringCycle: 'monthly'
      }
    }));
  }, []);

  const closeConvertDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      open: false,
      deliveryChallan: null
    }));
  }, []);

  const updateConvertOptions = useCallback((field, value) => {
    setDialogState(prev => ({
      ...prev,
      convertOptions: { ...prev.convertOptions, [field]: value }
    }));
  }, []);

  const confirmConvertToInvoice = useCallback(async () => {
    const { deliveryChallan, convertOptions } = dialogState;
    if (!deliveryChallan) return;

    try {
      await handleConvertToInvoice(deliveryChallan.id || deliveryChallan._id, convertOptions);
      closeConvertDialog();
      onSuccess?.('Delivery challan converted to invoice successfully.');
    } catch (error) {
      onError?.(error.message || 'Failed to convert delivery challan to invoice.');
    }
  }, [dialogState, handleConvertToInvoice, closeConvertDialog, onSuccess, onError]);

  // Memoized return object to prevent recreating on every render
  return useMemo(() => ({
    convertDialogOpen: dialogState.open,
    deliveryChallanToConvert: dialogState.deliveryChallan,
    convertOptions: dialogState.convertOptions,
    openConvertDialog,
    closeConvertDialog,
    updateConvertOptions,
    confirmConvertToInvoice,
  }), [
    dialogState.open,
    dialogState.deliveryChallan,
    dialogState.convertOptions,
    openConvertDialog,
    closeConvertDialog,
    updateConvertOptions,
    confirmConvertToInvoice
  ]);
}
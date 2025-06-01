'use client';

import { useState, useCallback } from 'react';

/**
 * Dialog handler for converting purchase orders to purchases.
 */
export function convertDialogHandler({ handleConvertToPurchase, onError, onSuccess }) {
  const [dialogState, setDialogState] = useState({
    open: false,
    purchaseOrder: null
  });

  const openConvertDialog = useCallback((purchaseOrder) => {
    setDialogState({ open: true, purchaseOrder });
  }, []);

  const closeConvertDialog = useCallback(() => {
    setDialogState({ open: false, purchaseOrder: null });
  }, []);

  const confirmConvertToPurchase = useCallback(async () => {
    const { purchaseOrder } = dialogState;
    if (!purchaseOrder) return;

    try {
      await handleConvertToPurchase(purchaseOrder.id || purchaseOrder._id);
      closeConvertDialog();
      onSuccess?.('Purchase order converted to purchase successfully.');
    } catch (error) {
      onError?.(error.message || 'Failed to convert purchase order to purchase.');
    }
  }, [dialogState.purchaseOrder, handleConvertToPurchase, closeConvertDialog, onSuccess, onError]);

  return {
    convertDialogOpen: dialogState.open,
    purchaseOrderToConvert: dialogState.purchaseOrder,
    openConvertDialog,
    closeConvertDialog,
    confirmConvertToPurchase,
  };
}
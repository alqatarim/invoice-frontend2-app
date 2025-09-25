'use client';

import { useState, useCallback } from 'react';

/**
 * Dialog handler for converting purchases to invoices.
 */
export function convertDialogHandler({ handleConvertToInvoice, onError, onSuccess }) {
     const [dialogState, setDialogState] = useState({
          open: false,
          purchase: null
     });

     const openConvertDialog = useCallback((purchase) => {
          setDialogState({ open: true, purchase });
     }, []);

     const closeConvertDialog = useCallback(() => {
          setDialogState({ open: false, purchase: null });
     }, []);

     const confirmConvertToInvoice = useCallback(async () => {
          const { purchase } = dialogState;
          if (!purchase) return;

          try {
               await handleConvertToInvoice(purchase.id || purchase._id);
               closeConvertDialog();
               onSuccess?.('Purchase converted to invoice successfully.');
          } catch (error) {
               onError?.(error.message || 'Failed to convert purchase to invoice.');
          }
     }, [dialogState.purchase, handleConvertToInvoice, closeConvertDialog, onSuccess, onError]);

     return {
          convertDialogOpen: dialogState.open,
          purchaseToConvert: dialogState.purchase,
          openConvertDialog,
          closeConvertDialog,
          confirmConvertToInvoice,
     };
}

import { useState } from 'react';

/**
 * convertDialogHandler
 * Handles state and logic for the Convert to Sales Return dialog.
 * @param {Object} params
 * @param {Function} params.handleConvertToSalesReturn - Function to perform the conversion.
 * @param {Function} params.onError - Callback for error snackbar.
 * @param {Function} params.onSuccess - Callback for success snackbar.
 */
export function convertDialogHandler({ handleConvertToSalesReturn, onError, onSuccess }) {
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [invoiceToConvert, setInvoiceToConvert] = useState(null);

  /**
   * Open the Convert to Sales Return dialog.
   * @param {object} invoice - The invoice to convert.
   */
  const openConvertDialog = (invoice) => {
    setInvoiceToConvert(invoice);
    setConvertDialogOpen(true);
  };

  /**
   * Close the Convert to Sales Return dialog.
   */
  const closeConvertDialog = () => {
    setInvoiceToConvert(null);
    setConvertDialogOpen(false);
  };

  /**
   * Confirm conversion to sales return.
   */
  const confirmConvertToSalesReturn = async () => {
    if (!invoiceToConvert) return;
    try {
      await handleConvertToSalesReturn(invoiceToConvert.id || invoiceToConvert._id);
      closeConvertDialog();
      if (onSuccess) onSuccess('Invoice converted to sales return successfully.');
    } catch (error) {
      if (onError) onError(error.message || 'Failed to convert invoice to sales return.');
    }
  };

  return {
    convertDialogOpen,
    invoiceToConvert,
    openConvertDialog,
    closeConvertDialog,
    confirmConvertToSalesReturn,
  };
}

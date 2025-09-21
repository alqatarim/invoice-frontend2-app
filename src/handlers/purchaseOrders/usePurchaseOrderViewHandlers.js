import { useCallback } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/currencyUtils';

/**
 * Handler for purchase order view functionality.
 * Provides action handlers and utility functions for ViewPurchaseOrder component.
 */
export default function usePurchaseOrderViewHandlers({
  purchaseOrderData,
  onEdit,
  onDelete,
  onClone,
  onConvert,
  enqueueSnackbar,
  closeSnackbar
}) {
  // Action handlers
  const handleEdit = useCallback(() => {
    if (onEdit && purchaseOrderData?._id) {
      onEdit(purchaseOrderData._id);
    }
  }, [onEdit, purchaseOrderData]);

  const handleDelete = useCallback(() => {
    if (onDelete && purchaseOrderData?._id) {
      onDelete(purchaseOrderData._id);
    }
  }, [onDelete, purchaseOrderData]);

  const handleClone = useCallback(() => {
    if (onClone && purchaseOrderData?._id) {
      onClone(purchaseOrderData._id);
    }
  }, [onClone, purchaseOrderData]);

  const handleConvert = useCallback(() => {
    if (onConvert && purchaseOrderData?._id) {
      onConvert(purchaseOrderData._id);
    }
  }, [onConvert, purchaseOrderData]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    try {
      // You can implement PDF download functionality here
      enqueueSnackbar?.('PDF download started', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar?.('Failed to download PDF', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Utility functions using existing utils
  const formatCurrencyDisplay = useCallback((amount) => {
    return formatCurrency(amount);
  }, []);

  const formatDateDisplay = useCallback((date) => {
    return formatDate(date);
  }, []);

  return {
    // Action handlers
    handleEdit,
    handleDelete,
    handleClone,
    handleConvert,
    handlePrint,
    handleDownloadPDF,

    // Utility functions
    formatCurrency: formatCurrencyDisplay,
    formatDate: formatDateDisplay,
  };
}
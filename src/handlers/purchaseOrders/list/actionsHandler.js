'use client';

import {
  clonePurchaseOrder,
  addPurchaseOrder,
  convertToPurchase,
  printDownloadPurchaseOrder,
} from '@/app/(dashboard)/purchase-orders/actions';

/**
 * Purchase order actions handler - manages all purchase order-related actions.
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters }) {
  /**
   * Execute an action with standard error handling and optional data refresh.
   */
  const executeAction = async (actionFn, successMessage, shouldRefresh = false) => {
    try {
      const result = await actionFn();
      onSuccess?.(successMessage);
      if (shouldRefresh && fetchData) {
        await fetchData({ page: pagination?.current, filters });
      }
      return result;
    } catch (error) {
      onError?.(error.message || 'Action failed');
      throw error;
    }
  };

  return {
    handleClone: (id) =>
      executeAction(
        () => clonePurchaseOrder(id),
        'Purchase order cloned successfully!',
        true
      ),

    handleSend: (id) =>
      executeAction(
        () => addPurchaseOrder(id),
        'Purchase order sent successfully!'
      ),

    handleConvertToPurchase: (id) =>
      executeAction(
        () => convertToPurchase(id),
        'Purchase order converted to purchase successfully!',
        true
      ),

    handlePrintDownload: async (id) => {
      try {
        const pdfUrl = await printDownloadPurchaseOrder(id);
        window.open(pdfUrl, '_blank');
        onSuccess?.('Purchase order is being prepared for download.');
      } catch (error) {
        onError?.(error.message || 'Failed to download purchase order.');
      }
    },
  };
}
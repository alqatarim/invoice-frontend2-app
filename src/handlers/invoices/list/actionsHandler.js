'use client';

import {
  cloneInvoice,
  sendInvoice,
  convertTosalesReturn,
  sendPaymentLink,
  printDownloadInvoice,
} from '@/app/(dashboard)/invoices/actions';

/**
 * Invoice actions handler - manages all invoice-related actions.
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
        () => cloneInvoice(id),
        'Invoice cloned successfully!',
        true
      ),

    handleSend: (id) =>
      executeAction(
        () => sendInvoice(id),
        'Invoice sent successfully!'
      ),

    handleConvertToSalesReturn: (id) =>
      executeAction(
        () => convertTosalesReturn(id),
        'Invoice converted to sales return successfully!',
        true
      ),

    handlePrintDownload: async (id) => {
      try {
        const pdfUrl = await printDownloadInvoice(id);
        window.open(pdfUrl, '_blank');
        onSuccess?.('Invoice is being prepared for download.');
      } catch (error) {
        onError?.(error.message || 'Failed to download invoice.');
      }
    },

    handleSendPaymentLink: (id) =>
      executeAction(
        () => sendPaymentLink(id),
        'Payment link sent successfully!'
      ),
  };
}
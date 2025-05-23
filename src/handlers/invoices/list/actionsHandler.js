import {
  cloneInvoice,
  sendInvoice,
  convertTosalesReturn,
  sendPaymentLink,
  printDownloadInvoice,
} from '@/app/(dashboard)/invoices/actions';

/**
 * actionsHandler
 * Handles invoice actions for the invoice list.
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters, tab }) {
  // Clone invoice
  const handleClone = async (id) => {
    try {
      const newInvoice = await cloneInvoice(id);
      onSuccess && onSuccess('Invoice cloned successfully!');
      fetchData && fetchData(tab, pagination.current, pagination.pageSize, filters);
      return newInvoice;
    } catch (error) {
      onError && onError(error.message || 'Failed to clone invoice.');
    }
  };

  // Send invoice
  const handleSend = async (id) => {
    try {
      await sendInvoice(id);
      onSuccess && onSuccess('Invoice sent successfully!');
    } catch (error) {
      onError && onError(error.message || 'Failed to send invoice.');
    }
  };

  // Convert to sales return
  const handleConvertToSalesReturn = async (id) => {
    try {
      await convertTosalesReturn(id, tab);
      onSuccess && onSuccess('Invoice converted to sales return successfully!');
      fetchData && fetchData(tab, pagination.current, pagination.pageSize, filters);
    } catch (error) {
      onError && onError(error.message || 'Failed to convert invoice to sales return.');
    }
  };

  // Print/download invoice
  const handlePrintDownload = async (id) => {
    try {
      const pdfUrl = await printDownloadInvoice(id);
      window.open(pdfUrl, '_blank');
      onSuccess && onSuccess('Invoice is being prepared for download.');
    } catch (error) {
      onError && onError(error.message || 'Failed to download invoice.');
    }
  };

  // Send payment link
  const handleSendPaymentLink = async (id) => {
    try {
      await sendPaymentLink(id);
      onSuccess && onSuccess('Payment link sent successfully!');
    } catch (error) {
      onError && onError(error.message || 'Failed to send payment link.');
    }
  };

  // Sort request
  const handleSortRequest = (sortBy, sortDirection, columnKey) => {
    let newDirection = 'asc';
    if (sortBy === columnKey) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    fetchData && fetchData(tab, 1, pagination.pageSize, filters, columnKey, newDirection);
    return { sortBy: columnKey, sortDirection: newDirection };
  };

  return {
    handleClone,
    handleSend,
    handleConvertToSalesReturn,
    handlePrintDownload,
    handleSendPaymentLink,
    handleSortRequest,
  };
}
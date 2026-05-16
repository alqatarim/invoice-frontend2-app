'use client';

import { useCallback } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/currencyUtils';

export default function usePurchaseOrderViewHandlers({
  purchaseOrderData,
  onEdit,
  onDelete,
  onClone,
  onConvert,
  enqueueSnackbar,
}) {
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
      enqueueSnackbar?.('PDF download started', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar?.('Failed to download PDF', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  return {
    handleEdit,
    handleDelete,
    handleClone,
    handleConvert,
    handlePrint,
    handleDownloadPDF,
    formatCurrency: amount => formatCurrency(amount),
    formatDate: date => formatDate(date),
  };
}

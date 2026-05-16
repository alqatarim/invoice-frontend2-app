'use client';

import { useCallback } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/currencyUtils';

export default function usePurchaseViewHandlers({
  purchaseData,
  onEdit,
  onDelete,
  onClone,
  onConvert,
  enqueueSnackbar,
}) {
  const handleEdit = useCallback(() => {
    if (onEdit && purchaseData?._id) {
      onEdit(purchaseData._id);
    }
  }, [onEdit, purchaseData]);

  const handleDelete = useCallback(() => {
    if (onDelete && purchaseData?._id) {
      onDelete(purchaseData._id);
    }
  }, [onDelete, purchaseData]);

  const handleClone = useCallback(() => {
    if (onClone && purchaseData?._id) {
      onClone(purchaseData._id);
    }
  }, [onClone, purchaseData]);

  const handleConvert = useCallback(() => {
    if (onConvert && purchaseData?._id) {
      onConvert(purchaseData._id);
    }
  }, [onConvert, purchaseData]);

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

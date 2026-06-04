'use client';

import { useCallback } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/currencyUtils';

export default function useQuotationViewHandlers({
  quotationData,
  onEdit,
  onDelete,
  onClone,
  onConvert,
  onStatusChange,
  enqueueSnackbar,
}) {
  const handleEdit = useCallback(() => {
    if (onEdit && quotationData?._id) {
      onEdit(quotationData._id);
    }
  }, [onEdit, quotationData]);

  const handleDelete = useCallback(() => {
    if (onDelete && quotationData?._id) {
      onDelete(quotationData._id);
    }
  }, [onDelete, quotationData]);

  const handleClone = useCallback(() => {
    if (onClone && quotationData?._id) {
      onClone(quotationData._id);
    }
  }, [onClone, quotationData]);

  const handleConvert = useCallback(() => {
    if (onConvert && quotationData?._id) {
      onConvert(quotationData._id);
    }
  }, [onConvert, quotationData]);

  const handleStatusChange = useCallback(
    status => {
      if (onStatusChange && quotationData?._id) {
        onStatusChange(quotationData._id, status);
      }
    },
    [onStatusChange, quotationData]
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(() => {
    enqueueSnackbar?.('PDF download started', { variant: 'info' });
  }, [enqueueSnackbar]);

  return {
    handleEdit,
    handleDelete,
    handleClone,
    handleConvert,
    handleStatusChange,
    handlePrint,
    handleDownloadPDF,
    formatCurrency: amount => formatCurrency(amount),
    formatDate: date => formatDate(date),
  };
}

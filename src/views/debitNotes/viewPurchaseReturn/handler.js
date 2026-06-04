'use client';

import { useCallback } from 'react';

export default function useDebitNoteViewHandlers({
  debitNoteData,
  onEdit,
  onDelete,
  onClone,
  enqueueSnackbar,
}) {
  const handleEdit = useCallback(() => {
    if (onEdit && debitNoteData?._id) {
      onEdit(debitNoteData._id);
    }
  }, [onEdit, debitNoteData]);

  const handleDelete = useCallback(() => {
    if (onDelete && debitNoteData?._id) {
      onDelete(debitNoteData._id);
    }
  }, [onDelete, debitNoteData]);

  const handleClone = useCallback(() => {
    if (onClone && debitNoteData?._id) {
      onClone(debitNoteData._id);
    }
  }, [onClone, debitNoteData]);

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
    handlePrint,
    handleDownloadPDF,
  };
}

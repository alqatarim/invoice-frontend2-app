'use client';

import { useCallback } from 'react';

export default function useDeliveryChallanViewHandler({
  deliveryChallanData,
  onEdit,
  onConvert,
  onDelete,
  enqueueSnackbar,
}) {
  const isConverted =
    String(deliveryChallanData?.status || '').toUpperCase() === 'CONVERTED';

  const handleEdit = useCallback(() => {
    if (isConverted) {
      enqueueSnackbar?.('Converted delivery challans cannot be edited.', { variant: 'error' });
      return;
    }
    onEdit?.(deliveryChallanData?._id);
  }, [deliveryChallanData?._id, enqueueSnackbar, isConverted, onEdit]);

  const handleConvert = useCallback(() => {
    if (isConverted) {
      enqueueSnackbar?.('This delivery challan has already been converted.', { variant: 'error' });
      return;
    }
    onConvert?.(deliveryChallanData?._id);
  }, [deliveryChallanData?._id, enqueueSnackbar, isConverted, onConvert]);

  const handleDelete = useCallback(() => {
    onDelete?.(deliveryChallanData?._id);
  }, [deliveryChallanData?._id, onDelete]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(() => {
    enqueueSnackbar?.('PDF download started', { variant: 'info' });
  }, [enqueueSnackbar]);

  return {
    isConverted,
    handleEdit,
    handleConvert,
    handleDelete,
    handlePrint,
    handleDownloadPDF,
  };
}

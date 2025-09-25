import { useCallback } from 'react';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/currencyUtils';

/**
 * Handler for purchase view functionality.
 * Provides action handlers and utility functions for ViewPurchase component.
 */
export default function usePurchaseViewHandlers({
     purchaseData,
     onEdit,
     onDelete,
     onClone,
     onConvert,
     enqueueSnackbar,
     closeSnackbar
}) {
     // Action handlers
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

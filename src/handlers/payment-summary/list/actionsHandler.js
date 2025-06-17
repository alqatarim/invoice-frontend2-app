'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { deletePayment, updatePaymentStatus } from '@/app/(dashboard)/payment-summary/actions';
import { toast } from 'react-toastify';

/**
 * Actions handler for payment summary list (following invoice pattern)
 */
export function actionsHandler({ onSuccess, onError, refreshData }) {
  const router = useRouter();

  const handleView = useCallback((invoiceId) => {
    router.push(`/invoices/invoice-view/${invoiceId}`);
  }, [router]);

  const handleDelete = useCallback(async (paymentId) => {
    try {
      const response = await deletePayment(paymentId);
      if (response.success) {
        toast.success(response.message || 'Payment deleted successfully');
        // Refresh data after deletion
        if (refreshData) {
          await refreshData();
        }
        if (onSuccess) {
          onSuccess('delete', response);
        }
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      const errorMessage = error.message || 'An error occurred while deleting payment';
      toast.error(errorMessage);
      if (onError) {
        onError('delete', error);
      }
    }
  }, [refreshData, onSuccess, onError]);

  const handleStatusUpdate = useCallback(async (paymentId, newStatus) => {
    try {
      const response = await updatePaymentStatus(paymentId, newStatus);
      if (response.success) {
        toast.success(response.message || 'Payment status updated successfully');
        // Refresh data after status update
        if (refreshData) {
          await refreshData();
        }
        if (onSuccess) {
          onSuccess('statusUpdate', response);
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      const errorMessage = error.message || 'An error occurred while updating payment status';
      toast.error(errorMessage);
      if (onError) {
        onError('statusUpdate', error);
      }
    }
  }, [refreshData, onSuccess, onError]);

  return {
    handleView,
    handleDelete,
    handleStatusUpdate,
  };
}
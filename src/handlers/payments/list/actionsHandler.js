'use client';

import { useRouter } from 'next/navigation';
import { deletePayment } from '@/app/(dashboard)/payments/actions';

/**
 * Payment actions handler - manages all payment-related actions
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters }) {
  const router = useRouter();

  /**
   * Execute an action with standard error handling and optional data refresh
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
    handleDelete: (id) =>
      executeAction(
        () => deletePayment(id),
        'Payment deleted successfully!',
        true
      ),

    handleView: (id) => router.push(`/payments/payment-view/${id}`),

    handleEdit: (id) => router.push(`/payments/payment-edit/${id}`),
  };
}
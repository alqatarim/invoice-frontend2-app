'use client';

import { useRouter } from 'next/navigation';
import {
  deleteExpense,
} from '@/app/(dashboard)/expenses/actions';

/**
 * Expense actions handler - manages all expense-related actions.
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, onView, onEdit }) {
  const router = useRouter();

  /**
   * Execute an action with standard error handling and optional data refresh.
   */
  const executeAction = async (actionFn, successMessage, shouldRefresh = false) => {
    try {
      const result = await actionFn();
      onSuccess?.(successMessage);
      if (shouldRefresh && fetchData) {
        await fetchData({ page: pagination?.current });
      }
      return result;
    } catch (error) {
      onError?.(error.message || 'Action failed');
      throw error;
    }
  };

  return {
    handleDelete: async (id) => {
      try {
        const result = await deleteExpense(id);
        if (result.success) {
          onSuccess?.('Expense deleted successfully!');
          if (fetchData) {
            await fetchData({ page: pagination?.current });
          }
        } else {
          throw new Error(result.message);
        }
        return result;
      } catch (error) {
        onError?.(error.message || 'Failed to delete expense');
        throw error;
      }
    },

    handleView: (id) => {
      if (onView) {
        onView(id);
      } else {
        router.push(`/expenses/expense-view/${id}`);
      }
    },

    handleEdit: (id) => {
      if (onEdit) {
        onEdit(id);
      } else {
        router.push(`/expenses/expense-edit/${id}`);
      }
    },

    handlePrintDownload: async (id) => {
      try {
        // Open print/download in new window/tab
        window.open(`/expenses/expense-view/${id}?print=true`, '_blank');
        onSuccess?.('Expense is being prepared for download.');
      } catch (error) {
        onError?.(error.message || 'Failed to download expense.');
      }
    },
  };
}
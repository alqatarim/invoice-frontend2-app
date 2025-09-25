'use client';

import {
  deletePurchase,
} from '@/app/(dashboard)/purchases/actions';

/**
 * Purchase actions handler - manages all purchase-related actions.
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination }) {
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
        const result = await deletePurchase(id);
        if (result.success) {
          onSuccess?.('Purchase deleted successfully!');
          if (fetchData) {
            await fetchData({ page: pagination?.current });
          }
        } else {
          throw new Error(result.message);
        }
        return result;
      } catch (error) {
        onError?.(error.message || 'Failed to delete purchase');
        throw error;
      }
    },

    handlePrintDownload: async (id) => {
      try {
        // Open print/download in new window/tab
        window.open(`/purchases/purchase-view/${id}?print=true`, '_blank');
        onSuccess?.('Purchase is being prepared for download.');
      } catch (error) {
        onError?.(error.message || 'Failed to download purchase.');
      }
    },
  };
}
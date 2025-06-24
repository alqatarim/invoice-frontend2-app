'use client';

import {
  addStock,
  removeStock,
} from '@/app/(dashboard)/inventory/actions';

/**
 * Inventory actions handler - manages all inventory-related actions.
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters }) {
  /**
   * Execute an action with standard error handling and optional data refresh.
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
    handleAddStock: (stockData) =>
      executeAction(
        () => addStock(stockData),
        'Stock added successfully!',
        true
      ),

    handleRemoveStock: (stockData) =>
      executeAction(
        () => removeStock(stockData),
        'Stock removed successfully!',
        true
      ),
  };
}
'use client';

import { useState } from 'react';
import {
  addStock,
  cycleCountStock,
  removeStock,
  transferStock,
} from '@/app/(dashboard)/inventory/actions';

/**
 * Inventory actions handler - manages all inventory-related actions.
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters }) {
  const [loading, setLoading] = useState({
    addStock: false,
    removeStock: false,
    transferStock: false,
    cycleCount: false,
  });

  /**
   * Execute an action with standard error handling and optional data refresh.
   */
  const executeAction = async (actionFn, successMessage, shouldRefresh = false, loadingKey) => {
    if (loading[loadingKey]) {
      // Prevent multiple simultaneous requests
      return;
    }

    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    
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
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  return {
    loading,
    handleAddStock: (stockData) =>
      executeAction(
        () => addStock(stockData),
        'Stock added successfully!',
        true,
        'addStock'
      ),

    handleRemoveStock: (stockData) =>
      executeAction(
        () => removeStock(stockData),
        'Stock removed successfully!',
        true,
        'removeStock'
      ),

    handleTransferStock: (transferData) =>
      executeAction(
        () => transferStock(transferData),
        'Stock transferred successfully!',
        true,
        'transferStock'
      ),

    handleCycleCount: (cycleCountData) =>
      executeAction(
        () => cycleCountStock(cycleCountData),
        'Cycle count recorded successfully!',
        true,
        'cycleCount'
      ),
  };
}
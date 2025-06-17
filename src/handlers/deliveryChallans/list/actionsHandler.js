'use client';

import { useCallback, useMemo } from 'react';
import {
  cloneDeliveryChallan,
  deleteDeliveryChallan,
  convertToInvoice,
} from '@/app/(dashboard)/deliveryChallans/actions';

/**
 * Delivery challan actions handler - manages all delivery challan-related actions.
 */
export function actionsHandler({ onSuccess, onError, fetchData, pagination, filters }) {
  /**
   * Execute an action with standard error handling and optional data refresh.
   */
  const executeAction = useCallback(async (actionFn, successMessage, shouldRefresh = false) => {
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
  }, [onSuccess, onError, fetchData, pagination?.current, filters]);

  const handleClone = useCallback((id) =>
    executeAction(
      () => cloneDeliveryChallan(id),
      'Delivery challan cloned successfully!',
      true
    ),
    [executeAction]
  );

  const handleDelete = useCallback((id) =>
    executeAction(
      () => deleteDeliveryChallan(id),
      'Delivery challan deleted successfully!',
      true
    ),
    [executeAction]
  );

  const handleConvertToInvoice = useCallback((id, data = {}) =>
    executeAction(
      () => convertToInvoice({ _id: id, ...data }),
      'Delivery challan converted to invoice successfully!',
      true
    ),
    [executeAction]
  );

  const handleView = useCallback((id) => {
    // Navigate to view page
    window.location.href = `/deliveryChallans/deliveryChallans-view/${id}`;
  }, []);

  const handleEdit = useCallback((id) => {
    // Navigate to edit page
    window.location.href = `/deliveryChallans/deliveryChallans-edit/${id}`;
  }, []);

  const handlePrintDownload = useCallback(async (id) => {
    try {
      // This would need to be implemented in the backend
      // For now, just show a message
      onSuccess?.('Print/Download feature will be available soon.');
    } catch (error) {
      onError?.(error.message || 'Failed to download delivery challan.');
    }
  }, [onSuccess, onError]);

  // Memoized return object to prevent recreating on every render
  return useMemo(() => ({
    handleClone,
    handleDelete,
    handleConvertToInvoice,
    handleView,
    handleEdit,
    handlePrintDownload,
  }), [
    handleClone,
    handleDelete,
    handleConvertToInvoice,
    handleView,
    handleEdit,
    handlePrintDownload
  ]);
}
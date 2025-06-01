'use client'

import { useCallback } from 'react';
import { deletePurchase } from '@/app/(dashboard)/purchases/actions';
import { toast } from 'react-toastify';

/**
 * Actions handler for purchase list operations.
 */
export function actionsHandler({ setPage, onListUpdate }) {
  
  const handleDelete = useCallback(async (purchaseId) => {
    if (!purchaseId) {
      toast.error('Invalid purchase selected');
      return;
    }

    try {
      const response = await deletePurchase(purchaseId);

      if (response.success) {
        toast.success('Purchase deleted successfully');
        setPage(1);
        if (onListUpdate) {
          onListUpdate();
        }
      } else {
        throw new Error(response.message || 'Failed to delete purchase');
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error(error.message || 'Error deleting purchase');
    }
  }, [setPage, onListUpdate]);

  const handlePrintDownload = useCallback((purchaseId) => {
    if (!purchaseId) {
      toast.error('Invalid purchase selected');
      return;
    }
    
    // Open print/download in new window/tab
    window.open(`/purchases/purchase-view/${purchaseId}?print=true`, '_blank');
  }, []);

  return {
    handleDelete,
    handlePrintDownload,
  };
}
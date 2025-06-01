'use client'

import { useCallback } from 'react';
import { deleteSalesReturn } from '@/app/(dashboard)/sales-return/actions';
import { toast } from 'react-toastify';

/**
 * Actions handler for sales return list operations.
 */
export function actionsHandler({ setPage, onListUpdate }) {
  
  const handleDelete = useCallback(async (salesReturnId) => {
    if (!salesReturnId) {
      toast.error('Invalid sales return selected');
      return;
    }

    try {
      const response = await deleteSalesReturn(salesReturnId);

      if (response.success) {
        toast.success('Sales return deleted successfully');
        setPage(1);
        if (onListUpdate) {
          onListUpdate();
        }
      } else {
        throw new Error(response.message || 'Failed to delete sales return');
      }
    } catch (error) {
      console.error('Error deleting sales return:', error);
      toast.error(error.message || 'Error deleting sales return');
    }
  }, [setPage, onListUpdate]);

  const handlePrintDownload = useCallback((salesReturnId) => {
    if (!salesReturnId) {
      toast.error('Invalid sales return selected');
      return;
    }
    
    // Open print/download in new window/tab
    window.open(`/sales-return/sales-return-view/${salesReturnId}?print=true`, '_blank');
  }, []);

  return {
    handleDelete,
    handlePrintDownload,
  };
}
'use client'

import { useCallback } from 'react';
import { deleteDebitNote, cloneDebitNote } from '@/app/(dashboard)/debitNotes/actions';
import { toast } from 'react-toastify';

/**
 * Actions handler for purchase return list operations.
 */
export function actionsHandler({ setPage, onListUpdate }) {
  
  const handleDelete = useCallback(async (debitNoteId) => {
    if (!debitNoteId) {
      toast.error('Invalid purchase return selected');
      return;
    }

    try {
      const response = await deleteDebitNote(debitNoteId);

      if (response.success) {
        toast.success('Purchase return deleted successfully');
        setPage(1);
        if (onListUpdate) {
          onListUpdate();
        }
      } else {
        throw new Error(response.message || 'Failed to delete purchase return');
      }
    } catch (error) {
      console.error('Error deleting purchase return:', error);
      toast.error(error.message || 'Error deleting purchase return');
    }
  }, [setPage, onListUpdate]);

  const handleClone = useCallback(async (debitNoteId) => {
    if (!debitNoteId) {
      toast.error('Invalid purchase return selected');
      return;
    }

    try {
      const response = await cloneDebitNote(debitNoteId);

      if (response.success) {
        toast.success('Purchase return cloned successfully');
        setPage(1);
        if (onListUpdate) {
          onListUpdate();
        }
      } else {
        throw new Error(response.message || 'Failed to clone purchase return');
      }
    } catch (error) {
      console.error('Error cloning purchase return:', error);
      toast.error(error.message || 'Error cloning purchase return');
    }
  }, [setPage, onListUpdate]);

  const handlePrintDownload = useCallback((debitNoteId) => {
    if (!debitNoteId) {
      toast.error('Invalid purchase return selected');
      return;
    }
    
    // Open print/download in new window/tab
    window.open(`/debitNotes/purchaseReturn-view/${debitNoteId}?print=true`, '_blank');
  }, []);

  const handleProcessReturn = useCallback((debitNoteId) => {
    if (!debitNoteId) {
      toast.error('Invalid purchase return selected');
      return;
    }
    
    // This would typically open a process return dialog or navigate to a processing page
    toast.info('Process return functionality to be implemented');
  }, []);

  const handleEmailVendor = useCallback((debitNoteId, vendorInfo) => {
    if (!debitNoteId || !vendorInfo) {
      toast.error('Invalid purchase return or vendor information');
      return;
    }
    
    // This would typically open an email dialog or send email directly
    toast.info('Email vendor functionality to be implemented');
  }, []);

  return {
    handleDelete,
    handleClone,
    handlePrintDownload,
    handleProcessReturn,
    handleEmailVendor,
  };
}
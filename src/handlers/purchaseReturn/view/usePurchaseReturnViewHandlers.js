'use client'

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getDebitNoteDetails, deleteDebitNote, cloneDebitNote } from '@/app/(dashboard)/debitNotes/actions';

/**
 * Main handler for Purchase Return view functionality
 */
export function usePurchaseReturnViewHandlers({ debitNoteId }) {
  const router = useRouter();

  // State
  const [debitNoteData, setDebitNoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  // UI state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [printMode, setPrintMode] = useState(false);

  // Load debit note data
  const loadDebitNoteData = useCallback(async () => {
    if (!debitNoteId) return;
    
    setIsLoading(true);
    try {
      const response = await getDebitNoteDetails(debitNoteId);
      
      if (response.success && response.data) {
        setDebitNoteData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load debit note data');
      }
    } catch (error) {
      console.error('Error loading debit note data:', error);
      toast.error(error.message || 'Failed to load purchase return details');
    } finally {
      setIsLoading(false);
    }
  }, [debitNoteId]);

  // Load data on mount
  useEffect(() => {
    loadDebitNoteData();
  }, [loadDebitNoteData]);

  // Check for print mode from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const printParam = urlParams.get('print');
      if (printParam === 'true') {
        setPrintMode(true);
        // Auto-trigger print after a short delay
        setTimeout(() => {
          window.print();
        }, 1000);
      }
    }
  }, []);

  // Action handlers
  const handleEdit = useCallback(() => {
    router.push(`/debitNotes/purchaseReturn-edit/${debitNoteId}`);
  }, [router, debitNoteId]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await deleteDebitNote(debitNoteId);
      
      if (response.success) {
        toast.success('Purchase return deleted successfully');
        router.push('/debitNotes/purchaseReturn-list');
      } else {
        throw new Error(response.message || 'Failed to delete purchase return');
      }
    } catch (error) {
      console.error('Error deleting purchase return:', error);
      toast.error(error.message || 'Failed to delete purchase return');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [debitNoteId, router]);

  const handleClone = useCallback(async () => {
    setIsCloning(true);
    try {
      const response = await cloneDebitNote(debitNoteId);
      
      if (response.success) {
        toast.success('Purchase return cloned successfully');
        // Navigate to edit the cloned item
        router.push(`/debitNotes/purchaseReturn-edit/${response.data._id}`);
      } else {
        throw new Error(response.message || 'Failed to clone purchase return');
      }
    } catch (error) {
      console.error('Error cloning purchase return:', error);
      toast.error(error.message || 'Failed to clone purchase return');
    } finally {
      setIsCloning(false);
      setCloneDialogOpen(false);
    }
  }, [debitNoteId, router]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    // Convert current page to PDF
    window.print();
  }, []);

  const handleEmailVendor = useCallback(() => {
    if (!debitNoteData?.vendorId?.vendor_email) {
      toast.error('Vendor email not available');
      return;
    }
    
    // This would typically open an email dialog or send email
    toast.info('Email functionality to be implemented');
  }, [debitNoteData]);

  const handleProcessReturn = useCallback(() => {
    // This would typically open a process return dialog
    toast.info('Process return functionality to be implemented');
  }, []);

  // Dialog handlers
  const handleDeleteDialogOpen = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleCloneDialogOpen = useCallback(() => {
    setCloneDialogOpen(true);
  }, []);

  const handleCloneDialogClose = useCallback(() => {
    setCloneDialogOpen(false);
  }, []);

  // Navigation handlers
  const handleBackToList = useCallback(() => {
    router.push('/debitNotes/purchaseReturn-list');
  }, [router]);

  // Calculations for display
  const calculations = useCallback(() => {
    if (!debitNoteData?.items) return null;

    const items = debitNoteData.items;
    
    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 1;
      const rate = Number(item.rate) || 0;
      return sum + (rate * quantity);
    }, 0);

    const totalDiscount = Number(debitNoteData.totalDiscount) || 0;
    const taxableAmount = Number(debitNoteData.taxableAmount) || 0;
    const totalTax = Number(debitNoteData.vat) || 0;
    const totalAmount = Number(debitNoteData.TotalAmount) || 0;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
  }, [debitNoteData]);

  return {
    // State
    debitNoteData,
    isLoading,
    isDeleting,
    isCloning,
    deleteDialogOpen,
    cloneDialogOpen,
    printMode,
    calculations: calculations(),

    // Handlers
    handleEdit,
    handleDelete,
    handleClone,
    handlePrint,
    handleDownload,
    handleEmailVendor,
    handleProcessReturn,
    handleBackToList,
    loadDebitNoteData,

    // Dialog handlers
    handleDeleteDialogOpen,
    handleDeleteDialogClose,
    handleCloneDialogOpen,
    handleCloneDialogClose,
  };
}
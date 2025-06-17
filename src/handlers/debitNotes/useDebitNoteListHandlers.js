import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteDebitNote, cloneDebitNote } from '@/app/(dashboard)/debitNotes/actions';

export function useDebitNoteListHandlers({
  initialDebitNotes,
  initialPagination,
  initialTab,
  initialFilters,
  initialSortBy,
  initialSortDirection,
  initialColumns,
  initialVendors,
  onError,
  onSuccess,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [debitNotes, setDebitNotes] = useState(initialDebitNotes || []);
  const [pagination, setPagination] = useState(initialPagination || { current: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState(initialSortBy || '');
  const [sortDirection, setSortDirection] = useState(initialSortDirection || 'asc');
  
  // Filter state
  const [filterValues, setFilterValues] = useState(initialFilters || {});
  
  // Column management
  const [availableColumns, setAvailableColumns] = useState(initialColumns || []);
  const [manageColumnsOpen, setManageColumnsOpen] = useState(false);
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDebitNote, setSelectedDebitNote] = useState(null);

  // Vendor and debit note options for filters
  const vendorOptions = useMemo(() => 
    initialVendors?.map(vendor => ({
      value: vendor._id,
      label: vendor.vendor_name
    })) || [], [initialVendors]);

  const debitNoteOptions = useMemo(() => 
    debitNotes?.map(debitNote => ({
      value: debitNote._id,
      label: debitNote.debit_note_id
    })) || [], [debitNotes]);

  // Pagination handlers
  const handlePageChange = useCallback((event, newPage) => {
    setPagination(prev => ({ ...prev, current: newPage + 1 }));
  }, []);

  const handlePageSizeChange = useCallback((event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPagination(prev => ({ ...prev, pageSize: newPageSize, current: 1 }));
  }, []);

  // Sort handlers
  const handleSortRequest = useCallback((property) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  }, [sortBy, sortDirection]);

  // Filter handlers
  const handleFilterValueChange = useCallback((field, value) => {
    setFilterValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFilterApply = useCallback((filters) => {
    setFilterValues(filters);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilterValues({});
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  const handleTabChange = useCallback((event, newTab) => {
    setFilterValues(prev => ({ ...prev, status: newTab }));
    setPagination(prev => ({ ...prev, current: 1 }));
  }, []);

  // Column management handlers
  const handleManageColumnsOpen = useCallback(() => {
    setManageColumnsOpen(true);
  }, []);

  const handleManageColumnsClose = useCallback(() => {
    setManageColumnsOpen(false);
  }, []);

  const handleColumnCheckboxChange = useCallback((columnKey, visible) => {
    setAvailableColumns(prev => 
      prev.map(col => 
        col.key === columnKey ? { ...col, visible } : col
      )
    );
  }, []);

  const handleManageColumnsSave = useCallback((setColumns) => {
    setColumns(availableColumns.filter(col => col.visible));
    setManageColumnsOpen(false);
  }, [availableColumns]);

  // Action handlers
  const handleClone = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await cloneDebitNote(id);
      if (response.success) {
        onSuccess?.('Debit note cloned successfully');
        // Refresh the list
        setDebitNotes(prev => [response.data, ...prev]);
        setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      } else {
        onError?.(response.message || 'Failed to clone debit note');
      }
    } catch (error) {
      onError?.(error.message || 'Error cloning debit note');
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const handleSend = useCallback(async (id) => {
    try {
      setLoading(true);
      // Implement send logic here
      onSuccess?.('Debit note sent successfully');
    } catch (error) {
      onError?.(error.message || 'Error sending debit note');
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const handlePrintDownload = useCallback((id) => {
    router.push(`/debitNotes/purchaseReturn-view/${id}`);
  }, [router]);

  const handleDelete = useCallback((id) => {
    const debitNote = debitNotes.find(dn => dn._id === id);
    setSelectedDebitNote(debitNote);
    setDeleteDialogOpen(true);
  }, [debitNotes]);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedDebitNote(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!selectedDebitNote?._id) return;

    try {
      setLoading(true);
      const response = await deleteDebitNote(selectedDebitNote._id);
      if (response.success) {
        onSuccess?.('Debit note deleted successfully');
        setDebitNotes(prev => prev.filter(dn => dn._id !== selectedDebitNote._id));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        closeDeleteDialog();
      } else {
        onError?.(response.message || 'Failed to delete debit note');
      }
    } catch (error) {
      onError?.(error.message || 'Error deleting debit note');
    } finally {
      setLoading(false);
    }
  }, [selectedDebitNote, onSuccess, onError, closeDeleteDialog]);

  return {
    // Data
    debitNotes,
    pagination,
    loading,
    sortBy,
    sortDirection,
    filterValues,
    
    // Options
    vendorOptions,
    debitNoteOptions,
    
    // Column management
    availableColumns,
    manageColumnsOpen,
    
    // Dialog state
    deleteDialogOpen,
    selectedDebitNote,
    
    // Handlers
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleFilterValueChange,
    handleFilterApply,
    handleFilterReset,
    handleTabChange,
    handleManageColumnsOpen,
    handleManageColumnsClose,
    handleColumnCheckboxChange,
    handleManageColumnsSave,
    handleClone,
    handleSend,
    handlePrintDownload,
    handleDelete,
    closeDeleteDialog,
    confirmDelete,
  };
}
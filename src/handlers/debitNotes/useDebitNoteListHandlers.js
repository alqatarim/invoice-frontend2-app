import React, { useState, useCallback } from 'react';
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
  // State management
  const [debitNotes, setDebitNotes] = useState(initialDebitNotes || []);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: initialPagination?.current || 1,
    pageSize: initialPagination?.pageSize || 10,
    total: initialPagination?.total || 0,
  });
  const [sortBy, setSortBy] = useState(initialSortBy || '');
  const [sortDirection, setSortDirection] = useState(initialSortDirection || 'asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Update debit notes when initial data changes
  React.useEffect(() => {
    if (initialDebitNotes) {
      setDebitNotes(initialDebitNotes);
    }
  }, [initialDebitNotes]);

  // Update pagination when initial pagination changes
  React.useEffect(() => {
    if (initialPagination) {
      setPagination({
        current: initialPagination.current || 1,
        pageSize: initialPagination.pageSize || 10,
        total: initialPagination.total || 0,
      });
    }
  }, [initialPagination]);

  // Action handlers
  const handleView = useCallback((id) => {
    // Navigate to view page
    window.open(`/debitNotes/purchaseReturn-view/${id}`, '_blank');
  }, []);

  const handleEdit = useCallback((id) => {
    // Navigate to edit page
    window.open(`/debitNotes/purchaseReturn-edit/${id}`, '_blank');
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await deleteDebitNote(id);

      if (response.success) {
        // Remove the deleted debit note from the list
        setDebitNotes(prev => prev.filter(dn => dn._id !== id));
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));
        onSuccess('Debit note deleted successfully');
      } else {
        onError(response.message || 'Failed to delete debit note');
      }
    } catch (error) {
      onError(error.message || 'Error deleting debit note');
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  const handleClone = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await cloneDebitNote(id);

      if (response.success) {
        // Add the cloned debit note to the list
        if (response.data) {
          setDebitNotes(prev => [response.data, ...prev]);
          setPagination(prev => ({
            ...prev,
            total: prev.total + 1
          }));
        }
        onSuccess('Debit note cloned successfully');
      } else {
        onError(response.message || 'Failed to clone debit note');
      }
    } catch (error) {
      onError(error.message || 'Error cloning debit note');
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  const handleSend = useCallback(async (id) => {
    onSuccess('Send functionality not implemented yet');
  }, [onSuccess]);

  const handlePrintDownload = useCallback((id) => {
    // Navigate to view page for print/download
    window.open(`/debitNotes/purchaseReturn-view/${id}`, '_blank');
  }, []);

  const openConvertDialog = useCallback(() => {
    onSuccess('Convert functionality not implemented yet');
  }, [onSuccess]);

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, current: page + 1 }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, current: 1 }));
  }, []);

  // Sorting handler
  const handleSortRequest = useCallback((property, direction) => {
    setSortBy(property);
    setSortDirection(direction);
  }, []);

  // Search handler
  const handleSearchInputChange = useCallback((searchValue) => {
    setSearchTerm(searchValue);
  }, []);

  return {
    // Data
    debitNotes,
    loading,
    pagination,
    sortBy,
    sortDirection,
    searchTerm,

    // Action handlers
    handleView,
    handleEdit,
    handleDelete,
    handleClone,
    handleSend,
    handlePrintDownload,
    openConvertDialog,

    // Pagination handlers
    handlePageChange,
    handlePageSizeChange,

    // Sorting handler
    handleSortRequest,

    // Search handler
    handleSearchInputChange,
  };
}
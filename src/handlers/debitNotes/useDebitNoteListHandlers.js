import React, { useState, useCallback, useEffect, useRef } from 'react';
import { deleteDebitNote, cloneDebitNote, getDebitNotesList } from '@/app/(dashboard)/debitNotes/actions';

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
  const loadingRef = useRef(false);

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

  const fetchDebitNotes = useCallback(async (page = pagination.current, pageSize = pagination.pageSize) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setLoading(true);
      const response = await getDebitNotesList(page, pageSize);
      if (response.success) {
        setDebitNotes(response.data || []);
        setPagination({
          current: page,
          pageSize,
          total: response.totalRecords || 0
        });
      } else {
        onError(response.message || 'Failed to fetch debit notes');
      }
    } catch (error) {
      onError(error.message || 'Failed to fetch debit notes');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [pagination.current, pagination.pageSize, onError]);

  // Pagination handlers
  const handlePageChange = useCallback((pageZeroBased) => {
    const nextPage = Number(pageZeroBased) + 1;
    if (!Number.isFinite(nextPage)) return;
    setPagination(prev => ({ ...prev, current: nextPage }));
    fetchDebitNotes(nextPage, pagination.pageSize);
  }, [fetchDebitNotes, pagination.pageSize]);

  const handlePageSizeChange = useCallback((pageSize) => {
    const nextSize = Number(pageSize);
    if (!Number.isFinite(nextSize)) return;
    setPagination(prev => ({ ...prev, pageSize: nextSize, current: 1 }));
    fetchDebitNotes(1, nextSize);
  }, [fetchDebitNotes]);

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
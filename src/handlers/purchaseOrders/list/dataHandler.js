'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getFilteredPurchaseOrders } from '@/app/(dashboard)/purchase-orders/actions';

/**
 * Data handler for purchase order list
 */
export function dataHandler({
  initialPurchaseOrders = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
  onSuccess,
}) {
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [pagination, setPagination] = useState(() => {
    // Ensure total matches initial data length if provided
    const basePagination = initialPagination || { current: 1, pageSize: 10, total: 0 };
    if (initialPurchaseOrders && initialPurchaseOrders.length > 0 && basePagination.total === 0) {
      return { ...basePagination, total: initialPurchaseOrders.length };
    }
    return basePagination;
  });
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection
  });

  // Search state management
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  // Use refs to access latest state values without causing re-renders
  const stateRef = useRef({
    searchTerm,
    pagination,
    sortBy: sorting.sortBy,
    sortDirection: sorting.sortDirection
  });

  // Update refs when state changes
  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sortBy: sorting.sortBy,
      sortDirection: sorting.sortDirection
    };
  }, [searchTerm, pagination, sorting.sortBy, sorting.sortDirection]);

  // Fetch purchase orders with current or provided parameters
  const fetchData = useCallback(async (params = {}) => {
    const {
      page = pagination.current,
      pageSize = pagination.pageSize,
      sortBy = sorting.sortBy,
      sortDirection = sorting.sortDirection
    } = params;

    setLoading(true);
    try {
      const { purchaseOrders: newPurchaseOrders, pagination: newPagination } = await getFilteredPurchaseOrders(
        'ALL', // Default to ALL tab since we removed filtering
        page,
        pageSize,
        {}, // Empty filters
        sortBy,
        sortDirection
      );

      setPurchaseOrders(newPurchaseOrders);
      setPagination(newPagination);
      setSorting({ sortBy, sortDirection });

      // Update full dataset for search functionality
      setFullDataset(newPurchaseOrders);

      return { purchaseOrders: newPurchaseOrders, pagination: newPagination };
    } catch (error) {
      console.error('fetchData error:', error);
      onError?.(error.message || 'Failed to fetch purchase orders');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pagination, sorting, onError]);

  const handlePageChange = useCallback((event, newPage) =>
    fetchData({ page: newPage + 1 }), [fetchData]);

  const handlePageSizeChange = useCallback(event =>
    fetchData({ page: 1, pageSize: parseInt(event.target.value, 10) }), [fetchData]);

  const handleSortRequest = useCallback((columnKey, direction) => {
    const newDirection = direction || (sorting.sortBy === columnKey && sorting.sortDirection === 'asc' ? 'desc' : 'asc');
    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
    return { sortBy: columnKey, sortDirection: newDirection };
  }, [sorting, fetchData]);

  // Keep a reference to the full dataset for search functionality
  const [fullDataset, setFullDataset] = useState(initialPurchaseOrders);

  // Search handlers - works with current dataset for local filtering
  const handleSearchInputChange = useCallback(async (value) => {
    // Don't do anything if the value hasn't actually changed
    if (value === stateRef.current.searchTerm) return;

    setSearching(true);
    setSearchTerm(value);

    try {
      // Use the full dataset for filtering
      const dataToFilter = fullDataset.length > 0 ? fullDataset : purchaseOrders;

      if (value.trim() === '') {
        // Reset to full dataset when search is cleared
        setPurchaseOrders(dataToFilter);
        setPagination(prev => ({
          ...prev,
          current: 1,
          total: dataToFilter.length
        }));
      } else {
        // Filter current dataset locally
        const filtered = dataToFilter.filter(item =>
          item.purchaseOrderId?.toLowerCase().includes(value.toLowerCase()) ||
          item.vendorInfo?.vendor_name?.toLowerCase().includes(value.toLowerCase()) ||
          item.vendorInfo?.phone?.includes(value) ||
          item.notes?.toLowerCase().includes(value.toLowerCase())
        );
        setPurchaseOrders(filtered);
        setPagination(prev => ({ ...prev, current: 1, total: filtered.length }));
      }
    } catch (error) {
      console.error('Error searching purchase orders:', error);
      onError?.(error.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [onError, fullDataset, purchaseOrders]);

  const handleSearchSubmit = useCallback((value) => {
    handleSearchInputChange(value);
  }, [handleSearchInputChange]);

  const handleSearchClear = useCallback(() => {
    handleSearchInputChange('');
  }, [handleSearchInputChange]);

  // Initial data fetch on mount
  useEffect(() => {
    if (initialPurchaseOrders.length === 0) {
      fetchData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    purchaseOrders,
    pagination,
    loading,
    ...sorting,

    // Search state
    searchTerm,
    searching,

    // Handlers
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,

    // Search handlers
    handleSearchInputChange,
    handleSearchSubmit,
    handleSearchClear,
  };
}
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getFilteredDeliveryChallans } from '@/app/(dashboard)/deliveryChallans/actions';
// import { useDebounce } from '@/hooks/useDebounce';

/**
 * Data handler for delivery challan list
 */
export const useDataHandler = (initialData, pagination, initialTab, initialFilters) => {
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data state
  const [deliveryChallans, setDeliveryChallans] = useState(initialData || []);
  const [paginationState, setPaginationState] = useState(pagination || { current: 1, pageSize: 10, total: 0 });

  // Sort state
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Stabilize initial values to prevent infinite loops
  const stableInitialTab = useMemo(() => initialTab, [initialTab]);
  const stableInitialFilters = useMemo(() => initialFilters || {}, [
    JSON.stringify(initialFilters || {})
  ]);

  // Fetch data function
  const loadData = useCallback(async (page = 1, pageSize = 10, tab = stableInitialTab, filters = {}, sort = '', sortDir = 'asc') => {
    setLoading(true);
    setError(null);

    try {
      const result = await getFilteredDeliveryChallans(tab, page, pageSize, filters, sort, sortDir);

      setDeliveryChallans(result.deliveryChallans);
      setPaginationState(result.pagination);
    } catch (err) {
      console.error('Error loading delivery challans:', err);
      setError(err.message || 'Failed to load delivery challans');
    } finally {
      setLoading(false);
    }
  }, [stableInitialTab]);

  // Pagination handlers - stabilized with proper dependencies
  const handlePageChange = useCallback((page) => {
    loadData(page, paginationState.pageSize, stableInitialTab, stableInitialFilters, sortBy, sortDirection);
  }, [loadData, paginationState.pageSize, stableInitialTab, stableInitialFilters, sortBy, sortDirection]);

  const handlePageSizeChange = useCallback((pageSize) => {
    loadData(1, pageSize, stableInitialTab, stableInitialFilters, sortBy, sortDirection);
  }, [loadData, stableInitialTab, stableInitialFilters, sortBy, sortDirection]);

  // Sort handlers - stabilized
  const handleSort = useCallback((field) => {
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDirection(newDirection);
    loadData(1, paginationState.pageSize, stableInitialTab, stableInitialFilters, field, newDirection);
  }, [loadData, paginationState.pageSize, stableInitialTab, stableInitialFilters, sortBy, sortDirection]);

  // Search handlers
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Refresh data - stabilized
  const refreshData = useCallback(() => {
    loadData(paginationState.current, paginationState.pageSize, stableInitialTab, stableInitialFilters, sortBy, sortDirection);
  }, [loadData, paginationState.current, paginationState.pageSize, stableInitialTab, stableInitialFilters, sortBy, sortDirection]);

  // Memoized return object to prevent recreating on every render
  return useMemo(() => ({
    // Data
    deliveryChallans,
    pagination: paginationState,
    loading,
    error,

    // Search
    searchTerm,
    handleSearch,

    // Sort
    sortBy,
    sortDirection,
    handleSort,

    // Pagination
    handlePageChange,
    handlePageSizeChange,

    // Actions
    loadData,
    refreshData,
  }), [
    deliveryChallans,
    paginationState,
    loading,
    error,
    searchTerm,
    handleSearch,
    sortBy,
    sortDirection,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    loadData,
    refreshData
  ]);
};
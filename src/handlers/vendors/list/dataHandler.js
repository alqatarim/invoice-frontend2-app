'use client'

import { useState } from 'react';
import { getFilteredVendors } from '@/app/(dashboard)/vendors/actions';

/**
 * Simplified data handler - eliminates race conditions and unnecessary complexity
 */
export function dataHandler({
  initialVendors = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  onError,
}) {
  const [state, setState] = useState({
    vendors: initialVendors,
    pagination: initialPagination,
    loading: false,
    sortBy: '',
    sortDirection: 'asc',
    filters: {}
  });

  // Single fetch function - no useCallback needed
  const fetchData = async (params = {}) => {
    const {
      page = state.pagination.current,
      pageSize = state.pagination.pageSize,
      filters = state.filters,
      sortBy = state.sortBy,
      sortDirection = state.sortDirection
    } = params;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const { vendors, pagination } = await getFilteredVendors(
        page,
        pageSize,
        filters,
        sortBy,
        sortDirection
      );

      setState(prev => ({
        ...prev,
        vendors,
        pagination,
        sortBy,
        sortDirection,
        filters,
        loading: false
      }));

      return { vendors, pagination };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      onError?.(error.message || 'Failed to fetch vendors');
      throw error;
    }
  };

  // Simple handlers - no useCallback overhead
  const handlePageChange = (_, newPage) =>
    fetchData({ page: newPage + 1 });

  const handlePageSizeChange = (event) =>
    fetchData({ page: 1, pageSize: parseInt(event.target.value, 10) });

  const handleSort = (columnKey) => {
    const newDirection = state.sortBy === columnKey && state.sortDirection === 'asc' ? 'desc' : 'asc';
    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
  };

  const applyFilters = (filters) => {
    if (!filters.vendor?.length) return;
    fetchData({ page: 1, filters });
  };

  const resetFilters = () => {
    fetchData({ page: 1, filters: {}, sortBy: '', sortDirection: 'asc' });
  };

  return {
    ...state,
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    applyFilters,
    resetFilters,
  };
}
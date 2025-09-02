'use client'

import { useState, useCallback, useRef, useEffect } from 'react';
import { getFilteredUnits } from '@/app/(dashboard)/units/actions';

/**
 * Unit list data handler aligned with vendor list behavior
 */
export function dataHandler({
  initialUnits = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  onError,
}) {
  // Data state management
  const [units, setUnits] = useState(initialUnits);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const loadingRef = useRef(false);

  // Use refs to access latest state values without causing re-renders
  const stateRef = useRef({
    searchTerm,
    pagination,
    sortBy,
    sortDirection,
    filters
  });

  // Update refs when state changes
  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sortBy,
      sortDirection,
      filters
    };
  }, [searchTerm, pagination, sortBy, sortDirection, filters]);

  // Fetch units data - using refs to avoid dependency issues
  const fetchData = useCallback(async (params = {}) => {
    if (loadingRef.current) return; // Prevent multiple simultaneous calls
    
    loadingRef.current = true;
    setLoading(true);

    try {
      const currentState = stateRef.current;
      
      // Prepare API parameters using current state and params
      const {
        page = currentState.pagination.current,
        pageSize = currentState.pagination.pageSize,
        filters: paramFilters = currentState.filters,
        sortBy: paramSortBy = currentState.sortBy,
        sortDirection: paramSortDirection = currentState.sortDirection
      } = params;

      const { units: fetchedUnits, pagination: fetchedPagination } = await getFilteredUnits(
        page,
        pageSize,
        paramFilters,
        paramSortBy,
        paramSortDirection
      );

      setUnits(fetchedUnits);
      setPagination(fetchedPagination);
      setSortBy(paramSortBy);
      setSortDirection(paramSortDirection);
      setFilters(paramFilters);

      return { units: fetchedUnits, pagination: fetchedPagination };
    } catch (error) {
      onError?.(error.message || 'Failed to fetch units');
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [onError]);

  // Pagination handlers expect zero-based page index from table
  const handlePageChange = useCallback((newPageZeroBased) => {
    setPagination(prev => ({ ...prev, current: Number(newPageZeroBased) + 1 }));
    fetchData({ page: Number(newPageZeroBased) + 1 });
  }, [fetchData]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: Number(newPageSize), current: 1 }));
    fetchData({ page: 1, pageSize: Number(newPageSize) });
  }, [fetchData]);

  // Sorting accepts explicit direction from table
  const handleSort = useCallback((columnKey, direction) => {
    const currentState = stateRef.current;
    const nextDirection = direction || (currentState.sortBy === columnKey && currentState.sortDirection === 'asc' ? 'desc' : 'asc');
    setSortBy(columnKey);
    setSortDirection(nextDirection);
    fetchData({ page: 1, sortBy: columnKey, sortDirection: nextDirection });
  }, [fetchData]);

  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchData({ page: 1, filters: newFilters });
  }, [fetchData]);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSortBy('');
    setSortDirection('asc');
    setSearchTerm('');
    fetchData({ page: 1, filters: {}, sortBy: '', sortDirection: 'asc' });
  }, [fetchData]);

  // Top-bar search, aligned with vendor list UX
  const handleSearchInputChange = useCallback(async (value) => {
    // Don't do anything if the value hasn't actually changed
    if (value === stateRef.current.searchTerm) return;
    
    setSearchTerm(value);
    
    try {
      const currentState = stateRef.current;
      const trimmed = (value ?? '').trim();
      const nextFilters = { ...currentState.filters };
      
      if (trimmed.length > 0) {
        nextFilters.search_unit = trimmed;
      } else {
        delete nextFilters.search_unit;
      }

      await fetchData({ page: 1, filters: nextFilters });
    } catch (error) {
      onError?.(error.message || 'Search failed');
    }
  }, [fetchData, onError]);

  return {
    // Data state
    units,
    pagination,
    loading,
    sortBy,
    sortDirection,
    filters,
    searchTerm,

    // Data actions
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    applyFilters,
    resetFilters,
    handleSearchInputChange,
  };
}

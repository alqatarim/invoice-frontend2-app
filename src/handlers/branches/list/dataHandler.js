'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getFilteredBranches } from '@/app/(dashboard)/branches/actions';

export function dataHandler({
  initialBranches = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  onError,
}) {
  const [branches, setBranches] = useState(initialBranches);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const loadingRef = useRef(false);

  const stateRef = useRef({
    searchTerm,
    pagination,
    sortBy,
    sortDirection,
    filters
  });

  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sortBy,
      sortDirection,
      filters
    };
  }, [searchTerm, pagination, sortBy, sortDirection, filters]);

  const fetchData = useCallback(async (params = {}) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const currentState = stateRef.current;
      const {
        page = currentState.pagination.current,
        pageSize = currentState.pagination.pageSize,
        filters: paramFilters = currentState.filters,
        sortBy: paramSortBy = currentState.sortBy,
        sortDirection: paramSortDirection = currentState.sortDirection
      } = params;

      const { branches: fetchedBranches, pagination: fetchedPagination } =
        await getFilteredBranches(page, pageSize, paramFilters, paramSortBy, paramSortDirection);

      setBranches(fetchedBranches);
      setPagination(fetchedPagination);
      setSortBy(paramSortBy);
      setSortDirection(paramSortDirection);
      setFilters(paramFilters);

      return { branches: fetchedBranches, pagination: fetchedPagination };
    } catch (error) {
      onError?.(error.message || 'Failed to fetch branches');
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [onError]);

  const handlePageChange = useCallback((newPageZeroBased) => {
    setPagination(prev => ({ ...prev, current: Number(newPageZeroBased) + 1 }));
    fetchData({ page: Number(newPageZeroBased) + 1 });
  }, [fetchData]);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: Number(newPageSize), current: 1 }));
    fetchData({ page: 1, pageSize: Number(newPageSize) });
  }, [fetchData]);

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

  const handleSearchInputChange = useCallback(async (value) => {
    if (value === stateRef.current.searchTerm) return;

    setSearchTerm(value);

    try {
      const currentState = stateRef.current;
      const trimmed = (value ?? '').trim();
      const nextFilters = { ...currentState.filters };

      if (trimmed.length > 0) {
        nextFilters.search_branch = trimmed;
      } else {
        delete nextFilters.search_branch;
      }

      await fetchData({ page: 1, filters: nextFilters });
    } catch (error) {
      onError?.(error.message || 'Search failed');
    }
  }, [fetchData, onError]);

  return {
    branches,
    pagination,
    loading,
    sortBy,
    sortDirection,
    filters,
    searchTerm,
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    applyFilters,
    resetFilters,
    handleSearchInputChange,
  };
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getBranchInventory } from '@/app/(dashboard)/branches/actions';

/**
 * Data handler for branch inventory list
 */
export function branchInventoryDataHandler({
  initialBranches = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
} = {}) {
  const [branches, setBranches] = useState(initialBranches);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection,
  });
  const [filterValues, setFilterValues] = useState({
    searchBranch: '',
    searchProduct: '',
    branchType: '',
    status: '',
  });
  const loadingRef = useRef(false);

  const stateRef = useRef({
    pagination,
    sorting,
    filterValues,
  });

  useEffect(() => {
    stateRef.current = {
      pagination,
      sorting,
      filterValues,
    };
  }, [pagination, sorting, filterValues]);

  const fetchData = useCallback(async (params = {}) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const currentState = stateRef.current;
      const {
        page = currentState.pagination.current,
        pageSize = currentState.pagination.pageSize,
        sortBy = currentState.sorting.sortBy,
        sortDirection = currentState.sorting.sortDirection,
        filters = currentState.filterValues,
      } = params;

      const response = await getBranchInventory(
        page,
        pageSize,
        {
          search_branch: filters.searchBranch,
          search_product: filters.searchProduct,
          branchType: filters.branchType,
          status: filters.status,
        },
        sortBy,
        sortDirection
      );

      const newBranches = response?.branches || [];
      const newPagination = {
        current: page,
        pageSize,
        total: response?.pagination?.total || 0,
      };

      setBranches(newBranches);
      setPagination(newPagination);
      setSorting({ sortBy, sortDirection });
      return { branches: newBranches, pagination: newPagination };
    } catch (error) {
      console.error('fetchBranchInventory error:', error);
      onError?.(error.message || 'Failed to fetch branch inventory');
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [onError]);

  const handlePageChange = useCallback(
    (eventOrPage, maybePage) => {
      const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage;
      if (typeof nextPage !== 'number') return;
      fetchData({ page: nextPage + 1 });
    },
    [fetchData]
  );

  const handlePageSizeChange = useCallback(
    (eventOrSize) => {
      const nextSize = typeof eventOrSize === 'number'
        ? eventOrSize
        : parseInt(eventOrSize.target.value, 10);
      if (!Number.isFinite(nextSize)) return;
      fetchData({ page: 1, pageSize: nextSize });
    },
    [fetchData]
  );

  const handleSortRequest = useCallback(columnKey => {
    const currentSorting = stateRef.current.sorting;
    const newDirection =
      currentSorting.sortBy === columnKey && currentSorting.sortDirection === 'asc'
        ? 'desc'
        : 'asc';
    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
    return { sortBy: columnKey, sortDirection: newDirection };
  }, [fetchData]);

  const handleSearchInputChange = useCallback(async (value) => {
    if (value === stateRef.current.filterValues.searchBranch) return;
    const nextFilters = {
      ...stateRef.current.filterValues,
      searchBranch: value,
    };
    setFilterValues(nextFilters);
    try {
      await fetchData({ filters: nextFilters, page: 1 });
    } catch (error) {
      console.error('Error searching branch inventory:', error);
      onError?.(error.message || 'Search failed');
    }
  }, [fetchData, onError]);

  const handleFilterChange = useCallback(async (field, value) => {
    const nextFilters = {
      ...stateRef.current.filterValues,
      [field]: value,
    };
    setFilterValues(nextFilters);

    try {
      await fetchData({ filters: nextFilters, page: 1 });
    } catch (error) {
      console.error('Error updating branch inventory filters:', error);
      onError?.(error.message || 'Failed to update filters');
    }
  }, [fetchData, onError]);

  const resetFilters = useCallback(async () => {
    const nextFilters = {
      searchBranch: '',
      searchProduct: '',
      branchType: '',
      status: '',
    };
    setFilterValues(nextFilters);

    try {
      await fetchData({ filters: nextFilters, page: 1, sortBy: '', sortDirection: 'asc' });
    } catch (error) {
      console.error('Error resetting branch inventory filters:', error);
      onError?.(error.message || 'Failed to reset filters');
    }
  }, [fetchData, onError]);

  return {
    branches,
    pagination,
    loading,
    ...sorting,
    searchTerm: filterValues.searchBranch,
    filterValues,
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
    handleFilterChange,
    resetFilters,
  };
}

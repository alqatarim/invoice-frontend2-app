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
  const [searchTerm, setSearchTerm] = useState('');
  const loadingRef = useRef(false);

  const stateRef = useRef({
    searchTerm,
    pagination,
    sorting,
  });

  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sorting,
    };
  }, [searchTerm, pagination, sorting]);

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
        search = currentState.searchTerm,
      } = params;

      const response = await getBranchInventory(
        page,
        pageSize,
        { search_branch: search },
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
    (event, newPage) => fetchData({ page: newPage + 1 }),
    [fetchData]
  );

  const handlePageSizeChange = useCallback(
    event => fetchData({ page: 1, pageSize: parseInt(event.target.value, 10) }),
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
    if (value === stateRef.current.searchTerm) return;
    setSearchTerm(value);
    try {
      await fetchData({ search: value, page: 1 });
    } catch (error) {
      console.error('Error searching branch inventory:', error);
      onError?.(error.message || 'Search failed');
    }
  }, [fetchData, onError]);

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    branches,
    pagination,
    loading,
    ...sorting,
    searchTerm,
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleSearchInputChange,
  };
}

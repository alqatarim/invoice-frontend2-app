'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import {  getFilteredInventory } from '@/app/(dashboard)/inventory/actions';
import { filterHandler } from '@/handlers/inventory/list/filterHandler';

/**
 * Data handler for inventory list
 */
export function dataHandler({
  initialInventory = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  onError,
  onSuccess,
}) {
  const [inventory, setInventory] = useState(initialInventory);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection
  });

  // Search state management
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const loadingRef = useRef(false);

  // Use simplified filterHandler
  const filter = filterHandler(initialFilters);

  // Use refs to access latest state values without causing re-renders
  const stateRef = useRef({
    searchTerm,
    pagination,
    sorting,
    filterValues: filter.filterValues
  });

  // Update refs when state changes
  useEffect(() => {
    stateRef.current = {
      searchTerm,
      pagination,
      sorting,
      filterValues: filter.filterValues
    };
  }, [searchTerm, pagination, sorting, filter.filterValues]);


  // Fetch inventory with current or provided parameters - using refs to avoid dependency issues
  const fetchData = useCallback(async (params = {}) => {
    if (loadingRef.current) return; // Prevent multiple simultaneous calls
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const currentState = stateRef.current;
      
      const {
        page = currentState.pagination.current,
        pageSize = currentState.pagination.pageSize,
        filters = currentState.filterValues,
        sortBy = currentState.sorting.sortBy,
        sortDirection = currentState.sorting.sortDirection,
        search = currentState.searchTerm
      } = params;

      // Always use getFilteredInventory for consistency
      // It handles empty filters by returning all inventory items
      const response = await getFilteredInventory(page, pageSize, filters, sortBy, sortDirection, search);

      const newInventory = response?.inventory || [];
      const newPagination = {
        current: page,
        pageSize: pageSize,
        total: response?.pagination?.total || 0
      };

      setInventory(newInventory);
      setPagination(newPagination);
      setSorting({ sortBy, sortDirection });


      return { inventory: newInventory, pagination: newPagination };
    } catch (error) {
      console.error('fetchData error:', error);
      onError?.(error.message || 'Failed to fetch inventory');
      throw error;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [onError]);

  const handlePageChange = useCallback((eventOrPage, maybePage) => {
    const nextPage = typeof maybePage === 'number' ? maybePage : eventOrPage;
    if (typeof nextPage !== 'number') return;
    fetchData({ page: nextPage + 1 });
  }, [fetchData]);

  const handlePageSizeChange = useCallback((eventOrSize) => {
    const nextSize = typeof eventOrSize === 'number'
      ? eventOrSize
      : parseInt(eventOrSize.target.value, 10);
    if (!Number.isFinite(nextSize)) return;
    fetchData({ page: 1, pageSize: nextSize });
  }, [fetchData]);

  const handleSortRequest = useCallback(columnKey => {
    const currentSorting = stateRef.current.sorting;
    const newDirection = currentSorting.sortBy === columnKey && currentSorting.sortDirection === 'asc' ? 'desc' : 'asc';
    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
    return { sortBy: columnKey, sortDirection: newDirection };
  }, [fetchData]);

  const handleFilterValueChange = useCallback((filters) => {
    // Update the filter state with the new filters object
    filter.setFilterValues(filters);
  }, [filter]);

  const handleFilterApply = useCallback((currentFilters = null) => {
    const filtersToApply = currentFilters || stateRef.current.filterValues;
    fetchData({ page: 1, filters: filtersToApply });
  }, [fetchData]);

  const handleFilterReset = useCallback(() => {
    filter.resetFilters();
    setSearchTerm('');
    fetchData({ page: 1, filters: {}, sortBy: '', sortDirection: 'asc', search: '' });
    filter.setFilterOpen(false);
  }, [filter, fetchData]);

  // Search handlers - similar to customer handlers
  const handleSearchInputChange = useCallback(async (value) => {
    // Don't do anything if the value hasn't actually changed
    if (value === stateRef.current.searchTerm) return;
    
    setSearching(true);
    setSearchTerm(value);
    
    try {
      // Fetch inventory with the new search value
      await fetchData({ 
        search: value, 
        page: 1
      });
    } catch (error) {
      console.error('Error searching inventory:', error);
      onError?.(error.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [fetchData, onError]);

  const handleSearchSubmit = useCallback(async (event) => {
    event.preventDefault();
    setSearching(true);

    try {
      await fetchData({ search: stateRef.current.searchTerm, page: 1 });
    } catch (error) {
      console.error('Error submitting search:', error);
      onError?.(error.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }, [fetchData, onError]);

  const handleSearchClear = useCallback(async () => {
    setSearchTerm('');
    setSearching(true);

    try {
      await fetchData({ search: '', page: 1 });
    } catch (error) {
      console.error('Error clearing search:', error);
      onError?.(error.message || 'Failed to clear search');
    } finally {
      setSearching(false);
    }
  }, [fetchData, onError]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    inventory,
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
    handleFilterValueChange,
    handleFilterApply,
    handleFilterReset,

    // Search handlers
    handleSearchInputChange,
    handleSearchSubmit,
    handleSearchClear,

    // Filter state and methods
    ...filter,
  };
}
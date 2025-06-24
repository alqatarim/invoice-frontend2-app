'use client'

import { useState, useEffect, useCallback } from 'react';
import { getInitialInventoryData, getFilteredInventory } from '@/app/(dashboard)/inventory/actions';
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
  setProductOptions,
  handleProductSearch,
}) {
  const [inventory, setInventory] = useState(initialInventory);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection
  });

  // Use simplified filterHandler
  const filter = filterHandler(initialFilters);

  // Initialize filter options on mount
  useEffect(() => {
    if (setProductOptions && initialInventory.length > 0) {
      setProductOptions(initialInventory.map(item => ({ value: item._id, label: item.name })));
    }
  }, []);

  // Fetch inventory with current or provided parameters
  const fetchData = useCallback(async (params = {}) => {
    const {
      page = pagination.current,
      pageSize = pagination.pageSize,
      filters = filter.filterValues,
      sortBy = sorting.sortBy,
      sortDirection = sorting.sortDirection
    } = params;

    setLoading(true);
    try {
      let response;
      if (Object.keys(filters || {}).length === 0) {
        response = await getInitialInventoryData();
      } else {
        response = await getFilteredInventory(page, pageSize, filters, sortBy, sortDirection);
      }

      const newInventory = response?.inventory || [];
      const newPagination = {
        current: page,
        pageSize: pageSize,
        total: response?.pagination?.total || 0
      };

      setInventory(newInventory);
      setPagination(newPagination);
      setSorting({ sortBy, sortDirection });

      // Update filter options with new data
      if (setProductOptions && newInventory.length > 0) {
        setProductOptions(
          newInventory.map(item => ({ value: item._id, label: item.name }))
        );
      }

      return { inventory: newInventory, pagination: newPagination };
    } catch (error) {
      console.error('fetchData error:', error);
      onError?.(error.message || 'Failed to fetch inventory');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pagination, filter.filterValues, sorting, onError, setProductOptions]);

  const handlePageChange = useCallback((event, newPage) =>
    fetchData({ page: newPage + 1 }), [fetchData]);

  const handlePageSizeChange = useCallback(event =>
    fetchData({ page: 1, pageSize: parseInt(event.target.value, 10) }), [fetchData]);

  const handleSortRequest = useCallback(columnKey => {
    const newDirection = sorting.sortBy === columnKey && sorting.sortDirection === 'asc' ? 'desc' : 'asc';
    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
    return { sortBy: columnKey, sortDirection: newDirection };
  }, [sorting, fetchData]);

  const handleFilterValueChange = useCallback((field, value) => {
    filter.updateFilter(field, value);
    if (field === 'productSearchText' && handleProductSearch) handleProductSearch(value);
  }, [filter, handleProductSearch]);

  const handleFilterApply = useCallback((currentFilters = null) => {
    fetchData({ page: 1, filters: currentFilters || filter.filterValues });
    filter.setFilterOpen(false);
  }, [filter, fetchData]);

  const handleFilterReset = useCallback(() => {
    filter.resetFilters();
    setProductOptions?.([]);
    fetchData({ page: 1, filters: {}, sortBy: '', sortDirection: 'asc' });
    filter.setFilterOpen(false);
  }, [filter, fetchData, setProductOptions]);

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

    // Handlers
    fetchData,
    handlePageChange,
    handlePageSizeChange,
    handleSortRequest,
    handleFilterValueChange,
    handleFilterApply,
    handleFilterReset,

    // Filter state and methods
    ...filter,
  };
}
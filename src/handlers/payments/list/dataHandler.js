'use client'

import { useState, useEffect, useCallback } from 'react';
import { getFilteredPayments, searchCustomers } from '@/app/(dashboard)/payments/actions';
import { filterHandler } from '@/handlers/payments/list/filterHandler';

/**
 * Data handler for payment list - matches payment summary functionality
 */
export function dataHandler({
  initialPayments = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialFilters = {},
  initialSortBy = '',
  initialSortDirection = 'asc',
  initialCustomerOptions = [],
  onError,
  onSuccess,
  setCustomerOptions,
  handleCustomerSearch,
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState({
    sortBy: initialSortBy,
    sortDirection: initialSortDirection
  });

  // Use filter handler that matches payment summary functionality
  const filter = filterHandler(initialFilters);

  // Initialize filter options on mount
  useEffect(() => {
    if (setCustomerOptions && initialCustomerOptions.length > 0) {
      setCustomerOptions(initialCustomerOptions.map(c => ({ 
        value: c._id, 
        label: c.name || c.customer_name || 'Unknown Customer',
        customer: {
          _id: c._id,
          name: c.name || c.customer_name,
          phone: c.phone,
          image: c.image
        }
      })));
    }
  }, []);

  // Fetch payments with current or provided parameters
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
      const { payments: newPayments, pagination: newPagination } = await getFilteredPayments(
        page,
        pageSize,
        filters,
        sortBy,
        sortDirection
      );

      setPayments(newPayments);
      setPagination(newPagination);
      setSorting({ sortBy, sortDirection });

      // Update filter state to match current filters
      if (filters && Object.keys(filters).length > 0) {
        filter.setFilterValues(prev => ({ ...prev, ...filters }));
      }

      return { payments: newPayments, pagination: newPagination };
    } catch (error) {
      console.error('fetchData error:', error);
      onError?.(error.message || 'Failed to fetch payments');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pagination, filter.filterValues, sorting, onError, filter]);

  // Handle pagination
  const handlePageChange = useCallback((event, newPage) =>
    fetchData({ page: newPage + 1 }), [fetchData]);

  const handlePageSizeChange = useCallback(event =>
    fetchData({ page: 1, pageSize: parseInt(event.target.value, 10) }), [fetchData]);

  // Handle sorting
  const handleSortRequest = useCallback(columnKey => {
    const newDirection = sorting.sortBy === columnKey && sorting.sortDirection === 'asc' ? 'desc' : 'asc';
    fetchData({ page: 1, sortBy: columnKey, sortDirection: newDirection });
    return { sortBy: columnKey, sortDirection: newDirection };
  }, [sorting, fetchData]);

  // Handle filter value changes
  const handleFilterValueChange = useCallback((field, value) => {
    filter.updateFilter(field, value);

    // Handle customer search separately
    if (field === 'search_customer' && handleCustomerSearch) {
      handleCustomerSearch(value);
    }
  }, [filter, handleCustomerSearch]);

  // Apply filters
  const handleFilterApply = useCallback((currentFilters = null) => {
    const filtersToApply = currentFilters || filter.filterValues;

    // Only apply if there are selected customers
    if (!filtersToApply.customer || filtersToApply.customer.length === 0) {
      console.log('No customers selected for filtering');
      return;
    }

    // Always start from page 1 when applying filters
    fetchData({
      page: 1,
      pageSize: pagination.pageSize,
      filters: filtersToApply
    });

    filter.setFilterOpen(false);
  }, [filter, fetchData, pagination.pageSize]);

  // Reset filters
  const handleFilterReset = useCallback(async () => {
    filter.resetFilters();

    // Reset to initial state
    try {
      const { payments: resetPayments, pagination: resetPagination } = await getFilteredPayments(
        1,
        pagination.pageSize,
        {}, // Empty filters
        '', // No sorting
        'asc'
      );

      setPayments(resetPayments);
      setPagination(resetPagination);
      setSorting({ sortBy: '', sortDirection: 'asc' });

      filter.setFilterOpen(false);
    } catch (error) {
      console.error('Error resetting filters:', error);
      onError?.(error.message || 'Failed to reset filters');
    }
  }, [filter, fetchData, pagination.pageSize, onError]);

  // Search customers function - for dynamic customer search
  const searchCustomersForFilter = useCallback(async (searchTerm) => {
    try {
      const response = await searchCustomers(searchTerm);
      return response.data || [];
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    payments,
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
    searchCustomersForFilter,

    // Filter state and methods
    ...filter,
  };
}
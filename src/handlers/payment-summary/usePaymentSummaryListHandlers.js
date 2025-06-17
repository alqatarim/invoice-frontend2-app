'use client';

import { useMemo, useCallback } from 'react';
import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';
import { searchHandler } from './list/searchHandler';
import { columnsHandler } from './list/columnsHandler';
import { filterHandler } from './list/filterHandler';

/**
 * Composite hook for payment summary list functionality (following invoice pattern).
 * Combines data management, actions, search, and UI handlers.
 */
export function usePaymentSummaryListHandlers({
  initialPayments = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialCustomers = [],
  initialFilters = {},
  onSuccess,
  onError,
}) {
  // Initialize all handlers
  const columns = columnsHandler([]);
  const search = searchHandler();
  const filter = filterHandler(initialFilters);

  // Initialize data handler with search integration
  const data = dataHandler({
    initialPayments,
    initialPagination,
    initialFilters,
    initialCustomers,
    setCustomerOptions: search.setCustomerOptions,
    onSuccess,
    onError,
  });

  // Create refresh function that maintains current filters
  const refreshData = useCallback(() => {
    return data.fetchData({ filters: filter.filterValues });
  }, [data, filter.filterValues]);

  const actions = actionsHandler({
    onSuccess,
    onError,
    refreshData,
  });

  // Enhanced filter handlers that trigger data fetch
  const handleFilterValueChange = useCallback((field, value) => {
    filter.updateFilter(field, value);
    if (field === 'customerSearchText') {
      search.handleCustomerSearch(value);
    }
  }, [filter, search]);

  const handleFilterApply = useCallback(() => {
    data.fetchData({ page: 1, filters: filter.filterValues });
    filter.setFilterOpen(false);
  }, [data, filter]);

  const handleFilterReset = useCallback(() => {
    filter.resetFilters();
    search.setCustomerOptions(initialCustomers.map(c => ({ value: c._id, label: c.name })));
    data.fetchData({ page: 1, filters: {}, sortBy: '', sortDirection: 'asc' });
    filter.setFilterOpen(false);
  }, [filter, search, data, initialCustomers]);

  // Customer selection handler for filter
  const handleCustomerSelection = useCallback((customerId, isChecked) => {
    const currentCustomers = filter.filterValues.customer || [];
    const updatedCustomers = isChecked
      ? [...currentCustomers, customerId]
      : currentCustomers.filter(id => id !== customerId);

    filter.updateFilter('customer', updatedCustomers);
  }, [filter]);

  // Combine all handlers into a single object
  return useMemo(() => {
    return {
      // Data state
      paymentSummaries: data.paymentSummaries,
      pagination: data.pagination,
      loading: data.loading,
      sortBy: data.sortBy,
      sortDirection: data.sortDirection,

      // Filter state
      filterOpen: filter.filterOpen,
      filterValues: filter.filterValues,
      selectedCustomers: filter.filterValues.customer || [],

      // Data handlers
      fetchData: data.fetchData,
      handlePageChange: data.handlePageChange,
      handlePageSizeChange: data.handlePageSizeChange,
      handleSortRequest: data.handleSortRequest,

      // Filter handlers
      handleFilterToggle: filter.toggleFilter,
      handleFilterValueChange,
      handleFilterApply,
      handleFilterReset,
      handleCustomerSelection,
      hasActiveFilters: filter.hasActiveFilters,
      getActiveFilterCount: filter.getActiveFilterCount,

      // Search functionality
      customerOptions: search.customerOptions,
      customerSearchLoading: search.customerSearchLoading,
      handleCustomerSearch: search.handleCustomerSearch,

      // Actions
      handleView: actions.handleView,
      handleDelete: actions.handleDelete,
      handleStatusUpdate: actions.handleStatusUpdate,

      // Column management
      availableColumns: columns.availableColumns,
      manageColumnsOpen: columns.manageColumnsOpen,
      handleManageColumnsOpen: columns.handleManageColumnsOpen,
      handleManageColumnsClose: columns.handleManageColumnsClose,
      handleColumnCheckboxChange: columns.handleColumnCheckboxChange,
      handleManageColumnsSave: columns.handleManageColumnsSave,
    };
  }, [
    data,
    search,
    actions,
    filter,
    columns,
    handleFilterValueChange,
    handleFilterApply,
    handleFilterReset,
    handleCustomerSelection,
  ]);
}
'use client';

import { useMemo } from 'react';
import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';
import { searchHandler } from './list/searchHandler';
import { columnsHandler } from './list/columnsHandler';

/**
 * Composite hook for payment list functionality.
 * Combines data management, actions, search, and UI handlers.
 */
export function usePaymentListHandlers(options = {}) {
  // Initialize handlers without column management to avoid circular dependencies
  const search = searchHandler();

  // Initialize data handler with search integration
  const data = dataHandler({
    ...options,
    initialCustomerOptions: options.initialCustomerOptions || [],
    setCustomerOptions: search.setCustomerOptions,
    handleCustomerSearch: search.handleCustomerSearch,
  });

  const actions = actionsHandler({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    pagination: data.pagination,
    filters: data.filterValues,
  });

  // Combine all handlers into a single object
  return useMemo(() => ({
    // Data state
    payments: data.payments,
    pagination: data.pagination,
    loading: data.loading,
    sortBy: data.sortBy,
    sortDirection: data.sortDirection,

    // Filter state
    filterValues: data.filterValues,
    filterOpen: data.filterOpen,
    filters: data.filterValues, // Alias for backward compatibility

    // Data handlers
    fetchData: data.fetchData,
    handlePageChange: data.handlePageChange,
    handlePageSizeChange: data.handlePageSizeChange,
    handleSortRequest: data.handleSortRequest,

    // Filter handlers
    handleFilterValueChange: data.handleFilterValueChange,
    handleFilterApply: data.handleFilterApply,
    handleFilterReset: data.handleFilterReset,
    handleFilterToggle: data.toggleFilter,
    isFilterApplied: data.hasActiveFilters,
    getFilterCount: data.getActiveFilterCount,

    // Search functionality
    customerOptions: search.customerOptions,
    customerSearchLoading: search.customerSearchLoading,
    handleCustomerSearch: search.handleCustomerSearch,

    // Actions
    handleDelete: actions.handleDelete,
    handleView: actions.handleView,
    handleEdit: actions.handleEdit,
  }), [data, search, actions]);
}
'use client';

import { useMemo } from 'react';
import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';
import { searchHandler } from './list/searchHandler';
import { columnsHandler } from './list/columnsHandler';

/**
 * Composite hook for inventory list functionality.
 * Combines data management, actions, search, and UI handlers.
 */
export function useInventoryListHandlers(options = {}) {
  // Initialize all handlers
  const columns = columnsHandler(options.initialColumns || []);
  const search = searchHandler();

  // Initialize data handler with search integration
  const data = dataHandler({
    ...options,
    setProductOptions: search.setProductOptions,
    handleProductSearch: search.handleProductSearch,
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
    inventory: data.inventory,
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
    productOptions: search.productOptions,
    handleProductSearch: search.handleProductSearch,

    // Actions
    handleAddStock: actions.handleAddStock,
    handleRemoveStock: actions.handleRemoveStock,

    // Column management
    availableColumns: columns.availableColumns,
    manageColumnsOpen: columns.manageColumnsOpen,
    handleManageColumnsOpen: columns.handleManageColumnsOpen,
    handleManageColumnsClose: columns.handleManageColumnsClose,
    handleColumnCheckboxChange: columns.handleColumnCheckboxChange,
    handleManageColumnsSave: columns.handleManageColumnsSave,
  }), [data, search, actions, columns]);
}
'use client';

import { useMemo } from 'react';
import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';

/**
 * Composite hook for inventory list functionality.
 * Combines data management, actions, and search handlers.
 */
export function useInventoryListHandlers(options = {}) {
  // Initialize data handler
  const data = dataHandler({
    ...options,
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

    // Search state and handlers
    searchTerm: data.searchTerm,
    handleSearchInputChange: data.handleSearchInputChange,

    // Data handlers
    handlePageChange: data.handlePageChange,
    handlePageSizeChange: data.handlePageSizeChange,
    handleSortRequest: data.handleSortRequest,

    // Actions
    handleAddStock: actions.handleAddStock,
    handleRemoveStock: actions.handleRemoveStock,
    stockLoading: actions.loading, // Expose stock operation loading states
  }), [data, actions]);
}
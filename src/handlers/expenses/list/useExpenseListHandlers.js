'use client';

import { useMemo } from 'react';
import { dataHandler } from './dataHandler';
import { actionsHandler } from './actionsHandler';

/**
 * Composite hook for expense list functionality.
 * Combines data management and actions handlers.
 */
export function useExpenseListHandlers(options = {}) {
  // Initialize data handler
  const data = dataHandler(options);

  const actions = actionsHandler({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    pagination: data.pagination,
    onView: options.onView,
    onEdit: options.onEdit,
  });

  // Combine all handlers into a single object
  return useMemo(() => {
    return {
      // Data state
      expenses: data.expenses,
      pagination: data.pagination,
      loading: data.loading,
      sortBy: data.sortBy,
      sortDirection: data.sortDirection,

      // Search state
      searchTerm: data.searchTerm,
      searching: data.searching,

      // Data handlers
      fetchData: data.fetchData,
      refreshData: data.fetchData, // Expose refresh functionality
      handlePageChange: data.handlePageChange,
      handlePageSizeChange: data.handlePageSizeChange,
      handleSortRequest: data.handleSortRequest,

      // Search handlers
      handleSearchInputChange: data.handleSearchInputChange,
      handleSearchSubmit: data.handleSearchSubmit,
      handleSearchClear: data.handleSearchClear,

      // Actions
      handleDelete: actions.handleDelete,
      handleView: actions.handleView,
      handleEdit: actions.handleEdit,
      handlePrintDownload: actions.handlePrintDownload,
    };
  }, [data, actions]);
}
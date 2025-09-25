'use client';

import { useMemo } from 'react';
import { dataHandler } from './dataHandler';
import { actionsHandler } from './actionsHandler';
import { convertDialogHandler } from './convertDialogHandler';
import { columnsHandler } from './columnsHandler';

/**
 * Composite hook for purchase list functionality.
 * Combines data management, actions, search, and UI handlers.
 */
export function usePurchaseListHandlers(options = {}) {
  // Initialize all handlers
  const columns = columnsHandler(options.initialColumns || []);

  // Initialize data handler
  const data = dataHandler(options);

  const actions = actionsHandler({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    pagination: data.pagination,
  });

  // Note: Convert functionality not available with current backend

  // Combine all handlers into a single object
  return useMemo(() => {
    return {
      // Data state
      purchases: data.purchases,
      pagination: data.pagination,
      loading: data.loading,
      sortBy: data.sortBy,
      sortDirection: data.sortDirection,

      // Search state
      searchTerm: data.searchTerm,
      searching: data.searching,

      // Data handlers
      fetchData: data.fetchData,
      handlePageChange: data.handlePageChange,
      handlePageSizeChange: data.handlePageSizeChange,
      handleSortRequest: data.handleSortRequest,

      // Search handlers
      handleSearchInputChange: data.handleSearchInputChange,
      handleSearchSubmit: data.handleSearchSubmit,
      handleSearchClear: data.handleSearchClear,

      // Actions
      handleDelete: actions.handleDelete,
      handlePrintDownload: actions.handlePrintDownload,

      // Column management
      availableColumns: columns.availableColumns,
      manageColumnsOpen: columns.manageColumnsOpen,
      handleManageColumnsOpen: columns.handleManageColumnsOpen,
      handleManageColumnsClose: columns.handleManageColumnsClose,
      handleColumnCheckboxChange: columns.handleColumnCheckboxChange,
      handleManageColumnsSave: columns.handleManageColumnsSave,
    };
  }, [data, actions, columns]);
}
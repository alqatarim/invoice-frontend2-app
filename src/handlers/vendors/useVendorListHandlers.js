'use client';

import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';

/**
 * Simplified vendor list handlers - eliminates redundant layers
 */
export function useVendorListHandlers(options = {}) {
  // Single data handler manages all data operations
  const data = dataHandler({
    initialVendors: options.initialVendors || [],
    initialPagination: options.initialPagination || { current: 1, pageSize: 10, total: 0 },
    onError: options.onError,
  });

  // Actions handler for CRUD operations
  const actions = actionsHandler({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    pagination: data.pagination,
    filters: data.filters,
  });

  return {
    // Data state
    vendors: data.vendors,
    pagination: data.pagination,
    loading: data.loading,
    sortBy: data.sortBy,
    sortDirection: data.sortDirection,

    // Data handlers
    handlePageChange: data.handlePageChange,
    handlePageSizeChange: data.handlePageSizeChange,
    handleSortRequest: data.handleSort,

    // Filter handlers
    handleFilterApply: data.applyFilters,
    handleFilterReset: data.resetFilters,

    // Actions
    handleDelete: actions.handleDelete,
    handleView: actions.handleView,
    handleEdit: actions.handleEdit,
  };
}
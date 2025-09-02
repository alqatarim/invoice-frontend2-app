'use client';

import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';

/**
 * Simplified product list handlers - eliminates redundant layers
 */
export function useProductListHandlers(options = {}) {
  // Single data handler manages all data operations
  const data = dataHandler({
    initialProducts: options.initialProducts || [],
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
    // Pass custom handlers if provided (for dialog mode)
    onView: options.onView,
    onEdit: options.onEdit,
  });

  return {
    // Data state
    products: data.products,
    pagination: data.pagination,
    loading: data.loading,
    sortBy: data.sortBy,
    sortDirection: data.sortDirection,
    searchTerm: data.searchTerm,

    // Data handlers
    handlePageChange: data.handlePageChange,
    handlePageSizeChange: data.handlePageSizeChange,
    handleSortRequest: data.handleSort,
    handleSort: data.handleSort,
    handleSearchInputChange: data.handleSearchInputChange,

    // Filter handlers
    handleFilterApply: data.applyFilters,
    handleFilterReset: data.resetFilters,

    // Actions
    handleDelete: actions.handleDelete,
    handleView: actions.handleView,
    handleEdit: actions.handleEdit,
  };
}
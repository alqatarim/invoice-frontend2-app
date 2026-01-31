'use client';

import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';

export function useBranchListHandlers(options = {}) {
  const data = dataHandler({
    initialBranches: options.initialBranches || [],
    initialPagination: options.initialPagination || { current: 1, pageSize: 10, total: 0 },
    onError: options.onError,
  });

  const actions = actionsHandler({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    pagination: data.pagination,
    filters: data.filters,
    onEdit: options.onEdit,
    onView: options.onView,
  });

  return {
    branches: data.branches,
    pagination: data.pagination,
    loading: data.loading,
    sortBy: data.sortBy,
    sortDirection: data.sortDirection,
    searchTerm: data.searchTerm,
    handlePageChange: data.handlePageChange,
    handlePageSizeChange: data.handlePageSizeChange,
    handleSortRequest: data.handleSort,
    handleSort: data.handleSort,
    handleSearchInputChange: data.handleSearchInputChange,
    refreshData: data.fetchData,
    handleFilterApply: data.applyFilters,
    handleFilterReset: data.resetFilters,
    handleDelete: actions.handleDelete,
    handleEdit: actions.handleEdit,
    handleView: actions.handleView,
  };
}

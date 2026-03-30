'use client';

import { useMemo } from 'react';
import { branchInventoryDataHandler } from './branchInventory/dataHandler';

/**
 * Composite hook for branch inventory list functionality.
 */
export function useBranchInventoryHandlers(options = {}) {
  const data = branchInventoryDataHandler({
    ...options,
  });

  return useMemo(() => ({
    branches: data.branches,
    pagination: data.pagination,
    loading: data.loading,
    sortBy: data.sortBy,
    sortDirection: data.sortDirection,
    searchTerm: data.searchTerm,
    filterValues: data.filterValues,
    fetchData: data.fetchData,
    handleSearchInputChange: data.handleSearchInputChange,
    handleFilterChange: data.handleFilterChange,
    resetFilters: data.resetFilters,
    handlePageChange: data.handlePageChange,
    handlePageSizeChange: data.handlePageSizeChange,
    handleSortRequest: data.handleSortRequest,
  }), [data]);
}

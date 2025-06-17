'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useDataHandler } from './list/dataHandler';
import { useFilterHandler } from './list/filterHandler';
import { actionsHandler } from './list/actionsHandler';
import { searchHandler } from './list/searchHandler';
import { convertDialogHandler } from './list/convertDialogHandler';
import { columnsHandler } from './list/columnsHandler';

/**
 * Composite hook for delivery challan list functionality.
 * Combines data management, actions, search, and UI handlers.
 */
export function useDeliveryChallanListHandlers(options = {}) {
  // Initialize all handlers
  const columns = columnsHandler(options.initialColumns || []);
  const search = searchHandler();
  const filter = useFilterHandler();

  // Get initial columns - stabilize them to prevent infinite loops
  const initialColumns = useMemo(() =>
    options.initialColumns || [],
    [options.initialColumns?.length]
  );

  // Column state management - use the availableColumns from columnsHandler as the source of truth
  const columnsState = columns.availableColumns;

  // Initialize data handler with simplified parameters
  const data = useDataHandler(
    options.initialDeliveryChallans,
    options.initialPagination,
    options.initialTab,
    options.initialFilters
  );

  const actions = actionsHandler({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.loadData,
    pagination: data.pagination,
    filters: filter.filters,
  });

  const convertDialog = convertDialogHandler({
    handleConvertToInvoice: actions.handleConvertToInvoice,
    onError: options.onError,
    onSuccess: options.onSuccess,
  });

  // Enhanced filter application that triggers data loading
  const handleApplyFilters = useCallback((filterValues) => {
    // Update filter state
    filter.applyFilters(filterValues);

    // Convert filter values to the format expected by the backend
    const backendFilters = {};
    if (filterValues.customer && filterValues.customer.length > 0) {
      backendFilters.customer = filterValues.customer.map(c => c.value);
    }

    // Load data with new filters, reset to page 1
    data.loadData(1, data.pagination.pageSize, options.initialTab, backendFilters, data.sortBy, data.sortDirection);
  }, [filter, data, options.initialTab]);

  // Enhanced filter reset that triggers data loading
  const handleResetFilters = useCallback(() => {
    // Reset filter state
    filter.resetFilters();

    // Clear search options
    search.clearCustomerOptions();

    // Load data without filters, reset to page 1
    data.loadData(1, data.pagination.pageSize, options.initialTab, {}, '', 'asc');
  }, [filter, search, data, options.initialTab]);

  // Table columns with handlers injected
  const tableColumns = useMemo(() =>
    columnsState
      .filter(col => col.visible)
      .map(col => ({
        ...col,
        renderCell: col.renderCell ?
          (row) => col.renderCell(row, {
            ...actions,
            permissions: options.permissions,
          }) : undefined
      })),
    [columnsState, actions, options.permissions]
  );

  // Combine all handlers into a single object
  return useMemo(() => ({
    // Data state
    deliveryChallans: data.deliveryChallans,
    pagination: data.pagination,
    loading: data.loading,
    error: data.error,
    sortBy: data.sortBy,
    sortDirection: data.sortDirection,

    // Filter state
    filters: filter.filters,
    activeTab: filter.activeTab,
    availableTabs: filter.availableTabs,

    // Data handlers
    loadData: data.loadData,
    refreshData: data.refreshData,
    handlePageChange: data.handlePageChange,
    handlePageSizeChange: data.handlePageSizeChange,
    handleSort: data.handleSort,

    // Filter handlers (enhanced with data loading)
    handleFilterChange: filter.handleFilterChange,
    handleTabChange: filter.handleTabChange,
    applyFilters: handleApplyFilters, // Enhanced version
    resetFilters: handleResetFilters, // Enhanced version

    // Search functionality
    searchTerm: data.searchTerm,
    handleSearch: data.handleSearch,
    customerOptions: search.customerOptions,
    deliveryChallanOptions: search.deliveryChallanOptions,
    searchLoading: search.searchLoading,
    handleCustomerSearch: search.handleCustomerSearch,
    handleDeliveryChallanSearch: search.handleDeliveryChallanSearch,

    // Actions
    handleClone: actions.handleClone,
    handleDelete: actions.handleDelete,
    handleView: actions.handleView,
    handleEdit: actions.handleEdit,
    handleConvertToInvoice: actions.handleConvertToInvoice,
    handlePrintDownload: actions.handlePrintDownload,

    // Convert dialog
    convertDialogOpen: convertDialog.convertDialogOpen,
    deliveryChallanToConvert: convertDialog.deliveryChallanToConvert,
    convertOptions: convertDialog.convertOptions,
    openConvertDialog: convertDialog.openConvertDialog,
    closeConvertDialog: convertDialog.closeConvertDialog,
    updateConvertOptions: convertDialog.updateConvertOptions,
    confirmConvertToInvoice: convertDialog.confirmConvertToInvoice,

    // Column management
    availableColumns: columns.availableColumns,
    manageColumnsOpen: columns.manageColumnsOpen,
    visibleColumnsCount: columns.visibleColumnsCount,
    handleManageColumnsOpen: columns.handleManageColumnsOpen,
    handleManageColumnsClose: columns.handleManageColumnsClose,
    handleColumnToggle: columns.handleColumnToggle,
    handleColumnCheckboxChange: columns.handleColumnCheckboxChange,
         handleManageColumnsSave: columns.handleManageColumnsSave,
     columnsState,
     tableColumns,
  }), [data, filter, search, actions, convertDialog, columns, handleApplyFilters, handleResetFilters, columnsState, tableColumns]);
}
'use client';

import { useMemo } from 'react';
import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';
import { searchHandler } from './list/searchHandler';
import { convertDialogHandler } from './list/convertDialogHandler';
import { columnsHandler } from './list/columnsHandler';

/**
 * Composite hook for invoice list functionality.
 * Combines data management, actions, search, and UI handlers.
 */
export function useInvoiceListHandlers(options = {}) {
  // Initialize all handlers
  const columns = columnsHandler(options.initialColumns || []);
  const search = searchHandler();
  
  // Initialize data handler with search integration
  const data = dataHandler({
    ...options,
    initialCustomers: options.initialCustomers || [],
    setCustomerOptions: search.setCustomerOptions,
    setInvoiceOptions: search.setInvoiceOptions,
    handleCustomerSearch: search.handleCustomerSearch,
    handleInvoiceSearch: search.handleInvoiceSearch,
  });

  const actions = actionsHandler({
    onSuccess: options.onSuccess,
    onError: options.onError,
    fetchData: data.fetchData,
    pagination: data.pagination,
    filters: data.filterValues,
  });

  const convertDialog = convertDialogHandler({
    handleConvertToSalesReturn: actions.handleConvertToSalesReturn,
    onError: options.onError,
    onSuccess: options.onSuccess,
  });

  // Combine all handlers into a single object
  return useMemo(() => {
    // Calculate tab value once for this render
    const currentTab = data.getCurrentTab();

    return {
      // Data state
      invoices: data.invoices,
      pagination: data.pagination,
      loading: data.loading,
      sortBy: data.sortBy,
      sortDirection: data.sortDirection,

      // Filter state
      filterValues: data.filterValues,
      filterOpen: data.filterOpen,
      filters: data.filterValues, // Alias for backward compatibility
      tab: currentTab, // Computed value for backward compatibility

    // Data handlers
    fetchData: data.fetchData,
    handlePageChange: data.handlePageChange,
    handlePageSizeChange: data.handlePageSizeChange,
    handleSortRequest: data.handleSortRequest,

         // Filter handlers
     handleFilterValueChange: data.handleFilterValueChange,
     handleFilterApply: data.handleFilterApply,
     handleFilterReset: data.handleFilterReset,
     handleTabChange: data.handleTabChange,
     handleFilterToggle: data.toggleFilter,
     isFilterApplied: data.hasActiveFilters,
     getFilterCount: data.getActiveFilterCount,
     getCurrentTab: data.getCurrentTab,

    // Search functionality
    customerOptions: search.customerOptions,
    invoiceOptions: search.invoiceOptions,
    handleCustomerSearch: search.handleCustomerSearch,
    handleInvoiceSearch: search.handleInvoiceSearch,

    // Actions
    handleClone: actions.handleClone,
    handleSend: actions.handleSend,
    handleConvertToSalesReturn: actions.handleConvertToSalesReturn,
    handlePrintDownload: actions.handlePrintDownload,
    handleSendPaymentLink: actions.handleSendPaymentLink,

    // Convert dialog
    convertDialogOpen: convertDialog.convertDialogOpen,
    openConvertDialog: convertDialog.openConvertDialog,
    closeConvertDialog: convertDialog.closeConvertDialog,
    confirmConvertToSalesReturn: convertDialog.confirmConvertToSalesReturn,

    // Column management
    availableColumns: columns.availableColumns,
    manageColumnsOpen: columns.manageColumnsOpen,
    handleManageColumnsOpen: columns.handleManageColumnsOpen,
    handleManageColumnsClose: columns.handleManageColumnsClose,
    handleColumnCheckboxChange: columns.handleColumnCheckboxChange,
    handleManageColumnsSave: columns.handleManageColumnsSave,
    };
  }, [data, search, actions, convertDialog, columns]);
}
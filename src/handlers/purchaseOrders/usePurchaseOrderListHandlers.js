'use client';

import { useMemo } from 'react';
import { dataHandler } from './list/dataHandler';
import { actionsHandler } from './list/actionsHandler';
import { convertDialogHandler } from './list/convertDialogHandler';
import { columnsHandler } from './list/columnsHandler';

/**
 * Composite hook for purchase order list functionality.
 * Combines data management, actions, search, and UI handlers.
 */
export function usePurchaseOrderListHandlers(options = {}) {
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

  const convertDialog = convertDialogHandler({
    handleConvertToPurchase: actions.handleConvertToPurchase,
    onError: options.onError,
    onSuccess: options.onSuccess,
  });

  // Combine all handlers into a single object
  return useMemo(() => {
    return {
      // Data state
      purchaseOrders: data.purchaseOrders,
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
      handleClone: actions.handleClone,
      handleSend: actions.handleSend,
      handleConvertToPurchase: actions.handleConvertToPurchase,
      handlePrintDownload: actions.handlePrintDownload,

      // Convert dialog
      convertDialogOpen: convertDialog.convertDialogOpen,
      openConvertDialog: convertDialog.openConvertDialog,
      closeConvertDialog: convertDialog.closeConvertDialog,
      confirmConvertToPurchase: convertDialog.confirmConvertToPurchase,

      // Column management
      availableColumns: columns.availableColumns,
      manageColumnsOpen: columns.manageColumnsOpen,
      handleManageColumnsOpen: columns.handleManageColumnsOpen,
      handleManageColumnsClose: columns.handleManageColumnsClose,
      handleColumnCheckboxChange: columns.handleColumnCheckboxChange,
      handleManageColumnsSave: columns.handleManageColumnsSave,
    };
  }, [data, actions, convertDialog, columns]);
}
import { useMemo } from 'react'

// Import modular handlers
import { useDataHandler } from './dataHandler'
import { useActionsHandler } from './actionsHandler'
import { useColumnsHandler } from './columnsHandler'

/**
 * Main composite hook for sales return list functionality
 * Now uses consolidated dataHandler that includes search functionality
 */
export function useSalesReturnListHandlers({
  initialSalesReturns,
  initialPagination,
  initialSortBy,
  initialSortDirection,
  initialColumns,
  onError,
  onSuccess,
}) {
  // Consolidated data handler - now includes search functionality
  const dataHandler = useDataHandler({
    initialSalesReturns,
    initialPagination,
    initialSortBy,
    initialSortDirection,
    onError,
    onSuccess
  })

  // Actions handler - manages CRUD operations
  const actionsHandler = useActionsHandler({
    onError,
    onSuccess,
    fetchSalesReturns: dataHandler.fetchSalesReturns
  })

  // Columns handler - manages table columns
  const columnsHandler = useColumnsHandler({
    initialColumns
  })

  // Customer options for filters (if needed in future)
  const customerOptions = useMemo(() =>
    dataHandler.salesReturns?.map(salesReturn => ({
      _id: salesReturn.customerInfo?._id,
      name: salesReturn.customerInfo?.name
    })).filter(customer => customer._id && customer.name) || [], [dataHandler.salesReturns])

  // Add index to sales returns for serial number
  const salesReturnsWithIndex = useMemo(() =>
    dataHandler.salesReturns.map((salesReturn, index) => ({
      ...salesReturn,
      _index: index
    })), [dataHandler.salesReturns])

  return {
    // Data state
    salesReturns: salesReturnsWithIndex,
    pagination: dataHandler.pagination,
    loading: dataHandler.loading,
    sortBy: dataHandler.sortBy,
    sortDirection: dataHandler.sortDirection,

    // Customer options
    customerOptions,

    // Data handlers
    fetchSalesReturns: dataHandler.fetchSalesReturns,
    handlePageChange: dataHandler.handlePageChange,
    handlePageSizeChange: dataHandler.handlePageSizeChange,
    handleSortChange: dataHandler.handleSortChange,

    // Search handlers
    searchTerm: dataHandler.searchTerm,
    searching: dataHandler.searching,
    handleSearchInputChange: dataHandler.handleSearchInputChange,
    handleSearchSubmit: dataHandler.handleSearchSubmit,
    handleSearchClear: dataHandler.handleSearchClear,
    handleSearchFocus: dataHandler.handleSearchFocus,
    handleSearchBlur: dataHandler.handleSearchBlur,

    // Action handlers
    selectedSalesReturn: actionsHandler.selectedSalesReturn,
    deleteDialogOpen: actionsHandler.deleteDialogOpen,
    handleView: actionsHandler.handleView,
    handleEdit: actionsHandler.handleEdit,
    handleDeleteClick: actionsHandler.handleDeleteClick,
    handleDeleteConfirm: actionsHandler.handleDeleteConfirm,
    handleDeleteCancel: actionsHandler.handleDeleteCancel,
    handlePrintDownload: actionsHandler.handlePrintDownload,
    handleProcessRefund: actionsHandler.handleProcessRefund,

    // Column handlers
    manageColumnsOpen: columnsHandler.manageColumnsOpen,
    tempColumns: columnsHandler.tempColumns,
    handleManageColumnsOpen: columnsHandler.handleManageColumnsOpen,
    handleManageColumnsClose: columnsHandler.handleManageColumnsClose,
    handleColumnToggle: columnsHandler.handleColumnToggle,
    handleManageColumnsSave: columnsHandler.handleManageColumnsSave,
    handleResetColumns: columnsHandler.handleResetColumns,
    loadSavedColumns: columnsHandler.loadSavedColumns,
    getVisibleColumns: columnsHandler.getVisibleColumns
  }
}
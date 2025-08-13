import { useMemo } from 'react'

// Import modular handlers
import { useDataHandler } from './list/dataHandler'
import { useActionsHandler } from './list/actionsHandler'
import { useColumnsHandler } from './list/columnsHandler'

/**
 * Main composite hook for customer list functionality
 * Now uses consolidated dataHandler that includes search functionality
 */
export function useCustomerListHandlers({
  initialCustomers,
  initialPagination,
  initialSortBy,
  initialSortDirection,
  initialColumns,
  onError,
  onSuccess,
}) {
  // Consolidated data handler - now includes search functionality
  const dataHandler = useDataHandler({
    initialCustomers,
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
    fetchCustomers: dataHandler.fetchCustomers
  })

  // Columns handler - manages table columns
  const columnsHandler = useColumnsHandler({
    initialColumns
  })

  // Customer options for filters
  const customerOptions = useMemo(() =>
    dataHandler.customers?.map(customer => ({
      _id: customer._id,
      name: customer.name
    })) || [], [dataHandler.customers])

  // Add index to customers for serial number
  const customersWithIndex = useMemo(() =>
    dataHandler.customers.map((customer, index) => ({
      ...customer,
      _index: index
    })), [dataHandler.customers])

  return {
    // Data state
    customers: customersWithIndex,
    pagination: dataHandler.pagination,
    loading: dataHandler.loading,
    sortBy: dataHandler.sortBy,
    sortDirection: dataHandler.sortDirection,

    // Customer options
    customerOptions,

    // Data handlers
    fetchCustomers: dataHandler.fetchCustomers,
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
    selectedCustomer: actionsHandler.selectedCustomer,
    deleteDialogOpen: actionsHandler.deleteDialogOpen,
    activateDialogOpen: actionsHandler.activateDialogOpen,
    deactivateDialogOpen: actionsHandler.deactivateDialogOpen,
    activateAnchorEl: actionsHandler.activateAnchorEl,
    deactivateAnchorEl: actionsHandler.deactivateAnchorEl,
    handleEdit: actionsHandler.handleEdit,
    handleView: actionsHandler.handleView,
    handleCreateInvoice: actionsHandler.handleCreateInvoice,
    handleDeleteClick: actionsHandler.handleDeleteClick,
    handleDeleteConfirm: actionsHandler.handleDeleteConfirm,
    handleDeleteCancel: actionsHandler.handleDeleteCancel,
    handleActivateClick: actionsHandler.handleActivateClick,
    handleActivateConfirm: actionsHandler.handleActivateConfirm,
    handleActivateCancel: actionsHandler.handleActivateCancel,
    handleDeactivateClick: actionsHandler.handleDeactivateClick,
    handleDeactivateConfirm: actionsHandler.handleDeactivateConfirm,
    handleDeactivateCancel: actionsHandler.handleDeactivateCancel,

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
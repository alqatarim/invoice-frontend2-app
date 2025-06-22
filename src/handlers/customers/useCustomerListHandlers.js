import { useMemo } from 'react'

// Import modular handlers
import { useDataHandler } from './list/dataHandler'
import { useActionsHandler } from './list/actionsHandler'
import { useFilterHandler } from './list/filterHandler'
import { useSearchHandler } from './list/searchHandler'
import { useColumnsHandler } from './list/columnsHandler'

/**
 * Main composite hook for customer list functionality
 * Combines all modular handlers following single responsibility principle
 */
export function useCustomerListHandlers({
  initialCustomers,
  initialPagination,
  initialTab,
  initialFilters,
  initialSortBy,
  initialSortDirection,
  initialColumns,
  onError,
  onSuccess,
}) {
  // Data handler - manages customer data, pagination, and fetching
  const dataHandler = useDataHandler({
    initialCustomers,
    initialPagination,
    initialTab,
    initialFilters,
    initialSortBy,
    initialSortDirection,
    onError,
    onSuccess
  })

  // Filter handler - manages filtering logic
  const filterHandler = useFilterHandler({
    initialFilters,
    fetchCustomers: dataHandler.fetchCustomers,
    onError
  })

  // Search handler - manages search functionality
  const searchHandler = useSearchHandler({
    fetchCustomers: dataHandler.fetchCustomers,
    handleSearchChange: filterHandler.handleSearchChange,
    onError
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
      _index: index + ((dataHandler.pagination.current - 1) * dataHandler.pagination.pageSize)
    })), [dataHandler.customers, dataHandler.pagination])

  return {
    // Data state
    customers: customersWithIndex,
    pagination: dataHandler.pagination,
    loading: dataHandler.loading,
    tab: dataHandler.tab,
    filters: dataHandler.filters,
    sortBy: dataHandler.sortBy,
    sortDirection: dataHandler.sortDirection,

    // Customer options
    customerOptions,

    // Data handlers
    fetchCustomers: dataHandler.fetchCustomers,
    handlePageChange: dataHandler.handlePageChange,
    handlePageSizeChange: dataHandler.handlePageSizeChange,
    handleTabChange: dataHandler.handleTabChange,
    handleSortChange: dataHandler.handleSortChange,

    // Filter handlers
    filterOpen: filterHandler.filterOpen,
    tempFilters: filterHandler.tempFilters,
    handleFilterToggle: filterHandler.handleFilterToggle,
    handleFilterChange: filterHandler.handleFilterChange,
    handleApplyFilter: filterHandler.handleApplyFilter,
    handleResetFilter: filterHandler.handleResetFilter,
    handleClearAllFilters: filterHandler.handleClearAllFilters,
    getActiveFilterCount: filterHandler.getActiveFilterCount,

    // Search handlers
    searchTerm: searchHandler.searchTerm,
    searching: searchHandler.searching,
    handleSearchInputChange: searchHandler.handleSearchInputChange,
    handleSearchSubmit: searchHandler.handleSearchSubmit,
    handleSearchClear: searchHandler.handleSearchClear,
    handleSearchFocus: searchHandler.handleSearchFocus,
    handleSearchBlur: searchHandler.handleSearchBlur,

    // Action handlers
    selectedCustomer: actionsHandler.selectedCustomer,
    deleteDialogOpen: actionsHandler.deleteDialogOpen,
    activateDialogOpen: actionsHandler.activateDialogOpen,
    deactivateDialogOpen: actionsHandler.deactivateDialogOpen,
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
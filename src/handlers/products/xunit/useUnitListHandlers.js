'use client'

import { useEffect } from 'react'
import { useUnitDataHandler } from './list/dataHandler'
import { useUnitActionsHandler } from './list/actionsHandler'
import { useUnitColumnsHandler } from './list/columnsHandler'
import { useUnitFilterHandler } from './list/filterHandler'

export const useUnitListHandlers = () => {
  const dataHandler = useUnitDataHandler()
  const actionsHandler = useUnitActionsHandler(
    dataHandler.fetchUnitList,
    dataHandler.page,
    dataHandler.size,
    dataHandler.setPage
  )
  const columnsHandler = useUnitColumnsHandler()
  const filterHandler = useUnitFilterHandler()

  // Fetch units on mount and when page/size changes
  useEffect(() => {
    dataHandler.fetchUnitList(dataHandler.page, dataHandler.size)
  }, [dataHandler.page, dataHandler.size])

  const handleReset = () => {
    dataHandler.setPage(1)
    dataHandler.setSize(10)
    dataHandler.setSortBy('unit')
    dataHandler.setSortDirection('asc')
    columnsHandler.resetColumns()
    dataHandler.fetchUnitList(1, 10)
  }

  return {
    // Data handlers
    unitList: dataHandler.unitList,
    setUnitList: dataHandler.setUnitList,
    totalCount: dataHandler.totalCount,
    setTotalCount: dataHandler.setTotalCount,
    loading: dataHandler.loading,
    page: dataHandler.page,
    setPage: dataHandler.setPage,
    size: dataHandler.size,
    setSize: dataHandler.setSize,
    sortBy: dataHandler.sortBy,
    sortDirection: dataHandler.sortDirection,
    fetchUnitList: dataHandler.fetchUnitList,
    handlePageChange: dataHandler.handlePageChange,
    handlePageSizeChange: dataHandler.handlePageSizeChange,
    handleSortRequest: dataHandler.handleSortRequest,

    // Actions handlers
    anchorEl: actionsHandler.anchorEl,
    selectedUnit: actionsHandler.selectedUnit,
    confirmDialog: actionsHandler.confirmDialog,
    handleMenuOpen: actionsHandler.handleMenuOpen,
    handleMenuClose: actionsHandler.handleMenuClose,
    handleDeleteClick: actionsHandler.handleDeleteClick,
    handleConfirmDelete: actionsHandler.handleConfirmDelete,
    handleCloseConfirmDialog: actionsHandler.handleCloseConfirmDialog,

    // Columns handlers
    columns: columnsHandler.columns,
    tempColumns: columnsHandler.tempColumns,
    isColumnsDrawerOpen: columnsHandler.isColumnsDrawerOpen,
    handleManageColumnsOpen: columnsHandler.handleManageColumnsOpen,
    toggleColumnVisibility: columnsHandler.toggleColumnVisibility,
    handleApplyColumns: columnsHandler.handleApplyColumns,
    handleCancelColumns: columnsHandler.handleCancelColumns,

    // Filter handlers
    isDrawerOpen: filterHandler.isDrawerOpen,
    tab: filterHandler.tab,
    toggleDrawer: filterHandler.toggleDrawer,
    handleDrawerClose: filterHandler.handleDrawerClose,
    handleTabChange: filterHandler.handleTabChange,

    // Combined handlers
    handleReset
  }
}
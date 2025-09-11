'use client'

import { useEffect } from 'react'
import { useCategoryDataHandler } from './list/dataHandler'
import { useCategoryActionsHandler } from './list/actionsHandler'
import { useCategoryColumnsHandler } from './list/columnsHandler'
import { useCategoryFilterHandler } from './list/filterHandler'

export const useCategoryListHandlers = () => {
  const dataHandler = useCategoryDataHandler()
  const actionsHandler = useCategoryActionsHandler(
    dataHandler.fetchCategoryList,
    dataHandler.page,
    dataHandler.size,
    dataHandler.setPage
  )
  const columnsHandler = useCategoryColumnsHandler()
  const filterHandler = useCategoryFilterHandler()

  // Fetch categories on mount and when page/size changes
  useEffect(() => {
    dataHandler.fetchCategoryList(dataHandler.page, dataHandler.size)
  }, [dataHandler.page, dataHandler.size])

  const handleReset = () => {
    dataHandler.setPage(1)
    dataHandler.setSize(10)
    dataHandler.setSortBy('category_name')
    dataHandler.setSortDirection('asc')
    columnsHandler.resetColumns()
    dataHandler.fetchCategoryList(1, 10)
  }

  return {
    // Data handlers
    categoryList: dataHandler.categoryList,
    setCategoryList: dataHandler.setCategoryList,
    totalCount: dataHandler.totalCount,
    setTotalCount: dataHandler.setTotalCount,
    loading: dataHandler.loading,
    page: dataHandler.page,
    setPage: dataHandler.setPage,
    size: dataHandler.size,
    setSize: dataHandler.setSize,
    sortBy: dataHandler.sortBy,
    sortDirection: dataHandler.sortDirection,
    fetchCategoryList: dataHandler.fetchCategoryList,
    handlePageChange: dataHandler.handlePageChange,
    handlePageSizeChange: dataHandler.handlePageSizeChange,
    handleSortRequest: dataHandler.handleSortRequest,

    // Actions handlers
    anchorEl: actionsHandler.anchorEl,
    selectedCategory: actionsHandler.selectedCategory,
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
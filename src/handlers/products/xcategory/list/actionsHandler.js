'use client'

import { useState, useCallback } from 'react'
import { deleteCategory } from '@/app/(dashboard)/products/actions'
import { toast } from 'react-toastify'

export const useCategoryActionsHandler = (fetchCategoryList, page, size, setPage) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, categoryId: null })

  const handleMenuOpen = useCallback((event, category) => {
    setAnchorEl(event.currentTarget)
    setSelectedCategory(category)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
    setSelectedCategory(null)
  }, [])

  const handleDeleteClick = useCallback((id) => {
    setConfirmDialog({ open: true, categoryId: id })
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    const id = confirmDialog.categoryId
    setConfirmDialog({ ...confirmDialog, open: false })
    
    try {
      const response = await deleteCategory(id)
      if (response.success) {
        await fetchCategoryList(1, size)
        setPage(1)
        toast.success("Category deleted successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      } else {
        throw new Error(response.message || "Failed to delete category")
      }
    } catch (err) {
      console.error("Error deleting category:", err)
      toast.error(err.message || "Error deleting category", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }, [confirmDialog, fetchCategoryList, size, setPage])

  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog({ ...confirmDialog, open: false })
  }, [confirmDialog])

  return {
    anchorEl,
    selectedCategory,
    confirmDialog,
    handleMenuOpen,
    handleMenuClose,
    handleDeleteClick,
    handleConfirmDelete,
    handleCloseConfirmDialog
  }
}
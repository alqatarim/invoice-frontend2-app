'use client'

import { useState, useCallback } from 'react'
import { deleteUnit } from '@/app/(dashboard)/products/actions'
import { toast } from 'react-toastify'

export const useUnitActionsHandler = (fetchUnitList, page, size, setPage) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, unitId: null })

  const handleMenuOpen = useCallback((event, unit) => {
    setAnchorEl(event.currentTarget)
    setSelectedUnit(unit)
  }, [])

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
    setSelectedUnit(null)
  }, [])

  const handleDeleteClick = useCallback((id) => {
    setConfirmDialog({ open: true, unitId: id })
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    const id = confirmDialog.unitId
    setConfirmDialog({ ...confirmDialog, open: false })
    
    try {
      const response = await deleteUnit(id)
      if (response.success) {
        await fetchUnitList(1, size)
        setPage(1)
        toast.success("Unit deleted successfully", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      } else {
        throw new Error(response.message || "Failed to delete unit")
      }
    } catch (err) {
      console.error("Error deleting unit:", err)
      toast.error(err.message || "Error deleting unit", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }, [confirmDialog, fetchUnitList, size, setPage])

  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog({ ...confirmDialog, open: false })
  }, [confirmDialog])

  return {
    anchorEl,
    selectedUnit,
    confirmDialog,
    handleMenuOpen,
    handleMenuClose,
    handleDeleteClick,
    handleConfirmDelete,
    handleCloseConfirmDialog
  }
}
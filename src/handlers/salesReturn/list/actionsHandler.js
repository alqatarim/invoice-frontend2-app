import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSalesReturn } from '@/app/(dashboard)/sales-return/actions'

/**
 * Actions handler for managing sales return actions (delete, print, etc.)
 */
export const useActionsHandler = ({ onError, onSuccess, fetchSalesReturns }) => {
  const router = useRouter()
  const [selectedSalesReturn, setSelectedSalesReturn] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Handle view navigation
  const handleView = useCallback((salesReturn) => {
    const salesReturnId = salesReturn._id
    router.push(`/sales-return/sales-return-view/${salesReturnId}`)
  }, [router])

  // Handle edit navigation
  const handleEdit = useCallback((salesReturn) => {
    const salesReturnId = salesReturn._id
    router.push(`/sales-return/sales-return-edit/${salesReturnId}`)
  }, [router])

  // Delete handlers
  const handleDeleteClick = useCallback((salesReturn) => {
    setSelectedSalesReturn(salesReturn)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedSalesReturn) return

    try {
      const response = await deleteSalesReturn(selectedSalesReturn._id)

      if (response.success) {
        onSuccess('Sales return deleted successfully')
        setDeleteDialogOpen(false)
        setSelectedSalesReturn(null)
        fetchSalesReturns()
      } else {
        throw new Error(response.message || 'Failed to delete sales return')
      }
    } catch (error) {
      console.error('Error deleting sales return:', error)
      onError(error.message || 'Failed to delete sales return')
    }
  }, [selectedSalesReturn, onError, onSuccess, fetchSalesReturns])

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false)
    setSelectedSalesReturn(null)
  }, [])

  // Print/Download handler
  const handlePrintDownload = useCallback((salesReturnId) => {
    if (!salesReturnId) {
      onError('Invalid sales return selected')
      return
    }

    // Open print/download in new window/tab
    window.open(`/sales-return/sales-return-view/${salesReturnId}?print=true`, '_blank')
  }, [onError])

  // Process refund handler
  const handleProcessRefund = useCallback((salesReturnId) => {
    if (!salesReturnId) {
      onError('Invalid sales return selected')
      return
    }

    // Navigate to refund processing page or open dialog
    router.push(`/sales-return/process-refund/${salesReturnId}`)
  }, [router, onError])

  return {
    // State
    selectedSalesReturn,
    deleteDialogOpen,

    // Navigation actions
    handleView,
    handleEdit,

    // Delete actions
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Other actions
    handlePrintDownload,
    handleProcessRefund
  }
}
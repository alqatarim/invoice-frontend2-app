import { useState, useCallback } from 'react'

/**
 * Simplified bank details handler for managing dialog state and actions
 * Form logic moved to useBankDetailsDialogHandlers for better separation
 */
export const useCustomerBankDetailsHandlers = ({ customer, onError, onSuccess, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Handle dialog open
  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true)
  }, [])

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false)
  }, [])

  // Handle successful update
  const handleUpdateSuccess = useCallback((updatedCustomer) => {
    setDialogOpen(false)
    onSuccess?.('Bank details updated successfully!')
    onUpdate?.(updatedCustomer)
  }, [onSuccess, onUpdate])

  return {
    // State
    dialogOpen,
    
    // Actions
    handleOpenDialog,
    handleCloseDialog,
    handleUpdateSuccess
  }
} 
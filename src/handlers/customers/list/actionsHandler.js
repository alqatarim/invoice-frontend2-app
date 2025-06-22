import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  deleteCustomer,
  activateCustomer,
  deactivateCustomer
} from '@/app/(dashboard)/customers/actions'

/**
 * Actions handler for managing customer actions (delete, activate, deactivate)
 */
export const useActionsHandler = ({ onError, onSuccess, fetchCustomers }) => {
  const router = useRouter()
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)

  // Handle edit navigation
  const handleEdit = useCallback((customer) => {
    const customerId = customer._id
    router.push(`/customers/edit/${customerId}`)
  }, [router])

  // Handle view navigation
  const handleView = useCallback((customer) => {
    const customerId = customer._id
    router.push(`/customers/customer-view/${customerId}`)
  }, [router])

  // Delete handlers
  const handleDeleteClick = useCallback((customer) => {
    setSelectedCustomer(customer)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedCustomer) return

    try {
      await deleteCustomer(selectedCustomer._id)
      onSuccess('Customer deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedCustomer(null)
      fetchCustomers()
    } catch (error) {
      console.error('Error deleting customer:', error)
      onError(error.message || 'Failed to delete customer')
    }
  }, [selectedCustomer, onError, onSuccess, fetchCustomers])

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false)
    setSelectedCustomer(null)
  }, [])

  // Activate handlers
  const handleActivateClick = useCallback((customer) => {
    setSelectedCustomer(customer)
    setActivateDialogOpen(true)
  }, [])

  const handleActivateConfirm = useCallback(async () => {
    if (!selectedCustomer) return

    try {
      await activateCustomer(selectedCustomer._id)
      onSuccess('Customer activated successfully')
      setActivateDialogOpen(false)
      setSelectedCustomer(null)
      fetchCustomers()
    } catch (error) {
      console.error('Error activating customer:', error)
      onError(error.message || 'Failed to activate customer')
    }
  }, [selectedCustomer, onError, onSuccess, fetchCustomers])

  const handleActivateCancel = useCallback(() => {
    setActivateDialogOpen(false)
    setSelectedCustomer(null)
  }, [])

  // Deactivate handlers
  const handleDeactivateClick = useCallback((customer) => {
    setSelectedCustomer(customer)
    setDeactivateDialogOpen(true)
  }, [])

  const handleDeactivateConfirm = useCallback(async () => {
    if (!selectedCustomer) return

    try {
      await deactivateCustomer(selectedCustomer._id)
      onSuccess('Customer deactivated successfully')
      setDeactivateDialogOpen(false)
      setSelectedCustomer(null)
      fetchCustomers()
    } catch (error) {
      console.error('Error deactivating customer:', error)
      onError(error.message || 'Failed to deactivate customer')
    }
  }, [selectedCustomer, onError, onSuccess, fetchCustomers])

  const handleDeactivateCancel = useCallback(() => {
    setDeactivateDialogOpen(false)
    setSelectedCustomer(null)
  }, [])

  // Create invoice navigation
  const handleCreateInvoice = useCallback((customerId) => {
    router.push(`/invoices/add?customerId=${customerId}`)
  }, [router])

  return {
    // State
    selectedCustomer,
    deleteDialogOpen,
    activateDialogOpen,
    deactivateDialogOpen,

    // Navigation actions
    handleEdit,
    handleView,
    handleCreateInvoice,

    // Delete actions
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Activate actions
    handleActivateClick,
    handleActivateConfirm,
    handleActivateCancel,

    // Deactivate actions
    handleDeactivateClick,
    handleDeactivateConfirm,
    handleDeactivateCancel
  }
}
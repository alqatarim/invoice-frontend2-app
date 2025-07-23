import { useState, useCallback } from 'react'
import { useCustomerDetailsHandlers } from './useCustomerDetailsHandlers'

/**
 * Customer address and billing handler for managing address and payment information
 */
export const useCustomerAddressHandlers = ({ customer, onError, onSuccess, onUpdate }) => {
  const [editMode, setEditMode] = useState({
    billingAddress: false,
    shippingAddress: false,
    bankDetails: false
  })

  // Dialog state management
  const [dialogState, setDialogState] = useState({
    billingAddress: false,
    shippingAddress: false,
    bankDetails: false
  })
  
  const [formData, setFormData] = useState({
    billingAddress: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    shippingAddress: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    bankDetails: {
      bankName: '',
      branch: '',
      accountHolderName: '',
      accountNumber: '',
      IFSC: ''
    }
  })

  // Use the customer details handler for API calls
  const { handleUpdateCustomerDetails, loading } = useCustomerDetailsHandlers({
    customer,
    onError,
    onSuccess,
    onUpdate
  })

  // Initialize form data when customer changes
  const initializeFormData = useCallback(() => {
    if (customer) {
      setFormData({
        billingAddress: {
          name: customer.billingAddress?.name || '',
          addressLine1: customer.billingAddress?.addressLine1 || '',
          addressLine2: customer.billingAddress?.addressLine2 || '',
          city: customer.billingAddress?.city || '',
          state: customer.billingAddress?.state || '',
          pincode: customer.billingAddress?.pincode || '',
          country: customer.billingAddress?.country || ''
        },
        shippingAddress: {
          name: customer.shippingAddress?.name || '',
          addressLine1: customer.shippingAddress?.addressLine1 || '',
          addressLine2: customer.shippingAddress?.addressLine2 || '',
          city: customer.shippingAddress?.city || '',
          state: customer.shippingAddress?.state || '',
          pincode: customer.shippingAddress?.pincode || '',
          country: customer.shippingAddress?.country || ''
        },
        bankDetails: {
          bankName: customer.bankDetails?.bankName || '',
          branch: customer.bankDetails?.branch || '',
          accountHolderName: customer.bankDetails?.accountHolderName || '',
          accountNumber: customer.bankDetails?.accountNumber || '',
          IFSC: customer.bankDetails?.IFSC || ''
        }
      })
    }
  }, [customer])

  // Handle edit mode toggle
  const handleEditModeToggle = useCallback((section, isEditing) => {
    setEditMode(prev => ({
      ...prev,
      [section]: isEditing
    }))
    
    if (isEditing) {
      initializeFormData()
    }
  }, [initializeFormData])

  // Dialog handlers
  const handleOpenDialog = useCallback((dialogType) => {
    setDialogState(prev => ({
      ...prev,
      [dialogType]: true
    }))
  }, [])

  const handleCloseDialog = useCallback((dialogType) => {
    setDialogState(prev => ({
      ...prev,
      [dialogType]: false
    }))
  }, [])

  // Handle billing address dialog
  const handleOpenBillingAddressDialog = useCallback(() => {
    handleOpenDialog('billingAddress')
  }, [handleOpenDialog])

  const handleCloseBillingAddressDialog = useCallback(() => {
    handleCloseDialog('billingAddress')
  }, [handleCloseDialog])

  // Handle shipping address dialog
  const handleOpenShippingAddressDialog = useCallback(() => {
    handleOpenDialog('shippingAddress')
  }, [handleOpenDialog])

  const handleCloseShippingAddressDialog = useCallback(() => {
    handleCloseDialog('shippingAddress')
  }, [handleCloseDialog])

  // Handle bank details dialog
  const handleOpenBankDetailsDialog = useCallback(() => {
    handleOpenDialog('bankDetails')
  }, [handleOpenDialog])

  const handleCloseBankDetailsDialog = useCallback(() => {
    handleCloseDialog('bankDetails')
  }, [handleCloseDialog])

  // Handle successful address update from dialog
  const handleAddressUpdateSuccess = useCallback((updatedCustomer) => {
    // Close any open dialogs
    setDialogState({
      billingAddress: false,
      shippingAddress: false,
      bankDetails: false
    })

    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedCustomer)
    }

    // Show success message
    if (onSuccess) {
      onSuccess('Address updated successfully')
    }
  }, [onUpdate, onSuccess])

  // Handle successful bank details update from dialog
  const handleBankDetailsUpdateSuccess = useCallback((updatedCustomer) => {
    // Close bank details dialog
    setDialogState(prev => ({
      ...prev,
      bankDetails: false
    }))

    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedCustomer)
    }

    // Show success message
    if (onSuccess) {
      onSuccess('Bank details updated successfully')
    }
  }, [onUpdate, onSuccess])

  // Handle dialog error
  const handleDialogError = useCallback((error) => {
    if (onError) {
      onError(error)
    }
  }, [onError])

  // Generic update success handler for dialogs
  const handleUpdateSuccess = useCallback((updatedCustomer) => {
    // Close any open dialogs
    setDialogState({
      billingAddress: false,
      shippingAddress: false,
      bankDetails: false
    })

    // Notify parent component of the update
    if (onUpdate) {
      onUpdate(updatedCustomer)
    }

    // Show success message
    if (onSuccess) {
      onSuccess('Customer updated successfully')
    }
  }, [onUpdate, onSuccess])

  // Handle field changes
  const handleFieldChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }, [])

  // Handle save for specific section
  const handleSaveSection = useCallback(async (section) => {
    try {
      const updateData = {
        [section]: formData[section]
      }
      
      await handleUpdateCustomerDetails(updateData)
      
      // Exit edit mode on successful save
      setEditMode(prev => ({
        ...prev,
        [section]: false
      }))
    } catch (error) {
      console.error(`Error updating ${section}:`, error)
    }
  }, [formData, handleUpdateCustomerDetails])

  // Handle cancel edit
  const handleCancelEdit = useCallback((section) => {
    setEditMode(prev => ({
      ...prev,
      [section]: false
    }))
    initializeFormData() // Reset form data
  }, [initializeFormData])

  // Copy billing address to shipping address
  const handleCopyBillingToShipping = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: { ...prev.billingAddress }
    }))
  }, [])

  return {
    // State
    editMode,
    formData,
    loading,
    dialogState,
    
    // Legacy actions (for existing components)
    handleEditModeToggle,
    handleFieldChange,
    handleSaveSection,
    handleCancelEdit,
    handleCopyBillingToShipping,
    initializeFormData,

    // Dialog actions (for new dialog components)
    handleOpenBillingAddressDialog,
    handleCloseBillingAddressDialog,
    handleOpenShippingAddressDialog,
    handleCloseShippingAddressDialog,
    handleOpenBankDetailsDialog,
    handleCloseBankDetailsDialog,
    handleAddressUpdateSuccess,
    handleBankDetailsUpdateSuccess,
    handleDialogError,
    handleUpdateSuccess
  }
} 
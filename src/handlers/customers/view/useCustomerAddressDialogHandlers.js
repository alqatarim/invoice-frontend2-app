import { useState, useCallback } from 'react'
import { updateCustomer } from '@/app/(dashboard)/customers/actions'

/**
 * Customer address dialog handler for managing address editing through dialog components
 */
export const useCustomerAddressDialogHandlers = ({ customer, onError, onSuccess, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [dialogState, setDialogState] = useState({
    billingAddress: false,
    shippingAddress: false
  })

  // Address form state
  const [addressForms, setAddressForms] = useState({
    billingAddress: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'US'
    },
    shippingAddress: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'US'
    }
  })

  // Initialize address forms from customer data
  const initializeAddressForms = useCallback(() => {
    if (customer) {
      setAddressForms({
        billingAddress: {
          name: customer.billingAddress?.name || customer?.name || '',
          addressLine1: customer.billingAddress?.addressLine1 || '',
          addressLine2: customer.billingAddress?.addressLine2 || '',
          city: customer.billingAddress?.city || '',
          state: customer.billingAddress?.state || '',
          pincode: customer.billingAddress?.pincode || '',
          country: customer.billingAddress?.country || 'US'
        },
        shippingAddress: {
          name: customer.shippingAddress?.name || customer?.name || '',
          addressLine1: customer.shippingAddress?.addressLine1 || '',
          addressLine2: customer.shippingAddress?.addressLine2 || '',
          city: customer.shippingAddress?.city || '',
          state: customer.shippingAddress?.state || '',
          pincode: customer.shippingAddress?.pincode || '',
          country: customer.shippingAddress?.country || 'US'
        }
      })
    }
  }, [customer])

  // Handle dialog open
  const handleOpenAddressDialog = useCallback((addressType) => {
    initializeAddressForms()
    setDialogState(prev => ({
      ...prev,
      [addressType]: true
    }))
  }, [initializeAddressForms])

  // Handle dialog close
  const handleCloseAddressDialog = useCallback((addressType) => {
    setDialogState(prev => ({
      ...prev,
      [addressType]: false
    }))
  }, [])

  // Handle billing address dialog
  const handleOpenBillingDialog = useCallback(() => {
    handleOpenAddressDialog('billingAddress')
  }, [handleOpenAddressDialog])

  const handleCloseBillingDialog = useCallback(() => {
    handleCloseAddressDialog('billingAddress')
  }, [handleCloseAddressDialog])

  // Handle shipping address dialog
  const handleOpenShippingDialog = useCallback(() => {
    handleOpenAddressDialog('shippingAddress')
  }, [handleOpenAddressDialog])

  const handleCloseShippingDialog = useCallback(() => {
    handleCloseAddressDialog('shippingAddress')
  }, [handleCloseAddressDialog])

  // Handle successful address update
  const handleAddressUpdateSuccess = useCallback((updatedCustomer, addressType) => {
    // Close the specific dialog
    setDialogState(prev => ({
      ...prev,
      [addressType]: false
    }))

    // Notify parent component
    if (onUpdate) {
      onUpdate(updatedCustomer)
    }

    // Show success message
    const addressTypeLabel = addressType === 'billingAddress' ? 'Billing' : 'Shipping'
    if (onSuccess) {
      onSuccess(`${addressTypeLabel} address updated successfully!`)
    }
  }, [onUpdate, onSuccess])

  // Handle address update error
  const handleAddressUpdateError = useCallback((error) => {
    if (onError) {
      onError(error)
    }
  }, [onError])

  // Copy billing address to shipping address
  const handleCopyBillingToShipping = useCallback(() => {
    if (customer?.billingAddress) {
      const updatedShippingAddress = { ...customer.billingAddress }
      
      // Update customer with copied address
      const updateData = {
        ...customer,
        shippingAddress: updatedShippingAddress
      }

      handleUpdateAddress('shippingAddress', updatedShippingAddress, updateData)
    }
  }, [customer])

  // Handle address update (internal method)
  const handleUpdateAddress = useCallback(async (addressType, addressData, fullUpdateData) => {
    if (!customer?._id) {
      onError('Customer ID is missing')
      return
    }

    setLoading(true)

    try {
      const result = await updateCustomer(customer._id, fullUpdateData)

      if (result.success) {
        handleAddressUpdateSuccess(result.data, addressType)
      } else {
        handleAddressUpdateError(result.message || 'Failed to update address')
      }
    } catch (error) {
      console.error('Error updating address:', error)
      handleAddressUpdateError(error.message || 'An error occurred while updating the address')
    } finally {
      setLoading(false)
    }
  }, [customer, handleAddressUpdateSuccess, handleAddressUpdateError, onError])

  // Validate address data
  const validateAddressData = useCallback((addressData) => {
    const errors = {}

    if (!addressData.name?.trim()) {
      errors.name = 'Name is required'
    }

    if (!addressData.addressLine1?.trim()) {
      errors.addressLine1 = 'Address line 1 is required'
    }

    if (!addressData.city?.trim()) {
      errors.city = 'City is required'
    }

    if (!addressData.state?.trim()) {
      errors.state = 'State is required'
    }

    if (!addressData.pincode?.trim()) {
      errors.pincode = 'Postal/ZIP code is required'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [])

  return {
    // State
    loading,
    dialogState,
    addressForms,

    // Actions
    handleOpenBillingDialog,
    handleCloseBillingDialog,
    handleOpenShippingDialog,
    handleCloseShippingDialog,
    handleAddressUpdateSuccess,
    handleAddressUpdateError,
    handleCopyBillingToShipping,
    initializeAddressForms,
    validateAddressData
  }
} 
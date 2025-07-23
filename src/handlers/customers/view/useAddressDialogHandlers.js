import { useState, useEffect, useCallback } from 'react'
import { updateCustomer } from '@/app/(dashboard)/customers/actions'

/**
 * Address dialog handler for managing address form state, validation, and submission
 */
export const useAddressDialogHandlers = ({ customer, addressType, open, onClose, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [copyToBilling, setCopyToBilling] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'US'
  })

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && customer) {
      const addressData = addressType === 'billing'
        ? customer.billingAddress
        : customer.shippingAddress

      setFormData({
        name: addressData?.name || customer?.name || '',
        addressLine1: addressData?.addressLine1 || '',
        addressLine2: addressData?.addressLine2 || '',
        city: addressData?.city || '',
        state: addressData?.state || '',
        pincode: addressData?.pincode || '',
        country: addressData?.country || 'US'
      })
      setErrors({})
      setCopyToBilling(false)
    }
  }, [open, customer, addressType])

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.addressLine1?.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required'
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'State is required'
    }

    if (!formData.pincode?.trim()) {
      newErrors.pincode = 'Postal/ZIP code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  // Handle copy to billing checkbox
  const handleCopyToBillingChange = useCallback((checked) => {
    setCopyToBilling(checked)
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      onError?.('Please fix the validation errors before submitting')
      return
    }

    if (!customer?._id) {
      onError?.('Customer ID is missing')
      return
    }

    setLoading(true)

    try {
      const updateData = {
        ...customer,
        [addressType === 'billing' ? 'billingAddress' : 'shippingAddress']: formData
      }

      // If copying shipping to billing, also update billing address
      if (addressType === 'shipping' && copyToBilling) {
        updateData.billingAddress = formData
      }

      const result = await updateCustomer(customer._id, updateData)

      if (result.success) {
        const message = copyToBilling && addressType === 'shipping'
          ? 'Shipping address updated and copied to billing address!'
          : `${addressType.charAt(0).toUpperCase() + addressType.slice(1)} address updated successfully!`
        
        onSuccess?.(result.data, message)
        onClose?.()
      } else {
        onError?.(result.message || 'Failed to update address')
      }
    } catch (error) {
      console.error('Error updating address:', error)
      onError?.(error.message || 'An error occurred while updating the address')
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, customer, addressType, copyToBilling, onSuccess, onError, onClose])

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (!loading) {
      onClose?.()
      setErrors({})
    }
  }, [loading, onClose])

  return {
    // State
    loading,
    errors,
    formData,
    copyToBilling,
    
    // Actions
    handleFieldChange,
    handleCopyToBillingChange,
    handleSubmit,
    handleClose,
    validateForm
  }
} 
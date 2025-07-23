import { useState, useEffect, useCallback } from 'react'
import { updateCustomer } from '@/app/(dashboard)/customers/actions'

/**
 * Customer details dialog handler for form management, validation, and submission
 */
export const useCustomerDetailsDialogHandlers = ({ customer, open, onClose, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    notes: ''
  })

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        website: customer.website || '',
        notes: customer.notes || ''
      })
      setErrors({})
    }
  }, [open, customer])

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Customer name is required'
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (formData.website && formData.website.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      if (!urlPattern.test(formData.website)) {
        newErrors.website = 'Please enter a valid website URL'
      }
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
        ...formData,
        website: formData.website || '',
        notes: formData.notes || ''
      }

      const result = await updateCustomer(customer._id, updateData)

      if (result.success) {
        onSuccess?.(result.data)
        setTimeout(() => onClose?.(), 1000)
      } else {
        onError?.(result.message || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      onError?.(error.message || 'An error occurred while updating the customer')
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, customer, onSuccess, onError, onClose])

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
    
    // Actions
    handleFieldChange,
    handleSubmit,
    handleClose,
    validateForm
  }
} 
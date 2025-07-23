import { useState, useEffect, useCallback } from 'react'
import { updateCustomer } from '@/app/(dashboard)/customers/actions'

/**
 * Bank details dialog handler for managing bank form state, validation, and submission
 */
export const useBankDetailsDialogHandlers = ({ customer, open, onClose, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    bankName: '',
    branch: '',
    accountHolderName: '',
    accountNumber: '',
    IFSC: ''
  })

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open && customer) {
      const bankData = customer.bankDetails || {}

      setFormData({
        bankName: bankData.bankName || '',
        branch: bankData.branch || '',
        accountHolderName: bankData.accountHolderName || customer?.name || '',
        accountNumber: bankData.accountNumber || '',
        IFSC: bankData.IFSC || ''
      })
      setErrors({})
    }
  }, [open, customer])

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {}

    if (!formData.bankName?.trim()) {
      newErrors.bankName = 'Bank name is required'
    }

    if (!formData.accountHolderName?.trim()) {
      newErrors.accountHolderName = 'Account holder name is required'
    }

    if (!formData.accountNumber?.trim()) {
      newErrors.accountNumber = 'Account number is required'
    }

    if (!formData.IFSC?.trim()) {
      newErrors.IFSC = 'IFSC/Routing code is required'
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
        bankDetails: formData
      }

      const result = await updateCustomer(customer._id, updateData)

      if (result.success) {
        onSuccess?.(result.data, 'Bank details updated successfully!')
        onClose?.()
      } else {
        onError?.(result.message || 'Failed to update bank details')
      }
    } catch (error) {
      console.error('Error updating bank details:', error)
      onError?.(error.message || 'An error occurred while updating bank details')
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
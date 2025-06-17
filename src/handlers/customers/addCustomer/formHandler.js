import { useState, useCallback } from 'react'

/**
 * Form handler for managing customer form state and validation
 */
export const useFormHandler = ({ onError }) => {
  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    website: '',
    notes: '',
    status: 'Active',
    image: null,
    
    // Billing Address
    billingAddress: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    
    // Shipping Address
    shippingAddress: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    
    // Bank Details
    bankDetails: {
      bankName: '',
      branch: '',
      accountHolderName: '',
      accountNumber: '',
      IFSC: ''
    }
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // Handle basic field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }, [errors])

  // Handle nested field changes (for addresses and bank details)
  const handleNestedFieldChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    
    // Clear nested errors
    const errorKey = `${section}.${field}`
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }))
    }
  }, [errors])

  // Handle file upload
  const handleFileChange = useCallback((file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        onError('Please select a valid image file (JPEG, JPG, or PNG)')
        return
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        onError('File size must be less than 5MB')
        return
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        image: null
      }))
    }
  }, [onError])

  // Copy billing address to shipping address
  const handleCopyBillingToShipping = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: { ...prev.billingAddress }
    }))
  }, [])

  // Handle field blur for validation
  const handleFieldBlur = useCallback((field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
    
    // Perform validation on blur
    validateField(field)
  }, [])

  // Validate individual field
  const validateField = useCallback((field) => {
    const value = formData[field]
    let error = ''
    
    switch (field) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Name is required'
        }
        break
      case 'email':
        if (!value || value.trim() === '') {
          error = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Please enter a valid email address'
        }
        break
      case 'phone':
        if (!value || value.trim() === '') {
          error = 'Phone number is required'
        } else if (!/^\d{10,15}$/.test(value.replace(/\D/g, ''))) {
          error = 'Please enter a valid phone number (10-15 digits)'
        }
        break
      default:
        break
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
    
    return error === ''
  }, [formData])

  // Validate entire form
  const validateForm = useCallback(() => {
    const fieldsToValidate = ['name', 'email', 'phone']
    let isValid = true
    const newErrors = {}
    
    fieldsToValidate.forEach(field => {
      const valid = validateField(field)
      if (!valid) {
        isValid = false
      }
    })
    
    return isValid
  }, [validateField])

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      website: '',
      notes: '',
      status: 'Active',
      image: null,
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
    setErrors({})
    setTouched({})
  }, [])

  return {
    // State
    formData,
    errors,
    touched,
    
    // Actions
    handleFieldChange,
    handleNestedFieldChange,
    handleFileChange,
    handleCopyBillingToShipping,
    handleFieldBlur,
    validateField,
    validateForm,
    resetForm,
    setFormData,
    setErrors
  }
}
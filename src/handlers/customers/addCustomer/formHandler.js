import { useState, useCallback } from 'react'
import { addCustomerSchema } from './validationSchema'

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
  const handleFieldBlur = useCallback(async (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))
    
    // Perform validation on blur
    await validateField(field)
  }, [validateField])

  // Validate individual field using Yup schema
  const validateField = useCallback(async (field) => {
    try {
      // Handle nested fields (e.g., 'billingAddress.name')
      if (field.includes('.')) {
        const [section, fieldName] = field.split('.')
        const sectionSchema = addCustomerSchema.fields[section]
        if (sectionSchema && sectionSchema.fields && sectionSchema.fields[fieldName]) {
          await sectionSchema.fields[fieldName].validate(formData[section][fieldName])
          setErrors(prev => ({
            ...prev,
            [field]: ''
          }))
          return true
        }
      } else {
        // Handle top-level fields
        const fieldSchema = addCustomerSchema.fields[field]
        if (fieldSchema) {
          await fieldSchema.validate(formData[field])
          setErrors(prev => ({
            ...prev,
            [field]: ''
          }))
          return true
        }
      }
      return true
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error.message
      }))
      return false
    }
  }, [formData])

  // Validate entire form using Yup schema
  const validateForm = useCallback(async () => {
    try {
      await addCustomerSchema.validate(formData, { abortEarly: false })
      setErrors({})
      return true
    } catch (validationErrors) {
      const newErrors = {}
      
      if (validationErrors.inner) {
        validationErrors.inner.forEach(error => {
          newErrors[error.path] = error.message
        })
      }
      
      setErrors(newErrors)
      return false
    }
  }, [formData])

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
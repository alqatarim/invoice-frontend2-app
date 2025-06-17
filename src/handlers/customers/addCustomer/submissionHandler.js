import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { addCustomer } from '@/app/(dashboard)/customers/actions'

/**
 * Submission handler for managing customer form submission
 */
export const useSubmissionHandler = ({ onError, onSuccess, validateForm, formData, resetForm }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      onError('Please fix the validation errors before submitting')
      return
    }

    setLoading(true)
    
    try {
      // Create FormData for API submission
      const submitFormData = new FormData()
      
      // Add basic fields
      submitFormData.append('name', formData.name)
      submitFormData.append('email', formData.email)
      submitFormData.append('phone', formData.phone)
      submitFormData.append('website', formData.website || '')
      submitFormData.append('notes', formData.notes || '')
      submitFormData.append('status', formData.status)
      
      // Add image file if selected
      if (formData.image) {
        submitFormData.append('image', formData.image)
      }
      
      // Add billing address
      Object.keys(formData.billingAddress).forEach(key => {
        submitFormData.append(`billingAddress[${key}]`, formData.billingAddress[key] || '')
      })
      
      // Add shipping address
      Object.keys(formData.shippingAddress).forEach(key => {
        submitFormData.append(`shippingAddress[${key}]`, formData.shippingAddress[key] || '')
      })
      
      // Add bank details
      Object.keys(formData.bankDetails).forEach(key => {
        submitFormData.append(`bankDetails[${key}]`, formData.bankDetails[key] || '')
      })

      // Submit to API
      const result = await addCustomer(submitFormData)
      
      if (result.success) {
        onSuccess(result.message || 'Customer added successfully')
        resetForm()
        
        // Navigate to customer list after a short delay
        setTimeout(() => {
          router.push('/customers/customer-list')
        }, 1000)
      } else {
        onError(result.error || 'Failed to add customer')
      }
    } catch (error) {
      console.error('Error submitting customer form:', error)
      onError(error.message || 'An error occurred while adding the customer')
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, onError, onSuccess, resetForm, router])

  // Handle save and continue
  const handleSaveAndContinue = useCallback(async (event) => {
    event.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      onError('Please fix the validation errors before submitting')
      return
    }

    setLoading(true)
    
    try {
      // Create FormData for API submission
      const submitFormData = new FormData()
      
      // Add basic fields
      submitFormData.append('name', formData.name)
      submitFormData.append('email', formData.email)
      submitFormData.append('phone', formData.phone)
      submitFormData.append('website', formData.website || '')
      submitFormData.append('notes', formData.notes || '')
      submitFormData.append('status', formData.status)
      
      // Add image file if selected
      if (formData.image) {
        submitFormData.append('image', formData.image)
      }
      
      // Add billing address
      Object.keys(formData.billingAddress).forEach(key => {
        submitFormData.append(`billingAddress[${key}]`, formData.billingAddress[key] || '')
      })
      
      // Add shipping address
      Object.keys(formData.shippingAddress).forEach(key => {
        submitFormData.append(`shippingAddress[${key}]`, formData.shippingAddress[key] || '')
      })
      
      // Add bank details
      Object.keys(formData.bankDetails).forEach(key => {
        submitFormData.append(`bankDetails[${key}]`, formData.bankDetails[key] || '')
      })

      // Submit to API
      const result = await addCustomer(submitFormData)
      
      if (result.success) {
        onSuccess(result.message || 'Customer added successfully')
        resetForm()
        // Don't navigate - stay on the form for adding another customer
      } else {
        onError(result.error || 'Failed to add customer')
      }
    } catch (error) {
      console.error('Error submitting customer form:', error)
      onError(error.message || 'An error occurred while adding the customer')
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, onError, onSuccess, resetForm])

  // Handle cancel
  const handleCancel = useCallback(() => {
    router.push('/customers/customer-list')
  }, [router])

  return {
    // State
    loading,
    
    // Actions
    handleSubmit,
    handleSaveAndContinue,
    handleCancel
  }
}
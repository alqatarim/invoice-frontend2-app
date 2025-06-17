import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updateCustomer } from '@/app/(dashboard)/customers/actions'

/**
 * Submission handler for managing customer edit form submission
 */
export const useSubmissionHandler = ({ 
  customerId, 
  onError, 
  onSuccess, 
  validateForm, 
  formData 
}) => {
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

    if (!customerId) {
      onError('Customer ID is required for updating')
      return
    }

    setLoading(true)
    
    try {
      // Create FormData for API submission
      const submitFormData = new FormData()
      
      // Add customer ID
      submitFormData.append('_id', customerId)
      
      // Add basic fields
      submitFormData.append('name', formData.name)
      submitFormData.append('email', formData.email)
      submitFormData.append('phone', formData.phone)
      submitFormData.append('website', formData.website || '')
      submitFormData.append('notes', formData.notes || '')
      submitFormData.append('status', formData.status)
      
      // Add image file if selected (new image)
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
      const result = await updateCustomer(submitFormData)
      
      if (result.success) {
        onSuccess(result.message || 'Customer updated successfully')
        
        // Navigate to customer list after a short delay
        setTimeout(() => {
          router.push('/customers/customer-list')
        }, 1000)
      } else {
        onError(result.error || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      onError(error.message || 'An error occurred while updating the customer')
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, customerId, onError, onSuccess, router])

  // Handle save and continue editing
  const handleSaveAndContinue = useCallback(async (event) => {
    event.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      onError('Please fix the validation errors before submitting')
      return
    }

    if (!customerId) {
      onError('Customer ID is required for updating')
      return
    }

    setLoading(true)
    
    try {
      // Create FormData for API submission
      const submitFormData = new FormData()
      
      // Add customer ID
      submitFormData.append('_id', customerId)
      
      // Add basic fields
      submitFormData.append('name', formData.name)
      submitFormData.append('email', formData.email)
      submitFormData.append('phone', formData.phone)
      submitFormData.append('website', formData.website || '')
      submitFormData.append('notes', formData.notes || '')
      submitFormData.append('status', formData.status)
      
      // Add image file if selected (new image)
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
      const result = await updateCustomer(submitFormData)
      
      if (result.success) {
        onSuccess(result.message || 'Customer updated successfully')
        // Don't navigate - stay on the form for continued editing
      } else {
        onError(result.error || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      onError(error.message || 'An error occurred while updating the customer')
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, customerId, onError, onSuccess])

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
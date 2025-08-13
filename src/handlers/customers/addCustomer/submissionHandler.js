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
    if (event && event.preventDefault) {
      event.preventDefault()
    }
    
    // Validate form before submission
    const isValid = await validateForm()
    if (!isValid) {
      onError('Please fix the validation errors before submitting')
      return
    }

    setLoading(true)
    
    try {
      // Create FormData matching backend expectations
      const submitFormData = new FormData()
      
      // Add image file if selected
      if (formData.image) {
        submitFormData.append('image', formData.image)
      }
      
      // Add basic fields
      submitFormData.append('name', formData.name || '')
      submitFormData.append('email', formData.email || '')
      submitFormData.append('phone', formData.phone || '')
      submitFormData.append('website', formData.website || '')
      submitFormData.append('notes', formData.notes || '')
      submitFormData.append('status', formData.status || 'Active')
      
      // Add billing address fields
      if (formData.billingAddress) {
        Object.keys(formData.billingAddress).forEach(key => {
          submitFormData.append(`billingAddress[${key}]`, formData.billingAddress[key] || '')
        })
      }
      
      // Add shipping address fields
      if (formData.shippingAddress) {
        Object.keys(formData.shippingAddress).forEach(key => {
          submitFormData.append(`shippingAddress[${key}]`, formData.shippingAddress[key] || '')
        })
      }
      
      // Add bank details fields
      if (formData.bankDetails) {
        Object.keys(formData.bankDetails).forEach(key => {
          submitFormData.append(`bankDetails[${key}]`, formData.bankDetails[key] || '')
        })
      }

      // Debug: Log what we're sending
      console.log('Form data being sent:')
      for (let [key, value] of submitFormData.entries()) {
        console.log(key, value)
      }

      // Submit to API
      const response = await addCustomer(submitFormData)
      
      console.log('API Response:', response)
      
      // Check response format matching old app (response.code == 200)
      if (response.code === 200) {
        onSuccess('Customer Added Successfully')
        resetForm()
        
        // Navigate to customer list
        setTimeout(() => {
          router.push('/customers')
        }, 1000)
      } else {
        // Handle error with proper message from response
        onError(response?.data?.message || response?.message || 'Failed to add customer')
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
    if (event && event.preventDefault) {
      event.preventDefault()
    }
    
    // Validate form before submission
    const isValid = await validateForm()
    if (!isValid) {
      onError('Please fix the validation errors before submitting')
      return
    }

    setLoading(true)
    
    try {
      // Create FormData matching backend expectations
      const submitFormData = new FormData()
      
      // Add image file if selected
      if (formData.image) {
        submitFormData.append('image', formData.image)
      }
      
      // Add basic fields
      submitFormData.append('name', formData.name || '')
      submitFormData.append('email', formData.email || '')
      submitFormData.append('phone', formData.phone || '')
      submitFormData.append('website', formData.website || '')
      submitFormData.append('notes', formData.notes || '')
      submitFormData.append('status', formData.status || 'Active')
      
      // Add billing address fields
      if (formData.billingAddress) {
        Object.keys(formData.billingAddress).forEach(key => {
          submitFormData.append(`billingAddress[${key}]`, formData.billingAddress[key] || '')
        })
      }
      
      // Add shipping address fields
      if (formData.shippingAddress) {
        Object.keys(formData.shippingAddress).forEach(key => {
          submitFormData.append(`shippingAddress[${key}]`, formData.shippingAddress[key] || '')
        })
      }
      
      // Add bank details fields
      if (formData.bankDetails) {
        Object.keys(formData.bankDetails).forEach(key => {
          submitFormData.append(`bankDetails[${key}]`, formData.bankDetails[key] || '')
        })
      }

      // Submit to API
      const response = await addCustomer(submitFormData)
      
      // Check response format matching old app (response.code == 200)
      if (response.code === 200) {
        onSuccess('Customer Added Successfully')
        resetForm()
        // Don't navigate - stay on the form for adding another customer
      } else {
        // Handle error with proper message from response
        onError(response?.data?.message || response?.message || 'Failed to add customer')
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
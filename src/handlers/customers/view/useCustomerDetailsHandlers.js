import { useState, useCallback } from 'react'
import { updateCustomer } from '@/app/(dashboard)/customers/actions'

/**
 * Customer details handler for managing customer basic information editing
 */
export const useCustomerDetailsHandlers = ({ customer, onError, onSuccess, onUpdate }) => {
  const [loading, setLoading] = useState(false)

  // Handle basic customer information update
  const handleUpdateCustomerDetails = useCallback(async (updatedData) => {
    if (!customer?._id) {
      onError('Customer ID is required for updating')
      return
    }

    setLoading(true)
    
    try {
      // Create FormData for API submission
      const formData = new FormData()
      
      // Add customer ID
      formData.append('_id', customer._id)
      
      // Add updated fields
      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] !== null && updatedData[key] !== undefined) {
          if (typeof updatedData[key] === 'object' && updatedData[key] !== null) {
            // Handle nested objects like addresses
            Object.keys(updatedData[key]).forEach(nestedKey => {
              formData.append(`${key}[${nestedKey}]`, updatedData[key][nestedKey] || '')
            })
          } else {
            formData.append(key, updatedData[key])
          }
        }
      })

      // Submit to API
      const result = await updateCustomer(formData)
      
      if (result.success) {
        onSuccess(result.message || 'Customer updated successfully')
        
        // Notify parent component to refresh data
        if (onUpdate) {
          onUpdate(result.data)
        }
      } else {
        onError(result.error || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      onError(error.message || 'An error occurred while updating the customer')
    } finally {
      setLoading(false)
    }
  }, [customer, onError, onSuccess, onUpdate])

  // Handle image upload
  const handleImageUpdate = useCallback(async (imageFile) => {
    if (!customer?._id) {
      onError('Customer ID is required for updating')
      return
    }

    // Validate file
    if (imageFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(imageFile.type)) {
        onError('Please select a valid image file (JPEG, JPG, or PNG)')
        return
      }
      
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (imageFile.size > maxSize) {
        onError('File size must be less than 5MB')
        return
      }
    }

    const formData = new FormData()
    formData.append('_id', customer._id)
    if (imageFile) {
      formData.append('image', imageFile)
    }

    await handleUpdateCustomerDetails({ image: imageFile })
  }, [customer, onError, handleUpdateCustomerDetails])

  // Handle status change
  const handleStatusChange = useCallback(async (newStatus) => {
    await handleUpdateCustomerDetails({ status: newStatus })
  }, [handleUpdateCustomerDetails])

  return {
    // State
    loading,
    
    // Actions
    handleUpdateCustomerDetails,
    handleImageUpdate,
    handleStatusChange
  }
} 
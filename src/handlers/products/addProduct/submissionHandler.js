'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { addProduct } from '@/app/(dashboard)/products/actions'

export const useProductSubmissionHandler = (formData, validateForm, resetForm) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    const isValid = await validateForm()
    if (!isValid) {
      toast.error('Please fix the form errors')
      return
    }

    setLoading(true)
    
    try {
      const formDataToSend = new FormData()
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          if (key === 'images' && formData[key] instanceof File) {
            formDataToSend.append(key, formData[key])
          } else if (key !== 'images') {
            formDataToSend.append(key, formData[key])
          }
        }
      })

      const response = await addProduct(formDataToSend)
      
      if (response.success) {
        toast.success('Product added successfully')
        resetForm()
        router.push('/products/product-list')
      } else {
        throw new Error(response.error || 'Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error(error.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }, [formData, validateForm, resetForm, router])

  return {
    loading,
    handleSubmit
  }
}
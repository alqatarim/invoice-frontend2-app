'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'

const addCategorySchema = yup.object().shape({
  category_name: yup.string().required('Category name is required').min(2, 'Category name must be at least 2 characters'),
  status: yup.boolean()
})

export const useAddCategoryHandlers = ({ onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addCategorySchema),
    defaultValues: {
      category_name: '',
      status: true
    }
  })

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Convert form data to FormData
      const formData = new FormData()
      
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          if (key === 'status') {
            // Don't include status as it defaults to active
            return
          } else {
            formData.append(key, data[key])
          }
        }
      })

      const result = await onSave(formData)
      return result
    } catch (error) {
      console.error('Error adding category:', error)
      return { success: false, error: error.message }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    control,
    handleSubmit,
    watch,
    errors,
    isSubmitting,
    handleFormSubmit,
    reset,
  }
}
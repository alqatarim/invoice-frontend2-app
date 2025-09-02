'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react'

const editCategorySchema = yup.object().shape({
  category_name: yup.string().required('Category name is required').min(2, 'Category name must be at least 2 characters'),
  status: yup.boolean()
})

export const useEditCategoryHandlers = ({ categoryData, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editCategorySchema),
    defaultValues: {
      category_name: '',
      status: true
    }
  })

  // Reset form when category data changes
  useEffect(() => {
    if (categoryData) {
      reset({
        category_name: categoryData.category_name || '',
        status: !categoryData.isDeleted
      })
    }
  }, [categoryData, reset])

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const result = await onSave(data)
      return result
    } catch (error) {
      console.error('Error updating category:', error)
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

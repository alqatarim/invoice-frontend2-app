'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react'

const editUnitSchema = yup.object().shape({
  unit: yup.string().required('Unit name is required').min(1, 'Unit name must be at least 1 character'),
  status: yup.boolean()
})

export const useEditUnitHandlers = ({ unitData, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editUnitSchema),
    defaultValues: {
      unit: '',
      status: true
    }
  })

  // Reset form when unit data changes
  useEffect(() => {
    if (unitData) {
      reset({
        unit: unitData.unit || '',
        status: !unitData.isDeleted
      })
    }
  }, [unitData, reset])

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // Convert form data to FormData
      const formData = new FormData()
      
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          if (key === 'status') {
            // Convert status to isDeleted
            formData.append('isDeleted', !data[key])
          } else {
            formData.append(key, data[key])
          }
        }
      })

      const result = await onSave(formData)
      return result
    } catch (error) {
      console.error('Error updating unit:', error)
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
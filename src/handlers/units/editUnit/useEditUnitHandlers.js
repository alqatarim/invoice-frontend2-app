'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react'

const editUnitSchema= yup.object().shape({
  name: yup.string().required('Unit name is required').min(2, 'Unit name must be at least 2 characters'),
  symbol: yup.string().required('Unit symbol is required').min(1, 'Unit symbol must be at least 2 characters')
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
      name: '',
      symbol: ''
    }
  })

  // Reset form when unit data changes
  useEffect(() => {
    if (unitData && typeof unitData === 'object') {
      reset({
        name: unitData.name || '',
        symbol: unitData.symbol || ''
      })
    }
  }, [unitData, reset])

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const result = await onSave(data)
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

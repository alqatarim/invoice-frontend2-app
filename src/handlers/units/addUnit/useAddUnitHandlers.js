'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'

const addUnitSchema = yup.object().shape({
  name: yup.string().required('Unit name is required').min(2, 'Unit name must be at least 2 characters'),
  symbol: yup.string().required('Unit symbol is required').min(1, 'Unit symbol must be at least 2 characters')
})

export const useAddUnitHandlers = ({ onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addUnitSchema),
    defaultValues: {
      name: '',
      symbol: ''
    }
  })

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const result = await onSave(data)
      return result
    } catch (error) {
      console.error('Error adding unit:', error)
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

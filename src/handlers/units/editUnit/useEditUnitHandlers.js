'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react'

const editUnitSchema= yup.object().shape({
  name: yup.string().required('Unit name is required').min(2, 'Unit name must be at least 2 characters'),
  symbol: yup.string().required('Unit symbol is required').min(1, 'Unit symbol must be at least 2 characters'),
  baseUnit: yup.string().nullable(),
  conversionFactor: yup
    .number()
    .typeError('Conversion factor must be a number')
    .positive('Conversion factor must be greater than 0')
    .nullable(),
  decimalPrecision: yup
    .number()
    .typeError('Precision must be a number')
    .integer('Precision must be a whole number')
    .min(0, 'Precision must be at least 0')
    .max(6, 'Precision cannot exceed 6')
    .nullable(),
  roundingMethod: yup.string().nullable(),
  standardUnitCode: yup.string().nullable(),
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
      name: '',
      symbol: '',
      baseUnit: '',
      conversionFactor: 1,
      decimalPrecision: 2,
      roundingMethod: 'round',
      standardUnitCode: '',
      status: true
    }
  })

  // Reset form when unit data changes
  useEffect(() => {
    if (unitData && typeof unitData === 'object') {
      reset({
        name: unitData.name || '',
        symbol: unitData.symbol || '',
        baseUnit: unitData.baseUnit?._id || unitData.baseUnit || '',
        conversionFactor: unitData.conversionFactor ?? 1,
        decimalPrecision: unitData.decimalPrecision ?? 2,
        roundingMethod: unitData.roundingMethod || 'round',
        standardUnitCode: unitData.standardUnitCode || '',
        status: unitData.status !== false
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

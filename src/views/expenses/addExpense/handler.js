'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import dayjs from 'dayjs'

import { validateExpenseAttachment } from '@/utils/fileUtils'

const addExpenseSchema = yup.object().shape({
  expenseId: yup.string().required('Expense ID is required'),
  reference: yup.string(),
  amount: yup.number().required('Amount is required').positive('Amount must be positive'),
  paymentMode: yup.string().required('Payment mode is required'),
  expenseDate: yup.date().required('Expense date is required'),
  status: yup.string().required('Payment status is required'),
  attachment: yup.mixed()
})

export const useAddExpenseHandlers = ({ expenseNumber, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageError, setImageError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addExpenseSchema),
    defaultValues: {
      expenseId: expenseNumber || '',
      reference: '',
      amount: '',
      paymentMode: '',
      expenseDate: dayjs(),
      status: '',
      attachment: null
    }
  })

  useEffect(() => {
    if (!expenseNumber) return
    setValue('expenseId', expenseNumber)
  }, [expenseNumber, setValue])

  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validation = await validateExpenseAttachment(file)

    if (validation.isValid) {
      setImagePreview(validation.preview)
      setSelectedFile(file)
      setImageError('')
    } else {
      setImageError(validation.error)
      setImagePreview(null)
      setSelectedFile(null)
    }
  }

  const handleImageError = () => {
    setImagePreview(null)
    setImageError('')
  }

  const handleImageDelete = () => {
    setImagePreview(null)
    setSelectedFile(null)
    setImageError('')
    setValue('attachment', null)
  }

  const handleDragEnter = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    const files = event.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      const validation = await validateExpenseAttachment(file)

      if (validation.isValid) {
        setImagePreview(validation.preview)
        setSelectedFile(file)
        setImageError('')
        setValue('attachment', file)
      } else {
        setImageError(validation.error)
        setImagePreview(null)
        setSelectedFile(null)
      }
    }
  }

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      let preparedAttachment = null

      if (selectedFile) {
        const reader = new FileReader()
        const base64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(selectedFile)
        })

        preparedAttachment = {
          base64,
          type: selectedFile.type,
          name: selectedFile.name
        }
      }

      const { attachment, ...expenseData } = data
      const result = await onSave(expenseData, preparedAttachment)
      return result
    } catch (error) {
      console.error('Error adding expense:', error)
      return { success: false, error: error.message }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    reset()
    setImagePreview(null)
    setSelectedFile(null)
    setImageError('')
    setIsDragging(false)
  }

  return {
    control,
    handleSubmit,
    watch,
    errors,
    isSubmitting,
    handleFormSubmit,
    reset: resetForm,
    imagePreview,
    selectedFile,
    imageError,
    handleImageChange,
    handleImageError,
    handleImageDelete,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    setValue,
  }
}

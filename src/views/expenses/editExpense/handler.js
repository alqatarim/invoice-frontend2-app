'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import dayjs from 'dayjs'

import { normalizeFileSource, validateExpenseAttachment } from '@/utils/fileUtils'

const editExpenseSchema = yup.object().shape({
  expenseId: yup.string().required('Expense ID is required'),
  reference: yup.string(),
  amount: yup.number().required('Amount is required').positive('Amount must be positive'),
  paymentMode: yup.string().required('Payment mode is required'),
  expenseDate: yup.date().required('Expense date is required'),
  status: yup.string().required('Payment status is required'),
  attachment: yup.mixed()
})

export const useEditExpenseHandlers = ({ expenseData, onSave }) => {
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editExpenseSchema),
    defaultValues: {
      expenseId: '',
      reference: '',
      amount: '',
      paymentMode: '',
      expenseDate: dayjs(),
      status: '',
      attachment: null
    }
  })

  useEffect(() => {
    if (expenseData && typeof expenseData === 'object') {
      setImagePreview(normalizeFileSource(expenseData.expenseDetails?.attachment))
      setSelectedFile(null)
      setImageError('')

      reset({
        expenseId: expenseData.expenseDetails?.expenseId || '',
        reference: expenseData.expenseDetails?.reference || '',
        amount: expenseData.expenseDetails?.amount || '',
        paymentMode: expenseData.expenseDetails?.paymentMode || '',
        expenseDate: expenseData.expenseDetails?.expenseDate ? dayjs(expenseData.expenseDetails.expenseDate) : dayjs(),
        status: expenseData.expenseDetails?.status || '',
        attachment: null
      })
    }
  }, [expenseData, reset])

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
      setImagePreview(normalizeFileSource(expenseData?.expenseDetails?.attachment))
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
      } else {
        setImageError(validation.error)
        setImagePreview(normalizeFileSource(expenseData?.expenseDetails?.attachment))
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

      const { attachment, ...nextExpenseData } = data
      const result = await onSave(nextExpenseData, preparedAttachment)
      return result
    } catch (error) {
      console.error('Error updating expense:', error)
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
  }
}

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { validateProductImage } from '@/utils/fileUtils'
import { categorySchema, DEFAULT_CATEGORY_FORM_VALUES } from './schema'

export const useCategoryHandler = ({
  mode = 'add',
  open,
  categoryId = null,
  onClose,
  onSave,
  initialCategoryData = null,
  initialDropdownOptions = { categories: [], taxes: [] },
  initialLoading = false,
  initialError = null,
  initialOptionsLoading = false,
  onRetry
}) => {
  const [categoryData, setCategoryData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageError, setImageError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const loading = initialLoading
  const error = initialError
  const dropdownOptions = initialDropdownOptions
  const optionsLoading = initialOptionsLoading

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: DEFAULT_CATEGORY_FORM_VALUES
  })

  const resetFormState = useCallback(() => {
    reset(DEFAULT_CATEGORY_FORM_VALUES)
    setImagePreview(null)
    setSelectedFile(null)
    setImageError('')
    setIsDragging(false)
    setCategoryData(null)
  }, [reset])

  const applyCategoryData = useCallback(nextCategoryData => {
    setCategoryData(nextCategoryData)
    setImagePreview(nextCategoryData?.image || null)
    setSelectedFile(null)
    setImageError('')

    reset({
      name: nextCategoryData?.name || '',
      slug: nextCategoryData?.slug || '',
      parentCategory: nextCategoryData?.parentCategory?._id || nextCategoryData?.parentCategory || '',
      tax: nextCategoryData?.tax?._id || nextCategoryData?.tax || '',
      status: nextCategoryData?.status !== false
    })
  }, [reset])

  useEffect(() => {
    if (!open) {
      return
    }

    if (mode === 'edit' || mode === 'view') {
      if (initialCategoryData && typeof initialCategoryData === 'object') {
        applyCategoryData(initialCategoryData)
      } else if (!loading) {
        setCategoryData(null)
        setImagePreview(null)
        setSelectedFile(null)
        setImageError('')
      }

      return
    }

    resetFormState()
  }, [applyCategoryData, initialCategoryData, loading, mode, open, resetFormState])

  const fallbackImagePreview = mode !== 'add' ? categoryData?.image || null : null

  const handleImageChange = useCallback(async event => {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    const validation = await validateProductImage(file)

    if (validation.isValid) {
      setImagePreview(validation.preview)
      setSelectedFile(file)
      setImageError('')
      return
    }

    setImageError(validation.error)
    setImagePreview(fallbackImagePreview)
    setSelectedFile(null)
  }, [fallbackImagePreview])

  const handleImageError = useCallback(() => {
    setImagePreview(null)
    setImageError('')
  }, [])

  const handleImageDelete = useCallback(() => {
    setImagePreview(null)
    setSelectedFile(null)
    setImageError('')
  }, [])

  const handleDragEnter = useCallback(event => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(event => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback(event => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDrop = useCallback(async event => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setImageError('Please drop an image file (PNG, JPG, etc.)')
      return
    }

    const validation = await validateProductImage(file)

    if (validation.isValid) {
      setImagePreview(validation.preview)
      setSelectedFile(file)
      setImageError('')
      return
    }

    setImageError(validation.error)
    setImagePreview(fallbackImagePreview)
    setSelectedFile(null)
  }, [fallbackImagePreview])

  const handleClose = useCallback(() => {
    if (isSubmitting) {
      return
    }

    resetFormState()
    onClose?.()
  }, [isSubmitting, onClose, resetFormState])

  const handleFormSubmit = useCallback(async data => {
    setIsSubmitting(true)

    try {
      let preparedImage = null

      if (selectedFile) {
        const reader = new FileReader()
        const base64 = await new Promise(resolve => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(selectedFile)
        })

        preparedImage = {
          base64,
          type: selectedFile.type,
          name: selectedFile.name
        }
      }

      const { images, ...formData } = data
      const result = await onSave?.({
        mode,
        categoryId,
        formData,
        preparedImage
      })

      if (result?.success) {
        resetFormState()
        onClose?.()
      }

      return result
    } catch (submitError) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'adding'} category:`, submitError)
      return { success: false, error: submitError.message }
    } finally {
      setIsSubmitting(false)
    }
  }, [categoryId, mode, onClose, onSave, resetFormState, selectedFile])

  const parentOptions = useMemo(
    () => (dropdownOptions.categories || []).filter(category => category._id !== categoryId),
    [categoryId, dropdownOptions.categories]
  )

  return {
    mode,
    control,
    handleSubmit,
    errors,
    isSubmitting,
    handleFormSubmit,
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
    loading,
    error,
    handleClose,
    retryLoad: onRetry,
    optionsLoading,
    dropdownOptions,
    parentOptions,
    categoryData
  }
}

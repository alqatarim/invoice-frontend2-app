'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
import { validateProductImage } from '@/utils/fileUtils'

const addCategorySchema = yup.object().shape({
  name: yup.string().required('Category name is required').min(2, 'Category name must be at least 2 characters'),
  slug: yup.string().required('Category slug is required').min(2, 'Category slug must be at least 2 characters')
})

export const useAddCategoryHandlers = ({ onSave }) => {
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
    resolver: yupResolver(addCategorySchema),
    defaultValues: {
      name: '',
      slug: ''
    }
  })

  // Image validation and handling using extracted utility
  const handleImageChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const validation = await validateProductImage(file)

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
  }

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        const validation = await validateProductImage(file)

        if (validation.isValid) {
          setImagePreview(validation.preview)
          setSelectedFile(file)
          setImageError('')
        } else {
          setImageError(validation.error)
          setImagePreview(null)
          setSelectedFile(null)
        }
      } else {
        setImageError('Please drop an image file (PNG, JPG, etc.)')
      }
    }
  }

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      let preparedImage = null;
      
      // Handle image if a new file was selected
      if (selectedFile) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(selectedFile);
        });
        
        preparedImage = {
          base64,
          type: selectedFile.type,
          name: selectedFile.name
        };
      }

      // Remove images from data object
      const { images, ...categoryData } = data;

      const result = await onSave(categoryData, preparedImage)
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

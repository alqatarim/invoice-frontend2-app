'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react'
import { productTypes, discountTypes } from '@/data/dataSets'
import { validateProductImage } from '@/utils/fileUtils'

const editProductSchema = yup.object().shape({
  type: yup.string().required('Type is required'),
  name: yup.string().required('Product name is required').min(2, 'Product name must be at least 2 characters'),
  category: yup.string().required('Category is required'),
  sellingPrice: yup.number().required('Selling price is required').positive('Selling price must be positive'),
  purchasePrice: yup.number().required('Purchase price is required').positive('Purchase price must be positive'),
  discountValue: yup.number().min(0, 'Discount value must be non-negative'),
  discountType: yup.number(),
  units: yup.string().required('Unit is required'),
  barcode: yup.string(),
  alertQuantity: yup.number().min(0, 'Alert quantity must be non-negative'),
  tax: yup.string(),
  productDescription: yup.string()
})

export const useEditProductHandlers = ({ productData, dropdownData, onSave }) => {
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
    resolver: yupResolver(editProductSchema),
    defaultValues: {
      type: 'product',
      name: '',
      sku: '',
      category: '',
      sellingPrice: '',
      purchasePrice: '',
      discountValue: 0,
      discountType: 2,
      units: '',
      barcode: '',
      alertQuantity: '',
      tax: '',
      productDescription: ''
    }
  })

  // Reset form when product data changes
  useEffect(() => {
    if (productData && typeof productData === 'object') {
      // Set image preview if product has existing image
      setImagePreview(productData.images || null)
      setSelectedFile(null)
      setImageError('')
      
      reset({
        type: productData.type || 'product',
        name: productData.name || '',
        sku: productData.sku || '',
        category: productData.category?._id || productData.category || '',
        sellingPrice: productData.sellingPrice || '',
        purchasePrice: productData.purchasePrice || '',
        discountValue: productData.discountValue || 0,
        discountType: productData.discountType || 2,
        units: productData.units?._id || productData.units || '',
        barcode: productData.barcode || '',
        alertQuantity: productData.alertQuantity || '',
        tax: productData.tax?._id || productData.tax || '',
        productDescription: productData.productDescription || ''
   
      })
    }
  }, [productData, reset])

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
      setImagePreview(productData?.images || null) // Fallback to existing image
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
          setImagePreview(productData?.images || null)
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
      const { images, ...productPayload } = data;
      const result = await onSave(productPayload, preparedImage)
      return result
    } catch (error) {
      console.error('Error updating product:', error)
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
    productTypes,
    discountTypes,
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
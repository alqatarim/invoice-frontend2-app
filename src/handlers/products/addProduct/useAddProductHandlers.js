'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
import { productTypes, discountTypes } from '@/data/dataSets'

const addProductSchema = yup.object().shape({
  type: yup.string().required('Type is required'),
  name: yup.string().required('Product name is required').min(2, 'Product name must be at least 2 characters'),
  category: yup.string().required('Category is required'),
  sellingPrice: yup.number().required('Selling price is required').positive('Selling price must be positive'),
  purchasePrice: yup.number().required('Purchase price is required').positive('Purchase price must be positive'),
  discountValue: yup.number().min(0, 'Discount value must be non-negative'),
  discountType: yup.string(),
  units: yup.string().required('Unit is required'),
  barcode: yup.string(),
  alertQuantity: yup.number().min(0, 'Alert quantity must be non-negative'),
  tax: yup.string(),
  productDescription: yup.string(),
  status: yup.boolean()
})

export const useAddProductHandlers = ({ dropdownData, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addProductSchema),
    defaultValues: {
      type: 'product',
      name: '',
      sku: '',
      category: '',
      sellingPrice: '',
      purchasePrice: '',
      discountValue: '',
      discountType: 'Percentage',
      units: '',
      barcode: '',
      alertQuantity: '',
      tax: '',
      productDescription: '',
      images: null,
      status: true
    }
  })

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      let preparedImage = null;
      
      // Handle image if provided
      if (data.images && data.images instanceof File) {
        const reader = new FileReader();
        const base64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(data.images);
        });
        
        preparedImage = {
          base64,
          type: data.images.type,
          name: data.images.name
        };
      }

      // Remove images from data object
      const { images, ...productData } = data;

      const result = await onSave(productData, preparedImage)
      return result
    } catch (error) {
      console.error('Error adding product:', error)
      return { success: false, error: error.message }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    reset()
    setImagePreview(null)
  }

  return {
    control,
    handleSubmit,
    watch,
    errors,
    isSubmitting,
    handleFormSubmit,
    reset: resetForm,
    productTypes,
    discountTypes,
    imagePreview,
    handleImageChange,
    setValue,
  }
}
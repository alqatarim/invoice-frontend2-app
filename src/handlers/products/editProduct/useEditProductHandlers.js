'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react'
import { productTypes, discountTypes } from '@/data/dataSets'

const editProductSchema = yup.object().shape({
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

export const useEditProductHandlers = ({ productData, dropdownData, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      discountValue: '',
      discountType: 'Percentage',
      units: '',
      barcode: '',
      alertQuantity: '',
      tax: '',
      productDescription: '',
      status: true
    }
  })

  // Reset form when product data changes
  useEffect(() => {
    if (productData && typeof productData === 'object') {
      reset({
        type: productData.type || 'product',
        name: productData.name || '',
        sku: productData.sku || '',
        category: productData.category?._id || productData.category || '',
        sellingPrice: productData.sellingPrice || '',
        purchasePrice: productData.purchasePrice || '',
        discountValue: productData.discountValue || '',
        discountType: productData.discountType || 'Percentage',
        units: productData.units?._id || productData.units || '',
        barcode: productData.barcode || '',
        alertQuantity: productData.alertQuantity || '',
        tax: productData.tax?._id || productData.tax || '',
        productDescription: productData.productDescription || '',
        status: productData.isDeleted !== undefined ? !productData.isDeleted : true
      })
    }
  }, [productData, reset])

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
  }
}
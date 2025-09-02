'use client'

import { useState, useCallback } from 'react'
import * as Yup from 'yup'

const productSchema = Yup.object().shape({
  type: Yup.string().required('Type is required'),
  name: Yup.string().required('Product name is required').min(2, 'Product name must be at least 2 characters'),
  category: Yup.string().required('Category is required'),
  sellingPrice: Yup.number().required('Selling price is required').positive('Selling price must be positive'),
  purchasePrice: Yup.number().required('Purchase price is required').positive('Purchase price must be positive'),
  discountValue: Yup.number().min(0, 'Discount value must be non-negative'),
  discountType: Yup.string(),
  units: Yup.string().required('Unit is required'),
  barcode: Yup.string(),
  alertQuantity: Yup.number().min(0, 'Alert quantity must be non-negative'),
  tax: Yup.string(),
  productDescription: Yup.string()
})

export const useProductFormHandler = (dropdownData = {}) => {
  const [formData, setFormData] = useState({
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
    images: null
  })

  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)

  const handleChange = useCallback((e) => {
    const { name, value, type, files } = e.target
    
    if (type === 'file') {
      const file = files[0]
      setFormData(prev => ({ ...prev, [name]: file }))
      
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(async () => {
    try {
      await productSchema.validate(formData, { abortEarly: false })
      setErrors({})
      return true
    } catch (err) {
      const validationErrors = {}
      if (err.inner) {
        err.inner.forEach(error => {
          validationErrors[error.path] = error.message
        })
      }
      setErrors(validationErrors)
      return false
    }
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData({
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
      images: null
    })
    setErrors({})
    setImagePreview(null)
  }, [])

  return {
    formData,
    setFormData,
    errors,
    imagePreview,
    handleChange,
    validateForm,
    resetForm
  }
}
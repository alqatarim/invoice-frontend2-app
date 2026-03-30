'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import * as yup from 'yup'
import { addCustomer } from '@/app/(dashboard)/customers/actions'

const addCustomerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Enter Name')
    .max(50, 'Name must be at most 50 characters'),
  email: yup
    .string()
    .email('Enter Valid Email')
    .required('Enter Email'),
  phone: yup
    .string()
    .required('Enter Phone number')
    .max(15, 'Phone Number Must Be At Most 15 Digits')
    .matches(/^\+?[1-9]\d*$/, 'Invalid Phone Number'),
  website: yup.string().url('Enter valid website URL').nullable(),
  notes: yup.string().nullable(),
  status: yup.string().oneOf(['Active', 'Deactive']).default('Active'),
  billingAddress: yup.object().shape({
    name: yup.string().required('Enter Name'),
    addressLine1: yup.string().required('Enter Address Line 1'),
    addressLine2: yup.string().required('Enter Address Line 2'),
    city: yup.string().required('Enter City'),
    state: yup.string().required('Enter State'),
    country: yup.string().required('Enter Country'),
    pincode: yup.string().required('Enter Pincode')
  }),
  shippingAddress: yup.object().shape({
    name: yup.string().required('Enter Name'),
    addressLine1: yup.string().required('Enter Address Line 1'),
    addressLine2: yup.string().required('Enter Address Line 2'),
    city: yup.string().required('Enter City'),
    state: yup.string().required('Enter State'),
    country: yup.string().required('Enter Country'),
    pincode: yup.string().required('Enter Pincode')
  }),
  bankDetails: yup.object().shape({
    bankName: yup.string(),
    branch: yup.string(),
    accountHolderName: yup.string(),
    accountNumber: yup.string(),
    IFSC: yup.string().max(15, 'IFSC must be at most 15 characters')
  })
})

const INITIAL_FORM_DATA = {
  name: '',
  email: '',
  phone: '',
  website: '',
  notes: '',
  status: 'Active',
  image: null,
  billingAddress: {
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: ''
  },
  shippingAddress: {
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: ''
  },
  bankDetails: {
    bankName: '',
    branch: '',
    accountHolderName: '',
    accountNumber: '',
    IFSC: ''
  }
}

const buildCustomerFormData = formData => {
  const submitFormData = new FormData()

  if (formData.image) {
    submitFormData.append('image', formData.image)
  }

  submitFormData.append('name', formData.name || '')
  submitFormData.append('email', formData.email || '')
  submitFormData.append('phone', formData.phone || '')
  submitFormData.append('website', formData.website || '')
  submitFormData.append('notes', formData.notes || '')
  submitFormData.append('status', formData.status || 'Active')

  Object.keys(formData.billingAddress || {}).forEach(key => {
    submitFormData.append(`billingAddress[${key}]`, formData.billingAddress[key] || '')
  })

  Object.keys(formData.shippingAddress || {}).forEach(key => {
    submitFormData.append(`shippingAddress[${key}]`, formData.shippingAddress[key] || '')
  })

  Object.keys(formData.bankDetails || {}).forEach(key => {
    submitFormData.append(`bankDetails[${key}]`, formData.bankDetails[key] || '')
  })

  return submitFormData
}

export const useAddCustomerHandler = ({ onError, onSuccess }) => {
  const router = useRouter()
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)

  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }, [errors])

  const handleNestedFieldChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))

    const errorKey = `${section}.${field}`

    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }))
    }
  }, [errors])

  const handleFileChange = useCallback((file) => {
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']

      if (!allowedTypes.includes(file.type)) {
        onError('Please select a valid image file (JPEG, JPG, or PNG)')
        return
      }

      const maxSize = 5 * 1024 * 1024

      if (file.size > maxSize) {
        onError('File size must be less than 5MB')
        return
      }
    }

    setFormData(prev => ({
      ...prev,
      image: file || null
    }))
  }, [onError])

  const handleCopyBillingToShipping = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: { ...prev.billingAddress }
    }))
  }, [])

  const validateField = useCallback(async (field) => {
    try {
      if (field.includes('.')) {
        const [section, fieldName] = field.split('.')
        const sectionSchema = addCustomerSchema.fields[section]

        if (sectionSchema?.fields?.[fieldName]) {
          await sectionSchema.fields[fieldName].validate(formData[section][fieldName])
        }
      } else if (addCustomerSchema.fields[field]) {
        await addCustomerSchema.fields[field].validate(formData[field])
      }

      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))

      return true
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error.message
      }))

      return false
    }
  }, [formData])

  const handleFieldBlur = useCallback(async (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))

    await validateField(field)
  }, [validateField])

  const validateForm = useCallback(async () => {
    try {
      await addCustomerSchema.validate(formData, { abortEarly: false })
      setErrors({})
      return true
    } catch (validationErrors) {
      const nextErrors = {}

      validationErrors.inner?.forEach(error => {
        nextErrors[error.path] = error.message
      })

      setErrors(nextErrors)
      return false
    }
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA)
    setErrors({})
    setTouched({})
  }, [])

  const submitCustomer = useCallback(async (shouldStayOnForm = false) => {
    const isValid = await validateForm()

    if (!isValid) {
      onError('Please fix the validation errors before submitting')
      return
    }

    setLoading(true)

    try {
      const response = await addCustomer(buildCustomerFormData(formData))

      if (response.code === 200) {
        onSuccess('Customer Added Successfully')
        resetForm()

        if (!shouldStayOnForm) {
          setTimeout(() => {
            router.push('/customers/customer-list')
          }, 1000)
        }

        return
      }

      onError(response?.data?.message || response?.message || 'Failed to add customer')
    } catch (error) {
      console.error('Error submitting customer form:', error)
      onError(error.message || 'An error occurred while adding the customer')
    } finally {
      setLoading(false)
    }
  }, [formData, onError, onSuccess, resetForm, router, validateForm])

  const handleSubmit = useCallback(async event => {
    if (event?.preventDefault) {
      event.preventDefault()
    }

    await submitCustomer(false)
  }, [submitCustomer])

  const handleSaveAndContinue = useCallback(async event => {
    if (event?.preventDefault) {
      event.preventDefault()
    }

    await submitCustomer(true)
  }, [submitCustomer])

  const handleCancel = useCallback(() => {
    router.push('/customers/customer-list')
  }, [router])

  return {
    formData,
    errors,
    touched,
    loading,
    handleFieldChange,
    handleNestedFieldChange,
    handleFileChange,
    handleCopyBillingToShipping,
    handleFieldBlur,
    validateField,
    validateForm,
    resetForm,
    setFormData,
    setErrors,
    handleSubmit,
    handleSaveAndContinue,
    handleCancel
  }
}

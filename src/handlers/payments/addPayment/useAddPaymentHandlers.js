'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useState } from 'react'
import dayjs from 'dayjs'

const addPaymentSchema = yup.object().shape({
     paymentNumber: yup.string().required('Payment number is required'),
     customerId: yup.string().required('Customer is required'),
     invoiceId: yup.string().required('Invoice number is required'),
     amount: yup.number().required('Amount is required').positive('Amount must be positive'),
     paymentMethod: yup.string().required('Payment method is required'),
     date: yup.date().required('Payment date is required'),
     reference: yup.string(),
     description: yup.string()
     // Note: status is auto-determined by backend based on payment_method
})

export const useAddPaymentHandlers = ({ paymentNumber, onSave }) => {
     const [isSubmitting, setIsSubmitting] = useState(false)

     const {
          control,
          handleSubmit,
          watch,
          reset,
          setValue,
          formState: { errors },
     } = useForm({
          resolver: yupResolver(addPaymentSchema),
          defaultValues: {
               paymentNumber: paymentNumber || '',
               customerId: '',
               invoiceId: '',
               amount: '',
               paymentMethod: 'Cash', // Default to Cash
               date: dayjs(),
               reference: '',
               description: ''
          }
     })

     const handleFormSubmit = async (data) => {
          setIsSubmitting(true)
          try {
               const result = await onSave(data)
               return result
          } catch (error) {
               console.error('Error adding payment:', error)
               return { success: false, error: error.message }
          } finally {
               setIsSubmitting(false)
          }
     }

     const resetForm = () => {
          reset()
     }

     return {
          control,
          handleSubmit,
          watch,
          errors,
          isSubmitting,
          handleFormSubmit,
          reset: resetForm,
          setValue,
     }
}

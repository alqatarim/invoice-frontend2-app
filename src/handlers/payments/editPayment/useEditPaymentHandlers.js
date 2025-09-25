'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

const editPaymentSchema = yup.object().shape({
     paymentNumber: yup.string().required('Payment number is required'),
     customerId: yup.string().required('Customer is required'),
     invoiceId: yup.string().required('Invoice ID is required'),
     amount: yup.number().required('Amount is required').positive('Amount must be positive'),
     paymentMethod: yup.string().required('Payment method is required'),
     date: yup.date().required('Payment date is required'),
     status: yup.string().required('Status is required'),
     reference: yup.string(),
     description: yup.string()
})

export const useEditPaymentHandlers = ({ paymentData, onSave }) => {
     const [isSubmitting, setIsSubmitting] = useState(false)

     const {
          control,
          handleSubmit,
          watch,
          reset,
          formState: { errors },
     } = useForm({
          resolver: yupResolver(editPaymentSchema),
          defaultValues: {
               paymentNumber: '',
               customerId: '',
               invoiceId: '',
               amount: '',
               paymentMethod: '',
               date: dayjs(),
               status: '',
               reference: '',
               description: ''
          }
     })

     // Reset form when payment data changes
     useEffect(() => {
          if (paymentData && typeof paymentData === 'object') {
               reset({
                    paymentNumber: paymentData.payment_number || paymentData.paymentNumber || '',
                    customerId: paymentData.customerDetail?._id || paymentData.customerId || '',
                    invoiceId: paymentData.invoiceId || '',
                    amount: paymentData.amount || '',
                    paymentMethod: paymentData.payment_method || paymentData.paymentMethod || '',
                    date: paymentData.date ? dayjs(paymentData.date) : dayjs(),
                    status: paymentData.status || '',
                    reference: paymentData.reference || '',
                    description: paymentData.description || ''
               })
          }
     }, [paymentData, reset])

     const handleFormSubmit = async (data) => {
          setIsSubmitting(true)
          try {
               const result = await onSave(data)
               return result
          } catch (error) {
               console.error('Error updating payment:', error)
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
     }
}

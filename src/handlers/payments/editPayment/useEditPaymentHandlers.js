'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

const editPaymentSchema = yup.object().shape({
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

export const useEditPaymentHandlers = ({ paymentData, onSave }) => {
     const [isSubmitting, setIsSubmitting] = useState(false)

     const {
          control,
          handleSubmit,
          watch,
          reset,
          setValue,
          formState: { errors },
     } = useForm({
          resolver: yupResolver(editPaymentSchema),
          defaultValues: {
               paymentNumber: '',
               customerId: '',
               invoiceId: '',
               amount: '',
               paymentMethod: 'Cash', // Default to Cash
               date: dayjs(),
               reference: '',
               description: ''
          }
     })

     // Reset form when payment data changes
     useEffect(() => {
          if (paymentData && typeof paymentData === 'object') {
               // Extract invoiceId - it might be an ObjectId string or populated object
               const invoiceId = typeof paymentData.invoiceId === 'object'
                    ? paymentData.invoiceId?._id
                    : paymentData.invoiceId || '';

               // Extract customerId from the payment's invoice details or customerDetail
               const customerId = paymentData.customerId?._id
                    || paymentData.customerId
                    || paymentData.customerDetail?._id
                    || '';

               reset({
                    paymentNumber: paymentData.payment_number || paymentData.paymentNumber || '',
                    customerId: customerId,
                    invoiceId: invoiceId,
                    amount: paymentData.amount || '',
                    paymentMethod: paymentData.payment_method || paymentData.paymentMethod || 'Cash',
                    date: paymentData.received_on ? dayjs(paymentData.received_on) : (paymentData.date ? dayjs(paymentData.date) : dayjs()),
                    reference: paymentData.reference || '',
                    description: paymentData.notes || paymentData.description || ''
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
          setValue,
     }
}

'use client'

// ** React Imports
import { useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Spinner from '@/components/Spinner'
import { useSnackbar } from 'notistack'

// ** Component Imports
import AddQuotation from '@/views/quotations/addQuotation/addQuotation'

// ** API Import
import { createQuotation, getAllCustomers } from 'src/app/(dashboard)/quotations/actions'

const AddQuotationIndex = ({ customers = [] }) => {
  // ** Hooks
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  
  // ** State
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ** Form submission handler
  const handleFormSubmit = async formData => {
    try {
      setIsSubmitting(true)
      
      const response = await createQuotation(formData)
      
      if (response?.success) {
        enqueueSnackbar('Quotation created successfully', { variant: 'success' })
        router.push('/quotations/quotation-list')
      } else {
        enqueueSnackbar(response?.message || 'Failed to create quotation', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error creating quotation:', error)
      enqueueSnackbar('An unexpected error occurred', { variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // ** Reset handler
  const handleReset = () => {
    router.push('/quotations/quotation-list')
  }
  
  return (
    <AddQuotation
      customers={customers}
      isSubmitting={isSubmitting}
      onSubmit={handleFormSubmit}
      resetData={handleReset}
    />
  )
}

export default AddQuotationIndex

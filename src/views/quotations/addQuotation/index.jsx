'use client'

// ** React Imports
import { useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Spinner from '@/components/Spinner'
import { useSnackbar } from 'notistack'

// ** Component Imports
import AddQuotation from '@/views/quotations/addQuotation/AddQuotation'

// ** API Import
import { createQuotation, getAllCustomers } from 'src/app/(dashboard)/quotations/actions'

const AddQuotationIndex = ({ customersData = [], productData = [], taxRates = [], initialBanks = [], signatures = [], quotationNumber }) => {
  // ** Hooks
  const router = useRouter()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  // ** Form submission handler
  const handleFormSubmit = async formData => {
    try {
      const loadingKey = enqueueSnackbar('Creating quotation...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      // Format data to match API expectations
      const formattedData = {
        quotationNumber: formData.quotationNumber,
        customerId: formData.customerId,
        date: formData.quotationDate,
        expiryDate: formData.expiryDate,
        payment_method: formData.payment_method,
        bank: formData.bank,
        referenceNo: formData.referenceNo,
        signatureId: formData.signatureId,
        notes: formData.notes,
        termsAndConditions: formData.termsAndConditions,
        items: formData.items,
        subTotal: formData.taxableAmount,
        totalAmount: formData.TotalAmount,
        totalDiscount: formData.totalDiscount,
        totalTax: formData.vat,
        status: 'DRAFTED'
      }

      const response = await createQuotation(formattedData)
      closeSnackbar(loadingKey)

      if (response?.success) {
        enqueueSnackbar('Quotation created successfully', { variant: 'success' })
        router.push('/quotations/quotation-list')
      } else {
        enqueueSnackbar(response?.message || 'Failed to create quotation', { variant: 'error' })
      }
    } catch (error) {
      console.error('Error creating quotation:', error)
      closeSnackbar()
      enqueueSnackbar('An unexpected error occurred', { variant: 'error' })
    }
  }

  return (
    <AddQuotation
      customersData={customersData}
      productData={productData}
      taxRates={taxRates}
      initialBanks={initialBanks}
      signatures={signatures}
      onSave={handleFormSubmit}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      quotationNumber={quotationNumber}
    />
  )
}

export default AddQuotationIndex

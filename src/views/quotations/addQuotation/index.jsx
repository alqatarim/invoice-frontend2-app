'use client'

// ** React Imports
import { useEffect, useState } from 'react'

// ** Next Imports
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Spinner from '@/components/Spinner'
import { useSnackbar } from 'notistack'

// ** Component Imports
import AddQuotation from '@/views/quotations/addQuotation/AddQuotation'

// ** API Import
import { createQuotation } from 'src/app/(dashboard)/quotations/actions'

const AddQuotationIndex = ({
  initialCustomers = [],
  initialProducts = [],
  initialTaxRates = [],
  initialBanks = [],
  initialSignatures = [],
  initialQuotationNumber = '',
  initialErrorMessage = ''
}) => {
  // ** Hooks
  const router = useRouter()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' })
    }
  }, [enqueueSnackbar, initialErrorMessage])

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
      customersData={initialCustomers}
      productData={initialProducts}
      taxRates={initialTaxRates}
      initialBanks={initialBanks}
      signatures={initialSignatures}
      onSave={handleFormSubmit}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      quotationNumber={initialQuotationNumber}
    />
  )
}

export default AddQuotationIndex

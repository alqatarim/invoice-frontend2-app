'use client'

// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/navigation'

// ** MUI Imports
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// ** Custom Components Imports
import EditQuotation from './EditQuotation'
import CustomHelmet from '@/components/CustomHelment'

// ** Third Party Imports
import { useSnackbar, closeSnackbar } from 'notistack'
import { formatISO } from 'date-fns'

// ** Actions Import
import { updateQuotation } from 'src/app/(dashboard)/quotations/actions'

const EditQuotationIndex = ({
  quotationData = null,
  customers = [],
  products = [],
  taxRates = [],
  banks = [],
  signatures = [],
  units = []
}) => {
  // ** Hooks
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  // ** States
  const [quotation, setQuotation] = useState(quotationData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!quotationData)

  // Process initial data if available
  useEffect(() => {
    if (quotationData) {
      setQuotation(quotationData)
      setIsLoading(false)
    }
  }, [quotationData])



  // Handle form submission
  const handleSubmit = async (formData) => {
    if (!quotation?._id) {
      enqueueSnackbar('Invalid quotation ID', { variant: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const loadingKey = enqueueSnackbar('Updating quotation...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      // Format dates for API and map fields
      const formattedData = {
        quotationNumber: formData.quotationNumber,
        customerId: formData.customerId,
        date: formData.quotationDate ? formatISO(new Date(formData.quotationDate)) : formatISO(new Date()),
        expiryDate: formData.expiryDate ? formatISO(new Date(formData.expiryDate)) : formatISO(new Date()),
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

      // Update quotation
      const response = await updateQuotation(quotation._id, formattedData)
      closeSnackbar && closeSnackbar(loadingKey)

      if (response?.success) {
        enqueueSnackbar('Quotation updated successfully', { variant: 'success' })
        router.push(`/quotations/quotation-view/${quotation._id}`)
      } else {
        enqueueSnackbar(response?.message || 'Failed to update quotation', { variant: 'error' })
      }
    } catch (error) {
      console.error("Error updating quotation:", error)
      closeSnackbar && closeSnackbar()
      enqueueSnackbar('An error occurred while updating the quotation', { variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reset form data
  const handleResetData = () => {
    // Reset data is handled by the component itself
    if (quotationData) {
      setQuotation(quotationData)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Show error state if quotation not found
  if (!quotation) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography variant="h6">Quotation not found</Typography>
      </Box>
    )
  }

  return (
    <>
      <CustomHelmet title="Edit Quotation" />

      <EditQuotation
        quotation={quotation}
        customers={customers}
        productData={products}
        taxRates={taxRates}
        initialBanks={banks}
        signatures={signatures}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        resetData={handleResetData}
        enqueueSnackbar={enqueueSnackbar}
        closeSnackbar={closeSnackbar}
      />
    </>
  )
}

export default EditQuotationIndex

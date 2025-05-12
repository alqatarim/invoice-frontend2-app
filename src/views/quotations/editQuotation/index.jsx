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
import EditQuotation from '@/views/quotations/editQuotation/editQuotation'
import CustomHelmet from '@/components/CustomHelment'

// ** Third Party Imports
import { useSnackbar } from 'notistack'
import { formatISO } from 'date-fns'

// ** Actions Import
import {
  updateQuotation,
  getQuotationById,
  getAllCustomers
} from 'src/app/(dashboard)/quotations/actions'

const EditQuotationIndex = ({ quotationData = null, customers = [] }) => {
  // ** Hooks
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  // ** States
  const [quotation, setQuotation] = useState(null)
  const [customersList, setCustomersList] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!quotationData)

  // Process initial data if available
  useEffect(() => {
    if (quotationData) {
      setQuotation(quotationData)
      setIsLoading(false)
    }
  }, [quotationData])

  // Process customers list if available
  useEffect(() => {
    if (customers?.length) {
      setCustomersList(customers)
    } else {
      // Fetch customers if not provided
      fetchCustomers()
    }
  }, [customers])

  // Fetch customers if not provided as prop
  const fetchCustomers = async () => {
    try {
      const response = await getAllCustomers()
      if (response?.success && Array.isArray(response.data)) {
        setCustomersList(response.data)
      } else {
        // Set empty array if data is not valid
        setCustomersList([])
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      enqueueSnackbar('Failed to load customers', { variant: 'error' })
      setCustomersList([]) // Fallback to empty array on error
    }
  }

  // Fetch quotation data if not provided as prop
  const fetchQuotationData = async (id) => {
    if (!id) {
      enqueueSnackbar('Invalid quotation ID', { variant: 'error' })
      router.push('/quotations')
      return
    }

    setIsLoading(true)
    try {
      const response = await getQuotationById(id)
      if (response?.success && response?.data) {
        setQuotation(response.data)
      } else {
        enqueueSnackbar('Quotation not found', { variant: 'error' })
        router.push('/quotations')
      }
    } catch (error) {
      console.error("Error fetching quotation:", error)
      enqueueSnackbar('Failed to load quotation details', { variant: 'error' })
      router.push('/quotations')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (formData) => {
    if (!quotation?._id) {
      enqueueSnackbar('Invalid quotation ID', { variant: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      // Format dates for API
      const formattedData = {
        ...formData,
        date: formData.date ? formatISO(new Date(formData.date)) : formatISO(new Date()),
        expiryDate: formData.expiryDate ? formatISO(new Date(formData.expiryDate)) : formatISO(new Date())
      }

      // Update quotation
      const response = await updateQuotation(quotation._id, formattedData)

      if (response?.success) {
        enqueueSnackbar('Quotation updated successfully', { variant: 'success' })
        router.push(`/quotations/quotation-view/${quotation._id}`)
      } else {
        enqueueSnackbar(response?.message || 'Failed to update quotation', { variant: 'error' })
      }
    } catch (error) {
      console.error("Error updating quotation:", error)
      enqueueSnackbar('An error occurred while updating the quotation', { variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reset form data
  const handleResetData = () => {
    if (quotation?._id) {
      fetchQuotationData(quotation._id)
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
        customers={customersList}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        resetData={handleResetData}
      />
    </>
  )
}

export default EditQuotationIndex

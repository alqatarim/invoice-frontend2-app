'use client'

// React Imports
import { useState, useEffect } from 'react'

// Component Imports
import InvoiceSettingsForm from './InvoiceSettingsForm'
import { getInvoiceSettings, updateInvoiceSettings } from '@/app/(dashboard)/settings/invoice-settings/actions'

const InvoiceSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const [invoiceSettings, setInvoiceSettings] = useState(initialData.invoiceSettings || {})
  const [loading, setLoading] = useState(!initialData.invoiceSettings)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  // Load invoice settings data only if not provided
  useEffect(() => {
    if (!initialData.invoiceSettings) {
      const loadData = async () => {
        try {
          setLoading(true)
          const result = await getInvoiceSettings()
          if (result.success) {
            setInvoiceSettings(result.data || {})
          } else {
            setError(result.message)
          }
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }

      loadData()
    }
  }, [initialData.invoiceSettings])

  const handleUpdate = async (formData) => {
    setUpdating(true)
    setError(null)

    try {
      const loadingKey = enqueueSnackbar('Updating invoice settings...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      const result = await updateInvoiceSettings(formData)

      if (result.success) {
        setInvoiceSettings(result.data)
        enqueueSnackbar('Invoice settings updated successfully', {
          variant: 'success',
          autoHideDuration: 3000,
        })
        return { success: true }
      } else {
        const errorMessage = result.message || 'Failed to update invoice settings'
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        })
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update invoice settings'
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      })
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setUpdating(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const result = await getInvoiceSettings()
      if (result.success) {
        setInvoiceSettings(result.data || {})
        setError(null)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <InvoiceSettingsForm
      invoiceSettings={invoiceSettings}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
      enqueueSnackbar={enqueueSnackbar}
    />
  )
}

export default InvoiceSettingsTab
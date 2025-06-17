'use client'

// React Imports
import { useState, useEffect } from 'react'

// Component Imports
import PaymentSettingsForm from './PaymentSettingsForm'
import { getPaymentSettings, updatePaymentSettings } from '@/app/(dashboard)/settings/payment-settings/actions'

const PaymentSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const [paymentSettings, setPaymentSettings] = useState(initialData.paymentSettings || {})
  const [loading, setLoading] = useState(!initialData.paymentSettings)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  // Load payment settings data only if not provided
  useEffect(() => {
    if (!initialData.paymentSettings) {
      const loadData = async () => {
        try {
          setLoading(true)
          const result = await getPaymentSettings()
          if (result.success) {
            setPaymentSettings(result.data || {})
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
  }, [initialData.paymentSettings])

  const handleUpdate = async (formData) => {
    setUpdating(true)
    setError(null)

    try {
      const loadingKey = enqueueSnackbar('Updating payment settings...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      const result = await updatePaymentSettings(formData)

      if (result.success) {
        setPaymentSettings(result.data)
        enqueueSnackbar('Payment settings updated successfully', {
          variant: 'success',
          autoHideDuration: 3000,
        })
        return { success: true }
      } else {
        const errorMessage = result.message || 'Failed to update payment settings'
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        })
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update payment settings'
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
      const result = await getPaymentSettings()
      if (result.success) {
        setPaymentSettings(result.data || {})
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
    <PaymentSettingsForm
      paymentSettings={paymentSettings}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
      enqueueSnackbar={enqueueSnackbar}
    />
  )
}

export default PaymentSettingsTab
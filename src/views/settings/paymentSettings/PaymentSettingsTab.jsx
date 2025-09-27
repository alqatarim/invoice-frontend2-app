'use client'

// React Imports
import { useState, useEffect } from 'react'

// Component Imports
import PaymentSettingsForm from './PaymentSettingsForm'
import usePaymentSettingsHandlers from '@/handlers/settings/usePaymentSettingsHandlers'

const PaymentSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const {
    paymentSettings,
    loading,
    updating,
    error,
    getPaymentSettings,
    updatePaymentSettings,
    clearError
  } = usePaymentSettingsHandlers(initialData)

  // Load payment settings data only if not provided
  useEffect(() => {
    if (!initialData.paymentSettings) {
      getPaymentSettings()
    }
  }, [])

  const handleUpdate = async (formData) => {
    try {
      await updatePaymentSettings(formData)
      enqueueSnackbar('Payment settings updated successfully', { variant: 'success' })
      return { success: true }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update payment settings', { variant: 'error' })
      return { success: false, message: error.message }
    }
  }

  const handleRefresh = async () => {
    clearError()
    await getPaymentSettings()
  }

  return (
    <PaymentSettingsForm
      paymentSettings={paymentSettings || initialData.paymentSettings}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
    />
  )
}

export default PaymentSettingsTab
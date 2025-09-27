'use client'

// React Imports
import { useState, useEffect } from 'react'

// Component Imports
import PreferenceSettingsForm from './PreferenceSettingsForm'
import usePreferenceSettingsHandlers from '@/handlers/settings/usePreferenceSettingsHandlers'

const PreferenceSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const {
    preferenceSettings,
    currencies,
    loading,
    updating,
    error,
    getPreferenceSettings,
    getCurrencies,
    updatePreferenceSettings,
    clearError
  } = usePreferenceSettingsHandlers(initialData)

  // Load preference settings data only if not provided
  useEffect(() => {
    if (!initialData.preferenceSettings) {
      getPreferenceSettings()
    }
    if (!initialData.currencies || initialData.currencies.length === 0) {
      getCurrencies()
    }
  }, [])

  const handleUpdate = async (formData) => {
    try {
      await updatePreferenceSettings(formData)
      enqueueSnackbar('Preference settings updated successfully', { variant: 'success' })
      return { success: true }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update preference settings', { variant: 'error' })
      return { success: false, message: error.message }
    }
  }

  const handleRefresh = async () => {
    clearError()
    await getPreferenceSettings()
    await getCurrencies()
  }

  const handleLoadCurrencies = async () => {
    await getCurrencies()
  }

  return (
    <PreferenceSettingsForm
      preferenceSettings={preferenceSettings || initialData.preferenceSettings}
      currencies={currencies || initialData.currencies}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
      onLoadCurrencies={handleLoadCurrencies}
    />
  )
}

export default PreferenceSettingsTab
'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import CompanySettingsForm from './CompanySettingsForm'
import useCompanySettingsHandlers from '@/handlers/settings/useCompanySettingsHandlers'

const CompanySettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const {
    companySettings,
    loading,
    updating,
    error,
    getCompanySettings,
    updateCompanySettings,
    clearError
  } = useCompanySettingsHandlers(initialData)

  const handleUpdate = async (formData) => {
    try {
      const result = await updateCompanySettings(formData)
      enqueueSnackbar('Company settings updated successfully', { variant: 'success' })
      return result
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update company settings', { variant: 'error' })
      return { success: false }
    }
  }

  const handleRefresh = async () => {
    clearError()
    await getCompanySettings()
  }

  return (
    <CompanySettingsForm
      companySettings={companySettings}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
    />
  )
}

export default CompanySettingsTab
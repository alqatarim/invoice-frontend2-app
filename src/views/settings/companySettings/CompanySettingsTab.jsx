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
      await updateCompanySettings(formData)
      enqueueSnackbar('Company settings updated successfully', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update company settings', { variant: 'error' })
    }
  }

  const handleRefresh = async () => {
    clearError()
    await getCompanySettings()
  }

  return (
    <CompanySettingsForm
      companySettings={companySettings || initialData}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
    />
  )
}

export default CompanySettingsTab
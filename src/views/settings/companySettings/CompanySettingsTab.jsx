'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import CompanySettingsForm from './CompanySettingsForm'
import useCompanySettingsHandlers from '@/handlers/settings/useCompanySettingsHandlers'
import AppSnackbar from '@/components/shared/AppSnackbar'

const CompanySettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const {
    companySettings,
    loading,
    updating,
    error,
    getCompanySettings,
    updateCompanySettings,
    clearError
  } = useCompanySettingsHandlers(initialData)

  const notify = (message, options = {}) => {
    if (typeof enqueueSnackbar === 'function') {
      enqueueSnackbar(message, options)
      return
    }

    setSnackbar({
      open: true,
      message,
      severity: options.variant || 'success'
    })
  }

  const handleUpdate = async (formData) => {
    try {
      const result = await updateCompanySettings(formData)
      notify('Company settings updated successfully', { variant: 'success' })
      return result
    } catch (error) {
      notify(error.message || 'Failed to update company settings', { variant: 'error' })
      return { success: false }
    }
  }

  const handleRefresh = async () => {
    clearError()
    await getCompanySettings()
  }

  return (
    <>
      <CompanySettingsForm
        companySettings={companySettings}
        loading={loading}
        updating={updating}
        error={error}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
      />
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        autoHideDuration={5000}
      />
    </>
  )
}

export default CompanySettingsTab
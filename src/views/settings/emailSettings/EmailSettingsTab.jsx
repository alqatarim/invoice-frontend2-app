'use client'

// React Imports
import { useState, useEffect } from 'react'

// Component Imports
import EmailSettingsForm from './EmailSettingsForm'
import useEmailSettingsHandlers from '@/handlers/settings/useEmailSettingsHandlers'

const EmailSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const {
    emailSettings,
    loading,
    updating,
    error,
    getEmailSettings,
    updateEmailSettings,
    clearError
  } = useEmailSettingsHandlers(initialData)

  // Load email settings data only if not provided
  useEffect(() => {
    if (!initialData.emailSettings) {
      getEmailSettings()
    }
  }, [])

  const handleUpdate = async (formData) => {
    try {
      await updateEmailSettings(formData)
      enqueueSnackbar('Email settings updated successfully', { variant: 'success' })
      return { success: true }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update email settings', { variant: 'error' })
      return { success: false, message: error.message }
    }
  }

  const handleRefresh = async () => {
    clearError()
    await getEmailSettings()
  }

  return (
    <EmailSettingsForm
      emailSettings={emailSettings || initialData.emailSettings}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
    />
  )
}

export default EmailSettingsTab
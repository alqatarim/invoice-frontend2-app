'use client'

// React Imports
import { useState, useEffect } from 'react'

// Component Imports
import NotificationSettingsForm from './NotificationSettingsForm'
import useNotificationSettingsHandlers from '@/handlers/settings/useNotificationSettingsHandlers'

const NotificationSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const {
    notificationSettings,
    loading,
    updating,
    error,
    getNotificationSettings,
    updateNotificationSettings,
    clearError
  } = useNotificationSettingsHandlers(initialData)

  // Load notification settings data only if not provided
  useEffect(() => {
    if (!initialData.notificationSettings) {
      getNotificationSettings()
    }
  }, [])

  const handleUpdate = async (formData) => {
    try {
      await updateNotificationSettings(formData)
      enqueueSnackbar('Notification settings updated successfully', { variant: 'success' })
      return { success: true }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to update notification settings', { variant: 'error' })
      return { success: false, message: error.message }
    }
  }

  const handleRefresh = async () => {
    clearError()
    await getNotificationSettings()
  }

  return (
    <NotificationSettingsForm
      notificationSettings={notificationSettings || initialData.notificationSettings}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
    />
  )
}

export default NotificationSettingsTab
'use client'

// React Imports
import { useState, useEffect } from 'react'

// Component Imports
import NotificationSettingsForm from './NotificationSettingsForm'
import { getNotificationSettings, updateNotificationSettings } from '@/app/(dashboard)/settings/notification-settings/actions'

const NotificationSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const [notificationSettings, setNotificationSettings] = useState(initialData.notificationSettings || {})
  const [loading, setLoading] = useState(!initialData.notificationSettings)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  // Load notification settings data only if not provided
  useEffect(() => {
    if (!initialData.notificationSettings) {
      const loadData = async () => {
        try {
          setLoading(true)
          const result = await getNotificationSettings()
          if (result.success) {
            setNotificationSettings(result.data || {})
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
  }, [initialData.notificationSettings])

  const handleUpdate = async (formData) => {
    setUpdating(true)
    setError(null)

    try {
      const loadingKey = enqueueSnackbar('Updating notification settings...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      const result = await updateNotificationSettings(formData)

      if (result.success) {
        setNotificationSettings(result.data)
        enqueueSnackbar('Notification settings updated successfully', {
          variant: 'success',
          autoHideDuration: 3000,
        })
        return { success: true }
      } else {
        const errorMessage = result.message || 'Failed to update notification settings'
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        })
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update notification settings'
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
      const result = await getNotificationSettings()
      if (result.success) {
        setNotificationSettings(result.data || {})
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
    <NotificationSettingsForm
      notificationSettings={notificationSettings}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
      enqueueSnackbar={enqueueSnackbar}
    />
  )
}

export default NotificationSettingsTab
'use client'

// React Imports
import { useState, useEffect } from 'react'

// Component Imports
import EmailSettingsForm from './EmailSettingsForm'
import { getEmailSettings, updateEmailSettings } from '@/app/(dashboard)/settings/email-settings/actions'

const EmailSettingsTab = ({ initialData = {}, enqueueSnackbar }) => {
  const [emailSettings, setEmailSettings] = useState(initialData.emailSettings || {})
  const [loading, setLoading] = useState(!initialData.emailSettings)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  // Load email settings data only if not provided
  useEffect(() => {
    if (!initialData.emailSettings) {
      const loadData = async () => {
        try {
          setLoading(true)
          const result = await getEmailSettings()
          if (result.success) {
            setEmailSettings(result.data || {})
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
  }, [initialData.emailSettings])

  const handleUpdate = async (formData) => {
    setUpdating(true)
    setError(null)

    try {
      const loadingKey = enqueueSnackbar('Updating email settings...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      const result = await updateEmailSettings(formData)

      if (result.success) {
        setEmailSettings(result.data)
        enqueueSnackbar('Email settings updated successfully', {
          variant: 'success',
          autoHideDuration: 3000,
        })
        return { success: true }
      } else {
        const errorMessage = result.message || 'Failed to update email settings'
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        })
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update email settings'
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
      const result = await getEmailSettings()
      if (result.success) {
        setEmailSettings(result.data || {})
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
    <EmailSettingsForm
      emailSettings={emailSettings}
      loading={loading}
      updating={updating}
      error={error}
      onUpdate={handleUpdate}
      onRefresh={handleRefresh}
      enqueueSnackbar={enqueueSnackbar}
    />
  )
}

export default EmailSettingsTab
'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/(dashboard)/profile/actions'

export function useProfileHandler({
  initialProfile = {},
  initialErrorMessage = ''
}) {
  const [profile, setProfile] = useState(initialProfile)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(initialErrorMessage || null)
  const [activeTab, setActiveTab] = useState('profile')

  const handleUpdate = async (formData, enqueueSnackbar, closeSnackbar) => {
    setUpdating(true)
    setError(null)

    try {
      const loadingKey = enqueueSnackbar('Updating profile...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      const result = await updateProfile(formData)
      closeSnackbar(loadingKey)

      if (result.success) {
        setProfile(result.data || {})
        return { success: true }
      }

      const errorMessage = result.message || 'Failed to update profile'
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      })
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } catch (updateError) {
      closeSnackbar()
      const errorMessage = updateError.message || 'Failed to update profile'
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

  return {
    profile,
    updating,
    error,
    activeTab,
    setActiveTab,
    handleUpdate,
  }
}

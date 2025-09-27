'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import ChangePasswordForm from './ChangePasswordForm'
import useChangePasswordHandlers from '@/handlers/settings/useChangePasswordHandlers'

const ChangePasswordTab = ({ enqueueSnackbar }) => {
  const {
    loading,
    updating,
    error,
    changePassword,
    clearError
  } = useChangePasswordHandlers()

  const handleChangePassword = async (formData) => {
    try {
      await changePassword(formData)
      enqueueSnackbar('Password changed successfully', { variant: 'success' })
      return { success: true }
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to change password', { variant: 'error' })
      return { success: false, message: error.message }
    }
  }

  return (
    <ChangePasswordForm
      loading={loading}
      updating={updating}
      error={error}
      onChangePassword={handleChangePassword}
    />
  )
}

export default ChangePasswordTab
'use client'

// React Imports
import { useState } from 'react'

// Component Imports
import ChangePasswordForm from './ChangePasswordForm'
import { changePassword } from '@/app/(dashboard)/settings/actions'

const ChangePasswordTab = ({ enqueueSnackbar }) => {
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const handleChangePassword = async (formData) => {
    setUpdating(true)
    setError(null)

    try {
      const loadingKey = enqueueSnackbar('Changing password...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true,
      })

      const result = await changePassword(formData)

      if (result.success) {
        enqueueSnackbar('Password changed successfully', {
          variant: 'success',
          autoHideDuration: 3000,
        })
        return { success: true }
      } else {
        const errorMessage = result.message || 'Failed to change password'
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        })
        setError(errorMessage)
        return { success: false, message: errorMessage }
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to change password'
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

  return (
    <ChangePasswordForm
      loading={loading}
      updating={updating}
      error={error}
      onChangePassword={handleChangePassword}
      enqueueSnackbar={enqueueSnackbar}
    />
  )
}

export default ChangePasswordTab
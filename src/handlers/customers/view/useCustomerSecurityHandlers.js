import { useState, useCallback } from 'react'

/**
 * Customer security handler for managing password and security settings
 */
export const useCustomerSecurityHandlers = ({ customer, onError, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [twoFactorSettings, setTwoFactorSettings] = useState({
    enabled: false,
    smsEnabled: false,
    appEnabled: false
  })

  // Handle password form changes
  const handlePasswordFieldChange = useCallback((field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  // Handle password visibility toggle
  const handlePasswordVisibilityToggle = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  // Validate password form
  const validatePasswordForm = useCallback(() => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm

    if (!currentPassword) {
      onError('Current password is required')
      return false
    }

    if (!newPassword) {
      onError('New password is required')
      return false
    }

    if (newPassword.length < 8) {
      onError('Password must be at least 8 characters long')
      return false
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(newPassword)) {
      onError('Password must contain uppercase letters, lowercase letters, numbers, and special characters')
      return false
    }

    if (newPassword !== confirmPassword) {
      onError('New password and confirmation do not match')
      return false
    }

    return true
  }, [passwordForm, onError])

  // Handle password change submission
  const handleChangePassword = useCallback(async () => {
    if (!validatePasswordForm()) {
      return
    }

    if (!customer?._id) {
      onError('Customer ID is required')
      return
    }

    setLoading(true)

    try {
      // TODO: Implement password change API call
      // This would typically call an API endpoint for changing passwords
      // const result = await changeCustomerPassword({
      //   customerId: customer._id,
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // })

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))

      onSuccess('Password changed successfully')
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      onError(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }, [customer, passwordForm, validatePasswordForm, onError, onSuccess])

  // Handle 2FA settings change
  const handle2FAToggle = useCallback(async (setting, enabled) => {
    if (!customer?._id) {
      onError('Customer ID is required')
      return
    }

    setLoading(true)

    try {
      // TODO: Implement 2FA settings API call
      // const result = await update2FASettings({
      //   customerId: customer._id,
      //   setting,
      //   enabled
      // })

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))

      setTwoFactorSettings(prev => ({
        ...prev,
        [setting]: enabled
      }))

      onSuccess(`Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      console.error('Error updating 2FA settings:', error)
      onError(error.message || 'Failed to update 2FA settings')
    } finally {
      setLoading(false)
    }
  }, [customer, onError, onSuccess])

  // Handle cancel password change
  const handleCancelPasswordChange = useCallback(() => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }, [])

  return {
    // State
    loading,
    showPassword,
    passwordForm,
    twoFactorSettings,
    
    // Actions
    handlePasswordFieldChange,
    handlePasswordVisibilityToggle,
    handleChangePassword,
    handleCancelPasswordChange,
    handle2FAToggle,
    validatePasswordForm
  }
} 
'use client'

import useChangePasswordHandlers from './handler'
import ChangePasswordForm from './ChangePasswordForm'
import SettingsLayout from '../shared/SettingsLayout'

const ChangePasswordIndex = () => {
  const {
    loading,
    updating,
    error,
    changePassword
  } = useChangePasswordHandlers()

  const handleChangePassword = async formData => {
    try {
      const result = await changePassword(formData)
      return result || { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  return (
    <SettingsLayout
      title="Change Password"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Change Password', current: true }
      ]}
    >
      <ChangePasswordForm
        loading={loading}
        updating={updating}
        error={error}
        onChangePassword={handleChangePassword}
      />
    </SettingsLayout>
  )
}

export default ChangePasswordIndex
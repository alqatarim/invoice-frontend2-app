'use client'

import useEmailSettingsHandlers from './handler'
import EmailSettingsForm from './EmailSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const EmailSettingsIndex = ({ initialData = {} }) => {
  const {
    emailSettings,
    loading,
    updating,
    error,
    getEmailSettings,
    updateEmailSettings,
    clearError
  } = useEmailSettingsHandlers(initialData)

  const handleUpdate = async formData => {
    try {
      return await updateEmailSettings(formData)
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  const handleRefresh = async () => {
    clearError()

    try {
      await getEmailSettings()
    } catch (error) {
      return null
    }
  }

  return (
    <SettingsLayout
      title="Email Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Email Settings', current: true }
      ]}
    >
      <EmailSettingsForm
        emailSettings={emailSettings || {}}
        loading={loading}
        updating={updating}
        error={error}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
      />
    </SettingsLayout>
  )
}

export default EmailSettingsIndex
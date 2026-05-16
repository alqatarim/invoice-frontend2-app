'use client'

import useNotificationSettingsHandlers from './handler'
import NotificationSettingsForm from './NotificationSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const NotificationSettingsIndex = ({ initialData = {} }) => {
  const {
    notificationSettings,
    loading,
    updating,
    error,
    getNotificationSettings,
    updateNotificationSettings,
    clearError
  } = useNotificationSettingsHandlers(initialData)

  const handleUpdate = async formData => {
    try {
      return await updateNotificationSettings(formData)
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
      await getNotificationSettings()
    } catch (error) {
      return null
    }
  }

  return (
    <SettingsLayout
      title="Notification Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Notification Settings', current: true }
      ]}
    >
      <NotificationSettingsForm
        notificationSettings={notificationSettings || {}}
        loading={loading}
        updating={updating}
        error={error}
        onUpdate={handleUpdate}
        onRefresh={handleRefresh}
      />
    </SettingsLayout>
  )
}

export default NotificationSettingsIndex
'use client'

import { useSettingsHandlers } from '@/handlers/settings/useSettingsHandlers'
import NotificationSettingsForm from './NotificationSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const NotificationSettingsIndex = ({ initialData = {} }) => {
  const {
    state,
    notificationHandlers
  } = useSettingsHandlers(initialData)

  return (
    <SettingsLayout
      title="Notification Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Notification Settings', current: true }
      ]}
    >
      <NotificationSettingsForm
        notificationSettings={state.notificationSettings || {}}
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onUpdate={notificationHandlers.updateNotificationSettings}
        onRefresh={notificationHandlers.loadNotificationSettings}
      />
    </SettingsLayout>
  )
}

export default NotificationSettingsIndex
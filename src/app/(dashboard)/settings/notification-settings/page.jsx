import { getNotificationSettings } from './actions'
import SettingsLayout from '@/views/settings/shared/SettingsLayout'

export default async function NotificationSettingsPage() {
  const { success, data, message } = await getNotificationSettings()
  
  if (!success) {
    console.error('Failed to load notification settings:', message)
  }

  const initialData = {
    notificationSettings: data || {},
    loading: false,
    error: success ? null : message
  }

  return <SettingsLayout initialData={initialData} />
}
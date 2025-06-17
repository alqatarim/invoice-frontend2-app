import { getEmailSettings } from './actions'
import SettingsLayout from '@/views/settings/shared/SettingsLayout'

export default async function EmailSettingsPage() {
  const { success, data, message } = await getEmailSettings()
  
  if (!success) {
    console.error('Failed to load email settings:', message)
  }

  const initialData = {
    emailSettings: data || {},
    loading: false,
    error: success ? null : message
  }

  return <SettingsLayout initialData={initialData} />
}
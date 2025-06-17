import { getAccountSettings } from './actions'
import AccountSettingsIndex from '@/views/settings/accountSettings'

export default async function AccountSettingsPage() {
  const { success, data, message } = await getAccountSettings()
  
  if (!success) {
    console.error('Failed to load account settings:', message)
  }

  const initialData = {
    accountSettings: data || {},
    loading: false,
    error: success ? null : message
  }

  return <AccountSettingsIndex initialData={initialData} />
}
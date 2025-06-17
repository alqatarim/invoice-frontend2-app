import { getCompanySettings } from './actions'
import SettingsLayout from '@/views/settings/shared/SettingsLayout'

export default async function CompanySettingsPage() {
  const { success, data, message } = await getCompanySettings()
  
  if (!success) {
    console.error('Failed to load company settings:', message)
  }

  const initialData = {
    companySettings: data || {},
    loading: false,
    error: success ? null : message
  }

  return <SettingsLayout initialData={initialData} />
}
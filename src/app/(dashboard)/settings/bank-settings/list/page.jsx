import { getInitialBankSettingsData } from '../actions'
import SettingsLayout from '@/views/settings/shared/SettingsLayout'

export default async function BankSettingsListPage() {
  const { success, data, message } = await getInitialBankSettingsData()
  
  if (!success) {
    console.error('Failed to load bank settings:', message)
  }

  const initialData = {
    bankSettings: {
      banks: data?.data || [],
      pagination: {
        page: 0,
        totalCount: data?.totalCount || 0,
        limit: 10
      },
      loading: false,
      error: success ? null : message
    }
  }

  return <SettingsLayout initialData={initialData} />
}
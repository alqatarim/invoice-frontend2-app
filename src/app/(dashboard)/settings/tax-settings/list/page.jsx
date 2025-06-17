import { getInitialTaxSettingsData } from '../actions'
import SettingsLayout from '@/views/settings/shared/SettingsLayout'

export default async function TaxSettingsListPage() {
  const { success, data, message } = await getInitialTaxSettingsData()
  
  if (!success) {
    console.error('Failed to load tax settings:', message)
  }

  const initialData = {
    taxSettings: {
      taxes: data?.data || [],
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
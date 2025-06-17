import { getPreferenceSettings, getCurrencies } from './actions'
import SettingsLayout from '@/views/settings/shared/SettingsLayout'

export default async function PreferenceSettingsPage() {
  const [settingsResult, currenciesResult] = await Promise.all([
    getPreferenceSettings(),
    getCurrencies()
  ])
  
  if (!settingsResult.success) {
    console.error('Failed to load preference settings:', settingsResult.message)
  }

  if (!currenciesResult.success) {
    console.error('Failed to load currencies:', currenciesResult.message)
  }

  const initialData = {
    preferenceSettings: settingsResult.data || {},
    currencies: currenciesResult.data || [],
    loading: false,
    error: settingsResult.success ? null : settingsResult.message
  }

  return <SettingsLayout initialData={initialData} />
}
import { getPaymentSettings } from './actions'
import SettingsLayout from '@/views/settings/shared/SettingsLayout'

export default async function PaymentSettingsPage() {
  const { success, data, message } = await getPaymentSettings()
  
  if (!success) {
    console.error('Failed to load payment settings:', message)
  }

  const initialData = {
    paymentSettings: data || {},
    loading: false,
    error: success ? null : message
  }

  return <SettingsLayout initialData={initialData} />
}
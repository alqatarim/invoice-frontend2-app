import { getInvoiceSettings } from './actions'
import SettingsLayout from '@/views/settings/shared/SettingsLayout'

export default async function InvoiceSettingsPage() {
  const { success, data, message } = await getInvoiceSettings()
  
  if (!success) {
    console.error('Failed to load invoice settings:', message)
  }

  const initialData = {
    invoiceSettings: data || {},
    loading: false,
    error: success ? null : message
  }

  return <SettingsLayout initialData={initialData} />
}
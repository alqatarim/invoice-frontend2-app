import { getDefaultInvoiceTemplate } from './actions'
import SettingsLayout from '@/views/settings/shared/SettingsLayout'

export default async function InvoiceTemplatesPage() {
  const { success, data, message } = await getDefaultInvoiceTemplate()
  
  if (!success) {
    console.error('Failed to load invoice templates:', message)
  }

  const initialData = {
    invoiceTemplates: data || {},
    loading: false,
    error: success ? null : message
  }

  return <SettingsLayout initialData={initialData} />
}
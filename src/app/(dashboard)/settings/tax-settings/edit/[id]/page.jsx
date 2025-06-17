import { getTaxById } from '../../actions'
import EditTaxSettingsIndex from '@/views/settings/taxSettings/editTaxSettings'

export default async function EditTaxSettingsPage({ params }) {
  const { id } = params
  const { success, data, message } = await getTaxById(id)
  
  if (!success) {
    console.error('Failed to load tax by ID:', message)
  }

  const initialData = {
    selectedTax: data || {},
    loading: false,
    error: success ? null : message
  }

  return <EditTaxSettingsIndex taxId={id} initialData={initialData} />
}
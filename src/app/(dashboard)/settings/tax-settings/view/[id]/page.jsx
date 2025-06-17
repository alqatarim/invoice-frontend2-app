import { getTaxById } from '../../actions'
import ViewTaxSettingsIndex from '@/views/settings/taxSettings/viewTaxSettings'

export default async function ViewTaxSettingsPage({ params }) {
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

  return <ViewTaxSettingsIndex taxId={id} initialData={initialData} />
}
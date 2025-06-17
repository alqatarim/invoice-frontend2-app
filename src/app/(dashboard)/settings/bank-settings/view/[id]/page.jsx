import { getBankById } from '../../actions'
import ViewBankSettingsIndex from '@/views/settings/bankSettings/viewBankSettings'

export default async function ViewBankSettingsPage({ params }) {
  const { id } = params
  const { success, data, message } = await getBankById(id)
  
  if (!success) {
    console.error('Failed to load bank by ID:', message)
  }

  const initialData = {
    selectedBank: data || {},
    loading: false,
    error: success ? null : message
  }

  return <ViewBankSettingsIndex bankId={id} initialData={initialData} />
}
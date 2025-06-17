import { getBankById } from '../../actions'
import EditBankSettingsIndex from '@/views/settings/bankSettings/editBankSettings'

export default async function EditBankSettingsPage({ params }) {
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

  return <EditBankSettingsIndex bankId={id} initialData={initialData} />
}
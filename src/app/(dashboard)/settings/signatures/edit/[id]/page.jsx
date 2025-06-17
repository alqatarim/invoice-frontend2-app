import { getSignatureById } from '../../actions'
import EditSignatureIndex from '@/views/settings/signatureLists/editSignature'

export default async function EditSignaturePage({ params }) {
  const { id } = params
  const { success, data, message } = await getSignatureById(id)

  if (!success) {
    console.error('Failed to load signature by ID:', message)
  }

  const initialData = {
    selectedSignature: data || {},
    loading: false,
    error: success ? null : message
  }

  return <EditSignatureIndex signatureId={id} initialData={initialData} />
}
import { getInitialSignaturesData } from '../actions'
import SignatureListIndex from '@/views/settings/signatureLists/listSignatures/index'

export default async function SignatureListPage() {
  const { success, data, message } = await getInitialSignaturesData()

  if (!success) {
    console.error('Failed to load signatures:', message)
  }

  const initialData = {
    signatures: data || [],
    pagination: {
      page: 0,
      totalCount: 0,
      limit: 10
    },
    loading: false,
    error: success ? null : message
  }

  return <SignatureListIndex initialData={initialData} />
}
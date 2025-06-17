import AddSignatureIndex from '@/views/settings/signatureLists/addSignature'

export default function AddSignaturePage() {
  const initialData = {
    loading: false,
    error: null
  }

  return <AddSignatureIndex initialData={initialData} />
}
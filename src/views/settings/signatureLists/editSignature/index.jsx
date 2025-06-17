'use client'

import { useEffect } from 'react'
import { useSignatureHandlers } from '@/handlers/settings/useSignatureHandlers'
import SignatureForm from '../shared/SignatureForm'
import SettingsLayout from '../../shared/SettingsLayout'

const EditSignatureIndex = ({ signatureId, initialData = {} }) => {
  const {
    state,
    actionHandlers,
    dataHandlers
  } = useSignatureHandlers(initialData)

  const id = signatureId
  const currentSignature = state.selectedSignature || initialData.selectedSignature

  useEffect(() => {
    if (id && !currentSignature) {
      // Load signature by ID - we'll need to add this to the actions if it doesn't exist
      dataHandlers.loadSignatures()
    }
  }, [id])

  const handleUpdate = async (formData) => {
    return await actionHandlers.updateSignature(id, formData)
  }

  return (
    <SettingsLayout
      title="Edit Signature"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Signature Lists', href: '/settings/signatures/list' },
        { label: 'Edit Signature', current: true }
      ]}
    >
      <SignatureForm
        signature={currentSignature}
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onSave={handleUpdate}
        isEdit={true}
      />
    </SettingsLayout>
  )
}

export default EditSignatureIndex
'use client'

import { useSignatureHandlers } from '@/handlers/settings/useSignatureHandlers'
import SignatureForm from '../shared/SignatureForm'
import SettingsLayout from '../../shared/SettingsLayout'

const AddSignatureIndex = ({ initialData = {} }) => {
  const {
    state,
    actionHandlers
  } = useSignatureHandlers(initialData)

  return (
    <SettingsLayout
      title="Add Signature"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Signature Lists', href: '/settings/signatures/list' },
        { label: 'Add Signature', current: true }
      ]}
    >
      <SignatureForm
        loading={state.loading}
        error={state.error}
        onSave={actionHandlers.addSignature}
        isEdit={false}
      />
    </SettingsLayout>
  )
}

export default AddSignatureIndex
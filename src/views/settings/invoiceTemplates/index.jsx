'use client'

import { useInvoiceTemplateHandlers } from '@/handlers/settings/useInvoiceTemplateHandlers'
import InvoiceTemplatesView from './InvoiceTemplatesView'
import SettingsLayout from '../shared/SettingsLayout'

const InvoiceTemplatesIndex = ({ initialData = {} }) => {
  const {
    state,
    templateHandlers
  } = useInvoiceTemplateHandlers(initialData)

  return (
    <SettingsLayout
      title="Invoice Templates"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Invoice Templates', current: true }
      ]}
    >
      <InvoiceTemplatesView
        templates={state.templates || []}
        defaultTemplate={state.defaultTemplate}
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onSetDefault={templateHandlers.updateDefaultTemplate}
        onRefresh={templateHandlers.loadDefaultTemplate}
      />
    </SettingsLayout>
  )
}

export default InvoiceTemplatesIndex
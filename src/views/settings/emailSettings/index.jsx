'use client'

import { useSettingsHandlers } from '@/handlers/settings/useSettingsHandlers'
import EmailSettingsForm from './EmailSettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const EmailSettingsIndex = ({ initialData = {} }) => {
  const { 
    state, 
    emailSettingsHandlers 
  } = useSettingsHandlers(initialData)

  return (
    <SettingsLayout
      title="Email Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Email Settings', current: true }
      ]}
    >
      <EmailSettingsForm
        emailSettings={state.emailSettings || {}}
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onUpdate={emailSettingsHandlers.updateEmailSettings}
        onRefresh={emailSettingsHandlers.loadEmailSettings}
      />
    </SettingsLayout>
  )
}

export default EmailSettingsIndex
'use client'

import { useSettingsHandlers } from '@/handlers/settings/useSettingsHandlers'
import ChangePasswordForm from './ChangePasswordForm'
import SettingsLayout from '../shared/SettingsLayout'

const ChangePasswordIndex = () => {
  const { 
    state, 
    passwordHandlers 
  } = useSettingsHandlers()

  return (
    <SettingsLayout
      title="Change Password"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Change Password', current: true }
      ]}
    >
      <ChangePasswordForm
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onChangePassword={passwordHandlers.changePassword}
      />
    </SettingsLayout>
  )
}

export default ChangePasswordIndex
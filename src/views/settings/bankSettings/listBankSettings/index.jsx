'use client'

import { useBankSettingsHandlers } from '@/handlers/settings/useBankSettingsHandlers'
import BankSettingsList from './BankSettingsList'
import BankSettingsHead from './BankSettingsHead'
import SettingsLayout from '../../shared/SettingsLayout'

const BankSettingsListIndex = ({ initialData = {} }) => {
  const { 
    state, 
    dataHandlers,
    actionHandlers 
  } = useBankSettingsHandlers(initialData)

  return (
    <SettingsLayout
      title="Bank Settings"
      breadcrumb={[
        { label: 'Settings', href: '/settings' },
        { label: 'Bank Settings', current: true }
      ]}
    >
      <BankSettingsHead />
      <BankSettingsList
        banks={state.banks || []}
        pagination={state.pagination}
        loading={state.loading}
        deleting={state.deleting}
        error={state.error}
        onRefresh={dataHandlers.loadBanks}
        onDelete={actionHandlers.deleteBanks}
        onClearError={actionHandlers.clearError}
      />
    </SettingsLayout>
  )
}

export default BankSettingsListIndex
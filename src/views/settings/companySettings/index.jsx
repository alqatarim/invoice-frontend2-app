'use client'

import { useSettingsHandlers } from '@/handlers/settings/useSettingsHandlers'
import CompanySettingsForm from './CompanySettingsForm'
import SettingsLayout from '../shared/SettingsLayout'

const CompanySettingsIndex = ({ initialData = {} }) => {
  const { 
    state, 
    companyHandlers 
  } = useSettingsHandlers(initialData)

  return (
    <SettingsLayout initialData={initialData}>
      <CompanySettingsForm
        companySettings={state.companySettings || {}}
        loading={state.loading}
        updating={state.updating}
        error={state.error}
        onUpdate={companyHandlers.updateCompanySettings}
        onRefresh={companyHandlers.loadCompanySettings}
      />
    </SettingsLayout>
  )
}

export default CompanySettingsIndex
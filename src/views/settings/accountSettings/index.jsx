// Component Imports
import SettingsLayout from '../shared/SettingsLayout'
import AccountSettingsTab from './AccountSettingsTab'

const AccountSettingsIndex = ({ initialData = {} }) => {
     return (
          <SettingsLayout
               title="Account Settings"
               breadcrumb={[
                    { label: 'Settings', href: '/settings' },
                    { label: 'Account Settings' }
               ]}
          >
               <AccountSettingsTab initialData={initialData} />
          </SettingsLayout>
     )
}

export default AccountSettingsIndex

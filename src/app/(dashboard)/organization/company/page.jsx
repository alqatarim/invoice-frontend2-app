import { Typography } from '@mui/material'
import CompanySettingsTab from '@/views/settings/companySettings/CompanySettingsTab'
import { getCompanySettings } from '@/app/(dashboard)/settings/actions'

export const metadata = {
  title: 'Company Profile | Kanakku',
}

const CompanyProfilePage = async () => {
  const result = await getCompanySettings()

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h4' component='h1' gutterBottom>
          Company Profile
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Manage the legal company identity, branding, operating hours, and headquarters location for this tenant.
        </Typography>
      </div>

      <CompanySettingsTab
        initialData={{ companySettings: result?.success ? result.data : {} }}
      />
    </div>
  )
}

export default CompanyProfilePage

import CompanyIndex from '@/views/company/index'
import { normalizeCompanyProfile } from '@/views/company/normalizeCompanyProfile'
import { getCompanyProfile, getProvinces } from './actions'

export const metadata = {
  title: 'Company Profile | Kanakku',
}

const CompanyPage = async () => {
  let initialCompanyProfile = {}
  let initialProvinces = []
  let initialErrorMessage = ''

  try {
    const [companyResult, provincesResult] = await Promise.all([
      getCompanyProfile(),
      getProvinces(),
    ])

    if (companyResult?.success) {
      initialCompanyProfile = normalizeCompanyProfile(companyResult.data)
    } else {
      initialErrorMessage = companyResult?.message || 'Failed to load company profile.'
    }

    initialProvinces = provincesResult?.success ? provincesResult.data || [] : []
  } catch (error) {
    console.error('CompanyPage: Error fetching company profile:', error)
    initialErrorMessage = error?.message || 'Failed to load company profile.'
  }

  return (
    <CompanyIndex
      initialCompanyProfile={initialCompanyProfile}
      initialProvinces={initialProvinces}
      initialErrorMessage={initialErrorMessage}
    />
  )
}

export default CompanyPage

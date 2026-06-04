import RolesListIndex from '@/views/roles-permission/listRoles/index'
import { getInitialRolesData } from '@/app/(dashboard)/roles-permission/actions'

export const metadata = {
  title: 'Access Control | Kanakku',
}

export default async function AccessControlPage() {
  let initialRoles = []
  let initialCardCounts = {
    totalRoles: 0,
    activeRoles: 0,
    superAdminRole: 0,
  }
  let initialErrorMessage = ''

  try {
    const initialData = await getInitialRolesData()
    initialRoles = initialData?.roles || []
    initialCardCounts = initialData?.cardCounts || initialCardCounts
  } catch (error) {
    console.error('AccessControlPage: Failed to load roles data:', error)
    initialErrorMessage = error?.message || 'Failed to load roles.'
  }

  return (
    <RolesListIndex
      initialRoles={initialRoles}
      initialCardCounts={initialCardCounts}
      initialErrorMessage={initialErrorMessage}
    />
  )
}

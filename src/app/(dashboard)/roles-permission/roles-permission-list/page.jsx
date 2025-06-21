import { getInitialRolesData } from '../actions'
import RolesListIndex from '@/views/roles-permission/listRoles/index'
import ProtectedComponent from '@/components/ProtectedComponent'

export default async function RolesListPage() {
  // Fetch initial data server-side
  const initialData = await getInitialRolesData()

  return (
    <ProtectedComponent moduleId='role' permissionType='view'>
      <RolesListIndex initialData={initialData} />
    </ProtectedComponent>
  )
}
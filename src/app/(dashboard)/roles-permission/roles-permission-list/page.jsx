import { getInitialRolesData } from '../actions'
import RolesListIndex from '@/views/roles-permission/listRoles/index'

export default async function RolesListPage() {
  // Fetch initial data server-side
  const initialData = await getInitialRolesData()

  return (
    <RolesListIndex initialData={initialData} />
  )
}
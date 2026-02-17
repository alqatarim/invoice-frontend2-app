import { getPermissionsByRoleId } from '../../actions'
import PermissionsViewIndex from '@/views/roles-permission/viewPermissions'

export default async function PermissionsViewPage({ params }) {
  // Fetch permissions data server-side
  const { permissions, roleName } = await getPermissionsByRoleId(params.id)

  return (
    <PermissionsViewIndex 
      roleId={params.id}
      initialPermissions={permissions}
      roleName={roleName}
    />
  )
}
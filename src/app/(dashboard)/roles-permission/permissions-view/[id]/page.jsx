import { getPermissionsByRoleId } from '../../actions'
import PermissionsViewIndex from '@/views/roles-permission/viewPermissions'
import ProtectedComponent from '@/components/layout/Protected-Component/ProtectedComponent'

export default async function PermissionsViewPage({ params }) {
  // Fetch permissions data server-side
  const { permissions, roleName } = await getPermissionsByRoleId(params.id)

  return (
    <ProtectedComponent moduleId='role' permissionType='update'>
      <PermissionsViewIndex 
        roleId={params.id}
        initialPermissions={permissions}
        roleName={roleName}
      />
    </ProtectedComponent>
  )
}
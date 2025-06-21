'use client'

import ViewPermissions from './ViewPermissions'

const PermissionsViewIndex = ({ roleId, initialPermissions, roleName }) => {
  return (
    <ViewPermissions 
      roleId={roleId}
      initialPermissions={initialPermissions}
      roleName={roleName}
    />
  )
}

export default PermissionsViewIndex
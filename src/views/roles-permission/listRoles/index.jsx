'use client'

import RolesList from './RolesList'

const RolesListIndex = ({
  initialRoles = [],
  initialCardCounts = {},
  initialErrorMessage = ''
}) => {
  return (
    <RolesList
      initialRoles={initialRoles}
      initialCardCounts={initialCardCounts}
      initialErrorMessage={initialErrorMessage}
    />
  )
}

export default RolesListIndex
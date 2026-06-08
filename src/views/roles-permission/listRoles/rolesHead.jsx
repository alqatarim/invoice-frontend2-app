'use client'

import { useMemo } from 'react'
import PageIconHeader from '@components/headers/PageIconHeader'
import StatCardGrid from '@/components/shared/StatCardGrid'

const RolesHead = ({ cardCounts }) => {
  const statCards = useMemo(
    () => [
      {
        title: 'Total Roles',
        value: cardCounts?.totalRoles || 0,
        icon: 'ri-group-line',
        color: 'primary',
      },
      {
        title: 'Active Roles',
        value: cardCounts?.activeRoles || 0,
        icon: 'ri-check-double-line',
        color: 'success',
      },
      {
        title: 'Super Admin',
        value: cardCounts?.superAdminRole || 0,
        icon: 'ri-admin-line',
        color: 'warning',
      },
    ],
    [cardCounts]
  )

  return (
    <>
      <PageIconHeader title='Access Control' icon='ri-group-line' />
      <StatCardGrid cards={statCards} />
    </>
  )
}

export default RolesHead

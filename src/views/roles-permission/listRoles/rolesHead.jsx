'use client'

import { useMemo } from 'react'
import { Grid } from '@mui/material'
import PageIconHeader from '@components/headers/PageIconHeader'
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder'

const RolesHead = ({ cardCounts }) => {
  const statCards = useMemo(
    () => [
      {
        title: 'Total Roles',
        value: cardCounts?.totalRoles || 0,
        subtitle: 'No of Roles',
        icon: 'ri-group-line',
        color: 'primary',
      },
      {
        title: 'Active Roles',
        value: cardCounts?.activeRoles || 0,
        subtitle: 'No of Active Roles',
        icon: 'ri-check-double-line',
        color: 'success',
      },
      {
        title: 'Super Admin',
        value: cardCounts?.superAdminRole || 0,
        subtitle: 'No of Super Admin',
        icon: 'ri-admin-line',
        color: 'warning',
      },
    ],
    [cardCounts]
  )

  return (
    <>
      <PageIconHeader title='Access Control' icon='ri-group-line' />

      <div className="mb-2">
        <Grid container className='flex flex-wrap justify-between gap-0'>
          {statCards.map(card => (
            <Grid key={card.title}>
              <HorizontalWithoutBorder {...card} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  )
}

export default RolesHead
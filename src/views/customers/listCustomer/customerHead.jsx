'use client'

import React, { useMemo } from 'react'
import { Grid } from '@mui/material'
import PageIconHeader from '@components/headers/PageIconHeader'
import HorizontalWithoutBorder from '@/components/card-statistics/HorizontalWithoutBorder'
import { getDefaultCustomerSummary } from './customerSummary'



const percentOfTotal = (value, total) => Math.round((value / Math.max(total, 1)) * 100)

const CustomerHead = ({ summary = getDefaultCustomerSummary() }) => {
  // const theme = useTheme()

  const customerStats = useMemo(
    () => ({
      ...getDefaultCustomerSummary(),
      ...(summary || {}),
    }),
    [summary]
  )

  const statCards = useMemo(() => {
    const {
      totalCustomers,
      paidCustomers,
      outstandingCustomers,
      dueCustomers,
    } = customerStats

    return [
      {
        title: 'Total Customers',
        value: totalCustomers,
        icon: 'mdi:user-multiple-outline',
        color: 'primary',
        indicator: `${totalCustomers} total`,
      },
      {
        title: 'Paid Customers',
        value: paidCustomers,
        icon: 'mdi:account-check-outline',
        color: 'success',
        indicator: `${percentOfTotal(paidCustomers, totalCustomers)}%`,
      },
      {
        title: 'Outstanding',
        value: outstandingCustomers,
        icon: 'mdi:account-clock-outline',
        color: 'warning',
        indicator: `${percentOfTotal(outstandingCustomers, totalCustomers)}%`,
      },
      {
        title: 'Due Customers',
        value: dueCustomers,
        icon: 'mdi:account-alert-outline',
        color: 'error',
        indicator: `${percentOfTotal(dueCustomers, totalCustomers)}%`,
      },
    ]
  }, [customerStats])

  return (
    <>
      <PageIconHeader title='Customers' iconSize={30} icon='mdi:account-group-outline' />

      <div className='mb-2'>
        <Grid container className='flex flex-wrap justify-between gap-0'>
          {statCards.map((card, index) => (
            <Grid key={card.title} >
              <HorizontalWithoutBorder {...card} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  )
}

export default CustomerHead

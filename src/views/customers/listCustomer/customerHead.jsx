'use client'

import React, { useMemo } from 'react'
import PageIconHeader from '@components/headers/PageIconHeader'
import StatCardGrid from '@/components/shared/StatCardGrid'

const percentOfTotal = (value, total) => Math.round((value / Math.max(total, 1)) * 100)

const CustomerHead = ({ customerListData }) => {
  const cardCounts = useMemo(
    () => ({
      totalCustomers: customerListData?.totalCustomers || 0,
      paidCustomers: customerListData?.paidCustomers || 0,
      outstandingCustomers: customerListData?.outstandingCustomers || 0,
      dueCustomers: customerListData?.dueCustomers || 0,
    }),
    [customerListData]
  )

  const statCards = useMemo(() => {
    const {
      totalCustomers,
      paidCustomers,
      outstandingCustomers,
      dueCustomers,
    } = cardCounts

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
  }, [cardCounts])

  return (
    <>
      <PageIconHeader title='Customers' iconSize={30} icon='mdi:account-group-outline' />
      <StatCardGrid cards={statCards} />
    </>
  )
}

export default CustomerHead

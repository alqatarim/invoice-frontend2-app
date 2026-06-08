'use client';

import React, { useMemo } from 'react';
import PageIconHeader from '@components/headers/PageIconHeader';
import StatCardGrid from '@/components/shared/StatCardGrid';

const VendorHead = ({ vendorListData }) => {
  const vendorStats = useMemo(
    () =>
      (vendorListData || []).reduce(
        (acc, vendor) => {
          acc.totalVendors += 1;

          if (vendor.status === true) {
            acc.activeVendors += 1;
          } else {
            acc.inactiveVendors += 1;
          }

          const balance = Number(vendor.balance) || 0;

          if (balance > 0) {
            acc.totalBalance += vendor.balanceType === 'Debit' ? -balance : balance;
          }

          return acc;
        },
        {
          totalVendors: 0,
          activeVendors: 0,
          inactiveVendors: 0,
          totalBalance: 0,
        }
      ),
    [vendorListData]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Vendors',
        value: vendorStats.totalVendors,
        icon: 'mdi:truck-outline',
        color: 'primary',
      },
      {
        title: 'Active Vendors',
        value: vendorStats.activeVendors,
        icon: 'mdi:truck-check-outline',
        color: 'success',
      },
      {
        title: 'Inactive Vendors',
        value: vendorStats.inactiveVendors,
        icon: 'mdi:truck-remove-outline',
        color: 'error',
      },
      {
        title: 'Total Balance',
        value: Math.abs(vendorStats.totalBalance),
        subtitle: vendorStats.totalBalance >= 0 ? 'Credit' : 'Debit',
        icon: 'hugeicons:saudi-riyal',
        color: 'info',
        isCurrency: true,
      },
    ],
    [vendorStats]
  );

  return (
    <>
      <PageIconHeader title='Vendors' iconSize={30} icon='mdi:truck-outline' />
      <StatCardGrid cards={statCards} />
    </>
  );
};

export default VendorHead;

'use client';

import React, { useMemo } from 'react';
import PageIconHeader from '@components/headers/PageIconHeader';
import StatCardGrid from '@/components/shared/StatCardGrid';
import { branchesOptions } from '@/data/dataSets';

const BranchHead = ({ summary = {} }) => {
  const stats = useMemo(() => {
    const total = Number(summary.totalLocations || summary.total || 0);
    const stores = Number(summary.stores || 0);
    const warehouses = Number(summary.warehouses || 0);

    return { total, stores, warehouses };
  }, [summary]);

  const statCards = useMemo(
    () => [
      {
        title: 'Total Locations',
        value: stats.total,
        icon: branchesOptions.find(option => option.value === 'Locations')?.icon || 'mdi:location-multiple-outline',
        color: branchesOptions.find(option => option.value === 'Locations')?.color || 'primary',
      },
      {
        title: 'Stores',
        value: stats.stores,
        icon: branchesOptions.find(option => option.value === 'Store')?.icon || 'mdi:storefront-outline',
        color: branchesOptions.find(option => option.value === 'Store')?.color || 'info',
      },
      {
        title: 'Warehouses',
        value: stats.warehouses,
        icon: branchesOptions.find(option => option.value === 'Warehouse')?.icon || 'mdi:warehouse',
        color: branchesOptions.find(option => option.value === 'Warehouse')?.color || 'success',
      },
    ],
    [stats]
  );

  return (
    <>
      <PageIconHeader title='Stores & Warehouses' icon='mdi:location-multiple-outline' />
      <StatCardGrid cards={statCards} />
    </>
  );
};

export default BranchHead;

'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
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
        // subtitle: 'Stores And Warehouses',
        icon: branchesOptions.find(option => option.value === 'Locations')?.icon || 'mdi:location-multiple-outline',
        color: branchesOptions.find(option => option.value === 'Locations')?.color || 'primary',
      },
      {
        title: 'Stores',
        value: stats.stores,
        // subtitle: 'Retail Stores',
        icon: branchesOptions.find(option => option.value === 'Store')?.icon || 'mdi:storefront-outline',
        color: branchesOptions.find(option => option.value === 'Store')?.color || 'info',
      },
      {
        title: 'Warehouses',
        value: stats.warehouses,
        // subtitle: 'Storage Sites',
        icon: branchesOptions.find(option => option.value === 'Warehouse')?.icon || 'mdi:warehouse',
        color: branchesOptions.find(option => option.value === 'Warehouse')?.color || 'success',
      },
    ],
    [stats]
  );

  return (
    <>
      <PageIconHeader title='Stores & Warehouses' icon='mdi:location-multiple-outline' />

      <div className="mb-2">
        <Grid container className='flex flex-wrap justify-between gap-0'>
          {statCards.map((card) => (
            <Grid key={card.title}>
              <HorizontalWithoutBorder {...card} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default BranchHead;

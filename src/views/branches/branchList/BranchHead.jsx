'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

const BranchHead = ({ branches = [] }) => {
  const stats = useMemo(() => {
    const total = branches.length;
    const stores = branches.filter(item => item.kind === 'STORE' || item.branchType === 'Store').length;
    const warehouses = branches.filter(item => item.kind === 'WAREHOUSE' || item.branchType === 'Warehouse').length;
    return { total, stores, warehouses };
  }, [branches]);

  const statCards = useMemo(
    () => [
      {
        title: 'Total Locations',
        value: stats.total,
        subtitle: 'Stores And Warehouses',
        icon: 'mdi:map-marker',
        color: 'primary',
      },
      {
        title: 'Stores',
        value: stats.stores,
        subtitle: 'Retail Stores',
        icon: 'mdi:storefront-outline',
        color: 'info',
      },
      {
        title: 'Warehouses',
        value: stats.warehouses,
        subtitle: 'Storage Sites',
        icon: 'mdi:warehouse',
        color: 'success',
      },
    ],
    [stats]
  );

  return (
    <>
      <PageIconHeader title='Stores & Warehouses' icon='mdi:map-marker' />

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

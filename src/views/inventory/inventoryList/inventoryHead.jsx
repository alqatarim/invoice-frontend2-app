'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

const getCountCard = (value) => ({
  count: Number(value?.count || 0),
  totalValue: Number(value?.total_value || 0),
});

const InventoryHead = ({ inventoryListData }) => {
  const inventoryStats = useMemo(
    () => ({
      totalItems: getCountCard(inventoryListData?.total_items?.[0]),
      lowStock: getCountCard(inventoryListData?.low_stock?.[0]),
      outOfStock: getCountCard(inventoryListData?.out_of_stock?.[0]),
      totalValue: getCountCard(inventoryListData?.total_value?.[0]),
    }),
    [inventoryListData]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Items',
        value: inventoryStats.totalItems.count,
        icon: 'tabler:package',
        color: 'primary',
      },
      {
        title: 'Low Stock',
        value: inventoryStats.lowStock.count,
        icon: 'mdi:package-down',
        color: 'warning',
      },
      {
        title: 'Out Of Stock',
        value: inventoryStats.outOfStock.count,
        icon: 'mdi:package-variant-remove',
        color: 'error',
      },
      {
        title: 'Total Value',
        value: inventoryStats.totalValue.totalValue,
        icon: 'lucide:saudi-riyal',
        color: 'success',
        isCurrency: true,
      },
    ],
    [inventoryStats]
  );

  return (
    <>
      <PageIconHeader title='Inventory' iconSize={30} icon='tabler:package' />

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

export default InventoryHead;
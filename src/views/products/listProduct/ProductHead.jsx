'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * ProductHead Component - Displays product statistics header
 */
const ProductHead = ({ summary = {} }) => {
  const productStats = useMemo(
    () => ({
      totalProducts: Number(summary.totalProducts || 0),
      activeProducts: Number(summary.activeProducts || 0),
      inactiveProducts: Number(summary.inactiveProducts || 0),
      totalValue: Number(summary.totalValue || 0),
    }),
    [summary]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Products',
        value: productStats.totalProducts,
        icon: 'mdi:package-variant',
        color: 'primary',
      },
      {
        title: 'Active Products',
        value: productStats.activeProducts,
        subtitle: `${Math.round((productStats.activeProducts / Math.max(productStats.totalProducts, 1)) * 100)}%`,
        icon: 'mdi:check-circle',
        color: 'success',
      },
      {
        title: 'Inactive Products',
        value: productStats.inactiveProducts,
        subtitle: `${Math.round((productStats.inactiveProducts / Math.max(productStats.totalProducts, 1)) * 100)}%`,
        icon: 'mdi:close-circle',
        color: 'error',
      },
      // {
      //   title: 'Total Value',
      //   value: productStats.totalValue,
      //   subtitle: 'Selling Price',
      //   icon: 'hugeicons:saudi-riyal',
      //   color: 'info',
      // },
    ],
    [productStats]
  );

  return (
    <>
      <PageIconHeader title='Products' iconSize={30} icon='mdi:package-variant' />

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
  );
};

export default ProductHead;
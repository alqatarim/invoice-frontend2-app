'use client';

import React, { useMemo } from 'react';
import PageIconHeader from '@components/headers/PageIconHeader';
import StatCardGrid from '@/components/shared/StatCardGrid';

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
    ],
    [productStats]
  );

  return (
    <>
      <PageIconHeader title='Products' iconSize={30} icon='mdi:package-variant' />
      <StatCardGrid cards={statCards} />
    </>
  );
};

export default ProductHead;

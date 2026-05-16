'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * PurchaseOrderHead Component - Displays purchase order statistics header
 */
const PurchaseOrderHead = ({ purchaseOrderListData }) => {
  const purchaseOrderStats = useMemo(() => {
    const stats = (purchaseOrderListData || []).reduce(
      (accumulator, order) => {
        accumulator.totalOrders += 1;
        accumulator.totalAmount += Number(order.TotalAmount) || 0;
        accumulator.activeOrders += 1;

        return accumulator;
      },
      {
        totalOrders: 0,
        totalAmount: 0,
        activeOrders: 0,
      }
    );

    return {
      ...stats,
      avgOrderValue: stats.totalOrders > 0 ? stats.totalAmount / stats.totalOrders : 0,
    };
  }, [purchaseOrderListData]);

  const statCards = useMemo(
    () => [
      {
        title: 'Total Orders',
        value: purchaseOrderStats.totalOrders,
        subtitle: `${purchaseOrderStats.activeOrders} active`,
        icon: 'tabler:file-invoice',
        color: 'primary',
      },
      {
        title: 'Active Orders',
        value: purchaseOrderStats.activeOrders,
        subtitle: `${Math.round((purchaseOrderStats.activeOrders / Math.max(purchaseOrderStats.totalOrders, 1)) * 100)}%`,
        icon: 'mdi:check-circle-outline',
        color: 'success',
      },
      {
        title: 'Total Amount',
        value: purchaseOrderStats.totalAmount,
        subtitle: 'Total Value',
        icon: 'hugeicons:saudi-riyal',
        color: 'info',
        isCurrency: true,
      },
      {
        title: 'Average Value',
        value: purchaseOrderStats.avgOrderValue,
        subtitle: 'Avg Order',
        icon: 'mdi:chart-line',
        color: 'warning',
        isCurrency: true,
      },
    ],
    [purchaseOrderStats]
  );

  return (
    <>
      <PageIconHeader title='Purchase Orders' icon='tabler:file-invoice' />

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

export default PurchaseOrderHead;
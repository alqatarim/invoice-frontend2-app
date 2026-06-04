'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
import { purchaseOrderStatusDefinitions } from '@/data/dataSets';

const formatCountSubtitle = count => `${count} ${count === 1 ? 'order' : 'orders'}`;

const PurchaseOrderHead = ({ purchaseOrderStatsData }) => {
  const cardCounts = useMemo(
    () => ({
      total: purchaseOrderStatsData?.total_purchase_orders?.[0] || {},
      pending: purchaseOrderStatsData?.total_pending?.[0] || {},
      approved: purchaseOrderStatsData?.total_approved?.[0] || {},
      rejected: purchaseOrderStatsData?.total_rejected?.[0] || {},
    }),
    [purchaseOrderStatsData]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Orders',
        value: cardCounts.total?.total_sum || 0,
        subtitle: formatCountSubtitle(cardCounts.total?.count || 0),
        icon: 'tabler:file-invoice',
        color: 'primary',
        isCurrency: true,
      },
      ...purchaseOrderStatusDefinitions
        .filter(status => status.summaryKey)
        .map(status => ({
          title: status.label,
          value: cardCounts[status.summaryKey]?.total_sum || 0,
          subtitle: formatCountSubtitle(cardCounts[status.summaryKey]?.count || 0),
          icon: status.icon,
          color: status.color,
          isCurrency: true,
        })),
    ],
    [cardCounts]
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

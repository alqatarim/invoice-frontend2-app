'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
import { deliveryChallanStatusOptions } from '@/data/dataSets';

const formatCountSubtitle = (count) => `${count} ${count === 1 ? 'challan' : 'challans'}`;

const DeliveryChallanHead = ({ summary = {} }) => {
  const cardCounts = useMemo(
    () => ({
      totalDeliveryAmount: summary.totalDeliveryAmount || 0,
      totalDeliveryChallans: summary.totalDeliveryChallans || 0,
      active: summary.active || { amount: 0, count: 0 },
      converted: summary.converted || { amount: 0, count: 0 },
      cancelled: summary.cancelled || { amount: 0, count: 0 },
    }),
    [summary]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Challans',
        value: cardCounts.totalDeliveryAmount,
        subtitle: formatCountSubtitle(cardCounts.totalDeliveryChallans),
        icon: 'tabler:truck-delivery',
        color: 'primary',
        isCurrency: true,
      },
      ...deliveryChallanStatusOptions.map((status) => ({
        title: status.label,
        value: cardCounts[status.summaryKey]?.amount || 0,
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
      <PageIconHeader title="Delivery Challans" icon="tabler:truck-delivery" />

      <div className="mb-2">
        <Grid container className="flex flex-wrap justify-between gap-0">
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

export default DeliveryChallanHead;

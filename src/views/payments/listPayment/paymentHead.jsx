'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
import { paymentStatusDefinitions } from '@/data/dataSets';

const formatCountSubtitle = count => `${count} ${count === 1 ? 'payment' : 'payments'}`;

const PaymentHead = ({ summary = {} }) => {
  const cardCounts = useMemo(
    () => ({
      totalAmount: Number(summary.totalAmount || 0),
      totalCount: Number(summary.totalCount || 0),
      pending: summary.pending || { amount: 0, count: 0 },
      success: summary.success || { amount: 0, count: 0 },
      failed: summary.failed || { amount: 0, count: 0 },
    }),
    [summary]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total',
        value: cardCounts.totalAmount,
        subtitle: formatCountSubtitle(cardCounts.totalCount),
        icon: 'ri-bank-card-line',
        color: 'primary',
        isCurrency: true,
      },
      ...paymentStatusDefinitions.map(status => ({
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
      <PageIconHeader title="Payments" icon="ri-bank-card-line" />

      <div className="mb-2">
        <Grid container className="flex flex-wrap justify-between gap-0">
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

export default PaymentHead;

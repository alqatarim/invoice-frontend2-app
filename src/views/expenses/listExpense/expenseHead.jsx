'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';
import { expenseStatusDefinitions } from '@/data/dataSets';

const formatCountSubtitle = count => `${count} ${count === 1 ? 'expense' : 'expenses'}`;

const ExpenseHead = ({ summary = {} }) => {
  const cardCounts = useMemo(
    () => ({
      totalAmount: Number(summary.totalAmount || 0),
      totalCount: Number(summary.totalCount || 0),
      paid: summary.paid || { amount: 0, count: 0 },
      pending: summary.pending || { amount: 0, count: 0 },
      cancelled: summary.cancelled || { amount: 0, count: 0 },
    }),
    [summary]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total',
        value: cardCounts.totalAmount,
        subtitle: formatCountSubtitle(cardCounts.totalCount),
        icon: 'tdesign:money',
        color: 'primary',
        isCurrency: true,
      },
      ...expenseStatusDefinitions.map(status => ({
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
      <PageIconHeader title="Expenses" icon="tdesign:money" />

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

export default ExpenseHead;

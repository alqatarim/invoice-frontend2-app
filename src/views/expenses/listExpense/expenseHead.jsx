'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * ExpenseHead Component - Displays expense statistics header
 */
const ExpenseHead = ({ expenseListData }) => {
  const expenseStats = useMemo(() => {
    if (!expenseListData?.length) {
      return {
        totalExpenses: 0,
        totalAmount: 0,
        paidExpenses: 0,
        pendingExpenses: 0,
      };
    }

    return expenseListData.reduce(
      (accumulator, expense) => {
        accumulator.totalExpenses += 1;
        accumulator.totalAmount += Number(expense.amount) || 0;

        if (expense.status?.toLowerCase() === 'paid') {
          accumulator.paidExpenses += 1;
        } else if (expense.status?.toLowerCase() === 'pending') {
          accumulator.pendingExpenses += 1;
        }

        return accumulator;
      },
      {
        totalExpenses: 0,
        totalAmount: 0,
        paidExpenses: 0,
        pendingExpenses: 0,
      }
    );
  }, [expenseListData]);

  const statCards = useMemo(
    () => [
      {
        title: 'Total Expenses',
        value: expenseStats.totalExpenses,
        subtitle: `${expenseStats.paidExpenses} paid`,
        icon: 'tabler:receipt',
        color: 'primary',
      },
      {
        title: 'Paid Expenses',
        value: expenseStats.paidExpenses,
        subtitle: `${Math.round((expenseStats.paidExpenses / Math.max(expenseStats.totalExpenses, 1)) * 100)}%`,
        icon: 'mdi:check-circle-outline',
        color: 'success',
      },
      {
        title: 'Pending Expenses',
        value: expenseStats.pendingExpenses,
        subtitle: `${Math.round((expenseStats.pendingExpenses / Math.max(expenseStats.totalExpenses, 1)) * 100)}%`,
        icon: 'mdi:clock-outline',
        color: 'warning',
      },
      {
        title: 'Total Amount',
        value: expenseStats.totalAmount,
        subtitle: 'All Expenses',
        icon: 'hugeicons:saudi-riyal',
        color: 'info',
        isCurrency: true,
      },
    ],
    [expenseStats]
  );

  return (
    <>
      <PageIconHeader title='Expenses' icon='tabler:receipt' />

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

export default ExpenseHead;
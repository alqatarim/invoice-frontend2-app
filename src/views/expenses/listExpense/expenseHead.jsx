'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * ExpenseHead Component - Displays expense statistics header
 */
const ExpenseHead = ({ expenseListData }) => {
  const theme = useTheme();
  const [expenseStats, setExpenseStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    paidExpenses: 0,
    pendingExpenses: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      if (expenseListData && expenseListData.length > 0) {
        const stats = expenseListData.reduce((acc, expense) => {
          // Count total expenses
          acc.totalExpenses++;

          // Calculate total amount
          const amount = Number(expense.amount) || 0;
          acc.totalAmount += amount;

          // Count by status
          if (expense.status?.toLowerCase() === 'paid') {
            acc.paidExpenses++;
          } else if (expense.status?.toLowerCase() === 'pending') {
            acc.pendingExpenses++;
          }

          return acc;
        }, {
          totalExpenses: 0,
          totalAmount: 0,
          paidExpenses: 0,
          pendingExpenses: 0,
        });

        setExpenseStats(stats);
      } else {
        // Reset stats when no data
        setExpenseStats({
          totalExpenses: 0,
          totalAmount: 0,
          paidExpenses: 0,
          pendingExpenses: 0,
        });
      }
    };

    calculateStats();
  }, [expenseListData]);

  const currencySymbol = '﷼'; // Saudi Riyal symbol

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="tabler:receipt" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Expenses
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Total Expenses"
              subtitle="All Expenses"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={expenseStats.totalExpenses.toString()}
              statsVariant='h4'
              trendNumber={`${expenseStats.paidExpenses} Paid`}
              trendNumberVariant='body1'
              avatarIcon='tabler:receipt'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Paid Expenses"
              subtitle="Completed"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={expenseStats.paidExpenses.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((expenseStats.paidExpenses / Math.max(expenseStats.totalExpenses, 1)) * 100)}%`}
              trendNumberVariant='body1'
              avatarIcon='mdi:check-circle-outline'
              color="success"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Pending Expenses"
              subtitle="To be Paid"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={expenseStats.pendingExpenses.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((expenseStats.pendingExpenses / Math.max(expenseStats.totalExpenses, 1)) * 100)}%`}
              trendNumberVariant='body1'
              avatarIcon='mdi:clock-outline'
              color="warning"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Total Amount"
              subtitle="Total Value"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(expenseStats.totalAmount)}`}
              statsVariant='h4'
              trendNumber="All Expenses"
              trendNumberVariant='body1'
              avatarIcon='mdi:currency-usd'
              color="info"
              iconSize='35px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default ExpenseHead;
'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import { getPurchaseList } from '@/app/(dashboard)/purchases/actions';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * PurchaseHead Component - Displays purchase statistics header
 */
const PurchaseHead = ({ purchaseListData }) => {
  const theme = useTheme();
  const [cardCounts, setCardCounts] = useState({
    totalPurchases: { total_sum: 0, count: 0 },
    totalPaid: { total_sum: 0, count: 0 },
    totalPending: { total_sum: 0, count: 0 },
    totalOverdue: { total_sum: 0, count: 0 }
  });

  useEffect(() => {
    const fetchCardCounts = async () => {
      try {
        const response = await getPurchaseList(1, 1000); // Get all purchases for stats
        if (response.success && response.data) {
          const purchases = response.data;

          const totalPurchases = {
            total_sum: purchases.reduce((sum, p) => sum + (Number(p.TotalAmount) || 0), 0),
            count: purchases.length
          };

          const paidPurchases = purchases.filter(p => p.status === 'PAID');
          const totalPaid = {
            total_sum: paidPurchases.reduce((sum, p) => sum + (Number(p.TotalAmount) || 0), 0),
            count: paidPurchases.length
          };

          const pendingPurchases = purchases.filter(p => p.status === 'Pending');
          const totalPending = {
            total_sum: pendingPurchases.reduce((sum, p) => sum + (Number(p.TotalAmount) || 0), 0),
            count: pendingPurchases.length
          };

          const overduePurchases = purchases.filter(p => p.status === 'Overdue');
          const totalOverdue = {
            total_sum: overduePurchases.reduce((sum, p) => sum + (Number(p.TotalAmount) || 0), 0),
            count: overduePurchases.length
          };

          setCardCounts({
            totalPurchases,
            totalPaid,
            totalPending,
            totalOverdue
          });
        }
      } catch (error) {
        console.error('Error fetching purchase card counts:', error);
      }
    };

    fetchCardCounts();
  }, [purchaseListData]);

  const currencySymbol = 'SAR';

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="tabler:shopping-cart" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Purchases
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Total Purchases"
              subtitle="No of Purchases"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalPurchases?.total_sum)}`}
              statsVariant='h5'
              trendNumber={cardCounts.totalPurchases?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='tabler:shopping-cart'
              color="primary"
              iconSize='26px'
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Paid"
              subtitle="Completed Purchases"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalPaid?.total_sum)}`}
              statsVariant='h5'
              trendNumber={cardCounts.totalPaid?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='tabler:check'
              color="success"
              iconSize='26px'
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Pending"
              subtitle="Awaiting Payment"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalPending?.total_sum)}`}
              statsVariant='h5'
              trendNumber={cardCounts.totalPending?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='tabler:clock'
              color="warning"
              iconSize='26px'
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Overdue"
              subtitle="Payment Overdue"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalOverdue?.total_sum)}`}
              statsVariant='h5'
              trendNumber={cardCounts.totalOverdue?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='tabler:alert-triangle'
              color="error"
              iconSize='26px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default PurchaseHead;
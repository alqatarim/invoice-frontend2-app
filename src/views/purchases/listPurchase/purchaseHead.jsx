'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * PurchaseHead Component - Displays purchase statistics header
 */
const PurchaseHead = ({ purchaseListData }) => {
  const theme = useTheme();
  const [purchaseStats, setPurchaseStats] = useState({
    totalPurchases: 0,
    totalAmount: 0,
    avgPurchaseValue: 0,
    activePurchases: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      if (purchaseListData && purchaseListData.length > 0) {
        const stats = purchaseListData.reduce((acc, purchase) => {
          // Count total purchases
          acc.totalPurchases++;

          // Calculate total amount
          const amount = Number(purchase.TotalAmount) || 0;
          acc.totalAmount += amount;

          // Count active purchases (assume all are active for now)
          acc.activePurchases++;

          return acc;
        }, {
          totalPurchases: 0,
          totalAmount: 0,
          activePurchases: 0,
        });

        // Calculate average purchase value
        stats.avgPurchaseValue = stats.totalPurchases > 0 ? stats.totalAmount / stats.totalPurchases : 0;

        setPurchaseStats(stats);
      } else {
        // Reset stats when no data
        setPurchaseStats({
          totalPurchases: 0,
          totalAmount: 0,
          avgPurchaseValue: 0,
          activePurchases: 0,
        });
      }
    };

    calculateStats();
  }, [purchaseListData]);

  const currencySymbol = '﷼'; // Saudi Riyal symbol

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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Total Purchases"
              subtitle="All Purchases"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={purchaseStats.totalPurchases.toString()}
              statsVariant='h4'
              trendNumber={`${purchaseStats.activePurchases} Active`}
              trendNumberVariant='body1'
              avatarIcon='tabler:shopping-cart'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Active Purchases"
              subtitle="Currently Active"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={purchaseStats.activePurchases.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((purchaseStats.activePurchases / Math.max(purchaseStats.totalPurchases, 1)) * 100)}%`}
              trendNumberVariant='body1'
              avatarIcon='mdi:check-circle-outline'
              color="success"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Total Amount"
              subtitle="Total Value"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(purchaseStats.totalAmount)}`}
              statsVariant='h4'
              trendNumber="Total Value"
              trendNumberVariant='body1'
              avatarIcon='mdi:currency-usd'
              color="info"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Average Value"
              subtitle="Per Purchase"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(purchaseStats.avgPurchaseValue)}`}
              statsVariant='h4'
              trendNumber="Avg Purchase"
              trendNumberVariant='body1'
              avatarIcon='mdi:chart-line'
              color="warning"
              iconSize='35px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default PurchaseHead;
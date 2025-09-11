'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * PurchaseOrderHead Component - Displays purchase order statistics header
 */
const PurchaseOrderHead = ({ purchaseOrderListData }) => {
  const theme = useTheme();
  const [purchaseOrderStats, setPurchaseOrderStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    avgOrderValue: 0,
    activeOrders: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      if (purchaseOrderListData && purchaseOrderListData.length > 0) {
        const stats = purchaseOrderListData.reduce((acc, order) => {
          // Count total orders
          acc.totalOrders++;
          
          // Calculate total amount
          const amount = Number(order.TotalAmount) || 0;
          acc.totalAmount += amount;
          
          // Count active orders (assume all are active for now)
          acc.activeOrders++;
          
          return acc;
        }, {
          totalOrders: 0,
          totalAmount: 0,
          activeOrders: 0,
        });
        
        // Calculate average order value
        stats.avgOrderValue = stats.totalOrders > 0 ? stats.totalAmount / stats.totalOrders : 0;
        
        setPurchaseOrderStats(stats);
      } else {
        // Reset stats when no data
        setPurchaseOrderStats({
          totalOrders: 0,
          totalAmount: 0,
          avgOrderValue: 0,
          activeOrders: 0,
        });
      }
    };

    calculateStats();
  }, [purchaseOrderListData]);

  const currencySymbol = '﷼'; // Saudi Riyal symbol

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="tabler:file-invoice" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Purchase Orders
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Total Orders"
              subtitle="All Orders"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={purchaseOrderStats.totalOrders.toString()}
              statsVariant='h4'
              trendNumber={`${purchaseOrderStats.activeOrders} Active`}
              trendNumberVariant='body1'
              avatarIcon='tabler:file-invoice'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Active Orders"
              subtitle="Currently Active"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={purchaseOrderStats.activeOrders.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((purchaseOrderStats.activeOrders / Math.max(purchaseOrderStats.totalOrders, 1)) * 100)}%`}
              trendNumberVariant='body1'
              avatarIcon='mdi:check-circle-outline'
              color="success"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Total Amount"
              subtitle="Total Value"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(purchaseOrderStats.totalAmount)}`}
              statsVariant='h4'
              trendNumber="Total Value"
              trendNumberVariant='body1'
              avatarIcon='mdi:currency-usd'
              color="info"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Average Value"
              subtitle="Per Order"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(purchaseOrderStats.avgOrderValue)}`}
              statsVariant='h4'
              trendNumber="Avg Order"
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

export default PurchaseOrderHead;
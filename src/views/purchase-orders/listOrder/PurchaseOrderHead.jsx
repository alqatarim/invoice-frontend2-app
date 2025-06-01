'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import { getInitialPurchaseOrderData } from '@/app/(dashboard)/purchase-orders/actions';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * PurchaseOrderHead Component - Displays purchase order statistics header
 */
const PurchaseOrderHead = ({ purchaseOrderListData }) => {
  const theme = useTheme();
  const [cardCounts, setCardCounts] = useState({
    totalCancelled: {},
    totalPending: {},
    totalApproved: {},
    totalPurchaseOrder: {},
    totalDrafted: {},
    totalConverted: {}
  });

  useEffect(() => {
    const fetchCardCounts = async () => {
      try {
        const response = await getInitialPurchaseOrderData();
        if (response.cardCounts) {
          setCardCounts({
            totalCancelled: response.cardCounts.total_cancelled?.[0] || {},
            totalPending: response.cardCounts.total_pending?.[0] || {},
            totalApproved: response.cardCounts.total_approved?.[0] || {},
            totalPurchaseOrder: response.cardCounts.total_purchase_order?.[0] || {},
            totalDrafted: response.cardCounts.total_drafted?.[0] || {},
            totalConverted: response.cardCounts.total_converted?.[0] || {}
          });
        }
      } catch (error) {
        console.error('Error fetching purchase order card counts:', error);
      }
    };

    fetchCardCounts();
  }, [purchaseOrderListData]);

  const currencySymbol = purchaseOrderListData.currencySymbol || '$';

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight  w-12 h-12'>
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
          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Total Orders"
              subtitle="No of Orders"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalPurchaseOrder?.total_sum)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalPurchaseOrder?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='iconamoon:invoice'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Pending"
              subtitle="No of Pending"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalPending?.total_sum)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalPending?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:access-time'
              color="warning"
              iconSize='35px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Approved"
              subtitle="No of Approved"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalApproved?.total_sum)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalApproved?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:check-circle-outline'
              color="success"
              iconSize='35px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Drafts"
              subtitle="No of Drafts"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalDrafted?.total_sum)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalDrafted?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:draw-pen'
              color="info"
              iconSize='35px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default PurchaseOrderHead;
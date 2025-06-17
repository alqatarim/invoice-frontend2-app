'use client';

import React from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * DeliveryChallanHead Component - Displays delivery challan statistics header
 */
const DeliveryChallanHead = ({ deliveryChallanListData = {}, currencyData = '$', isLoading = false }) => {
  const theme = useTheme();

  const cardCounts = deliveryChallanListData || {};
  const currencySymbol = currencyData || '$';

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="tabler:truck-delivery" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Delivery Challans
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Total Challans"
              subtitle="No of Challans"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalDeliveryChallans?.total_sum || 0)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalDeliveryChallans?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='tabler:truck-delivery'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Active"
              subtitle="No of Active"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalActive?.total_sum || 0)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalActive?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:check-circle-outline'
              color="success"
              iconSize='35px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Converted"
              subtitle="No of Converted"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalConverted?.total_sum || 0)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalConverted?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:file-export-outline'
              color="info"
              iconSize='35px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Cancelled"
              subtitle="No of Cancelled"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalCancelled?.total_sum || 0)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalCancelled?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:cancel'
              color="error"
              iconSize='35px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default DeliveryChallanHead;
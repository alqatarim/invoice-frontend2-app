import React from 'react';
import { Box, Grid } from '@mui/material';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

const InventoryHead = ({ stats, isLoading }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}>
          <HorizontalWithBorder
            title="Total Products"
            subtitle="Products in Stock"
            titleVariant='h5'
            subtitleVariant='body2'
            stats={stats?.totalProducts || 0}
            statsVariant='h4'
            trendNumber={stats?.productsCount || 0}
            trendNumberVariant='body1'
            avatarIcon='icon-[mdi--package-variant]'
            color="primary"
            iconSize='35px'
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <HorizontalWithBorder
            title="Low Stock"
            subtitle="Products Low in Stock"
            titleVariant='h5'
            subtitleVariant='body2'
            stats={stats?.lowStock || 0}
            statsVariant='h4'
            trendNumber={stats?.lowStockCount || 0}
            trendNumberVariant='body1'
            avatarIcon='icon-[mdi--package-variant-minus]'
            color="warning"
            iconSize='35px'
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <HorizontalWithBorder
            title="Out of Stock"
            subtitle="Products Out of Stock"
            titleVariant='h5'
            subtitleVariant='body2'
            stats={stats?.outOfStock || 0}
            statsVariant='h4'
            trendNumber={stats?.outOfStockCount || 0}
            trendNumberVariant='body1'
            avatarIcon='icon-[mdi--package-variant-remove]'
            color="error"
            iconSize='35px'
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <HorizontalWithBorder
            title="Stock Value"
            subtitle="Total Stock Value"
            titleVariant='h5'
            subtitleVariant='body2'
            stats={`$${stats?.stockValue || 0}`}
            statsVariant='h4'
            trendNumber={stats?.stockValueChange || 0}
            trendNumberVariant='body1'
            avatarIcon='icon-[mdi--cash]'
            color="success"
            iconSize='35px'
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryHead;
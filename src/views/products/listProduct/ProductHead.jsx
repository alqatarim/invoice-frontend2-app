'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * ProductHead Component - Displays product statistics header
 */
const ProductHead = ({ productListData }) => {
  const theme = useTheme();
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    totalValue: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      if (productListData && productListData.length > 0) {
        const stats = productListData.reduce((acc, product) => {
          // Count total products
          acc.totalProducts++;
          
          // Count active/inactive products
          if (!product.isDeleted) {
            acc.activeProducts++;
          } else {
            acc.inactiveProducts++;
          }
          
          // Calculate total value (based on selling price)
          const price = Number(product.sellingPrice) || 0;
          acc.totalValue += price;
          
          return acc;
        }, {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          totalValue: 0,
        });
        
        setProductStats(stats);
      }
    };

    calculateStats();
  }, [productListData]);

  const currencySymbol = '﷼'; // Saudi Riyal symbol

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="mdi:package-variant" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Products
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Total Products"
              subtitle="All Products"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={productStats.totalProducts.toString()}
              statsVariant='h4'
              trendNumber={`${productStats.activeProducts} Active`}
              trendNumberVariant='body1'
              avatarIcon='mdi:package-variant'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Active Products"
              subtitle="Currently Active"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={productStats.activeProducts.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((productStats.activeProducts / Math.max(productStats.totalProducts, 1)) * 100)}%`}
              trendNumberVariant='body1'
              avatarIcon='mdi:check-circle'
              color="success"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Inactive Products"
              subtitle="Currently Inactive"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={productStats.inactiveProducts.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((productStats.inactiveProducts / Math.max(productStats.totalProducts, 1)) * 100)}%`}
              trendNumberVariant='body1'
              avatarIcon='mdi:close-circle'
              color="error"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Total Value"
              subtitle="Based on Selling Price"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(productStats.totalValue)}`}
              statsVariant='h4'
              trendNumber="Total"
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

export default ProductHead;
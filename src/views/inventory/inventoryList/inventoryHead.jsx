'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import { getInitialInventoryData } from '@/app/(dashboard)/inventory/actions';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * InventoryHead Component - Displays inventory statistics header
 */
const InventoryHead = ({ inventoryListData }) => {
  const theme = useTheme();
  const [cardCounts, setCardCounts] = useState({
    totalItems: { count: 0, total_value: 0 },
    lowStock: { count: 0, total_value: 0 },
    outOfStock: { count: 0, total_value: 0 },
    totalValue: { count: 0, total_value: 0 }
  });

  useEffect(() => {
    const fetchCardCounts = async () => {
      try {
        const response = await getInitialInventoryData();
        if (response.cardCounts) {
          setCardCounts({
            totalItems: response.cardCounts.total_items?.[0] || { count: 0, total_value: 0 },
            lowStock: response.cardCounts.low_stock?.[0] || { count: 0, total_value: 0 },
            outOfStock: response.cardCounts.out_of_stock?.[0] || { count: 0, total_value: 0 },
            totalValue: response.cardCounts.total_value?.[0] || { count: 0, total_value: 0 }
          });
        }
      } catch (error) {
        console.error('Error fetching inventory card counts:', error);
      }
    };

    fetchCardCounts();
  }, [inventoryListData]);

  const currencySymbol = '$';

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="tabler:package" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Inventory
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid item size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Total Items"
              subtitle="No of Items"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalItems?.total_value || 0)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalItems?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='tabler:package'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid item size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Low Stock"
              subtitle="Items Running Low"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.lowStock?.total_value || 0)}`}
              statsVariant='h4'
              trendNumber={cardCounts.lowStock?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:package-down'
              color="warning"
              iconSize='35px'
            />
          </Grid>

          <Grid item size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Out of Stock"
              subtitle="Items Out of Stock"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.outOfStock?.total_value || 0)}`}
              statsVariant='h4'
              trendNumber={cardCounts.outOfStock?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:package-variant-remove'
              color="error"
              iconSize='35px'
            />
          </Grid>

          <Grid item size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Total Value"
              subtitle="Inventory Value"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(cardCounts.totalValue?.total_value || 0)}`}
              statsVariant='h4'
              trendNumber={cardCounts.totalValue?.count || 0}
              trendNumberVariant='body1'
              avatarIcon='mdi:currency-usd'
              color="success"
              iconSize='35px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default InventoryHead;
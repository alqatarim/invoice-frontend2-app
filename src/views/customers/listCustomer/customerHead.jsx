'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import { getInitialCustomerData } from '@/app/(dashboard)/customers/actions';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * CustomerHead Component - Displays customer statistics header
 * Styled to match InvoiceHead component exactly
 */
const CustomerHead = ({ customerListData }) => {
  const theme = useTheme();
  const [cardCounts, setCardCounts] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0
  });

  useEffect(() => {
    const fetchCardCounts = async () => {
      try {
        const response = await getInitialCustomerData();
        if (response.cardCounts) {
          setCardCounts({
            totalCustomers: response.cardCounts.totalCustomers || 0,
            activeCustomers: response.cardCounts.activeCustomers || 0,
            inactiveCustomers: response.cardCounts.inactiveCustomers || 0
          });
        }
      } catch (error) {
        console.error('Error fetching customer card counts:', error);
      }
    };

    if (customerListData) {
      setCardCounts({
        totalCustomers: customerListData.totalCustomers || 0,
        activeCustomers: customerListData.activeCustomers || 0,
        inactiveCustomers: customerListData.inactiveCustomers || 0
      });
    } else {
      fetchCardCounts();
    }
  }, [customerListData]);

  const currencySymbol = '$';

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="tabler:users" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Customers
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
            <HorizontalWithBorder
              title="Total Customers"
              subtitle="No of Customers"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={cardCounts.totalCustomers.toLocaleString()}
              statsVariant='h4'
              trendNumber={cardCounts.totalCustomers || 0}
              trendNumberVariant='body1'
              avatarIcon='tabler:users'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
            <HorizontalWithBorder
              title="Active Customers"
              subtitle="No of Active"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={cardCounts.activeCustomers.toLocaleString()}
              statsVariant='h4'
              trendNumber={cardCounts.activeCustomers || 0}
              trendNumberVariant='body1'
              avatarIcon='tabler:user-check'
              color="success"
              iconSize='30px'
            />
          </Grid>

          <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
            <HorizontalWithBorder
              title="Inactive Customers"
              subtitle="No of Inactive"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={cardCounts.inactiveCustomers.toLocaleString()}
              statsVariant='h4'
              trendNumber={cardCounts.inactiveCustomers || 0}
              trendNumberVariant='body1'
              avatarIcon='tabler:user-off'
              color="warning"
              iconSize='30px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default CustomerHead;
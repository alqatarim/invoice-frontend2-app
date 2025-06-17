'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { amountFormat } from '@/utils/numberUtils';
import { getInitialVendorData } from '@/app/(dashboard)/vendors/actions';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

/**
 * VendorHead Component - Displays vendor statistics header
 */
const VendorHead = ({ vendorListData }) => {
  const theme = useTheme();
  const [vendorStats, setVendorStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    inactiveVendors: 0,
    totalBalance: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      if (vendorListData && vendorListData.length > 0) {
        const stats = vendorListData.reduce((acc, vendor) => {
          // Count total vendors
          acc.totalVendors++;
          
          // Count active/inactive vendors
          if (vendor.status === true) {
            acc.activeVendors++;
          } else {
            acc.inactiveVendors++;
          }
          
          // Calculate total balance
          const balance = Number(vendor.balance) || 0;
          if (balance > 0) {
            if (vendor.balanceType === 'Credit') {
              acc.totalBalance += balance;
            } else if (vendor.balanceType === 'Debit') {
              acc.totalBalance -= balance;
            }
          }
          
          return acc;
        }, {
          totalVendors: 0,
          activeVendors: 0,
          inactiveVendors: 0,
          totalBalance: 0,
        });
        
        setVendorStats(stats);
      }
    };

    calculateStats();
  }, [vendorListData]);

  const currencySymbol = '﷼'; // Saudi Riyal symbol like in other parts

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="mdi:account-group" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Vendors
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Total Vendors"
              subtitle="All Vendors"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={vendorStats.totalVendors.toString()}
              statsVariant='h4'
              trendNumber={`${vendorStats.activeVendors} Active`}
              trendNumberVariant='body1'
              avatarIcon='mdi:account-group'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Active Vendors"
              subtitle="Currently Active"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={vendorStats.activeVendors.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((vendorStats.activeVendors / Math.max(vendorStats.totalVendors, 1)) * 100)}%`}
              trendNumberVariant='body1'
              avatarIcon='mdi:account-check'
              color="success"
              iconSize='35px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Inactive Vendors"
              subtitle="Currently Inactive"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={vendorStats.inactiveVendors.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((vendorStats.inactiveVendors / Math.max(vendorStats.totalVendors, 1)) * 100)}%`}
              trendNumberVariant='body1'
              avatarIcon='mdi:account-remove'
              color="error"
              iconSize='35px'
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <HorizontalWithBorder
              title="Total Balance"
              subtitle="Net Balance"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={`${currencySymbol} ${amountFormat(Math.abs(vendorStats.totalBalance))}`}
              statsVariant='h4'
              trendNumber={vendorStats.totalBalance >= 0 ? 'Credit' : 'Debit'}
              trendNumberVariant='body1'
              avatarIcon='mdi:currency-usd'
              color={vendorStats.totalBalance >= 0 ? "success" : "warning"}
              iconSize='35px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default VendorHead;
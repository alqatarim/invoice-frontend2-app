'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';
import moment from 'moment';

/**
 * CategoryHead Component - Displays category statistics header
 */
const CategoryHead = ({ categoryListData }) => {
  const theme = useTheme();
  const [categoryStats, setCategoryStats] = useState({
    totalCategories: 0,
    recentlyAdded: 0,
    activeCategories: 0,
    mostUsedCategory: 'N/A',
  });

  useEffect(() => {
    const calculateStats = () => {
      if (categoryListData && categoryListData.length > 0) {
        const stats = categoryListData.reduce((acc, category) => {
          // Count total categories
          acc.totalCategories++;
          
          // Count active categories (assuming all are active unless marked deleted)
          if (!category.isDeleted) {
            acc.activeCategories++;
          }
          
          // Count recently added (last 30 days)
          if (category.createdAt) {
            const createdDate = moment(category.createdAt);
            if (createdDate.isAfter(moment().subtract(30, 'days'))) {
              acc.recentlyAdded++;
            }
          }
          
          return acc;
        }, {
          totalCategories: 0,
          recentlyAdded: 0,
          activeCategories: 0,
          mostUsedCategory: 'General',
        });
        
        setCategoryStats(stats);
      }
    };

    calculateStats();
  }, [categoryListData]);

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="mdi:shape" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Categories
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Total Categories"
              subtitle="All Categories"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={categoryStats.totalCategories.toString()}
              statsVariant='h4'
              trendNumber={`${categoryStats.activeCategories} Active`}
              trendNumberVariant='body1'
              avatarIcon='mdi:shape'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Active Categories"
              subtitle="Currently Active"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={categoryStats.activeCategories.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((categoryStats.activeCategories / Math.max(categoryStats.totalCategories, 1)) * 100)}%`}
              trendNumberVariant='body1'
              avatarIcon='mdi:check-circle'
              color="success"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Recently Added"
              subtitle="Last 30 Days"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={categoryStats.recentlyAdded.toString()}
              statsVariant='h4'
              trendNumber={categoryStats.recentlyAdded > 0 ? 'Growing' : 'Stable'}
              trendNumberVariant='body1'
              avatarIcon='mdi:clock-outline'
              color="info"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Most Used"
              subtitle="Popular Category"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={categoryStats.mostUsedCategory}
              statsVariant='h6'
              trendNumber="Top Choice"
              trendNumberVariant='body1'
              avatarIcon='mdi:star'
              color="warning"
              iconSize='35px'
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default CategoryHead;
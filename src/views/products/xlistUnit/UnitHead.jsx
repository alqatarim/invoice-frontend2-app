'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';
import moment from 'moment';

/**
 * UnitHead Component - Displays unit statistics header
 */
const UnitHead = ({ unitListData }) => {
  const theme = useTheme();
  const [unitStats, setUnitStats] = useState({
    totalUnits: 0,
    recentlyAdded: 0,
    activeUnits: 0,
    mostUsedUnit: 'N/A',
  });

  useEffect(() => {
    const calculateStats = () => {
      if (unitListData && unitListData.length > 0) {
        const stats = unitListData.reduce((acc, unit) => {
          // Count total units
          acc.totalUnits++;
          
          // Count active units (assuming all are active unless marked deleted)
          if (!unit.isDeleted) {
            acc.activeUnits++;
          }
          
          // Count recently added (last 30 days)
          if (unit.createdAt) {
            const createdDate = moment(unit.createdAt);
            if (createdDate.isAfter(moment().subtract(30, 'days'))) {
              acc.recentlyAdded++;
            }
          }
          
          return acc;
        }, {
          totalUnits: 0,
          recentlyAdded: 0,
          activeUnits: 0,
          mostUsedUnit: 'Piece',
        });
        
        setUnitStats(stats);
      }
    };

    calculateStats();
  }, [unitListData]);

  return (
    <>
      {/* Header Section */}
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="mdi:ruler" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Units
          </Typography>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Total Units"
              subtitle="All Units"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={unitStats.totalUnits.toString()}
              statsVariant='h4'
              trendNumber={`${unitStats.activeUnits} Active`}
              trendNumberVariant='body1'
              avatarIcon='mdi:ruler'
              color="primary"
              iconSize='30px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Active Units"
              subtitle="Currently Active"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={unitStats.activeUnits.toString()}
              statsVariant='h4'
              trendNumber={`${Math.round((unitStats.activeUnits / Math.max(unitStats.totalUnits, 1)) * 100)}%`}
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
              stats={unitStats.recentlyAdded.toString()}
              statsVariant='h4'
              trendNumber={unitStats.recentlyAdded > 0 ? 'Growing' : 'Stable'}
              trendNumberVariant='body1'
              avatarIcon='mdi:clock-outline'
              color="info"
              iconSize='35px'
            />
          </Grid>

          <Grid size={{xs:12, sm:6, md:3}}>
            <HorizontalWithBorder
              title="Most Used"
              subtitle="Popular Unit"
              titleVariant='h5'
              subtitleVariant='body2'
              stats={unitStats.mostUsedUnit}
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

export default UnitHead;
'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * UnitHead Component - Displays unit statistics header
 */
const UnitHead = ({ unitListData }) => {
  const unitStats = useMemo(
    () =>
      (unitListData || []).reduce(
        (acc, unit) => {
          acc.totalUnits += 1;

          if (unit.status !== false) {
            acc.activeUnits += 1;
          } else {
            acc.inactiveUnits += 1;
          }

          return acc;
        },
        {
          totalUnits: 0,
          activeUnits: 0,
          inactiveUnits: 0,
        }
      ),
    [unitListData]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Units',
        value: unitStats.totalUnits,
        icon: 'mdi:ruler',
        color: 'primary',
      },
      {
        title: 'Active Units',
        value: unitStats.activeUnits,
        subtitle: `${Math.round((unitStats.activeUnits / Math.max(unitStats.totalUnits, 1)) * 100)}%`,
        icon: 'mdi:check-circle',
        color: 'success',
      },
      {
        title: 'Inactive Units',
        value: unitStats.inactiveUnits,
        subtitle: `${Math.round((unitStats.inactiveUnits / Math.max(unitStats.totalUnits, 1)) * 100)}%`,
        icon: 'mdi:close-circle',
        color: 'error',
      },
    ],
    [unitStats]
  );

  return (
    <>
      <PageIconHeader title='Units' iconSize={30} icon='mdi:ruler' />

      <div className="mb-2">
        <Grid container className='flex flex-wrap justify-between gap-0'>
          {statCards.map(card => (
            <Grid key={card.title}>
              <HorizontalWithoutBorder {...card} />
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};

export default UnitHead;

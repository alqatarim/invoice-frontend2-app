'use client';

import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
import PageIconHeader from '@components/headers/PageIconHeader';
import HorizontalWithoutBorder from '@components/card-statistics/HorizontalWithoutBorder';

/**
 * CategoryHead Component - Displays category statistics header
 */
const CategoryHead = ({ categoryListData }) => {
  const categoryStats = useMemo(
    () =>
      (categoryListData || []).reduce(
        (acc, category) => {
          acc.totalCategories += 1;

          if (category.status !== false) {
            acc.activeCategories += 1;
          } else {
            acc.inactiveCategories += 1;
          }

          return acc;
        },
        {
          totalCategories: 0,
          activeCategories: 0,
          inactiveCategories: 0,
        }
      ),
    [categoryListData]
  );

  const statCards = useMemo(
    () => [
      {
        title: 'Total Categories',
        value: categoryStats.totalCategories,
        icon: 'mdi:shape',
        color: 'primary',
      },
      {
        title: 'Active Categories',
        value: categoryStats.activeCategories,
        subtitle: `${Math.round((categoryStats.activeCategories / Math.max(categoryStats.totalCategories, 1)) * 100)}%`,
        icon: 'mdi:check-circle',
        color: 'success',
      },
      {
        title: 'Inactive Categories',
        value: categoryStats.inactiveCategories,
        subtitle: `${Math.round((categoryStats.inactiveCategories / Math.max(categoryStats.totalCategories, 1)) * 100)}%`,
        icon: 'mdi:close-circle',
        color: 'error',
      },
    ],
    [categoryStats]
  );

  return (
    <>
      <PageIconHeader title='Categories' iconSize={30} icon='mdi:shape' />

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

export default CategoryHead;

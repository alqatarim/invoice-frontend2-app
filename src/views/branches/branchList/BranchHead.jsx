'use client';

import React, { useMemo } from 'react';
import { Grid, Avatar, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

const BranchHead = ({ branches = [] }) => {
  const stats = useMemo(() => {
    const total = branches.length;
    const stores = branches.filter(item => item.branchType === 'Store').length;
    const warehouses = branches.filter(item => item.branchType === 'Warehouse').length;
    return { total, stores, warehouses };
  }, [branches]);

  return (
    <>
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className='bg-primary/12 text-primary bg-primaryLight w-12 h-12'>
            <Icon icon="mdi:map-marker" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Branches
          </Typography>
        </div>
      </div>

      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <HorizontalWithBorder
              title="Total Branches"
              subtitle="All Branches"
              stats={stats.total.toString()}
              avatarIcon='mdi:map-marker'
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <HorizontalWithBorder
              title="Stores"
              subtitle="Retail Stores"
              stats={stats.stores.toString()}
              avatarIcon='mdi:storefront-outline'
              color="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <HorizontalWithBorder
              title="Warehouses"
              subtitle="Storage Sites"
              stats={stats.warehouses.toString()}
              avatarIcon='mdi:warehouse'
              color="success"
            />
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default BranchHead;

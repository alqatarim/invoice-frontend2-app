import React from 'react';
import { Box, Grid, Skeleton } from '@mui/material';

const UnitFormSkeleton = ({ statusVariant = 'switch' }) => (
  <Box className="p-6">
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <Skeleton variant="rounded" height={56} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <Skeleton variant="rounded" height={56} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <Skeleton variant="rounded" height={56} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <Skeleton variant="rounded" height={56} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <Skeleton variant="rounded" height={56} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <Skeleton variant="rounded" height={56} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
        <Skeleton variant="rounded" height={56} />
      </Grid>
      {statusVariant === 'field' ? (
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Skeleton variant="rounded" height={56} />
        </Grid>
      ) : (
        <Grid size={{ xs: 12 }}>
          <Box className="flex items-center gap-3">
            <Skeleton variant="rounded" width={42} height={26} />
            <Skeleton variant="text" width={72} height={24} />
          </Box>
        </Grid>
      )}
    </Grid>
  </Box>
);

export default UnitFormSkeleton;

'use client';

import { Box, Card, CardContent, Grid, TextField } from '@mui/material';
import SectionHeader from '@/components/headers/SectionHeader';

export default function Overview({ warranty, formatDate, getSourceDisplay, minHeight }) {
  return (
    <Card sx={{ minHeight: { xs: 'auto', md: minHeight } }}>
      <CardContent className='flex flex-col gap-8 w-full md:w-3/4 lg:w-4/7 xl:w-3/5 px-8 py-7'>
        <Box className='flex flex-col gap-4'>
          <SectionHeader title='Info' icon="mdi:information-slab-circle-outline" iconSize={30} />
          <Grid container columnSpacing={2} rowSpacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="Warranty number" value={warranty.warrantyNumber || 'N/A'} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="Customer" value={warranty.customerId?.name || warranty.customerId?.email || 'Walk-in / unlinked'} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
        </Box>

        <Box className='flex flex-col gap-4'>
          <SectionHeader title='Product' icon="mdi:box-variant-closed" iconSize={30} />
          <Grid container columnSpacing={2} rowSpacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="Product" value={warranty.productSnapshot?.name || warranty.productId?.name || 'N/A'} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="SKU" value={warranty.productSnapshot?.sku || warranty.productId?.sku || 'N/A'} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="Serial number" value={warranty.productSnapshot?.serialNumber || 'N/A'} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="Source" value={getSourceDisplay(warranty) || 'N/A'} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
        </Box>

        <Box className='flex flex-col gap-4'>
          <SectionHeader title='Coverage' icon="mdi:clock-check-outline" iconSize={30} />
          <Grid container columnSpacing={2} rowSpacing={3} className='flex justify-between '>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="Start date" value={formatDate(warranty.startDate)} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="End date" value={formatDate(warranty.endDate)} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="Original end date" value={formatDate(warranty.originalEndDate)} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="Coverage type" value={(warranty.policySnapshot?.coverageType || 'N/A').replace(/_/g, ' ')} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField fullWidth label="Returned quantity" value={`${warranty.returnedQuantity || 0} / ${warranty.quantity || 1}`} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}

'use client';

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';

import UnitFormSkeleton from '@/views/units/UnitFormSkeleton';

const getBaseUnitLabel = unit => {
  if (!unit?.baseUnit) return 'None';
  if (typeof unit.baseUnit === 'string') return unit.baseUnit;

  return `${unit.baseUnit.name || 'N/A'}${unit.baseUnit.symbol ? ` (${unit.baseUnit.symbol})` : ''}`;
};

const getRoundingLabel = method => {
  const labels = {
    round: 'Round',
    floor: 'Floor',
    ceil: 'Ceil',
    none: 'None',
  };

  return labels[method] || method || 'Round';
};

const ViewUnitDialog = ({
  open,
  unitData,
  loading = false,
  error = null,
  onClose,
  onRetry,
}) => {
  if (!open) return null;

  const statusLabel = unitData?.status !== false ? 'Active' : 'Inactive';

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={{
        sx: {
          mt: { xs: 4, sm: 6 },
          width: '100%',
          minWidth: { xs: '90vw', sm: '400px' },
          minHeight: { xs: 'auto', sm: 'auto' },
        },
      }}
    >
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16'
      >
        View Unit
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-3 pli-0' sx={{ p: 0 }}>
        <IconButton onClick={onClose} className='absolute block-start-4 inline-end-4'>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <UnitFormSkeleton statusVariant='field' />
        ) : error ? (
          <Box className='flex flex-col justify-center items-center h-40 gap-4'>
            <Typography color='error' variant='h6'>
              Error Loading Unit
            </Typography>
            <Typography color='error'>{error}</Typography>
            <Button variant='outlined' color='primary' onClick={() => void onRetry?.()}>
              Retry
            </Button>
          </Box>
        ) : unitData ? (
          <Box className='p-6'>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  label='Unit Name'
                  value={unitData.name || ''}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  label='Symbol'
                  value={unitData.symbol || ''}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  label='Base Unit'
                  value={getBaseUnitLabel(unitData)}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  label='Conversion Factor'
                  value={unitData.conversionFactor ?? 1}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  label='Decimal Precision'
                  value={unitData.decimalPrecision ?? 2}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  label='Rounding Method'
                  value={getRoundingLabel(unitData.roundingMethod)}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  label='Standard Unit Code'
                  value={unitData.standardUnitCode || '-'}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  fullWidth
                  label='Status'
                  value={statusLabel}
                  InputProps={{ readOnly: true }}
                  variant='outlined'
                />
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box className='flex justify-center items-center h-40'>
            <Typography color='error'>Failed to load unit data</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16'>
        <Button variant='outlined' color='secondary' onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewUnitDialog;

import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  IconButton,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getUnitById } from '@/app/(dashboard)/units/actions';
import { useEditUnitHandlers } from '@/handlers/units/editUnit';

const EditUnitDialog = ({ open, unitId, onClose, onSave }) => {
  const theme = useTheme();
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    handleFormSubmit,
    reset,
  } = useEditUnitHandlers({
    unitData,
    onSave: async (data) => {
      const result = await onSave(unitId, data);
      if (result.success) {
        onClose();
      }
      return result;
    },
  });

  // Fetch unit data when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (open && unitId) {
        setLoading(true);
        try {
          const unitResponse = await getUnitById(unitId);
          setUnitData(unitResponse);
        } catch (error) {
          console.error('Failed to fetch unit data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [open, unitId]);

  const handleClose = () => {
    setUnitData(null);
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='sm' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Edit Unit
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="flex justify-center items-center h-40">
            <CircularProgress />
            <Typography className="ml-3">Loading unit data...</Typography>
          </Box>
        ) : unitData ? (
          <form onSubmit={handleSubmit(handleFormSubmit)} id="edit-unit-form">
            <Grid container spacing={4}>
              {/* Unit Name */}
              <Grid size={{xs:12}}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Unit Name"
                      placeholder="Enter unit name"
                      error={!!errors.unit}
                      helperText={errors.unit?.message}
                      disabled={isSubmitting}
                      required
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Failed to load unit data</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button
          variant='outlined'
          color='secondary'
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-unit-form"
          variant='contained'
          disabled={isSubmitting || loading || !unitData}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Updating...' : 'Update Unit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUnitDialog;

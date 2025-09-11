import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormHelperText,
  Switch,
  Box,
  IconButton,
  CircularProgress,
  Typography,
  FormControlLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getUnitDetails } from '@/app/(dashboard)/products/actions';
import { useEditUnitHandlers } from '@/handlers/products/unit/editUnit';

const EditUnitDialog = ({ open, unitId, onClose, onSave }) => {
  const theme = useTheme();
  const [unitData, setUnitData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
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
    const fetchUnitData = async () => {
      if (open && unitId) {
        setLoading(true);
        try {
          const response = await getUnitDetails(unitId);
          if (response.success) {
            setUnitData(response.data);
          } else {
            throw new Error(response.error || 'Failed to fetch unit');
          }
        } catch (error) {
          console.error('Failed to fetch unit data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUnitData();
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
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={5}>
              {/* Unit Name */}
              <Grid size={{xs:12}}>
                <Controller
                  name='unit'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Unit Name'
                      error={Boolean(errors.unit)}
                      helperText={errors.unit?.message}
                      autoFocus
                      placeholder='e.g., Piece, Kilogram, Meter, etc.'
                    />
                  )}
                />
              </Grid>

              {/* Status */}
              <Grid size={{xs:12}}>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label='Active Status'
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography>Failed to load unit data</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-16 sm:pli-16'>
        <Button color='secondary' variant='outlined' onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant='contained' 
          onClick={handleSubmit(handleFormSubmit)} 
          disabled={isSubmitting || !unitData}
        >
          {isSubmitting ? <CircularProgress size={20} /> : 'Update Unit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUnitDialog;
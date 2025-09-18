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
  Avatar,
  Skeleton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getUnitById } from '@/app/(dashboard)/units/actions';
import { useEditUnitHandlers } from '@/handlers/units/editUnit';
import { formIcons } from '@/data/dataSets';

const EditUnitDialog = ({ open, unitId, onClose, onSave }) => {
  const theme = useTheme();
  const [unitData, setUnitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        setError(null);
        try {
          const unitResponse = await getUnitById(unitId);
          
          if (unitResponse && typeof unitResponse === 'object') {
            setUnitData(unitResponse);
          } else {
            throw new Error('Invalid unit data received');
          }
        } catch (error) {
          console.error('Failed to fetch unit data:', error);
          setError(error.message || 'Failed to load unit data');
          setUnitData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [open, unitId]);

  const handleClose = () => {
    setUnitData(null);
    setError(null);
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      scroll='body'
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      PaperProps={{ 
        sx: { 
          mt: { xs: 4, sm: 6 }, 
          width: '100%',
          minWidth: { xs: '90vw', sm: '400px' },
          minHeight: { xs: 'auto', sm: 'auto' }
        } 
      }}
    >
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16'
      >
        Edit Unit
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-3 pli-0' sx={{ p: 0 }}>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="p-6">
          

            {/* Form Skeleton */}
            <Grid container spacing={4}>
              <Grid size={{xs:12, sm:6, md:6}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
              <Grid size={{xs:12, sm:6, md:6}}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            </Grid>
          </Box>
        ) : error ? (
          <Box className="flex flex-col justify-center items-center h-40 gap-4">
            <Typography color="error" variant="h6">Error Loading Unit</Typography>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => {
                setError(null);
                // Trigger refetch
                const fetchData = async () => {
                  if (open && unitId) {
                    setLoading(true);
                    setError(null);
                    try {
                      const unitResponse = await getUnitById(unitId);
                      
                      if (unitResponse && typeof unitResponse === 'object') {
                        setUnitData(unitResponse);
                      } else {
                        throw new Error('Invalid unit data received');
                      }
                    } catch (error) {
                      console.error('Failed to fetch unit data:', error);
                      setError(error.message || 'Failed to load unit data');
                      setUnitData(null);
                    } finally {
                      setLoading(false);
                    }
                  }
                };
                fetchData();
              }}
            >
              Retry
            </Button>
          </Box>
        ) : unitData ? (
          <Box className="p-6">
      

            <form onSubmit={handleSubmit(handleFormSubmit)} id="edit-unit-form">
              <Grid container spacing={4}>
                {/* Unit Name */}
                <Grid size={{xs:12, sm:6, md:6}}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Unit Name"
                        placeholder="Enter unit name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={isSubmitting}
                        required
                        InputProps={{
                          startAdornment: ( 
                            <Icon
                              style={{ marginRight: '5px' }}
                              icon={'mdi:ruler'}
                              width={23}
                              color={theme.palette.secondary.light}
                            />
                          ),
                        }}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>

                {/* Unit Symbol */}
                <Grid size={{xs:12, sm:6, md:6}}>
                  <Controller
                    name="symbol"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Symbol"
                        placeholder="e.g., kg, m, pcs"
                        disabled={isSubmitting}
                        InputProps={{
                          startAdornment: ( 
                            <Icon
                              style={{ marginRight: '5px' }}
                              icon={'mdi:format-size'}
                              width={23}
                              color={theme.palette.secondary.light}
                            />
                          ),
                        }}
                        variant="outlined"
                      />
                    )}
                  />
                </Grid>

                            </Grid>
            </form>
          </Box>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Failed to load unit data</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className='gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16'>
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

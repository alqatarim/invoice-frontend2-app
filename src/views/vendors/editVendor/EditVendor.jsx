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
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Switch,
  Box,
  IconButton,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getVendorById } from '@/app/(dashboard)/vendors/actions';

import { useEditVendorHandlers } from '@/handlers/vendors/editVendor';

const EditVendorDialog = ({ open, vendorId, onClose, onSave }) => {
  const theme = useTheme();
  const [vendorData, setVendorData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    watch,
    errors,
    vendorBalanceTypes,
    isSubmitting,
    handleFormSubmit,
    reset,
  } = useEditVendorHandlers({
    vendorData,
    onSave: async (data) => {
      const result = await onSave(vendorId, data);
      if (result.success) {
        onClose();
      }
      return result;
    },
    enqueueSnackbar: () => {}, // Will be handled by parent
    closeSnackbar: () => {}, // Will be handled by parent
  });

  const watchBalance = watch('balance');

  // Fetch vendor data when dialog opens
  useEffect(() => {
    const fetchVendorData = async () => {
      if (open && vendorId) {
        setLoading(true);
        try {
          const data = await getVendorById(vendorId);
          setVendorData(data);
        } catch (error) {
          console.error('Failed to fetch vendor data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVendorData();
  }, [open, vendorId]);

  const handleClose = () => {
    setVendorData(null);
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog fullWidth open={open} onClose={handleClose} maxWidth='md' scroll='body'>
      <DialogTitle
        variant='h4'
        className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-16 sm:pbe-6 sm:pli-16'
      >
        Edit Vendor
      </DialogTitle>

      <DialogContent className='overflow-visible pbs-0 pbe-6 pli-12 sm:pli-12'>
        <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
          <i className='ri-close-line text-textSecondary' />
        </IconButton>

        {loading ? (
          <Box className="flex justify-center items-center h-40">
            <CircularProgress />
            <Typography className="ml-3">Loading vendor data...</Typography>
          </Box>
        ) : vendorData ? (
          <form onSubmit={handleSubmit(handleFormSubmit)} id="edit-vendor-form">
            <Grid container spacing={4}>
              {/* Vendor Name */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="vendor_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Vendor Name"
                      placeholder="Enter vendor name"
                      error={!!errors.vendor_name}
                      helperText={errors.vendor_name?.message}
                      disabled={isSubmitting}
                      required
                    />
                  )}
                />
              </Grid>

              {/* Email */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="vendor_email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="email"
                      label="Email Address"
                      placeholder="Enter email address"
                      error={!!errors.vendor_email}
                      helperText={errors.vendor_email?.message}
                      disabled={isSubmitting}
                      required
                    />
                  )}
                />
              </Grid>

              {/* Phone */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="vendor_phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone Number"
                      placeholder="Enter phone number"
                      error={!!errors.vendor_phone}
                      helperText={errors.vendor_phone?.message}
                      disabled={isSubmitting}
                      required
                    />
                  )}
                />
              </Grid>

              {/* Closing Balance */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="balance"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Closing Balance (Optional)"
                      placeholder="0.00"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      error={!!errors.balance}
                      helperText={errors.balance?.message}
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <i className='ri-money-dollar-circle-line text-textSecondary' />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Balance Type - Only show if balance is entered */}
              {watchBalance && parseFloat(watchBalance) > 0 && (
                <Grid size={{xs:12, md:6}}>
                  <Controller
                    name="balanceType"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <FormLabel component="legend" className="text-sm mb-2 block">
                          Balance Type
                        </FormLabel>
                        <RadioGroup
                          {...field}
                          row
                          aria-label="balance-type"
                        >
                          {vendorBalanceTypes.map((type) => (
                            <FormControlLabel
                              key={type.value}
                              value={type.value}
                              control={<Radio size="small" disabled={isSubmitting} />}
                              label={type.label}
                            />
                          ))}
                        </RadioGroup>
                        {errors.balanceType && (
                          <FormHelperText error>
                            {errors.balanceType.message}
                          </FormHelperText>
                        )}
                      </Box>
                    )}
                  />
                </Grid>
              )}

              {/* Status */}
              <Grid size={{xs:12, md:6}}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Box>
                      <FormLabel component="legend" className="text-sm mb-2 block">
                        Status
                      </FormLabel>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                            disabled={isSubmitting}
                          />
                        }
                        label={field.value ? 'Active' : 'Inactive'}
                      />
                    </Box>
                  )}
                />
              </Grid>
            </Grid>
          </form>
        ) : (
          <Box className="flex justify-center items-center h-40">
            <Typography color="error">Failed to load vendor data</Typography>
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
          form="edit-vendor-form"
          variant='contained'
          disabled={isSubmitting || loading || !vendorData}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Updating...' : 'Update Vendor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditVendorDialog;
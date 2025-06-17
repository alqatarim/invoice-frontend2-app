import React from 'react';
import { Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  FormHelperText,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Switch,
} from '@mui/material';
import CustomAvatar from '@core/components/mui/Avatar';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import Link from 'next/link';

import { useEditVendorHandlers } from '@/handlers/vendors/editVendor';

const EditVendor = ({ id, vendorData, onSave, enqueueSnackbar, closeSnackbar }) => {
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    watch,
    errors,
    vendorBalanceTypes,
    isSubmitting,
    handleFormSubmit,
    handleCancel
  } = useEditVendorHandlers({
    vendorData,
    onSave,
    enqueueSnackbar,
    closeSnackbar
  });

  const watchBalance = watch('balance');

  return (
    <Box className="flex flex-col gap-6">
      {/* Header */}

          <Box className="flex items-center gap-3 mb-2">
            <CustomAvatar
              variant="rounded"
              color="primary"
              skin='light'
            >
              <Icon icon="mdi:account-edit" width={28} />
            </CustomAvatar>
            <Typography variant="h5" className="font-semibold" color='primary.main'>
              Edit Vendor
            </Typography>
          </Box>




      {/* Form */}
      <Card>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <CardContent className='flex flex-col gap-4'>
            <Grid container spacing={4}>
              {/* Vendor Name */}
              <Grid item xs={12} sm={6} md={4}>
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="mdi:account" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6} md={4}>
                <Controller
                  name="vendor_email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email Address"
                      placeholder="Enter email address"
                      type="email"
                      error={!!errors.vendor_email}
                      helperText={errors.vendor_email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="mdi:email" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} sm={6} md={4}>
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="mdi:phone" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Opening Balance */}
              <Grid item xs={12} sm={6} md={4}>
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="lucide:saudi-riyal" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Balance Type - Only show if balance is entered */}
              {watchBalance && parseFloat(watchBalance) > 0 && (
                <Grid item xs={6} sm={6} md={4}>
                  <Controller
                    name="balanceType"
                    control={control}
                    render={({ field }) => (
                      <Box className="flex flex-col gap-2 items-start border border-Light rounded-md h-full py-1 px-1">
                        <FormLabel component="legend" className="text-[0.8rem]">
                          Balance Type
                        </FormLabel>
                        <RadioGroup
                          {...field}
                          row
                          aria-label="balance-type"
                          sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'nowrap' }}
                        >
                          {vendorBalanceTypes.map((type) => (
                            <FormControlLabel
                              key={type.value}
                              value={type.value}
                              control={<Radio size="small" />}
                              label={type.label}
                              sx={{ m: 0, p: 0, alignItems: 'center' }}
                              className='h-[18px]'
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
              <Grid item xs={6} sm={3} md={2}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (

                    <Box className='flex flex-col gap-3 items-start  border border-Light rounded-md pt-1 pb-2 px-2'>
                      <FormLabel className='text-[0.8rem]' component="legend">
                        Status
                      </FormLabel>




                      <FormControlLabel
                      className='h-[10px]'
                     labelPlacement="end"

                        control={


                          <Switch
                            size='medium'
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                            sx={{
                              // p: 0,
                              // m: 0,
                              // height: 24,
                            //   minHeight: 0,
                            //   '& .MuiSwitch-thumb': { width: 16, height: 16 },
                            //   '& .MuiSwitch-switchBase': { p: 0, m: 0 },
                            //   alignSelf: 'center'
                            }}
                          />
                        }
                        label={field.value ? 'Active' : 'Inactive'}

                      />
                       </Box>

                  )}
                />
              </Grid>

            </Grid>

            {/* Form Actions */}
            <Box className="flex justify-end gap-3">
              <Button
              className='min-w-[120px]'
                variant="outlined"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className='min-w-[120px]'
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </Box>
            </CardContent>
          </form>

      </Card>
    </Box>
  );
};

export default EditVendor;
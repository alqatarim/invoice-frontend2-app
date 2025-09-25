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
     FormHelperText,
     FormControl,
     InputLabel,
     Select,
     MenuItem,
     Box,
     CircularProgress,
     Typography,
     Skeleton,
     Autocomplete,
} from '@mui/material';
import IconButton from '@core/components/mui/CustomOriginalIconButton';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getPaymentDetails } from '@/app/(dashboard)/payments/actions';
import { useEditPaymentHandlers } from '@/handlers/payments/editPayment/useEditPaymentHandlers';
import { formIcons } from '@/data/dataSets';

const paymentModes = [
     { value: 'cash', label: 'Cash' },
     { value: 'credit', label: 'Credit' },
     { value: 'cheque', label: 'Cheque' }
];

const EditPaymentDialog = ({ open, paymentId, onClose, onSave, customerOptions = [] }) => {
     const theme = useTheme();
     const [paymentData, setPaymentData] = useState(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState(null);

     const {
          control,
          handleSubmit,
          watch,
          errors,
          isSubmitting,
          handleFormSubmit,
     } = useEditPaymentHandlers({
          paymentData: paymentData || null,
          onSave: async (data) => {
               const result = await onSave(paymentId, data);
               if (result.success) {
                    onClose();
               }
               return result;
          },
     });

     // Fetch payment data when dialog opens
     useEffect(() => {
          const fetchData = async () => {
               if (open && paymentId) {
                    setLoading(true);
                    setError(null);
                    try {
                         const paymentResponse = await getPaymentDetails(paymentId);

                         if (paymentResponse && typeof paymentResponse === 'object') {
                              setPaymentData(paymentResponse);
                         } else {
                              throw new Error('Invalid payment data received');
                         }
                    } catch (error) {
                         console.error('Failed to fetch payment data:', error);
                         setError(error.message || 'Failed to load payment data');
                         setPaymentData(null);
                    } finally {
                         setLoading(false);
                    }
               }
          };

          fetchData();
     }, [open, paymentId]);

     const handleClose = () => {
          setPaymentData(null);
          setError(null);
          onClose();
     };

     if (!open) return null;

     return (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
               <Dialog
                    fullWidth
                    open={open}
                    onClose={handleClose}
                    maxWidth='md'
                    scroll='body'
                    sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
                    PaperProps={{
                         sx: {
                              mt: { xs: 4, sm: 6 },
                              width: '100%',
                              minWidth: { xs: '90vw', sm: '600px', md: '800px' },
                              minHeight: { xs: '70vh', sm: '600px' }
                         }
                    }}
               >
                    <DialogTitle
                         variant='h4'
                         className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16'
                    >
                         Edit Payment
                    </DialogTitle>

                    <DialogContent className='overflow-visible pbs-0 pbe-3 pli-0' sx={{ p: 0 }}>
                         <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
                              <i className='ri-close-line text-textSecondary' />
                         </IconButton>

                         {loading ? (
                              <Box className="p-6">
                                   {/* Form Skeleton */}
                                   <Grid container spacing={4}>
                                        {Array.from({ length: 8 }).map((_, index) => (
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                                  <Skeleton variant="rounded" height={56} />
                                             </Grid>
                                        ))}
                                   </Grid>
                              </Box>
                         ) : error ? (
                              <Box className="flex flex-col justify-center items-center h-40 gap-4">
                                   <Typography color="error" variant="h6">Error Loading Payment</Typography>
                                   <Typography color="error">{error}</Typography>
                                   <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => {
                                             setError(null);
                                             // Trigger refetch
                                             const fetchData = async () => {
                                                  if (open && paymentId) {
                                                       setLoading(true);
                                                       setError(null);
                                                       try {
                                                            const paymentResponse = await getPaymentDetails(paymentId);

                                                            if (paymentResponse && typeof paymentResponse === 'object') {
                                                                 setPaymentData(paymentResponse);
                                                            } else {
                                                                 throw new Error('Invalid payment data received');
                                                            }
                                                       } catch (error) {
                                                            console.error('Failed to fetch payment data:', error);
                                                            setError(error.message || 'Failed to load payment data');
                                                            setPaymentData(null);
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
                         ) : paymentData ? (
                              <Box className="p-6">
                                   <form onSubmit={handleSubmit(handleFormSubmit)} id="edit-payment-form">
                                        <Grid container spacing={4}>
                                             {/* Payment Number */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="paymentNumber"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <TextField
                                                                 {...field}
                                                                 fullWidth
                                                                 label="Payment Number"
                                                                 error={!!errors.paymentNumber}
                                                                 helperText={errors.paymentNumber?.message}
                                                                 disabled
                                                                 InputProps={{
                                                                      startAdornment: (
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'id')?.icon || 'mdi:identifier'}
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

                                             {/* Customer */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="customerId"
                                                       control={control}
                                                       render={({ field: { onChange, value, ...field } }) => (
                                                            <Autocomplete
                                                                 {...field}
                                                                 options={customerOptions}
                                                                 getOptionLabel={(option) => option?.name || ''}
                                                                 value={customerOptions.find(customer => customer._id === value) || null}
                                                                 onChange={(event, newValue) => {
                                                                      onChange(newValue?._id || '');
                                                                 }}
                                                                 disabled={isSubmitting}
                                                                 renderInput={(params) => (
                                                                      <TextField
                                                                           {...params}
                                                                           label="Customer"
                                                                           placeholder="Select customer"
                                                                           error={!!errors.customerId}
                                                                           helperText={errors.customerId?.message}
                                                                           required
                                                                           InputProps={{
                                                                                ...params.InputProps,
                                                                                startAdornment: (
                                                                                     <>
                                                                                          <Icon
                                                                                               style={{ marginRight: '5px' }}
                                                                                               icon={formIcons.find(icon => icon.value === 'customer')?.icon || 'mdi:account-outline'}
                                                                                               width={23}
                                                                                               color={theme.palette.secondary.light}
                                                                                          />
                                                                                          {params.InputProps.startAdornment}
                                                                                     </>
                                                                                ),
                                                                           }}
                                                                      />
                                                                 )}
                                                            />
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Invoice ID */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="invoiceId"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <TextField
                                                                 {...field}
                                                                 fullWidth
                                                                 label="Invoice ID"
                                                                 placeholder="Enter invoice ID"
                                                                 error={!!errors.invoiceId}
                                                                 helperText={errors.invoiceId?.message}
                                                                 disabled={isSubmitting}
                                                                 required
                                                                 InputProps={{
                                                                      startAdornment: (
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'invoice')?.icon || 'mdi:file-document-outline'}
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

                                             {/* Amount */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="amount"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <TextField
                                                                 {...field}
                                                                 fullWidth
                                                                 type="number"
                                                                 label="Amount"
                                                                 placeholder="0.00"
                                                                 error={!!errors.amount}
                                                                 helperText={errors.amount?.message}
                                                                 disabled={isSubmitting}
                                                                 required
                                                                 InputProps={{
                                                                      startAdornment: (
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'currency')?.icon || 'lucide:saudi-riyal'}
                                                                                width={21}
                                                                                color={theme.palette.secondary.light}
                                                                           />
                                                                      ),
                                                                 }}
                                                                 variant="outlined"
                                                            />
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Payment Method */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="paymentMethod"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <FormControl fullWidth error={!!errors.paymentMethod} required>
                                                                 <InputLabel>Payment Method</InputLabel>
                                                                 <Select
                                                                      {...field}
                                                                      label="Payment Method"
                                                                      disabled={isSubmitting}
                                                                      startAdornment={
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'payment')?.icon || 'mdi:credit-card-outline'}
                                                                                width={23}
                                                                                color={theme.palette.secondary.light}
                                                                           />
                                                                      }
                                                                 >
                                                                      {paymentModes.map((mode) => (
                                                                           <MenuItem key={mode.value} value={mode.value}>
                                                                                {mode.label}
                                                                           </MenuItem>
                                                                      ))}
                                                                 </Select>
                                                                 {errors.paymentMethod && <FormHelperText>{errors.paymentMethod.message}</FormHelperText>}
                                                            </FormControl>
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Payment Date */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="date"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <DatePicker
                                                                 {...field}
                                                                 label="Payment Date"
                                                                 disabled={isSubmitting}
                                                                 slotProps={{
                                                                      textField: {
                                                                           fullWidth: true,
                                                                           error: !!errors.date,
                                                                           helperText: errors.date?.message,
                                                                           required: true,
                                                                           InputProps: {
                                                                                startAdornment: (
                                                                                     <Icon
                                                                                          style={{ marginRight: '5px' }}
                                                                                          icon={formIcons.find(icon => icon.value === 'date')?.icon || 'mdi:calendar-outline'}
                                                                                          width={23}
                                                                                          color={theme.palette.secondary.light}
                                                                                     />
                                                                                ),
                                                                           },
                                                                      }
                                                                 }}
                                                            />
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Status */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="status"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <FormControl fullWidth error={!!errors.status} required>
                                                                 <InputLabel>Status</InputLabel>
                                                                 <Select
                                                                      {...field}
                                                                      label="Status"
                                                                      disabled={isSubmitting}
                                                                      startAdornment={
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'status')?.icon || 'mdi:check-circle-outline'}
                                                                                width={23}
                                                                                color={theme.palette.secondary.light}
                                                                           />
                                                                      }
                                                                 >
                                                                      <MenuItem value="success">Success</MenuItem>
                                                                      <MenuItem value="processing">Processing</MenuItem>
                                                                      <MenuItem value="pending">Pending</MenuItem>
                                                                      <MenuItem value="cancelled">Cancelled</MenuItem>
                                                                 </Select>
                                                                 {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                                                            </FormControl>
                                                       )}
                                                  />
                                             </Grid>

                                             {/* Reference */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="reference"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <TextField
                                                                 {...field}
                                                                 fullWidth
                                                                 label="Reference"
                                                                 placeholder="Enter reference"
                                                                 error={!!errors.reference}
                                                                 helperText={errors.reference?.message}
                                                                 disabled={isSubmitting}
                                                                 InputProps={{
                                                                      startAdornment: (
                                                                           <Icon
                                                                                style={{ marginRight: '5px' }}
                                                                                icon={formIcons.find(icon => icon.value === 'reference')?.icon || 'mdi:text-box-outline'}
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

                                             {/* Description */}
                                             <Grid size={{ xs: 12 }}>
                                                  <Controller
                                                       name="description"
                                                       control={control}
                                                       render={({ field }) => (
                                                            <TextField
                                                                 {...field}
                                                                 fullWidth
                                                                 label="Description"
                                                                 placeholder="Enter payment description"
                                                                 error={!!errors.description}
                                                                 helperText={errors.description?.message}
                                                                 disabled={isSubmitting}
                                                                 multiline
                                                                 rows={3}
                                                                 InputProps={{
                                                                      startAdornment: (
                                                                           <Icon
                                                                                style={{ marginRight: '5px', alignSelf: 'flex-start', marginTop: '12px' }}
                                                                                icon="mdi:text-box-outline"
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
                                   <Typography color="error">Failed to load payment data</Typography>
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
                              form="edit-payment-form"
                              variant='contained'
                              disabled={isSubmitting || loading || !paymentData}
                              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                         >
                              {isSubmitting ? 'Updating...' : 'Update Payment'}
                         </Button>
                    </DialogActions>
               </Dialog>
          </LocalizationProvider>
     );
};

export default EditPaymentDialog;

import React, { useState, useEffect } from 'react';
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
import { useAddPaymentHandlers } from '@/handlers/payments/addPayment/useAddPaymentHandlers';
import { formIcons } from '@/data/dataSets';
import { getInvoices } from '@/app/(dashboard)/payments/actions';

// Must match backend enum: ["Cash", "Cheque", "Online", "Bank"]
const paymentModes = [
     { value: 'Cash', label: 'Cash' },
     { value: 'Cheque', label: 'Cheque' },
     { value: 'Online', label: 'Online' },
     { value: 'Bank', label: 'Bank Transfer' }
];

const AddPaymentDialog = ({ open, onClose, onSave, paymentNumber, customerOptions = [] }) => {
     const theme = useTheme();
     const [loading, setLoading] = useState(false);
     const [allInvoices, setAllInvoices] = useState([]);
     const [invoicesLoading, setInvoicesLoading] = useState(false);

     const {
          control,
          handleSubmit,
          watch,
          errors,
          isSubmitting,
          handleFormSubmit,
          reset,
          setValue,
     } = useAddPaymentHandlers({
          paymentNumber,
          onSave: async (data) => {
               const result = await onSave(data);
               if (result.success) {
                    reset();
                    setAllInvoices([]);
                    onClose();
               }
               return result;
          },
     });

     // Watch selections
     const selectedCustomerId = watch('customerId');
     const selectedInvoiceId = watch('invoiceId');

     // Fetch all invoices when dialog opens
     useEffect(() => {
          const fetchAllInvoices = async () => {
               if (open) {
                    setInvoicesLoading(true);
                    try {
                         const invoices = await getInvoices();
                         setAllInvoices(invoices || []);
                    } catch (error) {
                         console.error('Error fetching invoices:', error);
                         setAllInvoices([]);
                    } finally {
                         setInvoicesLoading(false);
                    }
               }
          };

          fetchAllInvoices();
     }, [open]);

     // Get filtered invoices based on selected customer
     const filteredInvoices = selectedCustomerId
          ? allInvoices.filter(inv => inv.customerId === selectedCustomerId)
          : allInvoices;

     // Handle invoice selection - auto-set customer
     const handleInvoiceChange = (newValue) => {
          setValue('invoiceId', newValue?._id || '');
          if (newValue?.customerId) {
               setValue('customerId', newValue.customerId);
          }
     };

     // Handle customer change - reset invoice if it doesn't belong to new customer
     const handleCustomerChange = (newValue) => {
          const newCustomerId = newValue?._id || '';
          setValue('customerId', newCustomerId);

          // If current invoice doesn't belong to new customer, reset it
          if (selectedInvoiceId && newCustomerId) {
               const currentInvoice = allInvoices.find(inv => inv._id === selectedInvoiceId);
               if (currentInvoice && currentInvoice.customerId !== newCustomerId) {
                    setValue('invoiceId', '');
               }
          }
     };

     const handleClose = () => {
          reset();
          setAllInvoices([]);
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
                         Add New Payment
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
                         ) : (
                              <Box className="p-6">
                                   <form onSubmit={handleSubmit(handleFormSubmit)} id="add-payment-form">
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
                                                                 placeholder="Auto-generated"
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
                                                                      handleCustomerChange(newValue);
                                                                 }}
                                                                 isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                                                 filterOptions={(options, { inputValue }) => {
                                                                      const search = inputValue.toLowerCase();
                                                                      return options.filter(opt =>
                                                                           (opt.name || '').toLowerCase().includes(search) ||
                                                                           (opt.phone || '').toLowerCase().includes(search) ||
                                                                           (opt.email || '').toLowerCase().includes(search)
                                                                      );
                                                                 }}
                                                                 disabled={isSubmitting}
                                                                 renderOption={(props, option) => (
                                                                      <li {...props} key={option._id}>
                                                                           <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                                                <Typography variant="body2" fontWeight={500}>
                                                                                     {option.name}
                                                                                </Typography>
                                                                                {option.phone && (
                                                                                     <Typography variant="caption" color="text.secondary">
                                                                                          {option.phone}
                                                                                     </Typography>
                                                                                )}
                                                                           </Box>
                                                                      </li>
                                                                 )}
                                                                 renderInput={(params) => (
                                                                      <TextField
                                                                           {...params}
                                                                           label="Customer"
                                                                           placeholder="Type to search customer..."
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

                                             {/* Invoice Number */}
                                             <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                                  <Controller
                                                       name="invoiceId"
                                                       control={control}
                                                       render={({ field: { onChange, value, ...field } }) => (
                                                            <Autocomplete
                                                                 {...field}
                                                                 options={filteredInvoices}
                                                                 getOptionLabel={(option) => {
                                                                      if (typeof option === 'string') {
                                                                           const found = allInvoices.find(inv => inv._id === option);
                                                                           return found?.invoiceNumber || '';
                                                                      }
                                                                      return option?.invoiceNumber || '';
                                                                 }}
                                                                 value={allInvoices.find(inv => inv._id === value) || null}
                                                                 onChange={(event, newValue) => {
                                                                      handleInvoiceChange(newValue);
                                                                 }}
                                                                 isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                                                 filterOptions={(options, { inputValue }) => {
                                                                      if (!inputValue) return options;
                                                                      const searchTerm = inputValue.toLowerCase();
                                                                      return options.filter(option =>
                                                                           option?.invoiceNumber?.toLowerCase().includes(searchTerm) ||
                                                                           option?.CustomerName?.toLowerCase().includes(searchTerm)
                                                                      );
                                                                 }}
                                                                 disabled={isSubmitting || invoicesLoading}
                                                                 loading={invoicesLoading}
                                                                 renderOption={(props, option) => (
                                                                      <li {...props} key={option._id}>
                                                                           <Box sx={{
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                width: '100%',
                                                                                py: 0.5
                                                                           }}>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                                                     <Typography variant="body2" fontWeight={600} color="primary.main">
                                                                                          {option.invoiceNumber}
                                                                                     </Typography>
                                                                                     <Typography
                                                                                          variant="caption"
                                                                                          sx={{
                                                                                               bgcolor: option.balanceAmount > 0 ? 'warning.lighter' : 'success.lighter',
                                                                                               color: option.balanceAmount > 0 ? 'warning.dark' : 'success.dark',
                                                                                               px: 1,
                                                                                               py: 0.25,
                                                                                               borderRadius: 1,
                                                                                               fontWeight: 500
                                                                                          }}
                                                                                     >
                                                                                          Balance: {option.balanceAmount?.toFixed(2)}
                                                                                     </Typography>
                                                                                </Box>
                                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                     <Typography variant="caption" color="text.secondary">
                                                                                          <Icon icon="mdi:account-outline" width={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                                                                          {option.CustomerName || 'N/A'}
                                                                                     </Typography>
                                                                                     <Typography variant="caption" color="text.secondary">
                                                                                          Total: {option.totalAmount?.toFixed(2)}
                                                                                     </Typography>
                                                                                </Box>
                                                                           </Box>
                                                                      </li>
                                                                 )}
                                                                 renderInput={(params) => (
                                                                      <TextField
                                                                           {...params}
                                                                           label="Invoice Number"
                                                                           placeholder="Type to search invoice..."
                                                                           error={!!errors.invoiceId}
                                                                           helperText={errors.invoiceId?.message || (!selectedCustomerId ? 'Or select invoice to auto-fill customer' : '')}
                                                                           required
                                                                           InputProps={{
                                                                                ...params.InputProps,
                                                                                startAdornment: (
                                                                                     <>
                                                                                          <Icon
                                                                                               style={{ marginRight: '5px' }}
                                                                                               icon={formIcons.find(icon => icon.value === 'invoice')?.icon || 'mdi:file-document-outline'}
                                                                                               width={23}
                                                                                               color={theme.palette.secondary.light}
                                                                                          />
                                                                                          {params.InputProps.startAdornment}
                                                                                     </>
                                                                                ),
                                                                                endAdornment: (
                                                                                     <>
                                                                                          {invoicesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                                                          {params.InputProps.endAdornment}
                                                                                     </>
                                                                                ),
                                                                           }}
                                                                      />
                                                                 )}
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

                                             {/* Note: Status is auto-determined by backend based on payment_method */}

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
                              form="add-payment-form"
                              variant='contained'
                              disabled={isSubmitting || loading}
                              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                         >
                              {isSubmitting ? 'Adding...' : 'Add Payment'}
                         </Button>
                    </DialogActions>
               </Dialog>
          </LocalizationProvider>
     );
};

export default AddPaymentDialog;

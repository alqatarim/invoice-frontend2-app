'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { paymentSchema } from './paymentSchema';
import { formIcons, getPaymentStatusOption, paymentMethods } from '@/data/dataSets';
import { getInvoices } from '@/app/(dashboard)/payments/actions';

const formatPaymentAmountText = amount => {
     const total = Number(amount) || 0;
     return total.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
     });
};

const getFormIcon = value => formIcons.find(icon => icon.value === value)?.icon;

const PaymentReadOnlyField = ({ label, value, icon, theme, inputSx }) => (
     <TextField
          fullWidth
          label={label}
          value={value ?? ''}
          InputProps={{
               readOnly: true,
               startAdornment: icon ? (
                    <Icon
                         style={{ marginRight: '5px' }}
                         icon={icon}
                         width={23}
                         color={theme.palette.secondary.light}
                    />
               ) : undefined,
          }}
          variant="outlined"
          sx={inputSx}
     />
);

const DIALOG_PAPER_PROPS = {
     sx: {
          mt: { xs: 4, sm: 6 },
          width: '100%',
          minWidth: { xs: '90vw', sm: '600px', md: '800px' },
          minHeight: { xs: '70vh', sm: '600px' },
     },
};

const MODE_TITLES = {
     add: 'Add New Payment',
     edit: 'Edit Payment',
     view: 'View Payment',
};

const usePaymentFormHandler = ({ mode, paymentNumber, paymentData, onSave }) => {
     const isEdit = mode === 'edit';
     const [isSubmitting, setIsSubmitting] = useState(false);

     const {
          control,
          handleSubmit,
          watch,
          reset,
          setValue,
          formState: { errors },
     } = useForm({
          resolver: yupResolver(paymentSchema),
          defaultValues: {
               paymentNumber: paymentNumber || '',
               customerId: '',
               invoiceId: '',
               amount: '',
               paymentMethod: 'Cash',
               date: dayjs(),
               reference: '',
               description: '',
          },
     });

     useEffect(() => {
          if (!isEdit && paymentNumber) {
               setValue('paymentNumber', paymentNumber);
          }
     }, [paymentNumber, isEdit, setValue]);

     useEffect(() => {
          if (!isEdit || !paymentData?.paymentDetails) return;

          const details = paymentData.paymentDetails;
          const invoiceId =
               typeof details.invoiceId === 'object' ? details.invoiceId?._id : details.invoiceId || '';
          const customerId =
               details.customerId?._id ||
               details.customerId ||
               details.customerDetail?._id ||
               '';

          reset({
               paymentNumber: details.payment_number || details.paymentNumber || '',
               customerId,
               invoiceId,
               amount: details.amount || '',
               paymentMethod: details.payment_method || details.paymentMethod || 'Cash',
               date: details.received_on
                    ? dayjs(details.received_on)
                    : details.date
                         ? dayjs(details.date)
                         : dayjs(),
               reference: details.referenceNo || details.reference || '',
               description: details.notes || details.description || '',
          });
     }, [paymentData, isEdit, reset]);

     const handleFormSubmit = async data => {
          setIsSubmitting(true);
          try {
               return await onSave(data);
          } catch (error) {
               console.error(`Error ${isEdit ? 'updating' : 'adding'} payment:`, error);
               return { success: false, error: error.message };
          } finally {
               setIsSubmitting(false);
          }
     };

     const resetForm = () => {
          reset({
               paymentNumber: paymentNumber || '',
               customerId: '',
               invoiceId: '',
               amount: '',
               paymentMethod: 'Cash',
               date: dayjs(),
               reference: '',
               description: '',
          });
     };

     return {
          control,
          handleSubmit,
          watch,
          errors,
          isSubmitting,
          handleFormSubmit,
          reset: resetForm,
          setValue,
     };
};

const PaymentFormDialog = ({
     mode,
     open,
     onClose,
     onSave,
     paymentNumber,
     paymentData = null,
     customerOptions = [],
     loading = false,
     error = '',
     onRetry,
}) => {
     const theme = useTheme();
     const { enqueueSnackbar, closeSnackbar } = useSnackbar();
     const isAdd = mode === 'add';
     const isEdit = mode === 'edit';
     const formId = `payment-form-${mode}`;
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
     } = usePaymentFormHandler({
          mode,
          paymentNumber,
          paymentData,
          onSave: async data => {
               const result = await onSave(data);
               if (result?.success) {
                    if (isAdd) {
                         reset();
                         setAllInvoices([]);
                    }
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

     const mergedCustomerOptions = useMemo(() => {
          const storedCustomer = paymentData?.paymentDetails?.customerDetail;
          if (!storedCustomer?._id) {
               return customerOptions;
          }

          const exists = customerOptions.some(customer => customer._id === storedCustomer._id);
          if (exists) {
               return customerOptions;
          }

          return [
               {
                    _id: storedCustomer._id,
                    name: storedCustomer.name,
                    phone: storedCustomer.phone,
                    email: storedCustomer.email,
                    image: storedCustomer.image,
               },
               ...customerOptions,
          ];
     }, [customerOptions, paymentData]);

     const mergedInvoices = useMemo(() => {
          const details = paymentData?.paymentDetails;
          if (!details?.invoiceId) {
               return allInvoices;
          }

          const invoiceId =
               typeof details.invoiceId === 'object' ? details.invoiceId?._id : details.invoiceId;
          const exists = allInvoices.some(invoice => invoice._id === invoiceId);

          if (exists || !details.invoiceNumber) {
               return allInvoices;
          }

          return [
               {
                    _id: invoiceId,
                    invoiceNumber: details.invoiceNumber,
                    customerId: details.customerId?._id || details.customerId,
                    CustomerName: details.customerDetail?.name,
               },
               ...allInvoices,
          ];
     }, [allInvoices, paymentData]);

     const filteredInvoices = selectedCustomerId
          ? mergedInvoices.filter(inv => inv.customerId === selectedCustomerId)
          : mergedInvoices;

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
          if (isAdd) {
               reset();
               setAllInvoices([]);
          }
          onClose();
     };

     const submitPayment = async data => {
          const processingMessage = isEdit ? 'Updating payment...' : 'Adding payment...';
          const loadingKey = enqueueSnackbar(processingMessage, {
               variant: 'info',
               persist: true,
               preventDuplicate: true,
          });

          try {
               return await handleFormSubmit(data);
          } finally {
               closeSnackbar(loadingKey);
          }
     };

     const showForm = isAdd || (isEdit && !loading && !error && paymentData);

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
                    PaperProps={DIALOG_PAPER_PROPS}
               >
                    <DialogTitle
                         variant='h4'
                         className='flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16'
                    >
                         {MODE_TITLES[mode]}
                    </DialogTitle>

                    <DialogContent className='overflow-visible pbs-0 pbe-3 pli-0' sx={{ p: 0 }}>
                         <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4' disabled={isSubmitting}>
                              <i className='ri-close-line text-textSecondary' />
                         </IconButton>

                         {isEdit && loading ? (
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
                         ) : isEdit && error ? (
                              <Box className="flex flex-col justify-center items-center h-40 gap-4">
                                   <Typography color="error" variant="h6">
                                        Error Loading Payment
                                   </Typography>
                                   <Typography color="error">{error}</Typography>
                                   <Button variant="outlined" color="primary" onClick={onRetry}>
                                        Retry
                                   </Button>
                              </Box>
                         ) : showForm ? (
                              <Box className="p-6">
                                   <form onSubmit={handleSubmit(submitPayment)} id={formId}>
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
                                                                 options={mergedCustomerOptions}
                                                                 getOptionLabel={(option) => option?.name || ''}
                                                                 value={mergedCustomerOptions.find(customer => customer._id === value) || null}
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
                                                                 value={mergedInvoices.find(inv => inv._id === value) || null}
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
                                                                                // icon={getFormIcon(field.value) || 'mdi:credit-card-outline'}
                                                                                width={23}
                                                                                color={theme.palette.secondary.light}
                                                                           />
                                                                      }
                                                                 >
                                                                      {paymentMethods.map(method => (
                                                                           <MenuItem key={method.value} value={method.value}>
                                                                                <Box className="flex items-center gap-2">
                                                                                     <Icon icon={method.icon} width={18} color={theme.palette.secondary.light} />
                                                                                     {method.label}
                                                                                </Box>
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
                         ) : isEdit ? (
                              <Box className="flex justify-center items-center h-40">
                                   <Typography color="error">Payment not found</Typography>
                              </Box>
                         ) : null}
                    </DialogContent>

                    {showForm && (
                         <DialogActions className="gap-2 justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16">
                              <Button variant="outlined" color="secondary" onClick={handleClose} disabled={isSubmitting}>
                                   Close
                              </Button>
                              <Button
                                   type="submit"
                                   form={formId}
                                   variant="contained"
                                   disabled={isSubmitting}
                              >
                                   {isAdd ? 'Add Payment' : 'Update Payment'}
                              </Button>
                         </DialogActions>
                    )}
               </Dialog>
          </LocalizationProvider>
     );
};

const PaymentViewDialog = ({ open, onClose, paymentData = null, loading = false, error = '', onRetry }) => {
     const theme = useTheme();
     const payment = paymentData?.paymentDetails;
     const statusOption = getPaymentStatusOption(payment?.status);

     if (!open) return null;

     return (
          <Dialog
               fullWidth
               open={open}
               onClose={onClose}
               maxWidth="md"
               scroll="body"
               sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
               PaperProps={DIALOG_PAPER_PROPS}
          >
               <DialogTitle
                    variant="h4"
                    className="flex gap-2 flex-col text-center pbs-10 pbe-6 pli-10 sm:pbs-8 sm:pbe-0 sm:pli-16"
               >
                    {MODE_TITLES.view}
               </DialogTitle>

               <DialogContent className="overflow-visible pbs-0 pbe-3 pli-0" sx={{ p: 0 }}>
                    <IconButton onClick={onClose} className="absolute block-start-4 inline-end-4">
                         <i className="ri-close-line text-textSecondary" />
                    </IconButton>

                    {loading ? (
                         <Box className="p-6">
                              <Grid container spacing={4}>
                                   {Array.from({ length: 8 }).map((_, index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                             <Skeleton variant="rounded" height={56} />
                                        </Grid>
                                   ))}
                              </Grid>
                         </Box>
                    ) : error ? (
                         <Box className="flex flex-col items-center justify-center h-40 gap-4">
                              <Typography color="error" variant="h6">
                                   Error Loading Payment
                              </Typography>
                              <Typography color="error">{error}</Typography>
                              <Button variant="outlined" color="primary" onClick={onRetry}>
                                   Retry
                              </Button>
                         </Box>
                    ) : payment ? (
                         <Box className="p-6">
                              <Grid container spacing={4}>
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <PaymentReadOnlyField
                                             label="Payment Number"
                                             value={payment.payment_number || ''}
                                             icon={getFormIcon('id') || 'mdi:identifier'}
                                             theme={theme}
                                        />
                                   </Grid>
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <PaymentReadOnlyField
                                             label="Customer"
                                             value={payment.customerDetail?.name || 'N/A'}
                                             icon={getFormIcon('customer') || 'mdi:account-outline'}
                                             theme={theme}
                                        />
                                   </Grid>
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <PaymentReadOnlyField
                                             label="Invoice Number"
                                             value={payment.invoiceNumber || ''}
                                             icon={getFormIcon('invoice') || 'mdi:file-document-outline'}
                                             theme={theme}
                                        />
                                   </Grid>
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <PaymentReadOnlyField
                                             label="Amount"
                                             value={formatPaymentAmountText(payment.amount)}
                                             icon={getFormIcon('currency') || 'lucide:saudi-riyal'}
                                             theme={theme}
                                        />
                                   </Grid>
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <PaymentReadOnlyField
                                             label="Payment Method"
                                             value={payment.payment_method || ''}
                                             icon={getFormIcon('payment') || 'mdi:credit-card-outline'}
                                             theme={theme}
                                        />
                                   </Grid>
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <PaymentReadOnlyField
                                             label="Payment Date"
                                             value={
                                                  payment.received_on
                                                       ? dayjs(payment.received_on).format('DD/MM/YYYY')
                                                       : payment.createdAt
                                                            ? dayjs(payment.createdAt).format('DD/MM/YYYY')
                                                            : ''
                                             }
                                             icon={getFormIcon('date') || 'mdi:calendar-outline'}
                                             theme={theme}
                                        />
                                   </Grid>
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <PaymentReadOnlyField
                                             label="Status"
                                             value={statusOption.label}
                                             icon={getFormIcon('status') || 'mdi:check-circle-outline'}
                                             theme={theme}
                                             inputSx={{
                                                  '& .MuiInputBase-input': {
                                                       color: `${theme.palette[statusOption.color]?.main || theme.palette.text.primary}`,
                                                  },
                                             }}
                                        />
                                   </Grid>
                                   <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                        <PaymentReadOnlyField
                                             label="Reference"
                                             value={payment.referenceNo || payment.reference || ''}
                                             icon={getFormIcon('reference') || 'mdi:text-box-outline'}
                                             theme={theme}
                                        />
                                   </Grid>
                                   <Grid size={{ xs: 12 }}>
                                        <PaymentReadOnlyField
                                             label="Description"
                                             value={payment.notes || payment.description || ''}
                                             icon="mdi:text-box-outline"
                                             theme={theme}
                                        />
                                   </Grid>
                              </Grid>
                         </Box>
                    ) : (
                         <Box className="flex justify-center items-center h-40">
                              <Typography color="error">Payment not found</Typography>
                         </Box>
                    )}
               </DialogContent>

               <DialogActions className="flex justify-center pbs-0 pbe-10 pli-10 sm:pbe-12 sm:pli-16">
                    <Button color="secondary" variant="outlined" onClick={onClose}>
                         Close
                    </Button>
               </DialogActions>
          </Dialog>
     );
};

const PaymentDialog = ({ mode, open, ...rest }) => {
     if (!open) return null;

     if (mode === 'view') {
          return <PaymentViewDialog open={open} {...rest} />;
     }

     if (mode === 'add' || mode === 'edit') {
          return <PaymentFormDialog mode={mode} open={open} {...rest} />;
     }

     return null;
};

export default PaymentDialog;

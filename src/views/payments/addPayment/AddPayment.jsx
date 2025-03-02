"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  TableContainer,
  Divider,
  IconButton,
  Avatar,
  Fade,
  List,
  ListItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Icon } from '@iconify/react';
import { addPayment } from '@/app/(dashboard)/payments/actions';
import { paymentSchema } from './PaymentSchema';
import { formatDate, formatDiscount } from '@/utils/helpers';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getInvoicesByCustomer, getCustomers } from '@/app/(dashboard)/payments/actions';
import { debounce } from 'lodash';

const paymentModes = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Bank', label: 'Bank' },
  { value: 'Online', label: 'Online' }
];

const getPaymentModeIcon = (mode) => {
  switch (mode) {
    case 'Cash':
      return 'mdi:cash-multiple';
    case 'Cheque':
      return 'mdi:checkbook';
    case 'Bank':
      return 'mdi:bank';
    case 'Online':
      return 'mdi:web';
    default:
      return 'bi:credit-card';
  }
};

const convertFirstLetterToCapital = (string) => {
  return string
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getStatusBadge = (status,size='small') => {
  if (!status) return null;

  let color;
  switch (status) {
    case 'REFUND':
      color = 'info';
      break;

    case 'SENT':
      color = 'info';
      break;
    case 'UNPAID':
      color = 'default';
      break;
    case 'PARTIALLY_PAID':
      color = 'primary';
      break;
    case 'CANCELLED':
    case 'OVERDUE':
      color = 'error';
      break;
    case 'PAID':
      color = 'success';
      break;
    case 'DRAFTED':
      color = 'warning';
      break;
    default:
      color = 'default';
  }

  const formattedLabel = status.includes('_')
    ? convertFirstLetterToCapital(status.replace('_', ' '))
    : convertFirstLetterToCapital(status);

  return (
    <Chip
      label={formattedLabel}
      color={color || 'default'}
      size={size}
      variant="tonal"
    />
  );
};

const getDueDateChipColor = (dueDate) => {
  const today = dayjs();
  const due = dayjs(dueDate);
  const daysUntilDue = due.diff(today, 'day');

  if (daysUntilDue <= 0) return 'error';
  if (daysUntilDue <= 10) return 'warning';
  return 'secondary';
};

// Helper function to safely format numbers
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

const AddPayment = ({ customers, enqueueSnackbar, closeSnackbar, onSubmit, paymentNo }) => {
  const router = useRouter();
  const theme = useTheme();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customersList, setCustomersList] = useState(customers);
  const [paymentNumber, setPaymentNumber] = useState(paymentNo);
  const [invoicesList, setInvoicesList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const submitButtonRef = useRef(null);

  const defaultValues = {
    amount: '',
    customerId: '',
    paymentNumber: paymentNumber,
    invoiceId: '',
    payment_method: '',
    description: '',
    date: dayjs() // Add default date
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger
  } = useForm({
    defaultValues,
    resolver: yupResolver(paymentSchema),
    mode: 'onChange'
  });

  // Debounced search for invoices
  const debouncedInvoiceSearch = useCallback(
    debounce(async (search, customerId) => {
      try {
        const invoices = await getInvoicesByCustomer(customerId, search);
        setInvoicesList(invoices);
      } catch (error) {
        console.error('Error searching invoices:', error);
      }
    }, 300),
    []
  );

  // Handler for changing the selected customer
  const handleCustomerChange = async (newValue) => {
    try {
      // Clear previous selections first
      setValue('invoiceId', '');
      setSelectedInvoice(null);
      setInvoiceSearch(''); // Reset search term
      setSelectedCustomer(newValue);

      // Clear previous invoices list immediately
      setInvoicesList([]);

      if (newValue?._id) {
        // Directly fetch customer invoices without using the debounce function
        const customerInvoices = await getInvoicesByCustomer(newValue._id, '');
        setInvoicesList(customerInvoices);
      } else {
        const allInvoices = await getInvoicesByCustomer(null, '');
        setInvoicesList(allInvoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      enqueueSnackbar('Error fetching invoices', { variant: 'error' });
    }
  };

  // Handler for changing the selected invoice
  const handleInvoiceChange = async (newValue) => {
    if (newValue?._id && newValue?.customerId) {
      const invoiceCustomer = customersList.find(
        customer => customer._id === newValue.customerId
      );

      if (invoiceCustomer) {
        setValue('customerId', invoiceCustomer._id);
        setSelectedCustomer(invoiceCustomer);
      }
    }
  };

  // Debounced search for customers
  const debouncedCustomerSearch = useCallback(
    debounce(async (search) => {
      try {
        const customers = await getCustomers({ search });
        setCustomersList(customers);
      } catch (error) {
        console.error('Error searching customers:', error);
      }
    }, 300),
    []
  );

  const handleError = (errors) => {
    closeSnackbar();

    setTimeout(() => {
      const errorCount = Object.keys(errors).length;
      if (errorCount === 0) return;

      Object.values(errors).forEach((error, index) => {
        enqueueSnackbar(error.message, {
          autoHideDuration: 5000,
          variant: 'error',
          preventDuplicate: true,
          key: `error-${index}-${Date.now()}`,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right'
          }
        });
      });
    }, 200);
  };

  // Handle form submission
  const handleFormSubmit = async (data) => {
    try {
      closeSnackbar();

      const isValid = await trigger();
      if (!isValid) {
        handleError(errors);
        return;
      }

      // Use the actual submit button as anchor
      handleConfirmClick({ currentTarget: submitButtonRef.current }, data);
    } catch (error) {
      handleError({ submit: { message: error.message || 'Error submitting form' } });
    }
  };

  const handleConfirmClick = (event, data) => {
    setAnchorEl(event.currentTarget);
    setFormData(data);
  };

  // Confirm the submit after user hits "Add Payment"
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      handleError({ submit: { message: error.message || 'Error adding payment' } });
    } finally {
      setIsSubmitting(false);
      setAnchorEl(null);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 5,
            gap: 2
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: theme => alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main'
            }}
          >
            <Icon icon="material-symbols:payments-outline-rounded" fontSize={26} />
          </Avatar>
          <Box>
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 600 }}>
              Add Payment
            </Typography>

          </Box>
        </Box>

        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: theme => `0 8px 24px ${alpha(theme.palette.common.black, 0.06)}`,
            overflow: 'hidden',
            backdropFilter: 'blur(8px)',
            background: theme => alpha(theme.palette.background.paper, 0.95),
            '&:hover': {
              boxShadow: theme => `0 12px 28px ${alpha(theme.palette.common.black, 0.08)}`
            },
            transition: 'all 0.25s ease'
          }}
        >
          <CardContent>
            <form onSubmit={handleSubmit(handleFormSubmit, handleError)}>
              <Grid container padding={3} spacing={15}>
                {/* Payment Details Section with Header */}
                <Grid item xs={12}>
                  <Grid container spacing={5}>
                    {/* Section Header */}
                    <Grid item xs={12} className='flex flex-col gap-2'>
                      <Box className='flex flex-row gap-1.5 items-center'>
                        <Box
                          sx={{
                            width: 8,
                            height: 28,
                            bgcolor: 'secondary.lightOpacity',
                            borderRadius: 1
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '16px'}}>
                          Payment Details
                        </Typography>
                      </Box>
                      <Divider light textAlign='left' width='400px' />
                    </Grid>

                    {/* Payment Details Form Fields */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name='paymentNumber'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            fullWidth
                            value={paymentNumber}
                            label='Payment Number'
                            error={!!errors.paymentNumber}
                            helperText={errors.paymentNumber?.message}
                            slotProps={{
                              input: { readOnly: true }
                            }}
                            InputProps={{
                              startAdornment: (
                                <Box sx={{ mr: 1.5, mt: 2, color: 'secondary.main' }}>
                                  <Icon icon="tabler:hash" fontSize={20} />
                                </Box>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                                '&:hover': {
                                  backgroundColor: theme => alpha(theme.palette.background.paper, 0.9)
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Continue with other payment detail fields (date, payment_method, amount) */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name='date'
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            format='DD/MM/YYYY'
                            label='Payment Date'
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!errors.date,
                                helperText: errors.date?.message,
                             
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                                    '&:hover': {
                                      backgroundColor: theme => alpha(theme.palette.background.paper, 0.9)
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl
                        fullWidth
                        error={!!errors.payment_method}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                            '&:hover': {
                              backgroundColor: theme => alpha(theme.palette.background.paper, 0.9)
                            }
                          }
                        }}
                      >
                        <InputLabel>Payment Mode</InputLabel>
                        <Controller
                          name='payment_method'
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              label='Payment Mode'
                              sx={{ borderRadius: '12px' }}
                              // startAdornment={
                              //   <Box sx={{ ml: 1, mr: 1, color: 'secondary.main' }}>
                              //     <Icon icon={getPaymentModeIcon(field.value)} fontSize={20} />
                              //   </Box>
                              // }
                            >
                              {paymentModes.map((mode) => (
                                <MenuItem key={mode.value} value={mode.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Icon icon={getPaymentModeIcon(mode.value)} fontSize={20} color={theme.palette.secondary.main} />
                                    {mode.label}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.payment_method && (
                          <FormHelperText>{errors.payment_method.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Controller
                        name='amount'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='number'
                            label='Amount'
                            error={!!errors.amount}
                            helperText={errors.amount?.message}
                            InputProps={{
                              startAdornment: (
                                <Box sx={{ mr: 1.5, mt: 2, color: 'secondary.main' }}>
                                  <Icon icon="tabler:currency-riyal" fontSize={25} />
                                </Box>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                                '&:hover': {
                                  backgroundColor: theme => alpha(theme.palette.background.paper, 0.9)
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Customer & Invoice Section with Header */}
                <Grid item xs={12}>
                  <Grid container spacing={5}>
                    {/* Section Header */}
               <Grid item xs={12} className='flex flex-col gap-2'>
                      <Box className='flex flex-row gap-1.5 items-center'>
                        <Box
                          sx={{
                            width: 8,
                            height: 28,
                            bgcolor: 'secondary.lightOpacity',
                            borderRadius: 1
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '16px'}}>
                          Customers Invoices
                        </Typography>
                      </Box>
                      <Divider light textAlign='left' width='400px' />
                    </Grid>

                    {/* Customer & Invoice Form Fields */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='customerId'
                        control={control}
                        render={({ field: { onChange } }) => (
                          <Autocomplete
                            options={customersList}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option._id === value}
                            value={selectedCustomer}
                            onChange={(_, newValue) => {
                              onChange(newValue?._id || '');
                              handleCustomerChange(newValue);
                            }}
                            onInputChange={(_, newInputValue) => {
                              setCustomerSearch(newInputValue);
                              debouncedCustomerSearch(newInputValue);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label='Select Customer'
                                placeholder='Search by name...'
                                error={!!errors.customerId}
                                helperText={errors.customerId?.message}
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <Box sx={{ ml: 1, mr: 1, color: 'secondary.main' }}>
                                        <Icon icon="tabler:user" fontSize={20} />
                                      </Box>
                                      {params.InputProps.startAdornment}
                                    </>
                                  )
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                                    '&:hover': {
                                      backgroundColor: theme => alpha(theme.palette.background.paper, 0.9)
                                    }
                                  }
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <MenuItem
                                {...props}
                                sx={{
                                  py: 1.5,
                                  px: 2.5,
                                  borderRadius: '8px',
                                  mx: 1,
                                  my: 0.5,
                                  '&:hover': {
                                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.08)
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      bgcolor: theme => alpha(theme.palette.primary.light, 0.15),
                                      color: 'primary.main',
                                      fontSize: '0.875rem',
                                      fontWeight: 500
                                    }}
                                  >
                                    {option.name.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                      {option.name}
                                    </Typography>
                                    {option.email && (
                                      <Typography variant="caption" color="text.secondary">
                                        {option.email}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </MenuItem>
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name='invoiceId'
                        control={control}
                        render={({ field: { onChange } }) => (
                          <Autocomplete
                            options={invoicesList}
                            getOptionLabel={(option) => option.invoiceNumber || ''}
                            isOptionEqualToValue={(option, value) => option._id === value}
                            value={selectedInvoice}
                            onChange={(_, newValue) => {
                              onChange(newValue?._id || '');
                              setSelectedInvoice(newValue);
                              handleInvoiceChange(newValue);
                            }}
                            onInputChange={(_, newInputValue) => {
                              setInvoiceSearch(newInputValue);
                              debouncedInvoiceSearch(newInputValue, selectedCustomer?._id);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label='Select Invoice'
                                placeholder='Search by invoice number...'
                                error={!!errors.invoiceId}
                                helperText={errors.invoiceId?.message}
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <Box sx={{ ml: 1, mr: 1, color: 'secondary.main' }}>
                                        <Icon icon="tabler:file-invoice" fontSize={20} />
                                      </Box>
                                      {params.InputProps.startAdornment}
                                    </>
                                  )
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                                    '&:hover': {
                                      backgroundColor: theme => alpha(theme.palette.background.paper, 0.9)
                                    }
                                  }
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <MenuItem
                                {...props}
                                sx={{
                                  py: 1.5,
                                  px: 2.5,
                                  borderRadius: '10px',
                                  mx: 1,
                                  my: 0.5,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.06),
                                    boxShadow: theme => `0 4px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
                                  }
                                }}
                              >
                                <Grid container  className='flex flex-row justify-between' alignItems="center">
                                  {/* Invoice avatar and number */}
                                  <Grid item xs={12} sm={3} md={5} sx={{  alignItems: 'center' }}>
                                    <Typography variant="body1" color='primary.light' sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                      #{option.invoiceNumber}
                                    </Typography>
                                  </Grid>

                                  {/* Amount & Status */}
                                  <Grid item xs={12} sm={3} md={5} className='flex flex-row justify-between items-center'>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        // color: 'primary.light',
                                        fontWeight: 600
                                      }}
                                    >
                                      {formatNumber(option.totalAmount)} SAR
                                    </Typography>

                                    {option.status && (
                                      <Chip
                                        label={option.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase())}
                                        color={
                                          option.status === 'PAID' ? 'success' :
                                          option.status === 'UNPAID' ? 'error' :
                                          option.status === 'PARTIALLY_PAID' ? 'warning' :
                                          option.status === 'DRAFTED' ? 'info' :
                                          'default'
                                        }
                                        size="small"
                                        variant="tonal"
                                      />
                                    )}

                                  </Grid>

                                  {/* Status */}
                                  <Grid item xs={6} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>

                                  </Grid>
                                </Grid>
                              </MenuItem>
                            )}
                          />
                        )}
                      />
                    </Grid>

                    {/* Invoice Details Card - Show when invoice is selected */}
                    {selectedInvoice && (
                      <Grid item xs={12}>
                        <Fade in={!!selectedInvoice} timeout={500}>
                          <Card
                            elevation={0}
                            sx={{
                              borderRadius: '16px',
                              boxShadow: theme => `0 4px 16px 0 ${alpha(theme.palette.secondary.main, 0.1)}`,
                              p: 0,
                              overflow: 'hidden',
                              border: theme => `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                              mt: 2
                            }}
                          >
                            <Box sx={{
                              p: 3,
                              backgroundColor: theme => alpha(theme.palette.primary.main, 0.04),
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 42,
                                    height: 42,
                                    bgcolor: theme => alpha(theme.palette.primary.main, 0.12),
                                    color: 'primary.main'
                                  }}
                                >
                                  <Icon icon="tabler:file-invoice" fontSize={22} />
                                </Avatar>
                                <Box>
                                  <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                    Invoice #{selectedInvoice.invoiceNumber}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    {selectedInvoice.CustomerName}
                                  </Typography>
                                </Box>
                              </Box>
                              {selectedInvoice.status && getStatusBadge(selectedInvoice.status,'medium')}
                            </Box>

                            <Box sx={{ p: 3 }}>
                              <Grid container spacing={4}>
                                <Grid item xs={6} sm={4} md={2}>
                                  <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    borderRadius: '12px',
                                    bgcolor: theme => alpha(theme.palette.background.default, 0.6),
                                    p: 2
                                  }}>
                                    <Typography variant='caption' color='text.secondary' gutterBottom>
                                      Total Amount
                                    </Typography>
                                    <Typography variant='h6' sx={{ fontWeight: 600, color: 'primary.main' }}>
                                      {formatNumber(selectedInvoice.totalAmount)}
                                      <Typography component="span" variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
                                        SAR
                                      </Typography>
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={2}>
                                  <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    borderRadius: '12px',
                                    bgcolor: theme => alpha(theme.palette.background.default, 0.6),
                                    p: 2
                                  }}>
                                    <Typography variant='caption' color='text.secondary' gutterBottom>
                                      Balance Due
                                    </Typography>
                                    <Typography variant='h6' sx={{
                                      fontWeight: 600,
                                      color: selectedInvoice.balanceAmount > 0 ? 'error.main' : 'success.main'
                                    }}>
                                      {formatNumber(selectedInvoice.balanceAmount)}
                                      <Typography component="span" variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
                                        SAR
                                      </Typography>
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={2}>
                                  <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    borderRadius: '12px',
                                    bgcolor: theme => alpha(theme.palette.background.default, 0.6),
                                    p: 2
                                  }}>
                                    <Typography variant='caption' color='text.secondary' gutterBottom>
                                      Paid Amount
                                    </Typography>
                                    <Typography variant='h6' sx={{ fontWeight: 600, color: 'success.main' }}>
                                      {formatNumber(selectedInvoice.paidAmount)}
                                      <Typography component="span" variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
                                        SAR
                                      </Typography>
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={6} sm={4} md={2}>
                                  <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    borderRadius: '12px',
                                    bgcolor: theme => alpha(theme.palette.background.default, 0.6),
                                    p: 2
                                  }}>
                                    <Typography variant='caption' color='text.secondary' gutterBottom>
                                      Due Date
                                    </Typography>
                                    <Chip
                                      label={formatDate(selectedInvoice.dueDate)}
                                      color={getDueDateChipColor(selectedInvoice.dueDate)}
                                      size="small"
                                      variant="tonal"
                                      sx={{ fontWeight: 500, mt: 0.5 }}
                                    />
                                  </Box>
                                </Grid>
                              </Grid>

                              {/* Invoice Items Table without totals */}
                              <TableContainer
                                component={Paper}
                                elevation={0}
                                sx={{
                                  mt: 3,
                                  borderRadius: '12px',
                                  border: theme => `1px solid ${alpha(theme.palette.secondary.light, 0.1)}`,

                                }}
                              >
                                <Table sx={{ minWidth: 650 }} size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: theme => alpha(theme.palette.background.default, 0.6) }}>
                                      <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Item</TableCell>
                                      <TableCell sx={{ fontWeight: 600, py: 1.5 }}>Units</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>Qty</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>Rate</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>Discount</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>VAT</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>Amount</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {selectedInvoice.items.map((item, index) => (
                                      <TableRow
                                        key={index}
                                        sx={{
                                          '&:last-child td, &:last-child th': { border: 0 },
                                          '&:hover': { backgroundColor: theme => alpha(theme.palette.primary.light, 0.04) }
                                        }}
                                      >
                                        <TableCell component="th" scope="row" sx={{ py: 1.5 }}>
                                          {item.name}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{item.units || '-'}</TableCell>
                                        <TableCell align="right" sx={{ py: 1.5 }}>{item.quantity}</TableCell>
                                        <TableCell align="right" sx={{ py: 1.5 }}>{formatNumber(item.rate)}</TableCell>
                                        <TableCell align="right" sx={{ py: 1.5 }}>
                                          {item.discountType === '2'
                                            ? `${item.discount}% (${(item.discount / 100) * item.rate} SAR)`
                                            : `${formatNumber(item.discount)} SAR`}
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 1.5 }}>{item.tax}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 500, py: 1.5 }}>
                                          {formatNumber(item.amount)} SAR
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>

                              {/* Totals Section - Refined elegant styling */}
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, mt: 2 }}>
                                <Box
                                  sx={{
                                    width: { xs: '100%', sm: '60%', md: '40%' },
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    ml: 'auto',
                                    background: theme => `
                                      linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box,
                                      linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)}) border-box
                                    `,
                                    border: '1px solid transparent',
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '4px',
                                      height: '100%',
                                      backgroundImage: theme => `linear-gradient(to bottom, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                                      opacity: 0.2,
                                      borderTopLeftRadius: '12px',
                                      borderBottomLeftRadius: '12px'
                                    }
                                  }}
                                >
                                  <List disablePadding>
                                    <ListItem
                                      sx={{
                                        py: 1.8,
                                        borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.08)}`
                                      }}
                                    >
                                      <Grid container>
                                        <Grid item xs={6}>
                                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                            Subtotal
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {formatNumber(selectedInvoice.subTotal)} SAR
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    </ListItem>

                                    {selectedInvoice.totalDiscount > 0 && (
                                      <ListItem
                                        sx={{
                                          py: 1.8,
                                          borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.08)}`
                                        }}
                                      >
                                        <Grid container>
                                          <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                              Discount
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              ({formatNumber(selectedInvoice.totalDiscount)}) SAR
                                            </Typography>
                                          </Grid>
                                        </Grid>
                                      </ListItem>
                                    )}

                                    {selectedInvoice.vat > 0 && (
                                      <ListItem
                                        sx={{
                                          py: 1.8,
                                          borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.08)}`
                                        }}
                                      >
                                        <Grid container>
                                          <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                              Tax
                                            </Typography>
                                          </Grid>
                                          <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                              {formatNumber(selectedInvoice.vat)} SAR
                                            </Typography>
                                          </Grid>
                                        </Grid>
                                      </ListItem>
                                    )}

                                    <ListItem
                                      sx={{
                                        py: 2,
                                        backgroundColor: theme => alpha(theme.palette.background.default, 0.5),
                                        borderBottom: 'none',
                                        borderBottomLeftRadius: '12px',
                                        borderBottomRightRadius: '12px',
                                      }}
                                    >
                                      <Grid container alignItems="center">
                                        <Grid item xs={6}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            Total
                                          </Typography>
                                        </Grid>
                                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {formatNumber(selectedInvoice.totalAmount)} SAR
                                          </Typography>
                                        </Grid>
                                      </Grid>
                                    </ListItem>
                                  </List>
                                </Box>
                              </Box>
                            </Box>
                          </Card>
                        </Fade>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* Payment Notes Section with Header */}
                <Grid item xs={12}>
                  <Grid container spacing={5}>
                    {/* Section Header */}
                            <Grid item xs={12} className='flex flex-col gap-2'>
                      <Box className='flex flex-row gap-1.5 items-center'>
                        <Box
                          sx={{
                            width: 8,
                            height: 28,
                            bgcolor: 'secondary.lightOpacity',
                            borderRadius: 1
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '16px'}}>
                          Payment Notes
                        </Typography>
                      </Box>
                      <Divider light textAlign='left' width='400px' />
                    </Grid>

                    {/* Notes Field */}
                    <Grid item xs={12}>
                      <Controller
                        name='description'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={3}
                            label='Description'
                            placeholder='Enter any additional notes about this payment...'
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            InputProps={{
                              startAdornment: (
                                <Box sx={{ mr: 1.5, mt: 1.5, color: 'secondary.main', alignSelf: 'flex-start' }}>
                                  <Icon icon="tabler:notes" fontSize={20} />
                                </Box>
                              )
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                backgroundColor: theme => alpha(theme.palette.background.paper, 0.6),
                                '&:hover': {
                                  backgroundColor: theme => alpha(theme.palette.background.paper, 0.9)
                                },
                                alignItems: 'flex-start'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 2
                  }}>
                    <Button
                      variant='outlined'
                      component={Link}
                      href='/payments/payment-list'
                      sx={{
                        borderRadius: '12px',
                        py: 1.2,
                        px: 4,
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px',
                          backgroundColor: theme => alpha(theme.palette.primary.main, 0.04)
                        }
                      }}
                      startIcon={<Icon icon="tabler:arrow-left" />}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      variant='contained'
                      disabled={isSubmitting}
                      ref={submitButtonRef}
                      sx={{
                        borderRadius: '12px',
                        py: 1.2,
                        px: 4,
                        fontWeight: 500,
                        boxShadow: theme => `0 8px 16px 0 ${alpha(theme.palette.primary.main, 0.24)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: theme => `0 10px 20px 0 ${alpha(theme.palette.primary.main, 0.3)}`
                        }
                      }}
                      startIcon={<Icon icon="tabler:plus" />}
                    >
                      Add Payment
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>

            {/* Confirmation Popover */}
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => {
                setAnchorEl(null);
                setFormData(null);
              }}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              slotProps={{
                paper: {
                  sx: {
                    p: 0,
                    backgroundColor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(12px)',
                    boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.12)}`,
                    width: 350,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    borderRadius: '16px',
                    mt: -1,
                    overflow: 'hidden'
                  }
                }
              }}
            >
              <Box>
                <Box sx={{
                  p: 3,
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
                  borderBottom: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.1)
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: theme => alpha(theme.palette.primary.main, 0.12),
                        color: 'primary.main'
                      }}
                    >
                      <Icon icon="tabler:alert-circle" fontSize={22} />
                    </Avatar>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                      Confirm Payment
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 3 }}>
                  <Typography variant='body2' sx={{ mb: 3 }}>
                    Are you sure you want to add this payment? This action cannot be undone.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      size='small'
                      variant='outlined'
                      sx={{
                        borderRadius: '10px',
                        py: 1,
                        px: 2,
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px'
                        }
                      }}
                      startIcon={<Icon icon="tabler:x" />}
                      onClick={() => {
                        setAnchorEl(null);
                        setFormData(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size='small'
                      variant='contained'
                      startIcon={<Icon icon="tabler:check" />}
                      onClick={handleConfirmSubmit}
                      disabled={isSubmitting}
                      sx={{
                        borderRadius: '10px',
                        py: 1,
                        px: 2,
                        boxShadow: theme => `0 4px 12px 0 ${alpha(theme.palette.primary.main, 0.3)}`
                      }}
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Popover>
          </CardContent>
        </Card>

    </LocalizationProvider>
  );
};

export default AddPayment;
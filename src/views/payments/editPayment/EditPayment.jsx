'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Popover
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Icon } from '@iconify/react';
import { updatePayment } from '@/app/(dashboard)/payments/actions';
import { paymentSchema } from './PaymentSchema';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const paymentModes = [
  { value: 'cash', label: 'Cash' },
  { value: 'credit', label: 'Credit' },
  { value: 'cheque', label: 'Cheque' }
];

const EditPayment = ({ payment }) => {
  const router = useRouter();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const defaultValues = {
    date: dayjs(payment.date),
    amount: payment.amount,
    customerId: payment.customerDetail?._id,
    paymentNumber: payment.paymentNumber,
    invoiceId: payment.invoiceId,
    paymentMode: payment.payment_method,
    description: payment.description || ''
  };

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    resolver: yupResolver(paymentSchema)
  });

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await updatePayment({
        id: payment._id,
        ...formData
      });

      if (response.success) {
        enqueueSnackbar('Payment updated successfully', { variant: 'success' });
        router.push('/payments/expense-list');
      } else {
        enqueueSnackbar(response.message || 'Error updating payment', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      enqueueSnackbar('Error updating payment', { variant: 'error' });
    }
    setIsSubmitting(false);
    setAnchorEl(null);
  };

  const handleConfirmClose = () => {
    setAnchorEl(null);
  };

  const [formData, setFormData] = useState(null);

  const onSubmit = (data) => {
    setFormData(data);
    setAnchorEl(document.activeElement);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant='h5'>Edit Payment</Typography>
            <Button
              variant='outlined'
              startIcon={<Icon icon='tabler:arrow-left' />}
              component={Link}
              href='/payments/expense-list'
            >
              Back to List
            </Button>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name='date'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label='Payment Date'
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.date,
                          helperText: errors.date?.message
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='amount'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Amount'
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name='paymentNumber'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label='Payment Number'
                      error={!!errors.paymentNumber}
                      helperText={errors.paymentNumber?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.paymentMode}>
                  <InputLabel>Payment Mode</InputLabel>
                  <Controller
                    name='paymentMode'
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label='Payment Mode'>
                        {paymentModes.map((mode) => (
                          <MenuItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.paymentMode && (
                    <FormHelperText>{errors.paymentMode.message}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label='Description'
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant='outlined'
                    component={Link}
                    href='/payments/expense-list'
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    variant='contained'
                    disabled={isSubmitting}
                  >
                    Update Payment
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleConfirmClose}
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
                  p: 2,
                  backgroundColor: alpha(theme.palette.primary.contrastText, 0.3),
                  backdropFilter: 'blur(8px)',
                  color: theme.palette.success.main,
                  boxShadow: `0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
                  width: 'auto',
                  border: `1px solid ${alpha(theme.palette.common.black, 0.01)}`,
                  mt: -1
                }
              }
            }}
          >
            <Box className="p-2">
              <Typography variant="h6" className="mb-3">
                Are you sure you want to update this payment?
              </Typography>
              <Box className="flex gap-2 justify-end">
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={handleConfirmClose}
                >
                  No
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Yes'}
                </Button>
              </Box>
            </Box>
          </Popover>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default EditPayment;

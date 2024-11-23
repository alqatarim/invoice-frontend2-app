import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import moment from 'moment';
import { useTheme } from '@mui/material/styles';

const AddPaymentDialog = ({ open, onClose, onSubmit, invoiceId, invoiceAmount, balanceAmount }) => {
  const theme = useTheme();
  const [paymentMethods] = useState([
    { id: 'Cash', text: 'Cash' },
    { id: 'Credit Card', text: 'Credit Card' },
    { id: 'Bank Transfer', text: 'Bank Transfer' },
  ]);

  const schema = yup.object().shape({
    payment_method: yup.string().required('Payment method is required'),
    amount: yup
      .number()
      .typeError('Amount must be a number')
      .positive('Amount must be greater than zero')
      .max(balanceAmount, 'Amount cannot exceed balance amount')
      .required('Amount is required'),
    notes: yup.string(),
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      invoiceNumber: invoiceId,
      invoiceAmount: invoiceAmount,
      balanceAmount: balanceAmount,
      received_on: new Date(),
      payment_method: '',
      amount: balanceAmount,
      notes: '',
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = (data) => {
    const paymentData = {
      invoiceId: data.invoiceNumber,
      amount: parseFloat(data.amount),
      paymentMethod: data.payment_method,
      notes: data.notes,
      received_on: data.received_on,
    };
    onSubmit(paymentData);
    reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 24,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}>
        Add Payment
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <form>
          <Controller
            name="invoiceNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Invoice"
                margin="normal"
                fullWidth
                InputProps={{ readOnly: true }}
                error={!!errors.invoiceNumber}
                helperText={errors.invoiceNumber?.message}
              />
            )}
          />
          <Controller
            name="invoiceAmount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Invoice Amount"
                margin="normal"
                fullWidth
                InputProps={{ readOnly: true }}
                error={!!errors.invoiceAmount}
                helperText={errors.invoiceAmount?.message}
              />
            )}
          />
          <Controller
            name="balanceAmount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Balance Amount"
                margin="normal"
                fullWidth
                InputProps={{ readOnly: true }}
                error={!!errors.balanceAmount}
                helperText={errors.balanceAmount?.message}
              />
            )}
          />
          <Controller
            name="received_on"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Received Date"
                value={field.value}
                onChange={(date) => field.onChange(date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    fullWidth
                    error={!!errors.received_on}
                    helperText={errors.received_on?.message}
                  />
                )}
              />
            )}
          />
          <Controller
            name="payment_method"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.payment_method}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  {...field}
                  label="Payment Method"
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main } }}
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.id} value={method.id}>{method.text}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.payment_method?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Amount"
                margin="normal"
                fullWidth
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />
            )}
          />
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notes"
                margin="normal"
                fullWidth
                multiline
                rows={4}
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />
            )}
          />
        </form>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onFormSubmit)}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: '20px',
            px: 4,
            py: 1,
            boxShadow: theme.shadows[3],
            '&:hover': {
              boxShadow: theme.shadows[5],
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPaymentDialog;

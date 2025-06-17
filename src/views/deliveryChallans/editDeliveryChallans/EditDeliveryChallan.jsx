'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { deliveryChallanSchema } from '@/views/deliveryChallans/deliveryChallansSchema';
import SignaturePadComponent from '@/components/SignatureComponent';

const EditDeliveryChallan = ({
  id,
  deliveryChallanData,
  customersData = [],
  productData = [],
  taxRates = [],
  initialBanks = [],
  signatures = [],
  onSave,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [signatureURL, setSignatureURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(deliveryChallanSchema),
    defaultValues: {
      deliveryChallanNumber: '',
      customerId: null,
      deliveryChallanDate: dayjs(),
      dueDate: null,
      referenceNo: '',
      address: '',
      items: [],
      bank: '',
      notes: '',
      termsAndCondition: '',
      sign_type: 'eSignature',
      signatureName: '',
      signatureId: null,
      roundOff: false,
      taxableAmount: 0,
      totalDiscount: 0,
      vat: 0,
      TotalAmount: 0,
    }
  });

  const watchCustomer = watch('customerId');
  const watchSignType = watch('sign_type');

  // Initialize form with existing data
  useEffect(() => {
    if (deliveryChallanData) {
      const customer = customersData.find(c => c._id === deliveryChallanData.customerId?._id);
      const signature = signatures.find(s => s._id === deliveryChallanData.signatureId?._id);

      reset({
        deliveryChallanNumber: deliveryChallanData.deliveryChallanNumber || '',
        customerId: customer || null,
        deliveryChallanDate: deliveryChallanData.deliveryChallanDate ? dayjs(deliveryChallanData.deliveryChallanDate) : dayjs(),
        dueDate: deliveryChallanData.dueDate ? dayjs(deliveryChallanData.dueDate) : null,
        referenceNo: deliveryChallanData.referenceNo || '',
        address: deliveryChallanData.deliveryAddress ?
          `${deliveryChallanData.deliveryAddress.addressLine1 || ''}, ${deliveryChallanData.deliveryAddress.city || ''}, ${deliveryChallanData.deliveryAddress.state || ''} ${deliveryChallanData.deliveryAddress.pincode || ''}`.trim() : '',
        items: deliveryChallanData.items || [],
        bank: deliveryChallanData.bank || '',
        notes: deliveryChallanData.notes || '',
        termsAndCondition: deliveryChallanData.termsAndCondition || '',
        sign_type: deliveryChallanData.sign_type || 'eSignature',
        signatureName: deliveryChallanData.signatureName || '',
        signatureId: signature || null,
        roundOff: deliveryChallanData.roundOff || false,
        taxableAmount: deliveryChallanData.taxableAmount || 0,
        totalDiscount: deliveryChallanData.totalDiscount || 0,
        vat: deliveryChallanData.vat || 0,
        TotalAmount: deliveryChallanData.TotalAmount || 0,
      });

      // Set existing signature URL if it's an e-signature
      if (deliveryChallanData.sign_type === 'eSignature' && deliveryChallanData.signatureImage) {
        setSignatureURL(deliveryChallanData.signatureImage);
      }

      setLoading(false);
    }
  }, [deliveryChallanData, customersData, signatures, reset]);

  // Handle customer selection and auto-populate address
  const handleCustomerChange = (customer) => {
    if (customer?.shippingAddress) {
      const address = `${customer.shippingAddress.addressLine1}, ${customer.shippingAddress.city}, ${customer.shippingAddress.state} ${customer.shippingAddress.pincode}`;
      setValue('address', address);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare data for submission
      const formData = {
        ...data,
        deliveryChallanDate: data.deliveryChallanDate ? dayjs(data.deliveryChallanDate).toISOString() : null,
        dueDate: data.dueDate ? dayjs(data.dueDate).toISOString() : null,
        customerId: data.customerId?._id || data.customerId,
        signatureId: data.sign_type === 'manualSignature' ? data.signatureId?._id : null,
        deliveryAddress: data.customerId?.shippingAddress || {},
      };

      const result = await onSave(formData, signatureURL);

      if (result.success) {
        router.push('/deliveryChallans/deliveryChallans-list');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/deliveryChallans/deliveryChallans-list');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Delivery Challan
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Delivery Challan Number */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="deliveryChallanNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Delivery Challan Number"
                        fullWidth
                        disabled
                        error={!!errors.deliveryChallanNumber}
                        helperText={errors.deliveryChallanNumber?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Customer Selection */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="customerId"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        value={value}
                        onChange={(_, newValue) => {
                          onChange(newValue);
                          handleCustomerChange(newValue);
                        }}
                        options={customersData}
                        getOptionLabel={(option) => option.name || ''}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Customer *"
                            error={!!errors.customerId}
                            helperText={errors.customerId?.message}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>

                {/* Delivery Challan Date */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="deliveryChallanDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Delivery Challan Date *"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.deliveryChallanDate,
                            helperText: errors.deliveryChallanDate?.message,
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Due Date */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Due Date"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.dueDate,
                            helperText: errors.dueDate?.message,
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Reference Number */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="referenceNo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Reference Number"
                        fullWidth
                        error={!!errors.referenceNo}
                        helperText={errors.referenceNo?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Shipping Address */}
                <Grid item xs={12}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Shipping Address *"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.address}
                        helperText={errors.address?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Bank */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="bank"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.bank}>
                        <InputLabel>Bank</InputLabel>
                        <Select {...field} label="Bank">
                          <MenuItem value="">None</MenuItem>
                          {initialBanks.map((bank) => (
                            <MenuItem key={bank._id} value={bank._id}>
                              {bank.bankName}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.bank && <FormHelperText>{errors.bank.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Signature Type */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="sign_type"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.sign_type}>
                        <InputLabel>Signature Type *</InputLabel>
                        <Select {...field} label="Signature Type *">
                          <MenuItem value="eSignature">E-Signature</MenuItem>
                          <MenuItem value="manualSignature">Manual Signature</MenuItem>
                        </Select>
                        {errors.sign_type && <FormHelperText>{errors.sign_type.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Signature Name (for e-signature) */}
                {watchSignType === 'eSignature' && (
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="signatureName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Signature Name *"
                          fullWidth
                          error={!!errors.signatureName}
                          helperText={errors.signatureName?.message}
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Manual Signature Selection */}
                {watchSignType === 'manualSignature' && (
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="signatureId"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Autocomplete
                          value={value}
                          onChange={(_, newValue) => onChange(newValue)}
                          options={signatures}
                          getOptionLabel={(option) => option.signatureName || ''}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Signature *"
                              error={!!errors.signatureId}
                              helperText={errors.signatureId?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                )}

                {/* Notes */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Notes"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.notes}
                        helperText={errors.notes?.message}
                      />
                    )}
                  />
                </Grid>

                {/* Terms and Conditions */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="termsAndCondition"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Terms and Conditions"
                        fullWidth
                        multiline
                        rows={3}
                        error={!!errors.termsAndCondition}
                        helperText={errors.termsAndCondition?.message}
                      />
                    )}
                  />
                </Grid>

                {/* E-Signature Pad */}
                {watchSignType === 'eSignature' && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Draw Signature *
                    </Typography>
                    <SignaturePadComponent
                      initialSignature={signatureURL}
                      onSignatureChange={(signatureData) => {
                        setSignatureURL(signatureData);
                        setValue('signatureData', signatureData ? 'true' : 'false');
                      }}
                    />
                    {errors.signatureData && (
                      <FormHelperText error>{errors.signatureData.message}</FormHelperText>
                    )}
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Delivery Challan'}
            </Button>
          </Box>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default EditDeliveryChallan;
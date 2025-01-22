'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Autocomplete,
  Snackbar,
  Alert
} from '@mui/material';
import Icon from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { updatePurchase } from '@/app/(dashboard)/purchases/actions';

// Local currency formatter
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);
};

const defaultValues = {
  purchaseId: '',
  purchaseDate: new Date(),
  vendorId: null,
  items: [
    {
      productId: '',
      productName: '',
      unit: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 'fixed',
      discountValue: 0,
      tax: 0,
      amount: 0
    }
  ],
  paymentMode: 'Cash',
  status: 'PENDING',
  taxableAmount: 0,
  totalDiscount: 0,
  vat: 0,
  TotalAmount: 0,
  roundOff: false
};

const PurchaseEdit = ({ dropdownData, purchaseData }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues
  });

  useEffect(() => {
    if (purchaseData?.data) {
      const purchase = purchaseData.data;
      reset({
        ...purchase,
        purchaseDate: new Date(purchase.purchaseDate),
        vendorId: dropdownData.vendors?.find((v) => v._id === purchase.vendorId?._id) || null
      });
    }
  }, [purchaseData, dropdownData, reset]);

  const items = watch('items');

  const calculateItemAmount = (item) => {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const discountType = item.discountType;
    const discountInput = Number(item.discount) || 0;

    let discountValue = 0;
    const subtotal = quantity * rate;

    if (discountType === 'percentage') {
      discountValue = (subtotal * discountInput) / 100;
    } else {
      discountValue = discountInput;
    }

    const amountAfterDiscount = subtotal - discountValue;
    const tax = (amountAfterDiscount * (Number(item.tax) || 0)) / 100;

    return {
      discountValue,
      amount: amountAfterDiscount + tax
    };
  };

  const updateTotals = (items) => {
    let taxableAmount = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const { discountValue, amount } = calculateItemAmount(item);
      taxableAmount += amount;
      totalDiscount += discountValue;
      totalTax += ((amount - discountValue) * (Number(item.tax) || 0)) / 100;
    });

    setValue('taxableAmount', taxableAmount);
    setValue('totalDiscount', totalDiscount);
    setValue('vat', totalTax);
    setValue('TotalAmount', taxableAmount);
  };

  const handleAddItem = () => {
    setValue('items', [
      ...items,
      {
        productId: '',
        productName: '',
        unit: '',
        quantity: 1,
        rate: 0,
        discount: 0,
        discountType: 'fixed',
        discountValue: 0,
        tax: 0,
        amount: 0
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setValue('items', newItems);
    updateTotals(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    if (['quantity', 'rate', 'discount', 'discountType', 'tax'].includes(field)) {
      const { discountValue, amount } = calculateItemAmount(newItems[index]);
      newItems[index].discountValue = discountValue;
      newItems[index].amount = amount;
    }

    setValue('items', newItems);
    updateTotals(newItems);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await updatePurchase(purchaseData.data._id, data);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Purchase updated successfully',
          severity: 'success'
        });
        router.push('/purchases/purchase-list');
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Error updating purchase',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating purchase',
        severity: 'error'
      });
    }
    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <Box
                sx={{
                  p: 5,
                  pb: 3,
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h5">Edit Purchase</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => router.push('/purchases/purchase-list')}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" type="submit" disabled={loading}>
                    Save
                  </Button>
                </Box>
              </Box>

              <Divider />

              <Box sx={{ p: 5 }}>
                <Grid container spacing={6}>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name="purchaseId"
                      control={control}
                      rules={{ required: 'Purchase ID is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Purchase ID"
                          fullWidth
                          error={Boolean(error)}
                          helperText={error?.message}
                          disabled
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="purchaseDate"
                      control={control}
                      rules={{ required: 'Date is required' }}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          {...field}
                          label="Date"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: Boolean(error),
                              helperText: error?.message
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Controller
                      name="vendorId"
                      control={control}
                      rules={{ required: 'Vendor is required' }}
                      render={({ field: { value, onChange }, fieldState: { error } }) => (
                        <Autocomplete
                          value={value}
                          onChange={(_, newValue) => onChange(newValue)}
                          options={dropdownData.vendors || []}
                          getOptionLabel={(option) => option.vendor_name}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Vendor"
                              error={Boolean(error)}
                              helperText={error?.message}
                            />
                          )}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" sx={{ mt: 4, mb: 2 }}>
                  Items
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">Discount</TableCell>
                        <TableCell align="right">Tax (%)</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Autocomplete
                              value={dropdownData.products?.find((p) => p._id === item.productId) || null}
                              onChange={(_, newValue) => {
                                handleItemChange(index, 'productId', newValue?._id || '');
                                handleItemChange(index, 'productName', newValue?.name || '');
                                handleItemChange(index, 'unit', newValue?.unit || '');
                              }}
                              options={dropdownData.products || []}
                              getOptionLabel={(option) => option.name}
                              renderInput={(params) => (
                                <TextField {...params} size="small" />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              size="small"
                              inputProps={{ min: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                              size="small"
                              inputProps={{ min: 0 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                type="number"
                                value={item.discount}
                                onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                                size="small"
                                inputProps={{ min: 0 }}
                              />
                              <Autocomplete
                                value={item.discountType}
                                onChange={(_, newValue) =>
                                  handleItemChange(index, 'discountType', newValue)
                                }
                                options={['fixed', 'percentage']}
                                size="small"
                                sx={{ width: 100 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.tax}
                              onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                              size="small"
                              inputProps={{ min: 0, max: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveItem(index)}
                              disabled={items.length === 1}
                            >
                              <Icon icon="mdi:delete-outline" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Button
                  variant="outlined"
                  startIcon={<Icon icon="mdi:plus" />}
                  onClick={handleAddItem}
                  sx={{ mt: 2 }}
                >
                  Add Item
                </Button>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Box sx={{ minWidth: 200 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">
                        {formatCurrency(watch('taxableAmount'))}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Discount:</Typography>
                      <Typography variant="body2">
                        {formatCurrency(watch('totalDiscount'))}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Tax:</Typography>
                      <Typography variant="body2">{formatCurrency(watch('vat'))}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">Total:</Typography>
                      <Typography variant="subtitle2">
                        {formatCurrency(watch('TotalAmount'))}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PurchaseEdit;
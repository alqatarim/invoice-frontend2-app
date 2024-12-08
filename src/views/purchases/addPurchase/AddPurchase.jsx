'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { PurchaseSchema } from './PurchaseSchema';
import SignaturePad from 'react-signature-canvas';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const AddPurchase = ({ onSave, dropdownData }) => {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [signatureData, setSignatureData] = useState(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(PurchaseSchema),
    defaultValues: {
      purchaseDate: dayjs(),
      dueDate: dayjs().add(30, 'days'),
      items: [],
      sign_type: 'eSignature'
    }
  });

  const calculateTotals = (items) => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const amount = item.quantity * item.rate;
      subtotal += amount;
      totalTax += (amount * (item.tax || 0)) / 100;
      totalDiscount += (amount * (item.discount || 0)) / 100;
    });

    return {
      subtotal,
      totalTax,
      totalDiscount,
      total: subtotal + totalTax - totalDiscount
    };
  };

  const handleAddItem = () => {
    setItems([...items, {
      productId: '',
      quantity: 1,
      rate: 0,
      tax: 0,
      discount: 0
    }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    const removedProduct = newItems[index].productId;
    newItems.splice(index, 1);
    setItems(newItems);
    setValue('items', newItems);
    setSelectedProducts(selectedProducts.filter(id => id !== removedProduct));
  };

  const handleProductChange = (index, productId) => {
    const product = dropdownData.products.find(p => p._id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        productId: product._id,
        rate: product.purchasePrice || product.sellingPrice,
        tax: product.tax?.taxRate || 0
      };
      setItems(newItems);
      setValue(`items.${index}`, newItems[index]);
      setSelectedProducts([...selectedProducts, product._id]);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append basic fields
      formData.append('vendorId', data.vendorId.value);
      formData.append('purchaseDate', data.purchaseDate.toISOString());
      formData.append('dueDate', data.dueDate.toISOString());
      formData.append('referenceNo', data.referenceNo || '');

      // Append items
      data.items.forEach((item, index) => {
        Object.keys(item).forEach(key => {
          formData.append(`items[${index}][${key}]`, item[key]);
        });
      });

      // Append other fields
      if (data.bank?.value) {
        formData.append('bank', data.bank.value);
      }
      formData.append('notes', data.notes || '');
      formData.append('termsAndCondition', data.termsAndCondition || '');
      formData.append('sign_type', data.sign_type);

      if (data.sign_type === 'eSignature') {
        formData.append('signatureName', data.signatureName);
        formData.append('signatureData', signatureData);
      } else {
        formData.append('signatureId', data.signatureId.value);
      }

      const response = await onSave(formData);
      if (response.success) {
        toast.success('Purchase added successfully');
        router.push('/purchases/purchase-list');
      } else {
        toast.error(response.message || 'Error adding purchase');
      }
    } catch (error) {
      toast.error('Error adding purchase');
      console.error(error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="flex flex-col gap-4 p-4">
        <Typography variant="h5" color="primary">
          Add Purchase
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                {/* Vendor Selection */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="vendorId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.vendorId}>
                        <InputLabel>Vendor</InputLabel>
                        <Select {...field} label="Vendor">
                          {dropdownData.vendors.map(vendor => (
                            <MenuItem key={vendor._id} value={vendor._id}>
                              {vendor.vendor_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* Dates */}
                <Grid item xs={12} md={6}>
                  <Controller
                    name="purchaseDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Purchase Date"
                        {...field}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.purchaseDate
                          }
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Due Date"
                        {...field}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.dueDate
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
              </Grid>

              {/* Items Table */}
              <Box className="mt-6">
                <Box className="flex justify-between items-center mb-4">
                  <Typography variant="h6">Items</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    variant="contained"
                    size="small"
                  >
                    Add Item
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Rate</TableCell>
                        <TableCell>Tax (%)</TableCell>
                        <TableCell>Discount (%)</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Controller
                              name={`items.${index}.productId`}
                              control={control}
                              render={({ field }) => (
                                <FormControl fullWidth size="small" error={!!errors.items?.[index]?.productId}>
                                  <Select
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      handleProductChange(index, e.target.value);
                                    }}
                                  >
                                    {dropdownData.products
                                      .filter(product => !selectedProducts.includes(product._id) || product._id === field.value)
                                      .map(product => (
                                        <MenuItem key={product._id} value={product._id}>
                                          {product.name}
                                        </MenuItem>
                                      ))
                                    }
                                  </Select>
                                </FormControl>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`items.${index}.quantity`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  error={!!errors.items?.[index]?.quantity}
                                  inputProps={{ min: 1 }}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const newItems = [...items];
                                    newItems[index] = { ...newItems[index], quantity: parseInt(e.target.value) || 0 };
                                    setItems(newItems);
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`items.${index}.rate`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  error={!!errors.items?.[index]?.rate}
                                  inputProps={{ min: 0, step: "0.01" }}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const newItems = [...items];
                                    newItems[index] = { ...newItems[index], rate: parseFloat(e.target.value) || 0 };
                                    setItems(newItems);
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`items.${index}.tax`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  error={!!errors.items?.[index]?.tax}
                                  inputProps={{ min: 0, step: "0.01" }}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const newItems = [...items];
                                    newItems[index] = { ...newItems[index], tax: parseFloat(e.target.value) || 0 };
                                    setItems(newItems);
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`items.${index}.discount`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  type="number"
                                  size="small"
                                  error={!!errors.items?.[index]?.discount}
                                  inputProps={{ min: 0, step: "0.01" }}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const newItems = [...items];
                                    newItems[index] = { ...newItems[index], discount: parseFloat(e.target.value) || 0 };
                                    setItems(newItems);
                                  }}
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            ${((item.quantity * item.rate * (1 - (item.discount || 0) / 100) * (1 + (item.tax || 0) / 100)) || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleRemoveItem(index)} size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Totals */}
              <Box className="mt-6 flex justify-end">
                <Grid container spacing={2} maxWidth="sm">
                  <Grid item xs={6}>
                    <Typography>Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6} className="text-right">
                    <Typography>${calculateTotals(items).subtotal.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Tax:</Typography>
                  </Grid>
                  <Grid item xs={6} className="text-right">
                    <Typography>${calculateTotals(items).totalTax.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>Discount:</Typography>
                  </Grid>
                  <Grid item xs={6} className="text-right">
                    <Typography>${calculateTotals(items).totalDiscount.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6">Total:</Typography>
                  </Grid>
                  <Grid item xs={6} className="text-right">
                    <Typography variant="h6">${calculateTotals(items).total.toFixed(2)}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Additional Fields */}
              <Grid container spacing={3} className="mt-4">
                <Grid item xs={12} md={6}>
                  <Controller
                    name="bank"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Bank Account</InputLabel>
                        <Select {...field} label="Bank Account">
                          <MenuItem value="">None</MenuItem>
                          {dropdownData.banks.map(bank => (
                            <MenuItem key={bank._id} value={bank._id}>
                              {bank.bankName} - {bank.accountNumber}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Notes"
                        multiline
                        rows={3}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="termsAndCondition"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Terms and Conditions"
                        multiline
                        rows={3}
                        fullWidth
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Signature */}

              <Box className="mt-6">
                <Typography variant="h6" className="mb-4">Signature</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="sign_type"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.sign_type}>
                          <InputLabel>Signature Type</InputLabel>
                          <Select {...field} label="Signature Type">
                            <MenuItem value="eSignature">E-Signature</MenuItem>
                            <MenuItem value="manualSignature">Manual Signature</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  {watch('sign_type') === 'eSignature' && (
                    <>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name="signatureName"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Signature Name"
                              fullWidth
                              error={!!errors.signatureName}
                              helperText={errors.signatureName?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <SignaturePad
                          onSave={(data) => setSignatureData(data)}
                          error={!!errors.signatureData}
                          helperText={errors.signatureData?.message}
                        />
                      </Grid>
                    </>
                  )}
                  {watch('sign_type') === 'manualSignature' && (
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="signatureId"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.signatureId}>
                            <InputLabel>Select Signature</InputLabel>
                            <Select {...field} label="Select Signature">
                              {/* Add your saved signatures here */}
                              <MenuItem value="">Select a signature</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Form Actions */}
              <Box className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => router.push('/purchases/purchase-list')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Create Purchase
                </Button>
              </Box>
            </CardContent>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default AddPurchase;
'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Skeleton,
  Divider,
  Modal
} from '@mui/material';

import {

  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon

} from '@mui/icons-material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { toast } from 'react-toastify';
import { PurchaseOrderSchema } from './PurchaseOrderSchema';
import SignaturePad from 'react-signature-canvas';
import dayjs from 'dayjs';
import Link from 'next/link';
import { alpha } from '@mui/material/styles';

// Updated calculation functions
function calculateItemValues(item) {
  if (!item) return { rate: 0, discount: 0, tax: 0, amount: 0 };

  const quantity = Number(item.quantity) || 1;
  const purchasePrice = Number(item.purchasePrice || item.rate) || 0;
  const rate = purchasePrice * quantity;
  let discountValue = 0;

  // Calculate discount based on type
  if (item.discountType === 2) { // percentage discount
    const discountPercentage = Number(item.discount || 0);
    discountValue = (discountPercentage / 100) * rate;
  } else { // fixed discount
    discountValue = Number(item.discount || 0);
  }

  // Calculate tax
  const taxRate = Number(item.taxInfo?.taxRate || item.tax || 0);
  const discountedAmount = rate - discountValue;
  const tax = (taxRate / 100) * discountedAmount;

  // Calculate final amount
  const amount = discountedAmount + tax;

  return {
    rate: Number(rate),
    discount: Number(discountValue),
    tax: Number(tax),
    amount: Number(amount)
  };
}

function calculateTotals(items) {
  let subtotal = 0;
  let totalDiscount = 0;
  let vat = 0;
  let total = 0;

  items.forEach((item) => {
    const { rate, discount, tax, amount } = calculateItemValues(item);
    subtotal += rate;
    totalDiscount += discount;
    vat += tax;
    total += amount;
  });

  return {
    subtotal: Number(subtotal),
    totalDiscount: Number(totalDiscount),
    vat: Number(vat),
    total: Number(total)
  };
}

const AddPurchaseOrder = ({ onSave, vendors, products, taxRates, banks, signatures, purchaseOrderNumber, orderData }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
  const signaturePadRef = useRef(null);
  const [signType, setSignType] = useState(orderData?.sign_type || 'eSignature');
  const [signatureDataURL, setSignatureDataURL] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(orderData?.signatureId?.signatureImage || null);
  const [openModal, setOpenModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [productsCloneData, setProductsCloneData] = useState(products);
  const [editModalData, setEditModalData] = useState(null);
  const [editModalErrors, setEditModalErrors] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const { control, handleSubmit, watch, setValue, trigger, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(PurchaseOrderSchema),
    mode: 'onChange',
    defaultValues: {
      purchaseOrderDate: dayjs(),
      dueDate: dayjs().add(30, 'days'),
      items: [],
      sign_type: orderData?.sign_type || 'eSignature',
      signatureId: orderData?.signatureId || '',
      signatureName: orderData?.signatureName || ''
    }
  });

  const [totals, setTotals] = useState({ subtotal: 0, totalDiscount: 0, vat: 0, total: 0 });

  // Recalculate totals whenever items change
  useEffect(() => {
    setTotals(calculateTotals(items));
    // Keep form in sync
    setValue('items', items);
  }, [items, setValue]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (orderData) {
      // Set the sign_type in form and state
      setValue('sign_type', orderData.sign_type || 'eSignature');
      setSignType(orderData.sign_type || 'eSignature');

      // Handle signature data based on type
      if (orderData.sign_type === 'manualSignature' && orderData.signatureId) {
        setSelectedSignature(orderData.signatureId.signatureImage);
        setValue('signatureId', orderData.signatureId);
      } else if (orderData.sign_type === 'eSignature') {
        setValue('signatureName', orderData.signatureName || '');
      }
    }
  }, [orderData, setValue]);

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    setValue('items', newItems);
  };

  const handleProductChange = (productId) => {
    if (!productId) return;

    const selectedProduct = productsCloneData.find(prod => prod._id === productId);
    if (!selectedProduct) return;

    // Remove selected product from clone data
    setProductsCloneData(prev => prev.filter(p => p._id !== productId));

    // Create new item with initial values
    const newItem = {
      key: items.length,
      name: selectedProduct.name,
      productId: selectedProduct._id,
      units: selectedProduct.units?.name,
      unit_id: selectedProduct.units?._id,
      quantity: 1,
      discountType: selectedProduct.discountType || 3, // Default to fixed discount if not set
      discount: Number(selectedProduct.discountValue || 0).toFixed(2),
      purchasePrice: Number(selectedProduct.purchasePrice || 0),
      rate: Number(selectedProduct.purchasePrice || 0),
      taxInfo: selectedProduct.tax || null,
      tax: selectedProduct.tax ? Number(selectedProduct.tax.taxRate || 0).toFixed(2) : "0.00",
      isRateFormUpadted: false,
      form_updated_discounttype: selectedProduct.discountType || 3,
      form_updated_discount: Number(selectedProduct.discountValue || 0),
      form_updated_rate: Number(selectedProduct.purchasePrice || 0),
      form_updated_tax: selectedProduct.tax ? Number(selectedProduct.tax.taxRate || 0) : 0
    };

    // Calculate initial values
    const calculatedValues = calculateItemValues(newItem);

    // Update the item with calculated values
    newItem.rate = calculatedValues.rate.toFixed(2);
    newItem.discount = calculatedValues.discount.toFixed(2);
    newItem.tax = calculatedValues.tax.toFixed(2);
    newItem.amount = calculatedValues.amount.toFixed(2);

    setItems(prev => [...prev, newItem]);
    setSelectedProduct('');
  };

  const onSubmit = async (data) => {
    try {
      const purchaseOrderData = {
        items: items.map(item => ({
          ...item,
          taxInfo: JSON.stringify(item.taxInfo)
        })),
        vendorId: data.vendorId,
        dueDate: data.dueDate.toISOString(),
        purchaseOrderDate: data.purchaseOrderDate.toISOString(),
        referenceNo: data.referenceNo || '',
        purchaseOrderId: purchaseOrderNumber,
        taxableAmount: totals.subtotal,
        TotalAmount: totals.total,
        vat: totals.vat,
        totalDiscount: totals.totalDiscount,
        roundOff: false,
        bank: data.bank || '',
        notes: data.notes || '',
        termsAndCondition: data.termsAndCondition || '',
        sign_type: data.sign_type,
        signatureName: data.sign_type === 'eSignature' ? (data.signatureName || '') : '',
        signatureId: data.sign_type === 'manualSignature' ? (data.signatureId?._id || '') : ''
      };

      const response = await onSave(purchaseOrderData, signatureDataURL);

      if (response.success) {
        setSubmissionResult('Purchase order created successfully!');
      } else {
        setSubmissionResult(response.message || 'Error creating purchase order');
      }
    } catch (error) {
      setSubmissionResult('Error creating purchase order');
      console.error(error);
    } finally {
      setShowResultDialog(true);
    }
  };

  const handleError = (errors) => {
    const errorMessages = Object.values(errors).map(error => error.message).join(', ');
    toast.error(`Validation errors: ${errorMessages}`);
  };

  const handleOpenSignatureDialog = () => {
    setShowSignatureDialog(true);
  };

  const handleCloseSignatureDialog = () => {
    setShowSignatureDialog(false);
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current) {
      const signatureData = signaturePadRef.current.toDataURL();
      setSignatureDataURL(signatureData);
      setValue('signatureData', signatureData);
      handleCloseSignatureDialog();
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setSignatureDataURL(null);
    setValue('signatureData', null);
  };

  const handleSignatureSelection = (selectedOption, field) => {
    field.onChange(selectedOption);
    setSelectedSignature(selectedOption?.signatureImage);
    trigger('signatureId');
  };

  const handleEditItem = (index) => {
    const item = items[index];
    setEditingItemIndex(index);
    setEditModalData({
      rate: item.purchasePrice,
      discountType: item.discountType || '',
      discount: item.discount || '',
      quantity: item.quantity,
      productId: item.productId,
      taxInfo: item.taxInfo
    });
    setOpenModal(true);
  };

  const handleEditModalSave = () => {
    if (!editModalData) return;

    const newItems = [...items];
    const index = newItems.findIndex(item => item.key === editModalData.key);
    if (index === -1) return;

    const item = newItems[index];

    // Save form updated values
    item.form_updated_rate = Number(editModalData.rate);
    item.form_updated_discount = Number(editModalData.discount);
    item.form_updated_discounttype = editModalData.discountType;
    item.form_updated_tax = Number(editModalData.taxInfo?.taxRate || 0);
    item.isRateFormUpadted = true;

    // Update tax info
    item.taxInfo = editModalData.taxInfo;

    // Calculate new values based on quantity
    const quantity = Number(item.quantity);
    const rateValue = quantity * Number(editModalData.rate);

    // Calculate discount
    let calculatedDiscount;
    if (editModalData.discountType === 2) { // percentage
      calculatedDiscount = (rateValue * (Number(editModalData.discount) / 100));
    } else { // fixed
      calculatedDiscount = Number(editModalData.discount);
    }

    // Calculate tax and final amount
    const discountedAmount = rateValue - calculatedDiscount;
    const taxAmount = discountedAmount * (Number(editModalData.taxInfo?.taxRate || 0) / 100);

    // Update item with new values
    item.rate = rateValue.toFixed(2);
    item.discount = calculatedDiscount.toFixed(2);
    item.discountType = editModalData.discountType;
    item.tax = taxAmount.toFixed(2);
    item.amount = (rateValue - calculatedDiscount + taxAmount).toFixed(2);

    setItems(newItems);
    setOpenEditModal(false);
    setEditModalData(null);
  };

  const handleQuantityChange = (index, newQuantity) => {
    const newItems = [...items];
    const item = newItems[index];

    // Use form updated values if they exist
    const updatedItem = {
      ...item,
      quantity: Number(newQuantity),
      rate: item.isRateFormUpadted ? item.form_updated_rate : item.purchasePrice,
      discount: item.isRateFormUpadted ? item.form_updated_discount : item.discount,
      discountType: item.isRateFormUpadted ? item.form_updated_discounttype : item.discountType,
      tax: item.isRateFormUpadted ? item.form_updated_tax : (item.taxInfo?.taxRate || 0)
    };

    // Calculate new values
    const calculatedValues = calculateItemValues(updatedItem);

    // Update item with calculated values
    newItems[index] = {
      ...item,
      quantity: Number(newQuantity),
      rate: calculatedValues.rate.toFixed(2),
      discount: calculatedValues.discount.toFixed(2),
      tax: calculatedValues.tax.toFixed(2),
      amount: calculatedValues.amount.toFixed(2)
    };

    setItems(newItems);
  };

  const handleDiscountTypeChange = (newDiscountType) => {
    const { rate, discountType, discount } = editModalData;
    let newDiscountValue = Number(discount);
    const currentRate = Number(rate);

    // Ensure we have valid numbers
    if (isNaN(newDiscountValue) || isNaN(currentRate) || currentRate === 0) {
      console.error('Invalid values for conversion:', { discount, rate });
      return;
    }

    // Convert based on the new type selected
    if (newDiscountType === 3) { // Converting TO Fixed
      newDiscountValue = (newDiscountValue / 100) * currentRate;
    } else if (newDiscountType === 2) { // Converting TO Percentage
      newDiscountValue = (newDiscountValue / currentRate) * 100;
    }


    setEditModalData({
      ...editModalData,
      discountType: newDiscountType,
      discount: Number(newDiscountValue.toFixed(2))
    });
  };

  const renderSignatureSection = () => {
    return (
      <Box className="mt-6">
        <Typography variant="h6" className="mb-4">Signature</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="sign_type"
              control={control}
              defaultValue={orderData?.sign_type || 'eSignature'}
              render={({ field: { onChange, value } }) => (
                <RadioGroup
                  row
                  value={signType}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    onChange(newValue);
                    setSignType(newValue);

                    // Clear appropriate fields based on selection
                    if (newValue === 'eSignature') {
                      setValue('signatureId', '');
                      setSelectedSignature(null);
                    } else {
                      setValue('signatureName', '');
                      setSignatureDataURL(null);
                    }
                  }}
                >
                  <FormControlLabel
                    value="eSignature"
                    control={<Radio />}
                    label="E-Signature"
                  />
                  <FormControlLabel
                    value="manualSignature"
                    control={<Radio />}
                    label="Manual Signature"
                  />
                </RadioGroup>
              )}
            />
          </Grid>

          {signType === 'manualSignature' && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Select Signature Name <span style={{ color: 'red' }}>*</span>
              </Typography>
              <Controller
                name="signatureId"
                control={control}
                defaultValue={orderData?.signatureId || ''}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.signatureId}>
                    <Select
                      value={field.value?._id || ''}
                      onChange={(event) => {
                        const selectedSignature = signatures.find(sig => sig._id === event.target.value);
                        handleSignatureSelection(selectedSignature, field);
                      }}
                      size="small"
                    >
                      {signatures.map((option) => (
                        <MenuItem key={option._id} value={option._id}>
                          {option.signatureName}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.signatureId && (
                      <FormHelperText error>{errors.signatureId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              {selectedSignature && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Signature Image
                  </Typography>
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1,
                      maxWidth: '200px'
                    }}
                  >
                    <img
                      src={selectedSignature}
                      alt="Signature"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '200px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        console.error('Error loading signature image');
                        e.target.style.display = 'none';
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Grid>
          )}

          {signType === 'eSignature' && (
            <>
              <Grid item xs={12} md={6}>
                <Controller
                  name="signatureName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Signature Name"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      error={!!errors.signatureName}
                      helperText={errors.signatureName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Box className="flex flex-row mt-6 items-center justify-between">
                  <Typography variant="body1">eSignature</Typography>
                  <IconButton
                    size="small"
                    onClick={handleOpenSignatureDialog}
                    sx={{
                      border: '2px solid',
                      borderColor: 'text.primary',
                      borderRadius: '12px',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
                {signatureDataURL ? (
                  <img
                    src={signatureDataURL}
                    alt="Signature"
                    style={{
                      maxWidth: '60%',
                      marginBottom: '1rem',
                      border: '3px solid #eee',
                      borderRadius: '8px',
                      padding: '5px',
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No signature drawn
                  </Typography>
                )}
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    );
  };

  const handleEditModalChange = (field, value) => {
    const updatedData = { ...editModalData, [field]: value };
    const calculated = calculateItemValues(updatedData);

    setEditModalData({
      ...updatedData,
      rate: calculated.rate,
      discount: calculated.discount,
      tax: calculated.tax,
      amount: calculated.amount
    });
  };

  const handleEditClick = (item) => {
    setEditModalData({
      ...item,
      key: item.key,
      rate: item.isRateFormUpadted ? item.form_updated_rate : item.purchasePrice,
      discount: item.isRateFormUpadted ? item.form_updated_discount : item.discount,
      discountType: item.isRateFormUpadted ? item.form_updated_discounttype : item.discountType,
      taxInfo: item.taxInfo
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditModalData(null);
    setOpenEditModal(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="flex flex-col gap-4 p-4">
        <Typography variant="h5" color="primary">
          Create Purchase Order
        </Typography>

        <form onSubmit={handleSubmit(onSubmit, handleError)}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                {/* Purchase Order Number */}
                <Grid item xs={12} md={4}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={40} />
                  ) : (
                    <TextField
                      label="Purchase Order Id"
                      value={purchaseOrderNumber || ''}
                      variant="outlined"
                      fullWidth
                      size="small"
                      disabled
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  )}
                </Grid>

                {/* Vendor Selection */}
                <Grid item xs={12} md={4}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={40} />
                  ) : (
                    <Controller
                      name="vendorId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined" error={!!errors.vendorId}>
                          <InputLabel>Vendor</InputLabel>
                          <Select
                            {...field}
                            label="Vendor"
                            size="small"
                            sx={{
                              borderColor: errors.vendorId ? 'red' : field.value ? 'green' : 'default',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.vendorId ? 'red' : field.value ? 'green' : 'default',
                              }
                            }}
                          >
                            {vendors.map(vendor => (
                              <MenuItem key={vendor._id} value={vendor._id}>
                                {vendor.vendor_name}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.vendorId && (
                            <FormHelperText error>{errors.vendorId.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  )}
                </Grid>

                {/* Purchase Order Date */}
                <Grid item xs={12} md={4}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={40} />
                  ) : (
                    <Controller
                      name="purchaseOrderDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Purchase Order Date"
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.purchaseOrderDate,
                              helperText: errors.purchaseOrderDate?.message,
                              sx: {
                                borderColor: errors.purchaseOrderDate ? 'red' : field.value ? 'green' : 'default',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: errors.purchaseOrderDate ? 'red' : field.value ? 'green' : 'default',
                                }
                              }
                            }
                          }}
                        />
                      )}
                    />
                  )}
                </Grid>

                {/* Due Date */}
                <Grid item xs={12} md={4}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={40} />
                  ) : (
                    <Controller
                      name="dueDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Due Date"
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.dueDate,
                              helperText: errors.dueDate?.message,
                              sx: {
                                borderColor: errors.dueDate ? 'red' : field.value ? 'green' : 'default',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: errors.dueDate ? 'red' : field.value ? 'green' : 'default',
                                }
                              }
                            }
                          }}
                        />
                      )}
                    />
                  )}
                </Grid>

                {/* Reference Number */}
                <Grid item xs={12} md={4}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={40} />
                  ) : (
                    <Controller
                      name="referenceNo"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Reference No"
                          variant="outlined"
                          fullWidth
                          size="small"
                          error={!!errors.referenceNo}
                          helperText={errors.referenceNo?.message}
                          sx={{
                            borderColor: errors.referenceNo ? 'red' : field.value ? 'green' : 'default',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: errors.referenceNo ? 'red' : field.value ? 'green' : 'default',
                            }
                          }}
                        />
                      )}
                    />
                  )}
                </Grid>
              </Grid>

              {/* Products Table */}
              <Box sx={{ my: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Products
                </Typography>
                {isLoading ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FormControl variant="outlined" sx={{ flexGrow: 1 }}>
                      <InputLabel size="small">Select Product</InputLabel>
                      <Select
                        size="small"
                        value={selectedProduct}
                        onChange={(e) => handleProductChange(e.target.value)}
                        label="Select Product"
                      >
                        {productsCloneData.map((product) => (
                          <MenuItem key={product._id} value={product._id}>
                            {product.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Link href="/products/product-add" passHref>
                      <IconButton
                        color="primary"
                        className="transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
                      >
                        <AddIcon />
                      </IconButton>
                    </Link>
                  </Box>
                )}
                {errors.items && (
                  <Typography variant="caption" color="error">
                    {errors.items.message}
                  </Typography>
                )}
              </Box>

              {/* Items Table */}
              <Box sx={{ mb: 6 }}>
                <Table size="small">
                  <TableHead
                    sx={{
                      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
                    }}
                  >
                    <TableRow>
                      <TableCell>Product / Service</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Discount</TableCell>
                      <TableCell>VAT</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.key}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.units}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            inputProps={{ min: 1 }}
                          />
                        </TableCell>
                        <TableCell>{Number(item.rate).toFixed(2)}</TableCell>
                        <TableCell>{Number(item.discount).toFixed(2)}</TableCell>
                        <TableCell>{Number(item.tax).toFixed(2)}</TableCell>
                        <TableCell>{Number(item.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEditClick(item)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(item.key)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              {/* Edit/Add Item Modal */}
              <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="edit-item-modal"
                aria-describedby="edit-item-modal-description"
              >
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 1
                }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Edit Item
                  </Typography>
                  {editModalData && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Rate"
                          type="number"
                          value={editModalData.rate}
                          onChange={(e) => setEditModalData({...editModalData, rate: e.target.value})}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Discount Type</InputLabel>
                          <Select
                            value={editModalData.discountType}
                            onChange={(e) => handleDiscountTypeChange(e.target.value)}
                            label="Discount Type"
                          >
                            <MenuItem value={2}>Percentage</MenuItem>
                            <MenuItem value={3}>Fixed</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label={`Discount ${editModalData.discountType === 2 ? '(%)' : ''}`}
                          type="number"
                          value={editModalData.discount}
                          onChange={(e) => setEditModalData({...editModalData, discount: e.target.value})}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Tax Rate (%)</InputLabel>
                          <Select
                            value={editModalData.taxInfo?._id || ''}
                            onChange={(e) => {
                              const selectedTax = taxRates.find(tax => tax._id === e.target.value);
                              setEditModalData({
                                ...editModalData,
                                taxInfo: selectedTax,
                                tax: selectedTax?.taxRate || 0
                              });
                            }}
                            label="Tax Rate (%)"
                          >

                            {taxRates.map((tax) => (
                              <MenuItem key={tax._id} value={tax._id}>
                                {tax.name} ({tax.taxRate}%)
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditModalSave}>Save</Button>
                  </Box>
                </Box>
              </Modal>

              {/* Totals Section */}
              <Box className="mt-6">
                <Grid container spacing={2} justifyContent="flex-end">
                  <Grid item xs={12} md={4}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography>Subtotal:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6" sx={{ textAlign: 'right' }}>
                          {totals.subtotal.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>Tax:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6" sx={{ textAlign: 'right' }}>
                          {totals.vat.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>Discount:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6" sx={{ textAlign: 'right' }}>
                          {totals.totalDiscount.toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6">Total:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6" sx={{ textAlign: 'right' }}>
                          {totals.total.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
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
                          {banks.map(bank => (
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

              {renderSignatureSection()}

              {/* Form Actions */}
              <Box className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => router.push('/purchase-orders/order-list')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Create Purchase Order
                </Button>
              </Box>
            </CardContent>
          </Card>
        </form>

        {/* Signature Dialog */}
        <Dialog open={showSignatureDialog} onClose={handleCloseSignatureDialog}>
          <DialogTitle>Draw Your Signature</DialogTitle>
          <DialogContent>
            <SignaturePad
              ref={signaturePadRef}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas'
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClearSignature}>Clear</Button>
            <Button onClick={handleCloseSignatureDialog}>Cancel</Button>
            <Button onClick={handleSaveSignature} color="primary">
              Save Signature
            </Button>
          </DialogActions>
        </Dialog>

        {/* Result Dialog */}
        <Dialog open={showResultDialog} onClose={() => setShowResultDialog(false)}>
          <DialogTitle>Submission Result</DialogTitle>
          <DialogContent>
            <Typography>{submissionResult}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => router.push('/purchase-orders/order-list')} color="primary">
              Go to Order List
            </Button>
            <Button onClick={() => setShowResultDialog(false)} color="secondary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={openEditModal} onClose={handleCloseEditModal}>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent>
            {editModalData && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rate"
                    type="number"
                    value={editModalData.rate}
                    onChange={(e) => setEditModalData({
                      ...editModalData,
                      rate: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={editModalData.discountType}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        discountType: e.target.value
                      })}
                      label="Discount Type"
                    >
                      <MenuItem value={2}>Percentage</MenuItem>
                      <MenuItem value={3}>Fixed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={`Discount ${editModalData.discountType === 2 ? '(%)' : ''}`}
                    type="number"
                    value={editModalData.discount}
                    onChange={(e) => setEditModalData({
                      ...editModalData,
                      discount: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tax Rate (%)</InputLabel>
                    <Select
                      value={editModalData.taxInfo?._id || ''}
                      onChange={(e) => {
                        const selectedTax = taxRates.find(tax => tax._id === e.target.value);
                        setEditModalData({
                          ...editModalData,
                          taxInfo: selectedTax,
                          tax: selectedTax?.taxRate || 0
                        });
                      }}
                      label="Tax Rate (%)"
                    >
                      {taxRates.map((tax) => (
                        <MenuItem key={tax._id} value={tax._id}>
                          {tax.name} ({tax.taxRate}%)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleEditModalSave();
                handleCloseEditModal();
              }}
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AddPurchaseOrder
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
import { EditPurchaseOrderSchema } from '@/views/purchase-orders/editOrder/EditPurchaseOrderSchema';
import SignaturePad from 'react-signature-canvas';
import dayjs from 'dayjs';
import Link from 'next/link';
import { alpha } from '@mui/material/styles';





  // **Calculation Functions (Moved Inside Component for Consistency)**
const calculateItemValues = (item) => {
    if (!item) return { rate: 0, discount: 0, tax: 0, amount: 0 };

    const quantity = Number(item.quantity);
    const purchasePrice = Number(item.rate);
    const rate = purchasePrice * quantity;
    let discountValue = 0;

    // Calculate discount based on type
    if (item.discountType == 2) { // percentage discount
        discountValue = (Number(item.discount) / 100) * rate;
    } else { // fixed discount
        discountValue = Number(item.discount);
    }

    const taxRate = Number(item.taxInfo?.taxRate || 0);
    const tax = (taxRate / 100) * (rate - discountValue);
    const amount = rate - discountValue + tax;

    return {
        rate: Number(rate),
        discount: Number(discountValue),
        tax: Number(tax),
        amount: Number(amount)
    };
  };

  const calculateTotals = (items) => {
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
  };


const EditPurchaseOrder = ({
  orderData,
  products,
  vendors,
  taxRates,
  banks,
  signatures,
  onSave
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [openSignatureDialog, setOpenSignatureDialog] = useState(false);
  const signaturePadRef = useRef(null);
  const [signType, setSignType] = useState(orderData?.sign_type || 'eSignature');
  const [signatureDataURL, setSignatureDataURL] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(
    orderData?.sign_type === 'manualSignature' ? orderData?.signatureId?.signatureImage : null
  );
  const [openModal, setOpenModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [productsCloneData, setProductsCloneData] = useState(products);
  const [editModalData, setEditModalData] = useState(null);
  const [editModalErrors, setEditModalErrors] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  const { control, handleSubmit, watch, setValue, trigger, formState: { errors, isValid } } = useForm({
    resolver: yupResolver(EditPurchaseOrderSchema),
    mode: 'onChange',
    defaultValues: {
      vendorId: orderData.vendorId?._id || '',
      purchaseOrderDate: dayjs(orderData.purchaseOrderDate),
      dueDate: dayjs(orderData.dueDate),
      referenceNo: orderData.referenceNo || '',
      bank: orderData.bank?._id || '',
      notes: orderData.notes || '',
      termsAndCondition: orderData.termsAndCondition || '',
      sign_type: orderData?.sign_type || '',
      signatureId: orderData?.signatureId || '',
      items: orderData?.items || []
    }
  });

  const [totals, setTotals] = useState({ subtotal: 0, totalDiscount: 0, vat: 0, total: 0 });



  // **Recalculate totals whenever items change**
  // useEffect(() => {
  //   setTotals(calculateTotals(items));
  //   // Keep form in sync
  //   setValue('items', items);
  // }, [items, setValue]);

  // useEffect(() => {
  //   setIsLoading(true);
  //   const timer = setTimeout(() => {
  //     setIsLoading(false);
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, []);


  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    setValue('items', newItems);
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;
    const selectedProduct = products.find(prod => prod._id === productId);

    if (selectedProduct) {
        // Remove selected product from clone data
        const updatedProductsCloneData = productsCloneData.filter(prod => prod._id !== productId);
        setProductsCloneData(updatedProductsCloneData);

        // Initialize new item
        const quantity = 1;
        const purchasePrice = Number(selectedProduct.purchasePrice);
        const discountType = selectedProduct.discountType;
        const discountValue = Number(selectedProduct.discountValue).toFixed(2);
        const taxRate = Number(selectedProduct.tax?.taxRate).toFixed(2);

        let calculatedDiscount;
        let rateValue = purchasePrice * quantity;

        if (discountType === "2") { // Percentage discount
            calculatedDiscount = (rateValue * (discountValue / 100)).toFixed(2);
        } else { // Fixed discount
            calculatedDiscount = discountValue;
        }

        const afterDiscount = (rateValue - calculatedDiscount).toFixed(2);
        const calculatedTax = (afterDiscount * (taxRate / 100)).toFixed(2);
        const calculatedAmount = (purchasePrice - calculatedDiscount + calculatedTax).toFixed(2);

        const newItem = {
            key: items.length,
            name: selectedProduct.name,
            productId: selectedProduct._id,
            units: selectedProduct.units?.name,
            unit_id: selectedProduct.units?._id,
            quantity: quantity,
            discountType: discountType,
            discount: calculatedDiscount,
            rate: purchasePrice.toFixed(2),
            tax: calculatedTax,
            taxInfo: selectedProduct.tax,
            isRateFormUpadted: false,
            form_updated_discounttype: discountType,
            form_updated_discount: discountValue,
            form_updated_rate: purchasePrice.toFixed(2),
            form_updated_tax: taxRate,
            amount: calculatedAmount
        };

        // Update items state
        const updatedItems = [...items, newItem];
        setItems(updatedItems);
        setValue('items', updatedItems);
        setSelectedProduct('');
    }
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
        purchaseOrderId: orderData.purchaseOrderId,
        taxableAmount: totals.subtotal,
        TotalAmount: totals.total,
        vat: totals.vat,
        totalDiscount: totals.totalDiscount,
        roundOff: false,
        bank: data.bank || '',
        notes: data.notes || '',
        termsAndCondition: data.termsAndCondition || '',
        sign_type: data.sign_type || 'eSignature',
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
    let taxInfoData = item.taxInfo;

    // Parse taxInfo if it's a string
    if (typeof item.taxInfo === "string") {
        taxInfoData = JSON.parse(item.taxInfo);
    }

    // Set modal data with parsed and formatted values
    setEditModalData({
        rate: Number(item.form_updated_rate || item.purchasePrice).toFixed(2),
        discountType: item.form_updated_discounttype || item.discountType || '',
        discount: Number(item.form_updated_discount || item.discount || 0).toFixed(2),
        quantity: item.quantity,
        productId: item.productId,
        taxInfo: taxInfoData,
        tax: Number(item.form_updated_tax || taxInfoData?.taxRate || 0).toFixed(2),
        keyValue: item.key
    });

    setEditingItemIndex(index);
    setOpenModal(true);
  };

  const handleEditModalChange = (field, value) => {
    const updatedData = { ...editModalData, [field]: value };

    // Recalculate values based on updated data
    const calculated = calculateItemValues(updatedData);

    setEditModalData({
        ...updatedData,
        rate: calculated.rate,
        discount: calculated.discount,
        tax: calculated.tax,
        amount: calculated.amount
    });
  };

  const handleEditModalSave = () => {
    if (!editModalData) return;

    const newItems = [...items];
    const item = newItems[editingItemIndex];

    // Update item with new values from modal
    item.rate = editModalData.rate;
    item.discountType = editModalData.discountType;
    item.discount = editModalData.discount;
    item.quantity = editModalData.quantity;
    item.taxInfo = editModalData.taxInfo;
    item.tax = editModalData.tax;
    item.amount = editModalData.amount;
    item.isRateFormUpadted = true;

    // Store form updated values
    item.form_updated_rate = editModalData.rate;
    item.form_updated_discounttype = editModalData.discountType;
    item.form_updated_discount = editModalData.discount;
    item.form_updated_tax = editModalData.tax;

    setItems(newItems);
    setValue('items', newItems);
    setOpenModal(false);
    setEditModalData(null);
    setEditingItemIndex(null);
  };

  const handleQuantityChange = (index, newQuantity) => {
    const newItems = [...items];
    const item = newItems[index];
    const originalProduct = products.find(prod => prod._id === item.productId);

    // Reset item values to original state
    if (item.isRateFormUpadted) {
        item.rate = item.form_updated_rate;
        item.discount = item.form_updated_discount;
        item.tax = item.form_updated_tax;
    } else {
        item.rate = originalProduct.purchasePrice;
        item.discount = originalProduct.discountValue;
        item.tax = originalProduct.tax?.taxRate;
    }

    // Calculate new values based on the new quantity
    const rate = item.rate * newQuantity;
    let discountValue = 0;

    if (item.discountType == 2) { // percentage discount
        discountValue = (item.discount / 100) * rate;
    } else { // fixed discount
        discountValue = item.discount;
    }

    const tax = ((rate - discountValue) * item.tax) / 100;
    const amount = rate - discountValue + tax;

    // Update item with calculated values
    item.quantity = newQuantity;
    item.rate = rate;
    item.discount = discountValue;
    item.tax = tax;
    item.amount = amount;

    setItems(newItems);
    setValue('items', newItems);
  };

  const handleDiscountTypeChange = (newDiscountType) => {
    const { rate, discount } = editModalData;
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
              defaultValue={orderData?.sign_type || ''}
              render={({ field: { onChange, value } }) => (
                <RadioGroup
                  row
                  value={value}
                  onChange={(e) => {
                    onChange(e.target.value);
                    setSignType(e.target.value);
                    if (e.target.value === 'eSignature') {
                      setValue('signatureId', '');
                      setValue('signatureName', orderData?.signatureName || '');
                    } else {
                      setValue('signatureData', '');
                      setValue('signatureName', '');
                      if (orderData?.signatureId) {
                        setValue('signatureId', orderData.signatureId);
                        setSelectedSignature(orderData.signatureId.signatureImage);
                      }
                    }
                  }}
                >
                  <FormControlLabel value="eSignature" control={<Radio />} label="E-Signature" />
                  <FormControlLabel value="manualSignature" control={<Radio />} label="Manual Signature" />
                </RadioGroup>
              )}
            />
          </Grid>

          {watch('sign_type') === 'manualSignature' && (
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
                      value={field.value?._id || orderData?.signatureId?._id || ''}
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

          {watch('sign_type') === 'eSignature' && (
            <>
              <Grid item xs={12} md={6}>
                <Controller
                  name="signatureName"
                  control={control}
                  defaultValue={orderData?.signatureName || ''}
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

  // Initialize items state with orderData items
  useEffect(() => {
    if (orderData.items) {
      const formattedItems = orderData.items.map(item => ({
        ...item,
        taxInfo: typeof item.taxInfo === 'string' ? JSON.parse(item.taxInfo) : item.taxInfo
      }));
      setItems(formattedItems);
      setValue('items', formattedItems);
    }
  }, [orderData, setValue]);

  // Set signature related states based on orderData
  useEffect(() => {
    setSignType(orderData.sign_type || '');
    if (orderData.sign_type === 'manualSignature' && orderData.signatureId) {
      setSelectedSignature(orderData.signatureId.signatureImage);
    }
  }, [orderData]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="flex flex-col gap-4 p-4">
        <Typography variant="h5" color="primary">
          Edit Purchase Order
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
                      value={orderData.purchaseOrderId || ''}
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

                            value={field.value || ''}
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

              {/* Products Section */}
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
                        onChange={handleProductChange}
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
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.units || '-'}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={Number(item.quantity)}
                              onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                              inputProps={{ min: 1 }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {Number(item.rate).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {Number(item.discount || 0).toFixed(2)}
                            {(item.discountType === 2 && Number(item.discount) > 0) && ' (%)'}
                          </TableCell>
                          <TableCell>
                            {Number(item.tax || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {Number(item.amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleEditItem(index)} size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleRemoveItem(index)} size="small">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          No items added yet
                        </TableCell>
                      </TableRow>
                    )}
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
                          onChange={(e) => handleEditModalChange('rate', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Discount Type</InputLabel>
                          <Select
                            value={editModalData.discountType}
                            onChange={(e) => handleEditModalChange('discountType', e.target.value)}
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
                          onChange={(e) => handleEditModalChange('discount', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Tax Rate (%)</InputLabel>
                          <Select
                            value={editModalData.taxInfo?._id || ''}
                            onChange={(e) => {
                              const selectedTax = taxRates.find(tax => tax._id === e.target.value);
                              handleEditModalChange('taxInfo', selectedTax);
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
                  Update
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
      </Box>
    </LocalizationProvider>
  );
};

export default EditPurchaseOrder
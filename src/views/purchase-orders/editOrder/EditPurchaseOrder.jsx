'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomIconButtonTwo from '@core/components/mui/CustomIconButtonTwo';

// MUI Components
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
  Modal,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';

// MUI Icons
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

// MUI Date Pickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Other Dependencies
import SignaturePad from 'react-signature-canvas';
import dayjs from 'dayjs';

// Local Imports
import { EditPurchaseOrderSchema } from '@/views/purchase-orders/editOrder/EditPurchaseOrderSchema';
import { addBank } from '@/app/(dashboard)/purchase-orders/actions';

// Calculation Functions
function calculateItemValues(item) {
  if (!item) return { rate: 0, discountValue: 0, tax: 0, amount: 0 };

  const quantity = Number(item.quantity) || 1;
  const purchasePrice = Number(parseFloat(item.purchasePrice || item.rate).toFixed(2)) || 0;
  const rate = parseFloat((purchasePrice * quantity).toFixed(2));
  let discountValue = 0;

  // Calculate discount based on type
  if (parseInt(item.discountType) === 2) { // percentage discount
    discountValue = parseFloat(((Number(item.discount) / 100) * rate).toFixed(2));
  } else { // fixed discount
    discountValue = parseFloat(Number(item.discount || 0).toFixed(2));
  }

  // Calculate tax
  const taxRate = Number(item.taxInfo?.taxRate || item.tax || 0);
  const discountedAmount = parseFloat((rate - discountValue).toFixed(2));
  const tax = parseFloat(((taxRate / 100) * discountedAmount).toFixed(2));

  // Calculate final amount
  const amount = parseFloat((discountedAmount + tax).toFixed(2));

  return {
    rate,
    tax,
    discountValue,
    amount
  };
}

function calculateTotals(items) {
  let subtotal = 0;
  let totalDiscount = 0;
  let vat = 0;
  let total = 0;

  items.forEach((item) => {
    const { rate, discountValue, tax, amount } = calculateItemValues(item);
    subtotal += rate;
    totalDiscount += discountValue;
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
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [items, setItems] = useState(orderData?.items || []);
  const signaturePadRef = useRef(null);
  const [signType, setSignType] = useState(orderData?.sign_type || 'eSignature');
  const [signatureDataURL, setSignatureDataURL] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(
    orderData?.sign_type === 'manualSignature' ? orderData?.signatureId?.signatureImage : null
  );
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState(null);
  const [snackbars, setSnackbars] = useState([]);
  const [openBankModal, setOpenBankModal] = useState(false);
  const [newBank, setNewBank] = useState({ name: '', bankName: '', branch: '', accountNumber: '', IFSCCode: '' });
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Initialize productsCloneData excluding products already in the order
  const [productsCloneData, setProductsCloneData] = useState(() => {
    try {
      if (!Array.isArray(products)) return [];
      if (!Array.isArray(orderData?.items)) return [...products];

      const existingProductIds = new Set(orderData.items.map(item => item.productId));
      return products.filter(product => !existingProductIds.has(product._id));
    } catch (error) {
      console.error('Error initializing productsCloneData:', error);
      return [];
    }
  });

  // Initialize form with existing order data
  const { control, handleSubmit, watch, setValue, trigger, formState: { errors }, register } = useForm({
    resolver: yupResolver(EditPurchaseOrderSchema),
    mode: 'onChange',
    defaultValues: {
      purchaseOrderId: orderData?.purchaseOrderId || '',
      vendorId: orderData?.vendorId?._id || '',
      purchaseOrderDate: dayjs(orderData?.purchaseOrderDate),
      dueDate: dayjs(orderData?.dueDate),
      referenceNo: orderData?.referenceNo || '',
      bank: orderData?.bank?._id || '',
      notes: orderData?.notes || '',
      termsAndCondition: orderData?.termsAndCondition || '',
      sign_type: orderData?.sign_type || '',
      signatureId: orderData?.signatureId?._id || '',
      items: orderData?.items || []
    }
  });

  // Initialize totals from existing order data
  const [totals, setTotals] = useState(() => {
    if (!orderData?.items) return { subtotal: 0, totalDiscount: 0, vat: 0, total: 0 };
    return calculateTotals(orderData.items);
  });

  // Handle adding new product to order
  const handleProductChange = (productId) => {
    try {
      if (!productId) return;

      const selectedProduct = products.find(product => product._id === productId);
      if (!selectedProduct) return;

      const newItem = {
        key: Date.now(),
        productId: selectedProduct._id,
        name: selectedProduct.name,
        quantity: 1,
        rate: selectedProduct.sellingPrice,
        purchasePrice: selectedProduct.sellingPrice,
        discount: 0,
        discountType: 2,
        tax: selectedProduct.tax?.taxRate || 0,
        taxInfo: selectedProduct.tax,
        amount: selectedProduct.sellingPrice,
        units: selectedProduct.units,
        unit: selectedProduct.unit
      };

      setItems(prev => [...prev, newItem]);
      setSelectedProduct('');
      setProductsCloneData(prev => prev.filter(p => p._id !== productId));
      setTotals(calculateTotals([...items, newItem]));

    } catch (error) {
      console.error('Error handling product change:', error);
      setSnackbars(prev => [...prev, {
        id: Date.now(),
        message: 'Error adding product. Please try again.',
        severity: 'error'
      }]);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Trigger validation for all fields and wait for it to complete
      const isFormValid = await trigger();

      // Check if there are any validation errors
      if (!isFormValid) {
        handleError(errors);
        return;
      }

      setIsLoading(true);

      // Prepare the final data with original order ID
      const finalData = {
        _id: orderData._id, // Include original order ID
        purchaseOrderId: data.purchaseOrderId,
        vendorId: data.vendorId,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: Number(item.quantity),
          units: item.units || '',
          unit: item.unit || '',
          rate: Number(item.rate),
          discount: Number(item.discount),
          tax: Number(item.tax),
          taxInfo: typeof item.taxInfo === 'string' ? item.taxInfo : JSON.stringify(item.taxInfo),
          amount: Number(item.amount),
          discountType: Number(item.discountType),
          isRateFormUpadted: item.isRateFormUpadted,
          form_updated_discounttype: item.form_updated_discounttype,
          form_updated_discount: Number(item.form_updated_discount),
          form_updated_rate: Number(item.form_updated_rate),
          form_updated_tax: Number(item.form_updated_tax),
        })),
        dueDate: data.dueDate.toISOString(),
        purchaseOrderDate: data.purchaseOrderDate.toISOString(),
        referenceNo: data.referenceNo || '',
        taxableAmount: totals.subtotal || 0,
        TotalAmount: totals.total || 0,
        vat: totals.vat || 0,
        totalDiscount: totals.totalDiscount || 0,
        roundOff: false,
        bank: data.bank || '',
        notes: data.notes || '',
        termsAndCondition: data.termsAndCondition || '',
        sign_type: signType,
        ...(signType === 'manualSignature'
          ? { signatureId: data.signatureId }
          : { signatureName: data.signatureName })
      };

      // Pass signature data directly like in AddPurchaseOrder
      const response = await onSave(
        finalData,
        data.sign_type === 'eSignature' ? signatureDataURL : null
      );

      if (response) {
        setSubmissionResult(
          response.success
            ? `Purchase order ${orderData.purchaseOrderId} updated successfully!`
            : `Failed to update purchase order ${orderData.purchaseOrderId}. Please try again.`
        );
        setShowResultDialog(true);
      }

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionResult(`Error updating purchase order ${orderData.purchaseOrderId}: ${error.message}`);
      setShowResultDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleCloseSignatureDialog = () => {
    setShowSignatureDialog(false);
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current) {
      const dataURL = signaturePadRef.current.toDataURL();
      setSignatureDataURL(dataURL);
      setShowSignatureDialog(false);
    }
  };

  const handleSignTypeChange = (event) => {
    setSignType(event.target.value);
    setSignatureDataURL(null);
    setSelectedSignature(null);
  };

  // Add handleSignatureSelection function
  const handleSignatureSelection = (selectedOption, field) => {
    if (selectedOption) {
      field.onChange(selectedOption._id);
      setSelectedSignature(selectedOption.signatureImage);
      trigger('signatureId');
    } else {
      field.onChange('');
      setSelectedSignature(null);
    }
  };

  // Update handleQuantityChange function
  const handleQuantityChange = (index, newQuantity) => {
    const newItems = [...items];
    const item = newItems[index];

    // Get base rate (either form updated or original purchase price)
    const baseRate = parseFloat((item.isRateFormUpadted ? item.form_updated_rate : item.purchasePrice).toFixed(2));
    const baseDiscount = parseFloat((item.isRateFormUpadted ? item.form_updated_discount : item.discount).toFixed(2));
    const baseDiscountType = item.isRateFormUpadted ? item.form_updated_discounttype : item.discountType;
    const baseTaxRate = parseFloat((item.isRateFormUpadted ? item.form_updated_tax : (item.taxInfo?.taxRate || 0)));

    // Calculate new rate based on quantity * base rate
    const newRate = parseFloat((Number(newQuantity) * Number(baseRate)).toFixed(2));

    // Calculate discount
    let calculatedDiscount;
    if (parseInt(baseDiscountType) === 2) { // percentage
      calculatedDiscount = parseFloat((newRate * (Number(baseDiscount) / 100)).toFixed(2));
    } else { // fixed
      calculatedDiscount = parseFloat(Number(baseDiscount).toFixed(2));
    }

    // Calculate tax
    const discountedAmount = parseFloat((newRate - calculatedDiscount).toFixed(2));
    const taxAmount = parseFloat((discountedAmount * (Number(baseTaxRate) / 100)).toFixed(2));

    // Update item with new values
    newItems[index] = {
      ...item,
      quantity: Number(newQuantity),
      rate: newRate,
      tax: taxAmount,
      amount: parseFloat((newRate - calculatedDiscount + taxAmount).toFixed(2))
    };

    setItems(newItems);
    setTotals(calculateTotals(newItems));
    setValue('items', newItems);
  };

  // Update handleRemoveItem function
  const handleRemoveItem = (index) => {
    try {
      // Log initial state for debugging
      console.log('Current items:', items);
      console.log('Attempting to remove item at index:', index);

      // Create a copy of current items
      const currentItems = [...items];

      // Get the item to be removed
      const removedItem = currentItems[index];

      console.log('Item to be removed:', removedItem);

      // Safety check
      if (!removedItem) {
        console.warn('No item found at index:', index);
        return;
      }

      // Remove the item from the array
      currentItems.splice(index, 1);

      // If the removed item had a productId, add it back to available products
      if (removedItem.productId) {
        const originalProduct = products.find(p => p._id === removedItem.productId);
        if (originalProduct) {
          setProductsCloneData(prevProducts => {
            console.log('Adding product back to available products:', originalProduct);
            return [...prevProducts, originalProduct];
          });
        }
      }

      // Update state with new arrays
      console.log('Updated items array:', currentItems);

      // Update all related state in a single batch
      setItems(currentItems);
      setTotals(calculateTotals(currentItems));
      setValue('items', currentItems);

    } catch (error) {
      console.error('Error in handleRemoveItem:', error);
    }
  };

  // Add handleEditClick function
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

  // Add handleEditModalSave function
  const handleEditModalSave = () => {
    if (!editModalData) return;

    const newItems = [...items];
    const index = newItems.findIndex(item => item.key === editModalData.key);
    if (index === -1) return;

    const item = newItems[index];

    // Save form updated values with 2 decimal places
    item.form_updated_rate = parseFloat(Number(editModalData.rate).toFixed(2));
    item.form_updated_discount = parseFloat(Number(editModalData.discount).toFixed(2));
    item.form_updated_discounttype = editModalData.discountType;
    item.form_updated_tax = parseFloat(Number(editModalData.taxInfo?.taxRate || 0).toFixed(2));
    item.isRateFormUpadted = true;

    // Update tax info
    item.taxInfo = editModalData.taxInfo;

    // Calculate new values based on quantity
    const quantity = Number(item.quantity);
    const rateValue = parseFloat((quantity * Number(editModalData.rate)).toFixed(2));

    // Calculate discount
    let calculatedDiscount;
    if (parseInt(editModalData.discountType) === 2) { // percentage
      calculatedDiscount = parseFloat((rateValue * (Number(editModalData.discount) / 100)).toFixed(2));
    } else { // fixed
      calculatedDiscount = parseFloat(Number(editModalData.discount).toFixed(2));
    }

    // Calculate tax and final amount
    const discountedAmount = parseFloat((rateValue - calculatedDiscount).toFixed(2));
    const taxAmount = parseFloat((discountedAmount * (Number(editModalData.taxInfo?.taxRate || 0) / 100)).toFixed(2));

    // Update item with new values
    item.rate = rateValue;
    item.discount = editModalData.discount;
    item.discountType = editModalData.discountType;
    item.tax = taxAmount;
    item.amount = parseFloat((rateValue - calculatedDiscount + taxAmount).toFixed(2));

    setItems(newItems);
    setTotals(calculateTotals(newItems));
    setValue('items', newItems);
    setOpenEditModal(false);
    setEditModalData(null);
  };

  // Add handleCloseEditModal function
  const handleCloseEditModal = () => {
    setEditModalData(null);
    setOpenEditModal(false);
  };

  // Add handleAddBank function
  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      const response = await addBank(newBank);
      if (response) {
        const newBankWithDetails = {
          _id: response._id,
          name: newBank.name,
          bankName: newBank.bankName,
          branch: newBank.branch,
          accountNumber: newBank.accountNumber,
          IFSCCode: newBank.IFSCCode,
        };
        setBanks((prevBanks) => [...prevBanks, newBankWithDetails]);
        setValue('bank', newBankWithDetails._id);
        trigger('bank');
        setOpenBankModal(false);
        setNewBank({ name: '', bankName: '', branch: '', accountNumber: '', IFSCCode: '' });
      }
    } catch (error) {
      console.error('Failed to add bank:', error);
    }
  };

  // Add handleOpenSignatureDialog function
  const handleOpenSignatureDialog = () => {
    setShowSignatureDialog(true);
  };

  // Add handleError function
  const handleError = (errors) => {
    const errorCount = Object.keys(errors).length;

    if (errorCount === 0) return;

    let message;
    if (errorCount === 1) {
      // For single error, be specific
      const [field, error] = Object.entries(errors)[0];
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
      message = error?.message || `Please review the ${fieldName} field`;
    } else {
      // For multiple errors, group by type if possible
      const hasRequiredFieldErrors = Object.values(errors).some(error =>
        error?.message?.toLowerCase().includes('required')
      );
      const hasInvalidFieldErrors = Object.values(errors).some(error =>
        error?.message?.toLowerCase().includes('invalid')
      );

      if (hasRequiredFieldErrors && hasInvalidFieldErrors) {
        message = `Please fill in required fields and correct invalid entries`;
      } else if (hasRequiredFieldErrors) {
        message = `Please fill in all required fields`;
      } else if (hasInvalidFieldErrors) {
        message = `Please correct invalid entries`;
      } else {
        message = `Please review ${errorCount} highlighted fields`;
      }
    }

    // Add error message to snackbars
    setSnackbars(prev => [...prev, {
      id: Date.now(),
      message,
      severity: 'error'
    }]);
  };

  const renderSnackbars = () => {
    return snackbars.map(snackbar => (
      <Snackbar
        key={snackbar.id}
        open={true}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbars(prev => prev.filter(item => item.id !== snackbar.id));
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => {
            setSnackbars(prev => prev.filter(item => item.id !== snackbar.id));
          }}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    ));
  };

  const renderSignatureSection = () => {
    return (
      <Box className="p-0">
        <Typography variant='h5' gutterBottom>
          Signature
        </Typography>

        {/* Signature section*/}
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            {/* Signature Type */}
            <Controller
              name="sign_type"
              control={control}
              defaultValue={'eSignature'}
              render={({ field: { onChange, value } }) => (
                <RadioGroup
                  row
                  value={signType}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    onChange(newValue);
                    setSignType(newValue);

                    if (newValue === 'eSignature') {
                      // Clear manual signature fields
                      setValue('signatureId', '');
                      setSelectedSignature(null);
                    } else {
                      // Clear eSignature fields
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

          {/* Manual Signature */}
          {signType === 'manualSignature' && (
            <Grid container item xs={9} gap={2}>
              <Controller
                name="signatureId"
                control={control}
                defaultValue={''}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.signatureId} variant='outlined'>
                    <InputLabel size="medium">
                      Select Signature Name <span style={{ color: 'red' }}>*</span>
                    </InputLabel>
                    <Select
                      label="Select Signature Name"
                      value={field.value || ''}
                      onChange={(event) => {
                        const selectedSignature = signatures.find(sig => sig._id === event.target.value);
                        handleSignatureSelection(selectedSignature, field);
                      }}
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

              <Box sx={{
                height: '136px',
                width: '136px',
                padding: '10px',
              }}>
                {selectedSignature ? (
                  <img
                    src={selectedSignature}
                    alt="Signature"
                    style={{
                      maxHeight: '136px',
                      maxWidth: '340px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      console.error('Error loading signature image');
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Icon
                    color={alpha(theme.palette.secondary.light, 0.2)}
                    width="120px"
                    height='102px'
                    icon="mdi:signature-image"
                  />
                )}
              </Box>
            </Grid>
          )}

          {/* E-Signature */}
          {signType === 'eSignature' && (
            <Grid container item xs={9} gap={2} alignItems="flex-start">
              <Controller
                name="signatureName"
                control={control}
                render={({ field }) => (
                  <TextField
                    variant='standard'
                    fullWidth
                    {...field}
                    label={<Typography variant="">Add Signature Name <span style={{ color: 'red' }}>*</span></Typography>}
                    error={!!errors.signatureName}
                    helperText={errors.signatureName?.message}
                  />
                )}
              />

              <Box sx={{
                height: '136px',
                width: '136px',
                padding: '10px',
              }}>
                {signatureDataURL ? (
                  <CustomIconButton
                    aria-label='Signature'
                    onClick={handleOpenSignatureDialog}
                    variant='outlined'
                    height='136px'
                    skin='light'
                  >
                    <img
                      src={signatureDataURL}
                      alt="E-Signature"
                      style={{
                        maxHeight: '120px',
                        maxWidth: '400px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  </CustomIconButton>
                ) : (
                  <Controller
                    name="signatureData"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <CustomIconButton
                        aria-label='Signature'
                        onClick={handleOpenSignatureDialog}
                        size='130px'
                        skin='light'
                        color={errors.signatureData && signType === 'eSignature' ? 'error' : 'primary'}
                      >
                        <Icon
                          width="120"
                          height='120'
                          icon="material-symbols-light:signature-outline-rounded"
                        />
                      </CustomIconButton>
                    )}
                  />
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const handleEditItem = (index) => {
    const item = items[index];
    if (!item) return;

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

  const handleEditModalChange = (field, value) => {
    setEditModalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="flex flex-col gap-4 p-4">
        <Typography variant="h5" color="primary">
          Edit Purchase Order
        </Typography>

        <form onSubmit={handleSubmit(onSubmit, handleError)}>
          {/* Header Information Card */}
          <Card>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <Typography variant='h5' gutterBottom>
                    Details
                  </Typography>
                </Grid>

                {/* Purchase Order Number */}
                <Grid item xs={12} md={4}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={40} />
                  ) : (
                    <TextField
                      label="Purchase Order Id"
                      value={orderData?.purchaseOrderId || ''}
                      variant="outlined"
                      fullWidth
                      size="medium"
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
                          <InputLabel size='medium'>Vendor</InputLabel>
                          <Select
                            {...field}
                            label="Vendor"
                            size="medium"
                            sx={{
                              borderColor: errors.vendorId ? 'red' : field.value ? 'green' : 'default',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: errors.vendorId ? 'red' : field.value ? 'green' : 'default',
                              }
                            }}
                          >
                            {vendors.map(vendor => (
                              <MenuItem size='medium' key={vendor._id} value={vendor._id}>
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
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              size: "medium",
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
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              size: "medium",
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
                          size="medium"
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
            </CardContent>
          </Card>

          {/* Products Card */}
          <Card sx={{ mt: 4 }}>
            <CardContent className='flex flex-col gap-3'>
              {/* Product label */}
              <Box>
                <Typography variant='h5' gutterBottom>
                  Products
                </Typography>
              </Box>

              {/* Products selector and table */}
              <Grid container spacing={3} className='items-center'>
                <Grid item xs={10} md={5} lg={4}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={200} />
                  ) : (
                    <FormControl className="w-full" variant="outlined">
                      <InputLabel size="medium">Select Product</InputLabel>
                      <Select
                        size="medium"
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
                  )}
                  {errors.items && (
                    <Typography variant="caption" color="error">
                      {errors.items.message}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={2} md={1} lg={1} className='flex items-center'>
                  <Link href="/products/product-add" passHref>
                    <CustomIconButtonTwo size='large' variant='outlined' color='primary' className='min-is-fit'>
                      <i className='ri-add-line' />
                    </CustomIconButtonTwo>
                  </Link>
                </Grid>
              </Grid>

              {/* Items Table */}
              <Box className='border rounded overflow-hidden'>
                <TableContainer
                  sx={{
                    maxWidth: '100%',
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': {
                      height: 8
                    },
                    '&::-webkit-scrollbar-thumb': {
                      borderRadius: 2,
                      bgcolor: theme => alpha(theme.palette.secondary.main, 0.1)
                    }
                  }}
                >
                  <Table
                    size='small'
                    sx={{
                      minWidth: {
                        xs: 650,
                        sm: 750,
                        md: '100%'
                      },
                      '& .MuiTableCell-root': {
                        borderColor: theme => alpha(theme.palette.secondary.main, 0.15),
                        px: { xs: 1, sm: 2, md: 3 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}
                  >
                    <TableHead
                      sx={{
                        bgcolor: theme => alpha(theme.palette.secondary.main, 0.09),
                      }}
                    >
                      <TableRow>
                        <TableCell sx={{ minWidth: { xs: 120, sm: 150 } }}>Product / Service</TableCell>
                        <TableCell sx={{ minWidth: { xs: 60, sm: 80 } }}>Unit</TableCell>
                        <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>Quantity</TableCell>
                        <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>Rate</TableCell>
                        <TableCell sx={{ minWidth: { xs: 100, sm: 120 } }}>Discount</TableCell>
                        <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>VAT</TableCell>
                        <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>Amount</TableCell>
                        <TableCell sx={{ minWidth: { xs: 80, sm: 100 } }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.length > 0 ? (
                        items.map((item, index) => (
                          <TableRow key={item.key}>
                            <TableCell sx={{ maxWidth: { xs: 120, sm: 150 } }}>
                              <Typography noWrap>{item.name}</Typography>
                            </TableCell>
                            <TableCell>{item.units}</TableCell>
                            <TableCell>
                              <TextField
                                size='small'
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                inputProps={{
                                  min: 1,
                                  style: {
                                    padding: { xs: '4px 8px', sm: '8px 12px' }
                                  }
                                }}
                                sx={{
                                  width: { xs: '70px', sm: '100px' },
                                  '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>{Number(item.rate).toFixed(2)}</TableCell>
                            <TableCell>
                              <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 0.5, sm: 1 },
                                alignItems: { sm: 'center' }
                              }}>
                                {Number(item.discount) === 0 ? (
                                  "0"
                                ) : Number(item.discountType) === 2 ? (
                                  <>
                                    <span>{Number(item.discount)}%</span>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'text.secondary',
                                        display: 'inline-block'
                                      }}
                                    >
                                      ({((Number(item.discount) / 100) * item.rate).toFixed(2)} SAR)
                                    </Typography>
                                  </>
                                ) : (
                                  <>{Number(item.discount).toFixed(2)} SAR</>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>{item.tax.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}</TableCell>
                            <TableCell>{Number(item.amount).toFixed(2)}</TableCell>
                            <TableCell>
                              <Box sx={{
                                display: 'flex',
                                gap: { xs: 0.5, sm: 1 }
                              }}>
                                <IconButton
                                  onClick={() => handleEditClick(item)}
                                  size="small"
                                  sx={{
                                    [theme.breakpoints.up('sm')]: {
                                      padding: '8px'
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  onClick={() => handleRemoveItem(index)}
                                  size="small"
                                  sx={{
                                    [theme.breakpoints.up('sm')]: {
                                      padding: '8px'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            align="center"
                            sx={{
                              py: { xs: 4, sm: 6, md: 8 },
                              color: theme => theme.palette.text.secondary,
                              borderBottom: 'none'
                            }}
                          >
                            <Box sx={{
                              position: 'relative',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              py: 3
                            }}>
                              <Icon
                                color={alpha(theme.palette.secondary.light, 0.2)}
                                icon="line-md:alert-circle-loop"
                                width='120px'
                                height='120px'
                              />
                              <Typography
                                variant="h5"
                                color='secondary.light'
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  zIndex: 1,
                                  fontWeight: 700
                                }}
                              >
                                No items added yet
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Totals Section */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Grid container spacing={2} sx={{ maxWidth: '300px' }}>
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
                      {totals.vat.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
              </Box>
            </CardContent>
          </Card>

          {/* Bottom Section with Bank, Terms, and Signature */}
          <Grid container spacing={4} sx={{ mt: 4 }} className='justify-between'>
            {/* Left Side - Bank and Terms */}
            <Grid item xs={12} md={6} lg={6}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                      <Typography variant='h5'>Bank & Notes</Typography>
                    </Grid>

                    <Grid item xs={12} md={12}>
                      <Grid container spacing={4} alignItems='center'>
                        <Grid item xs={7} md={7} lg={7}>




                          <Controller
                            name="bank"

                            control={control}
                            render={({ field }) => (
                              <FormControl variant='outlined' fullWidth>
                                <InputLabel>Bank Account</InputLabel>
                                <Select
                                 label='Bank Account'
                                 size="medium"
                                 {...field}>
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

                        <Grid item xs={5} md={2} lg={1}>
                          <Button
                            variant="contained"
                            size='large'
                            onClick={() => setOpenBankModal(true)}
                            startIcon={<Icon icon="mdi:bank-outline" width='25px' />}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            Add Bank
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={11} md={10} lg={9.5}>
                      <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            variant={'standard'}
                            {...field}
                            label="Notes"
                            multiline
                            minRows={1}
                            maxRows={4}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={11} md={10} lg={9.5}>
                      <Controller
                        name="termsAndCondition"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            variant={'standard'}
                            label="Terms and Conditions"
                            multiline
                            minRows={1}
                            maxRows={4}
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Side - Signature */}
            <Grid item xs={12} md={6} lg={6}>
              <Card>
                <CardContent>
                  {renderSignatureSection()}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box className="mt-6 flex justify-end gap-2">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => router.push('/purchase-orders/order-list')}
              startIcon={<Icon icon="mdi:arrow-left" />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<Icon icon="mdi:content-save" />}
            >
              Update Purchase Order
            </Button>
          </Box>
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
                className: 'border rounded-md'
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
        <Dialog
          open={showResultDialog}
          onClose={() => setShowResultDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {submissionResult?.includes('success') ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="mdi:check-circle" color="success" width={24} />
                Success
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon="mdi:alert-circle" color="error" width={24} />
                Error
              </Box>
            )}
          </DialogTitle>
          <DialogContent>
            <Typography>{submissionResult}</Typography>
          </DialogContent>
          <DialogActions>
            {submissionResult?.includes('success') ? (
              <>
                <Button
                  onClick={() => router.push('/purchase-orders/order-list')}
                  variant="contained"
                  color="primary"
                  startIcon={<Icon icon="mdi:format-list-bulleted" />}
                >
                  Go to Order List
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowResultDialog(false)} color="secondary">
                Close
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm">
          <DialogContent>
            {editModalData && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant='h5' color='primary' className=''>Edit Item</Typography>
                </Grid>

                {/* Rate */}
                <Grid item xs={12} md={5} lg={5}>
                  <FormControl fullWidth>
                    <TextField
                      size='small'
                      label="Rate"
                      type="number"
                      value={editModalData.rate}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        rate: e.target.value
                      })}
                    />
                  </FormControl>
                </Grid>

                {/* VAT */}
                <Grid item xs={12} md={6} lg={6}>
                  <FormControl size='small' fullWidth>
                    <InputLabel>VAT (%)</InputLabel>
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
                      label="VAT (%)"
                    >
                      {taxRates.map((tax) => (
                        <MenuItem key={tax._id} value={tax._id}>
                          {tax.name} ({tax.taxRate}%)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Discount */}
                <Grid item xs={12} md={5} lg={5}>
                  <TextField
                    size='small'
                    fullWidth
                    label='Discount'
                    type="number"
                    value={editModalData.discount}
                    onChange={(e) => setEditModalData({
                      ...editModalData,
                      discount: e.target.value
                    })}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          className='text-secondary'
                          position="end"
                          color='secondary'
                        >
                          {Number(editModalData.discountType) === 2 ?
                            <>
                              <Typography className='text-[16px]'>
                                %
                              </Typography>
                              <Typography className='text-[13px] ml-1'>
                                ({((Number(editModalData.rate) || 0) * (Number(editModalData.discount) || 0) / 100).toFixed(2)} SAR)
                              </Typography>
                            </>
                            : 'SAR'}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Discount Type */}
                <Grid item xs={12} md={6} lg={6}>
                  <FormControl component="fieldset" className="h-full flex items-center">
                    <RadioGroup
                      row
                      value={editModalData.discountType}
                      onChange={(e) => setEditModalData({
                        ...editModalData,
                        discountType: Number(e.target.value)
                      })}
                      className="flex items-center"
                    >
                      <Box sx={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <FormControlLabel
                          value={2}
                          control={
                            <Radio
                              icon={
                                <Icon
                                  icon="ri:discount-percent-line"
                                  width={32}
                                />
                              }
                              checkedIcon={
                                <Icon
                                  icon="ri:discount-percent-line"
                                  width={32}
                                />
                              }
                              size="medium"
                            />}
                          label="Percentage"
                        />
                        <FormControlLabel
                          value={3}
                          control={
                            <Radio
                              icon={
                                <Icon
                                  icon="mdi:cash-multiple"
                                  width={32}
                                />
                              }
                              checkedIcon={
                                <Icon
                                  icon="mdi:cash-multiple"
                                  width={32}
                                />
                              }
                              size="medium"
                            />}
                          label="Fixed"
                        />
                      </Box>
                    </RadioGroup>
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
              variant='contained'
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Bank Modal */}
        <Modal open={openBankModal} onClose={() => setOpenBankModal(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 1
            }}
          >
            <Typography variant="h5" color='primary' sx={{ mb: 2 }}>
              Add Bank Details
            </Typography>
            <form onSubmit={handleAddBank}>
              <TextField
                fullWidth
                label="Bank Name"
                value={newBank.bankName}
                onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Account Number"
                value={newBank.accountNumber}
                onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Account Holder Name"
                value={newBank.name}
                onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Branch Name"
                value={newBank.branch}
                onChange={(e) => setNewBank({ ...newBank, branch: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="IFSC Code"
                value={newBank.IFSCCode}
                onChange={(e) => setNewBank({ ...newBank, IFSCCode: e.target.value })}
                margin="normal"
                required
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  onClick={() => setOpenBankModal(false)}
                  variant="outlined"
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>

        {renderSnackbars()}
      </Box>
    </LocalizationProvider>
  );
};

export default EditPurchaseOrder;
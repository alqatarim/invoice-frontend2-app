'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton'
import CustomIconButtonTwo from '@core/components/mui/CustomIconButtonTwo'
import { alpha } from '@mui/material/styles';
import {
FormLabel,
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
  InputAdornment,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {

  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon

} from '@mui/icons-material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { PurchaseReturnSchema } from '@/views/debitNotes/editPurchaseReturn/EditPurchaseReturnSchema';
import SignaturePad from 'react-signature-canvas';
import dayjs from 'dayjs';
import Link from 'next/link';
import { addBank } from '@/app/(dashboard)/purchase-orders/actions';

// Updated calculation functions
function calculateItemValues(item) {
  if (!item) return { rate: 0, discountValue: 0, tax: 0, amount: 0 };

  const quantity = Number(item.quantity) || 1;
  // Use form_updated_rate if rate was edited
  const baseRate = item.isRateFormUpadted ? item.form_updated_rate : (item.purchasePrice || item.rate);
  const rate = parseFloat((baseRate * quantity).toFixed(2));

  // Determine discount type and value
  const discountType = item.isRateFormUpadted ? item.form_updated_discounttype : item.discountType;
  const discountValue = item.isRateFormUpadted ? item.form_updated_discount : item.discount;

  let calculatedDiscount;
  if (parseInt(discountType) === 2) { // percentage
    calculatedDiscount = parseFloat((rate * (discountValue / 100)).toFixed(2));
  } else { // fixed
    calculatedDiscount = parseFloat(Number(discountValue).toFixed(2));
  }

  // Calculate tax
  const taxRate = item.isRateFormUpadted ? item.form_updated_tax : (item.taxInfo?.taxRate || item.tax || 0);
  const discountedAmount = parseFloat((rate - calculatedDiscount).toFixed(2));
  const tax = parseFloat((discountedAmount * (taxRate / 100)).toFixed(2));

  // Calculate final amount
  const amount = parseFloat((discountedAmount + tax).toFixed(2));

  return {
    rate,
    discountValue: calculatedDiscount,
    tax,
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

  // Add React-style precision handling
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    totalDiscount: parseFloat(totalDiscount.toFixed(2)),
    vat: parseFloat(vat.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}

const EditPurchaseReturn = ({ debitNoteData, onSave, vendors, products, taxRates, banks, signatures, enqueueSnackbar, closeSnackbar }) => {
  const router = useRouter();



  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const signaturePadRef = useRef(null);
  const [signType, setSignType] = useState('eSignature');
  const [signatureDataURL, setSignatureDataURL] = useState(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [productsCloneData, setProductsCloneData] = useState(products);
  const [editModalData, setEditModalData] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openBankModal, setOpenBankModal] = useState(false);
  const [newBank, setNewBank] = useState({
    name: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    IFSCCode: ''
  });

  const theme = useTheme();
  const { control, handleSubmit, watch, setValue, trigger, formState: { errors, isValid, isDirty } } = useForm({
    resolver: yupResolver(PurchaseReturnSchema),
    mode: 'onChange',
    defaultValues: {
      purchaseReturnDate: dayjs(),
      dueDate: dayjs().add(30, 'days'),
      items: [],
      sign_type: 'eSignature',
      vendorId: '',
      referenceNo: '',
      bank: '',
      notes: '',
      termsAndCondition: ''
    }
  });

  const [totals, setTotals] = useState({
    subtotal: 0,
    totalDiscount: 0,
    vat: 0,
    total: 0,
    roundOff: 0
  });

  // Initialize form with debit note data
  useEffect(() => {
    if (debitNoteData) {
      // Set form values
      setValue('vendorId', debitNoteData.vendorId._id);
      setValue('purchaseReturnDate', dayjs(debitNoteData.purchaseOrderDate));
      setValue('dueDate', dayjs(debitNoteData.dueDate));
      setValue('referenceNo', debitNoteData.referenceNo);
      setValue('bank', debitNoteData.bank);
      setValue('notes', debitNoteData.notes);
      setValue('termsAndCondition', debitNoteData.termsAndCondition);
      setValue('sign_type', debitNoteData.sign_type);

      // Load signature selection and respective data without clearing existing data
      setSignType(debitNoteData.sign_type);
      if (debitNoteData.sign_type === 'manualSignature') {
        setValue('signatureId', debitNoteData.signatureId._id);
        setSelectedSignature(debitNoteData.signatureId.signatureImage);
      } else if (debitNoteData.sign_type === 'eSignature') {
        setValue('signatureName', debitNoteData.signatureName);
        setValue('signatureImage', debitNoteData.signatureImage);
        setSignatureDataURL(debitNoteData.signatureImage);
      }

      // Set items with formatted values
      const formattedItems = debitNoteData.items.map(item => ({
        key: Date.now() + Math.random(),
        productId: item.productId,
        name: item.name,
        quantity: Number(item.quantity),
        units: item.units,
        unit: item.unit,
        purchasePrice: Number(item.rate),
        rate: Number(item.rate),
        discount: Number(item.discount),
        discountType: 3, // Assuming fixed discount
        tax: Number(item.tax),
        amount: Number(item.amount),
        isRateFormUpadted: false
      }));
      setItems(formattedItems);
      setValue('items', formattedItems);

      // Calculate totals
      setTotals({
        subtotal: Number(debitNoteData.taxableAmount),
        totalDiscount: Number(debitNoteData.totalDiscount),
        vat: Number(debitNoteData.vat),
        total: Number(debitNoteData.TotalAmount),
        roundOff: debitNoteData.roundOff
      });
    }
  }, [debitNoteData, setValue]);

  const handleRemoveItem = (index) => {
    try {
      const currentItems = [...items];
      const removedItem = currentItems[index];

      if (!removedItem) {
        return;
      }

      currentItems.splice(index, 1);

      if (removedItem.productId) {
        const originalProduct = products.find(p => p._id === removedItem.productId);
        if (originalProduct) {
          setProductsCloneData(prevProducts => [...prevProducts, originalProduct]);
        }
      }

      setItems(currentItems);
      setTotals(prev => ({
        ...calculateTotals(currentItems),
        roundOff: prev.roundOff
      }));
      setValue('items', currentItems);

    } catch (error) {
      // Handle error silently or with user notification if needed
    }
  };



const handleProductChange = (productId) => {
  try {
    if (!productId) return;

    const selectedProduct = productsCloneData.find(prod => prod._id === productId);
    if (!selectedProduct) return;

    // Remove selected product from clone data
    setProductsCloneData(prev => prev.filter(p => p._id !== productId));

    // Create new item with initial values
    const newItem = {
      key: Date.now(),
      name: selectedProduct.name,
      productId: selectedProduct._id,
      units: selectedProduct.units?.name,
      unit: selectedProduct.units?._id,
      quantity: 1,
      discountType: selectedProduct.discountType || 3,
      discount: Number(selectedProduct.discountValue || 0),
      purchasePrice: Number(selectedProduct.purchasePrice || 0),
      rate: Number(selectedProduct.purchasePrice || 0),
      taxInfo: selectedProduct.tax || null,
      tax: selectedProduct.tax ? Number(selectedProduct.tax.taxRate || 0) : 0,
      isRateFormUpadted: false,
      form_updated_discounttype: selectedProduct.discountType || 3,
      form_updated_discount: Number(selectedProduct.discountValue || 0),
      form_updated_rate: Number(selectedProduct.purchasePrice || 0),
      form_updated_tax: selectedProduct.tax ? Number(selectedProduct.tax.taxRate || 0) : 0
    };

    // Calculate initial values for the new item
    const { rate, discountValue, tax, amount } = calculateItemValues(newItem);

    // Update state with new item and recalculate totals
    setItems(prevItems => {
      const updatedItems = [...prevItems, { ...newItem, rate, discountValue, tax, amount }];
      setTotals(calculateTotals(updatedItems));
      setValue('items', updatedItems, { shouldValidate: true });
      return updatedItems;
    });

    setSelectedProduct('');
  } catch (error) {
    console.error('Error in handleProductChange:', error);
  }
};



  const handleError = (errors) => {
    // Get all form values
    const formValues = watch();

    // First close any existing snackbars
    closeSnackbar();

    // Add a small delay before showing new snackbars
    setTimeout(() => {
      const errorCount = Object.keys(errors).length;
      if (errorCount === 0) return;

      Object.values(errors).forEach((error, index) => {

        enqueueSnackbar(error.message, {
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

  const onSubmit = async (data) => {
    try {
      closeSnackbar();

      const isValid = await trigger();
      if (!isValid) {
        handleError(errors);
        return;
      }


      let loadingKey = enqueueSnackbar('Updating purchase return...', {
        variant: 'info',
        persist: true,
        preventDuplicate: false,
        SnackbarProps: {
          onExited: () => {}
        }
      });

      const finalDebitNoteData = {
        id: debitNoteData._id,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit || '',
          rate: item.rate,
          discount: item.discount,
          tax: item.tax,
          amount: item.amount,
          name: item.name,
          discountValue: item.discount,
          discountAmount: item.discountValue,
          alertQuantity: item.quantity,
          units: item.units || ''
        })),
        vendorId: data.vendorId || '',
        debit_note_id: debitNoteData.debit_note_id,
        dueDate: data.dueDate.toISOString(),
        purchaseOrderDate: data.purchaseReturnDate.toISOString(),
        referenceNo: data.referenceNo || '',
        taxableAmount: totals.subtotal || 0,
        TotalAmount: totals.total || 0,
        vat: totals.vat || 0,
        totalDiscount: totals.totalDiscount || 0,
        roundOff: false,
        bank: data.bank || '',
        notes: data.notes || '',
        termsAndCondition: data.termsAndCondition || '',
        sign_type: data.sign_type,
        ...(data.sign_type === 'manualSignature'
          ? { signatureId: data.signatureId }
          : {
              signatureName: data.signatureName,
              signatureImage: data.signatureImage
            })
      };

      const response = await onSave(finalDebitNoteData);

      // Close loading notification
      closeSnackbar(loadingKey);

      if (!response?.success) {
        const errorMessage = response?.error?.message || response?.message || 'Failed to update purchase return';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: false,
          SnackbarProps: {
            onExited: () => console.log('Error snackbar closed'),
            onClose: (event, reason) => {
              if (reason === 'clickaway') return;
              closeSnackbar();
            }
          }
        });
        return;
      }

      // Show success notification

      // enqueueSnackbar('Purchase return updated successfully!', {
      //   variant: 'success',
      //   autoHideDuration: 10000,
      //   preventDuplicate: false,
      //   SnackbarProps: {
      //     onExited: () => console.log('Success snackbar closed'),
      //     onClose: (event, reason) => {
      //       if (reason === 'clickaway') return;
      //       closeSnackbar();
      //     }
      //   }
      // });

      setSubmissionResult({
        success: true,
        message: 'Purchase return updated successfully!'
      });
      setShowResultDialog(true);

    } catch (error) {
      // Close loading notification if it exists
      closeSnackbar();

      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'An unexpected error occurred while updating the purchase return';

      console.error('Form submission error:', error);

      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 10000,
        preventDuplicate: false,
        SnackbarProps: {
          onExited: () => console.log('Error snackbar closed'),
          onClose: (event, reason) => {
            if (reason === 'clickaway') return;
            closeSnackbar();
          }
        }
      });
    }
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
      setValue('signatureImage', signatureData);
      trigger('signatureImage');
      handleCloseSignatureDialog();
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setSignatureDataURL(null);
    setValue('signatureImage', '');
    trigger('signatureImage');
  };

  const handleSignatureSelection = (selectedOption, field) => {
    if (selectedOption) {
      field.onChange(selectedOption._id);
      setSelectedSignature(selectedOption.signatureImage);
      trigger('signatureId');
    } else {
      field.onChange('');
      setSelectedSignature(null);
      trigger('signatureId');
    }
  };

  const handleSignTypeChange = (e) => {
    const newValue = e.target.value;
    setValue('sign_type', newValue);
    setSignType(newValue);
    // Do not clear any field values when switching
    trigger('sign_type');
  };

  const handleEditModalSave = () => {
    if (!editModalData) return;

    const newItems = [...items];
    const index = newItems.findIndex(item => item.key === editModalData.key);
    if (index === -1) return;

    const item = newItems[index];

    // Store all form updates explicitly
    item.form_updated_rate = parseFloat(Number(editModalData.rate).toFixed(2));
    item.form_updated_discount = parseFloat(Number(editModalData.discount).toFixed(2));
    item.form_updated_discounttype = editModalData.discountType;
    item.form_updated_tax = parseFloat(Number(editModalData.taxInfo?.taxRate || 0).toFixed(2));
    item.isRateFormUpadted = true;

    // Directly update calculated fields using calculateItemValues
    const { rate, discountValue, tax, amount } = calculateItemValues({
      ...item,
      quantity: item.quantity,
      purchasePrice: item.form_updated_rate,
      discountType: item.form_updated_discounttype,
      discount: item.form_updated_discount,
      taxInfo: { taxRate: item.form_updated_tax }
    });

    // Update item with calculated values
    item.rate = rate;
    item.discount = item.form_updated_discount;
    item.discountType = item.form_updated_discounttype;
    item.tax = tax;
    item.amount = amount;

    setItems(newItems);
    setTotals(prev => ({
      ...calculateTotals(newItems),
      roundOff: prev.roundOff
    }));
    setValue('items', newItems);
    setOpenEditModal(false);
    setEditModalData(null);
  };

  const handleQuantityChange = (index, newQuantity) => {
    const newItems = [...items];
    const item = newItems[index];

    // Always use calculateItemValues for recalculations
    const updatedItem = {
      ...item,
      quantity: Number(newQuantity)
    };

    const { rate, discountValue, tax, amount } = calculateItemValues(updatedItem);

    newItems[index] = {
      ...updatedItem,
      rate,
      tax,
      amount
    };

    setItems(newItems);
    setTotals(prev => ({
      ...calculateTotals(newItems),
      roundOff: prev.roundOff
    }));
    setValue('items', newItems);
  };

  const renderSignatureSection = () => {
    return (
      <Box className="p-0">
        <Typography variant="h5" gutterBottom>
          Signature
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
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
                    // Do not clear field values when switching
                    trigger('sign_type');
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

          {/* Keep both sections in DOM but conditionally show/hide */}
          <Grid
            container
            item
            xs={9}
            gap={2}
            alignItems="flex-start"
            sx={{ display: signType === 'eSignature' ? 'flex' : 'none' }}
          >
            <Controller
              name="signatureName"
              control={control}
              render={({ field }) => (
                <TextField
                  variant="standard"
                  fullWidth
                  {...field}
                  label={
                    <Typography>
                      Add Signature Name <span style={{ color: 'red' }}>*</span>
                    </Typography>
                  }
                  error={!!errors.signatureName}
                  helperText={errors.signatureName?.message}
                />
              )}
            />
            <Box
              sx={{
                height: '136px',
                width: '136px',
                padding: '10px',
              }}
            >
              {signatureDataURL ? (
                <CustomIconButton
                  aria-label="Signature"
                  onClick={handleOpenSignatureDialog}
                  variant="outlined"
                  height="136px"
                  skin="light"
                >
                  <img
                    src={signatureDataURL}
                    alt="E-Signature"
                    style={{
                      maxHeight: '120px',
                      maxWidth: '400px',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                    }}
                    onLoad={() => {
                      setValue('signatureImage', signatureDataURL);
                      trigger('signatureImage');
                    }}
                  />
                </CustomIconButton>
              ) : (
                <Controller
                  name="signatureImage"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <CustomIconButton
                      aria-label="Signature"
                      onClick={handleOpenSignatureDialog}
                      size="130px"
                      skin="light"
                      color={errors.signatureImage && signType === 'eSignature' ? 'error' : 'primary'}
                    >
                      <Icon
                        width="120"
                        height="120"
                        icon="material-symbols-light:signature-outline-rounded"
                      />
                    </CustomIconButton>
                  )}
                />
              )}
            </Box>
          </Grid>

          <Grid
            container
            item
            xs={9}
            gap={2}
            sx={{ display: signType === 'manualSignature' ? 'flex' : 'none' }}
          >
            <Controller
              name="signatureId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.signatureId} variant="outlined">
                  <InputLabel size="medium">
                    Select Signature Name <span style={{ color: 'red' }}>*</span>
                  </InputLabel>
                  <Select
                    label="Select Signature Name"
                    value={field.value || ''}
                    onChange={(event) => {
                      const selected = signatures.find(sig => sig._id === event.target.value);
                      handleSignatureSelection(selected, field);
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
            <Box
              sx={{
                height: '136px',
                width: '136px',
                padding: '10px',
              }}
            >
              {selectedSignature ? (
                <img
                  src={selectedSignature}
                  alt="Signature"
                  style={{
                    maxHeight: '136px',
                    maxWidth: '340px',
                    objectFit: 'contain',
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
                  height="102px"
                  icon="mdi:signature-image"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
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

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      // Show loading notification
      let loadingKey = enqueueSnackbar('Adding bank details...', {
        variant: 'info',
        persist: true,
        preventDuplicate: false,
        SnackbarProps: {
          onExited: () => console.log('Loading snackbar closed'),
        }
      });

      const response = await addBank(newBank);

      // Close loading notification
      closeSnackbar(loadingKey);

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

        // Add success notification
        enqueueSnackbar('Bank details added successfully', {
          variant: 'success',
          autoHideDuration: 6000,
          preventDuplicate: false,
          SnackbarProps: {
            onExited: () => console.log('Success snackbar closed'),
            onClose: (event, reason) => {
              if (reason === 'clickaway') return;
              closeSnackbar();
            }
          }
        });
      }
    } catch (error) {
      // Close loading notification if it exists
      closeSnackbar();

      console.error('Failed to add bank:', error);
      // Add error notification
      enqueueSnackbar('Failed to add bank details: ' + error.message, {
        variant: 'error',
        autoHideDuration: 6000,
        preventDuplicate: false,
        SnackbarProps: {
          onExited: () => console.log('Error snackbar closed'),
          onClose: (event, reason) => {
            if (reason === 'clickaway') return;
            closeSnackbar();
          }
        }
      });
    }
  };



  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="flex flex-col gap-4 p-4">
        <Typography variant="h5" color="primary">
          Edit Purchase Return
        </Typography>

        <form onSubmit={handleSubmit(onSubmit, handleError)}>
          {/* Header Information Card */}
          <Card>
            <CardContent>
              <Grid container spacing={5}>


             <Grid item xs={12}>
                <Typography variant='h5'  gutterBottom>
                  Details
                </Typography>
              </Grid>


                {/* Purchase Order Number, Vendor, Dates */}
                <Grid item xs={12} md={4}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={40} />
                  ) : (
                    <TextField
                      label="Debit Note Id"
                      value={debitNoteData?.debit_note_id || ''}
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
                              <MenuItem size='medium'  key={vendor._id} value={vendor._id}>
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
                      name="purchaseReturnDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Purchase Return Date"
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              size: "medium",
                              fullWidth: true,
                              error: !!errors.purchaseReturnDate,
                              helperText: errors.purchaseReturnDate?.message,
                              sx: {
                                borderColor: errors.purchaseReturnDate ? 'red' : field.value ? 'green' : 'default',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: errors.purchaseReturnDate ? 'red' : field.value ? 'green' : 'default',
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
                 <Typography variant='h5'  gutterBottom>
                  Products
                </Typography>
              </Box>

              {/* Products selector and table */}

                  <Grid container spacing={3} className='items-center'>
              <Grid item xs={10} md={5} lg={4}>
                {isLoading ? (
                  <Skeleton variant="rectangular" height={200} />
                ) : (

                     <FormControl className="w-full" variant="outlined" >
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

                        <Link  href="/products/product-add" passHref>

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
                    // Add smooth scrolling
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
                        xs: 650, // Minimum width on extra-small screens
                        sm: 750, // Minimum width on small screens
                        md: '100%' // Full width on medium and up
                      },
                      '& .MuiTableCell-root': {
                        borderColor: theme => alpha(theme.palette.secondary.main, 0.15),
                        // Responsive padding
                        px: { xs: 1, sm: 2, md: 3 },
                        py: { xs: 1, sm: 1.5 },
                        // Responsive text size
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }
                    }}
                  >
                    <TableHead
                      sx={{
                        bgcolor: theme => alpha(theme.palette.secondary.main, 0.09),
                      }}
                    >
                      <TableRow >
                        <TableCell  sx={{ minWidth: { xs: 120, sm: 150 } }}>Product / Service</TableCell>
                        <TableCell  sx={{ minWidth: { xs: 60, sm: 80 } }}>Unit</TableCell>
                        <TableCell  sx={{ minWidth: { xs: 80, sm: 100 } }}>Quantity</TableCell>
                        <TableCell  sx={{ minWidth: { xs: 80, sm: 100 } }}>Rate</TableCell>
                        <TableCell  sx={{ minWidth: { xs: 100, sm: 120 } }}>Discount</TableCell>
                        <TableCell  sx={{ minWidth: { xs: 80, sm: 100 } }}>VAT</TableCell>
                        <TableCell  sx={{ minWidth: { xs: 80, sm: 100 } }}>Amount</TableCell>
                        <TableCell  sx={{ minWidth: { xs: 80, sm: 100 } }}>Actions</TableCell>
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
                                    // Use sx for conditional sizing instead
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

              {/* Add Totals Section here */}
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

          {/* Bottom Section with Bank, Terms, Totals, and Signature */}
          <Grid container spacing={4} sx={{ mt: 4 }} className='justify-between'>
            {/* Left Side - Bank and Terms */}
            <Grid item xs={12} md={6} lg={6}>
              <Card >
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

                          <Grid item xs={5} md={2} lg={1} >

                            <Button

                          variant="contained"
                          size='large'
                          onClick={() => setOpenBankModal(true)}
                          startIcon={<Icon  icon="mdi:bank-outline" width='25px' />}
                          sx={{  whiteSpace: 'nowrap' }}
                          // className='max-sm:is-full is-auto'
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

            {/* Right Side - Totals and Signature */}
            <Grid item xs={12} md={6} lg={6}>
              <Card>
                <CardContent>


                    {/* Signature Section */}

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
              onClick={() => router.push('/debitNotes/purchaseReturn-list')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              Update Purchase Return
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
                // className: 'signature-canvas',
                className:'border  rounded-md'

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
            {submissionResult?.success ? (
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
            <Typography>{submissionResult?.message}</Typography>
          </DialogContent>
          <DialogActions>
            {submissionResult?.success ? (
              <>
                <Button
                  onClick={() => router.push('/debitNotes/purchaseReturn-list')}
                  variant="contained"
                  color="primary"
                  startIcon={<Icon icon="mdi:format-list-bulleted" />}
                >
                  Go to Order List
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setShowResultDialog(false)}
                variant="contained"
                color="primary"
              >
                Try Again
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={openEditModal} onClose={handleCloseEditModal}
        maxWidth="sm"

        >



          <DialogContent>
            {editModalData && (
              <Grid container spacing={3}>

                <Grid item xs={12} >
                <Typography variant='h5' color='primary' className=''>Edit Item</Typography>

                </Grid>



                      {/* Rate */}
                      <Grid item xs={12} md={5} lg={5} >
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

                {/* Discount  */}
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
      </Box>
    </LocalizationProvider>
  );
};

export default EditPurchaseReturn
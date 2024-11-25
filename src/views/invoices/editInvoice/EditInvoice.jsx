// app/(dashboard)/invoices/[id]/EditInvoice.jsx

'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  addBank,
  updateInvoice,
} from '@/app/(dashboard)/invoices/actions';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Skeleton,
  Divider,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Modal,
  Box,
  Card,
  CardContent,
  Grid,
  Switch,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormHelperText,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import SignaturePad from 'react-signature-canvas';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import { DialogContentText } from '@mui/material';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';

// Helper functions
const calculateTotals = (items, shouldRoundOff, getValues) => {
  if (!items || !Array.isArray(items)) {
    return {
      taxableAmount: 0,
      totalDiscount: 0,
      vat: 0,
      TotalAmount: 0,
      roundOffValue: 0,
    };
  }

  // Calculate totals based on items
  let taxableAmount = 0;
  let totalDiscount = 0;
  let vat = 0;
  let TotalAmount = 0;
  let roundOffValue = 0;

  items.forEach((item, index) => {
    // Assuming item has properties: quantity, rate, discount, taxRate
    const itemTotal = Number(item.rate);
    const itemDiscount = item.discountType === 'INR' ? item.discount : (item.discount / 100) * itemTotal;
    const taxRate = getValues(`items.${index}.taxInfo.taxRate`) || 0;
    const itemTax = (Number(taxRate) / 100) * (itemTotal - itemDiscount);

    taxableAmount += itemTotal;
    totalDiscount += itemDiscount;
    vat += itemTax;
  });

  TotalAmount = taxableAmount - totalDiscount + vat;

  if (shouldRoundOff) {
    roundOffValue = Math.round(TotalAmount) - TotalAmount;
    TotalAmount = Math.round(TotalAmount);
  }

  return {
    taxableAmount,
    totalDiscount,
    vat,
    TotalAmount,
    roundOffValue,
  };
};

const formatDateForInput = (dateString) => {
  return dateString ? dayjs(dateString).format('YYYY-MM-DD') : '';
};

const parseDateForSubmission = (dateString) => {
  return dateString ? dayjs(dateString).toISOString() : null;
};

// Validation schema
const useValidationSchema = () => {
  return yup.object().shape({
    // Temporarily disable all validations
    signatureId: yup.mixed().when('sign_type', {
      is: 'manualSignature',
      then: yup.object().required('Please select a signature'),
    }),
  });
};

// Helper function to calculate item values
const calculateItemValues = (item) => {
  if (!item) return { rate: 0, discount: 0, tax: 0, amount: 0 };

  const rate = Number(item.rate) || 0;
  const discountType = item.discountType || 'PERCENTAGE';
  let discount = 0;

  if (discountType === 'PERCENTAGE') {
    discount = (item.discount / 100) * rate || 0;
  } else if (discountType === 'INR') {
    discount = item.discount || 0;
  }
  const taxRate = item.taxInfo ? Number(item.taxInfo.taxRate) : 0;
  const tax = (taxRate / 100) * (rate - discount) || 0;
  const amount = Number(rate) - Number(discount) + Number(tax);

  return { rate, discount, tax, amount };
};

const EditInvoice = ({ invoiceData, customersData, productData, taxRates, initialBanks, signatures }) => {
  const validationSchema = useValidationSchema();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      invoiceNumber: '',
      referenceNo: '',
      customerId: '',
      taxableAmount: 0,
      payment_method: '',
      invoiceDate: dayjs().format('YYYY-MM-DD'),
      dueDate: dayjs().format('YYYY-MM-DD'),
      TotalAmount: 0,
      notes: '',
      vat: 0,
      totalDiscount: 0,
      roundOff: false,
      roudOffValue: 0,
      termsAndCondition: '',
      bank: '',
      signatureName: '',
      signatureId: '',
      sign_type: '',
      signatureData: '',
      items: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });

  const [productsCloneData, setProductsCloneData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [signatureDataURL, setSignatureDataURL] = useState('');
   const [signatureURL, setSignatureURL] = useState('');
  const signaturePadRef = useRef(null);
  const [paymentMethods] = useState([
    { label: 'Cash', value: 'Cash' },
    { label: 'Bank', value: 'Bank' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'Online', value: 'Online' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [showHeader, setShowHeader] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [showProductsTable, setShowProductsTable] = useState(false);
  const [showTotals, setShowTotals] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  // const [taxableAmount, setTaxableAmount] = useState(0);
  // const [totalDiscount, setTotalDiscount] = useState(0);
  // const [vat, setVat] = useState(0);
  // const [TotalAmount, setTotalAmount] = useState(0);
  // const [roundOffValue, setRoundOffValue] = useState(0);

  const [openBankModal, setOpenBankModal] = useState(false);
  const [newBank, setNewBank] = useState({
    name: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    IFSCCode: '',
  });

  const [banks, setBanks] = useState(initialBanks || []);
  const [newBankId, setNewBankId] = useState(null);

  const [signType, setSignType] = useState('eSignature');
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [rowErr, setRowErr] = useState([]);

  const hasMounted = useRef(false);

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState({
    image: "/images/animated-icons/question.gif",
    message: 'Are you sure you want to update this invoice?',
  });
  const theme = useTheme();
  const [updatingMessage, setUpdatingMessage] = useState('Updating');
  const [dotCount, setDotCount] = useState(0);

  const [signOptions, setSignOptions] = useState(signatures || []);
  const [selectedSignature, setSelectedSignature] = useState(null);

  useEffect(() => {
    if (hasMounted.current && watchItems) {
      const { taxableAmount, totalDiscount, vat, TotalAmount, roundOffValue } = calculateTotals(
        watchItems,
        watchRoundOff,
        getValues
      );

      setValue('taxableAmount', taxableAmount);
      setValue('totalDiscount', totalDiscount);
      setValue('vat', vat);
      setValue('TotalAmount', TotalAmount);
      setValue('roundOffValue', roundOffValue);
    } else {
      hasMounted.current = true;
    }
  }, [watchItems, watchRoundOff]);

  // Initialize form values
  useEffect(() => {
    if (invoiceData && isLoading) { // Only run when isLoading is true
      const initialValues = {
        invoiceNumber: invoiceData.invoiceNumber || '',
        referenceNo: invoiceData.referenceNo || '',
        customerId: invoiceData.customerId?._id || '',
        payment_method: invoiceData.payment_method || '',
        invoiceDate: formatDateForInput(invoiceData.invoiceDate),
        dueDate: formatDateForInput(invoiceData.dueDate),
        taxableAmount: invoiceData.taxableAmount || '',
        TotalAmount: Number(invoiceData.TotalAmount) || 0,
        notes: invoiceData.notes || '',
        vat: invoiceData.vat || 0,
        totalDiscount: invoiceData.totalDiscount || 0,
        roundOff: invoiceData.roundOff || false,
        termsAndCondition: invoiceData.termsAndCondition || '',
        bank: invoiceData.bank?._id || '',
        roundOffValue: invoiceData.roundOffValue || 0,
        sign_type: invoiceData.sign_type,
        items: invoiceData.items.map((item) => ({
          ...item,
          taxInfo: item.taxInfo ? (() => {
            const parsedTaxInfo = JSON.parse(item.taxInfo);
            return {
              ...parsedTaxInfo,
              taxRate: Number(parsedTaxInfo.taxRate)
            };
          })() : null
        })) || []
      };

      // Handle signature data
      if (invoiceData.sign_type === "eSignature") {
        if (invoiceData.signatureImage) {
          setSignatureDataURL(invoiceData.signatureImage);
          initialValues.signatureImage = invoiceData.signatureImage;
          initialValues.signatureName = invoiceData.signatureName || '';
        }
      } else {
        initialValues.signatureId = invoiceData.signatureId?.value || '';
      }

      // Reset form with all values at once
      reset(initialValues);
      setIsLoading(false); // Now correctly setting isLoading to false
    }
  }, [invoiceData, isLoading]);

  // Set available products
  useEffect(() => {
    if (productData && invoiceData && !isLoading) {
      const selectedProductIds = invoiceData.items.map((item) => item.productId);
      const availableProducts = productData.filter((product) => !selectedProductIds.includes(product._id));
      setProductsCloneData(availableProducts);
    }
  }, [productData, invoiceData, isLoading]);

  // Timed display effects
  useEffect(() => {
    setShowHeader(true);
    setTimeout(() => setShowInvoiceDetails(true), 200);
    setTimeout(() => setShowProductsTable(true), 400);
    setTimeout(() => setShowTotals(true), 600);
    setTimeout(() => setShowSignature(true), 800);
  }, []);

  // Initialize row errors
  useEffect(() => {
    if (invoiceData?.items) {
      const tempArray = invoiceData.items.map((element, index) => ({
        field: `qtyInput${index}`,
        valid: true,
        key: index,
      }));
      setRowErr(tempArray);
    }
  }, [invoiceData]);

  const handleProductChange = (event) => {
    const selectedProductId = event.target.value;
    setSelectedProduct(selectedProductId);
    handleAddProduct(selectedProductId);
  };

  const handleAddProduct = (productId) => {
    if (!productId) {
      setSnackbar({
        open: true,
        message: 'Please select a product',
        severity: 'error',
      });
      return;
    }

    const product = productData.find((p) => p._id === productId);
    if (!product) {
      setSnackbar({
        open: true,
        message: 'Invalid product selected',
        severity: 'error',
      });
      return;
    }

    const newData = {
      productId: product._id,
      name: product.name,
      quantity: 1,
      rate: product.sellingPrice,
      units: product.units.name,
      unit: product.units._id,
      discountType: product.discountType,
      discount: product.discountValue != null ? Number(product.discountValue).toFixed(2) : '0.00',
      taxRate: product.tax?.taxRate || 0,
      taxInfo: product.tax,
      isRateFormUpadted: false,
      form_updated_discounttype: '',
      form_updated_discount: '',
      form_updated_rate: '',
      form_updated_tax: '',
    };


    append(newData);
    setSelectedProduct('');
    setProductsCloneData((prev) => prev.filter((p) => p._id !== product._id));
  };

  const handleEditItem = (index) => {
    const item = getValues(`items.${index}`);
    setEditingItemIndex(index);

    // Ensure taxInfo is parsed if it's a string
    let taxInfoData = item.taxInfo;
    if (typeof item.taxInfo === "string") {
      taxInfoData = JSON.parse(item.taxInfo);
    }

    // Set the form values for editing
    setValue(`items.${index}.taxInfo`, taxInfoData);
    setValue(`items.${index}.rate`, Number(item.rate).toFixed(2));
    setValue(`items.${index}.discount`, Number(item.discount).toFixed(2));
    setValue(`items.${index}.quantity`, item.quantity);
    setValue(`items.${index}.form_updated_tax`, taxInfoData.taxRate);
    setValue(`items.${index}.form_updated_discounttype`, item.discountType);
    setValue(`items.${index}.form_updated_discount`, item.discount);

    setOpenModal(true);
  };

  const handleDeleteItem = (index) => {
    const currentItems = getValues('items');
    const deletedItem = currentItems[index];
    remove(index);

    if (deletedItem && deletedItem.productId) {
      const product = productData.find((p) => p._id === deletedItem.productId);
      if (product) {
        setProductsCloneData((prev) => [...prev, product]);
      }
    }

    setValue(
      'items',
      currentItems.filter((_, i) => i !== index)
    );
  };

const handleSaveEditItem = async () => {
  try {
    // Get the updated item data
    const updatedItem = getValues(`items.${editingItemIndex}`);

    // Set isRateFormUpadted to true
    setValue(`items.${editingItemIndex}.isRateFormUpadted`, true);

    // Update form_updated_* fields with the new values
    setValue(`items.${editingItemIndex}.form_updated_rate`, Number(updatedItem.rate).toFixed(2));
    setValue(`items.${editingItemIndex}.form_updated_discount`, Number(updatedItem.discount).toFixed(2));
    setValue(`items.${editingItemIndex}.form_updated_tax`, Number(updatedItem.taxInfo.taxRate));
    setValue(`items.${editingItemIndex}.form_updated_discounttype`, updatedItem.discountType);

    // Update the item in the field array
    update(editingItemIndex, getValues(`items.${editingItemIndex}`));

    // Trigger recalculations by updating the items array
    const items = getValues('items');
    setValue('items', items);

    setOpenModal(false);
  } catch (error) {
    console.error('Error saving item:', error);
  }
};



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

  useEffect(() => {
    if (newBankId && banks.some((bank) => bank._id === newBankId)) {
      setValue('bank', newBankId);
      trigger('bank');
      setNewBankId(null);
    }
  }, [banks, newBankId]);

  const handleOpenSignatureDialog = () => {
    setShowSignatureDialog(true);
  };

  const handleCloseSignatureDialog = () => {
    setShowSignatureDialog(false);
  };

  const handleSaveSignature = () => {
 if (signaturePadRef.current) {
        const signatureDataURL = signaturePadRef.current.toDataURL();


        setValue('signatureData', signatureDataURL);
        setSignatureDataURL(signatureDataURL);

        setSignatureURL(signatureDataURL);

    }
    handleCloseSignatureDialog();
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setSignatureDataURL(null);
    setValue('signatureData', null);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  useEffect(() => {
    let interval;
    if (isUpdating) {
      interval = setInterval(() => {
        setDotCount((prevCount) => (prevCount + 1) % 6);
      }, 200);
    } else {
      setDotCount(0);
    }

    return () => clearInterval(interval);
  }, [isUpdating]);

  useEffect(() => {
    const messages = ["   ",".  ", ".. ", "...",".. ",".  "];
    const messageIndex = (dotCount % messages.length);
    setUpdatingMessage(`Updating${messages[messageIndex]}`);
  }, [dotCount]);

  const handleConfirmUpdate = async () => {
    setIsUpdating(true);
    setConfirmationStatus({
      image: "/images/animated-icons/update.gif",
      message: updatingMessage,
    });

    const currentFormData = getValues();
    if (currentFormData) {
      const updatedFormData = {
        customerId: currentFormData.customerId,
        payment_method: currentFormData.payment_method,
        taxableAmount: currentFormData.taxableAmount,
        vat: currentFormData.vat,
        roundOff: currentFormData.roundOff,
        totalDiscount: currentFormData.totalDiscount,
        TotalAmount: currentFormData.TotalAmount,
        invoiceNumber: currentFormData.invoiceNumber,
        referenceNo: currentFormData.referenceNo,
        dueDate: parseDateForSubmission(currentFormData.dueDate),
        invoiceDate: parseDateForSubmission(currentFormData.invoiceDate),
        notes: currentFormData.notes,
        bank: currentFormData.bank,
        termsAndCondition: currentFormData.termsAndCondition,
        sign_type: currentFormData.sign_type,
        signatureId: currentFormData.sign_type === 'manualSignature' ?
          currentFormData.signatureId?._id : // Get the _id from the selected signature object
          null,
        signatureName: currentFormData.signatureName || '',
        items: currentFormData.items.map((item) => ({
          ...item,
          tax: item.tax,
          taxInfo: JSON.stringify(item.taxInfo),
        })),
      };

      try {
        const updateResult = await updateInvoice(invoiceData._id, updatedFormData, signatureURL);

        setIsUpdating(false);

        if (updateResult.success) {
          setConfirmationStatus({
            image: "/images/animated-icons/success.gif",
            message: 'Invoice updated successfully!',
          });
          setShowSuccessOptions(true);
        } else {
          setConfirmationStatus({
            image: "/images/animated-icons/fail.gif",
            message: updateResult.message || 'Failed to update invoice',
          });
        }
      } catch (error) {
        console.error('Error updating invoice:', error);
        setIsUpdating(false);
        setConfirmationStatus({
          image: "/images/animated-icons/fail.gif",
          message: 'An error occurred while updating the invoice.',
        });
      }
    }
  };

  const handleContinueEditing = () => {
    setOpenConfirmDialog(false);
    setShowSuccessOptions(false);
  };

  const onSubmit = async (data) => {
    setOpenConfirmDialog(true);
    setConfirmationStatus({
      image: "/images/animated-icons/question.gif",
      message: 'Are you sure you want to update this invoice?',
    });
  };

  const handleQuantityChange = (event, index, item) => {
    const { value } = event.target;
    const quantity = Number(value) || 0;

    // Get the current item data
    const currentItem = getValues(`items.${index}`);

    // Calculate base rate (single unit)
    const baseUnitRate = currentItem.isRateFormUpadted
      ? Number(currentItem.form_updated_rate)
      : Number(currentItem.rate);

    // Calculate total rate based on quantity
    const totalRate = baseUnitRate * quantity;

    // Calculate discount
    let discount = 0;
    const discountType = currentItem.isRateFormUpadted
      ? currentItem.form_updated_discounttype
      : currentItem.discountType;
    const discountValue = currentItem.isRateFormUpadted
      ? Number(currentItem.form_updated_discount)
      : Number(currentItem.discount);

    if (discountType === 'PERCENTAGE') {
      // For percentage, apply to the total rate
      discount = (discountValue / 100) * totalRate;
    } else {
      // For fixed amount (INR/SAR), keep the original discount
      discount = discountValue;
    }

    // Calculate VAT
    const taxRate = currentItem.isRateFormUpadted
      ? Number(currentItem.form_updated_tax)
      : Number(currentItem.taxInfo?.taxRate || 0);
    const vat = ((taxRate / 100) * (totalRate - discount));

    // Calculate final amount
    const amount = totalRate - discount + vat;

    // Update the item in the form
    const updatedItem = {
      ...currentItem,
      quantity: quantity,
      rate: totalRate.toFixed(2),
      discount: discount.toFixed(2),
      tax: vat.toFixed(2),
      amount: amount.toFixed(2)
    };

    // Update validation state if needed
    const setValidRow = rowErr.find((row) => Number(row?.key) === index);
    if (setValidRow) {
      setValidRow.valid = quantity > 0;
      setRowErr((prev) => {
        const newRowErr = [...prev];
        const rowIndex = newRowErr.findIndex((item) => item?.key === index);
        newRowErr[rowIndex] = { ...newRowErr[rowIndex], ...setValidRow };
        return newRowErr;
      });
    }

    // Update the form
    setValue(`items.${index}`, updatedItem);

    // Update items array to trigger recalculation
    const items = getValues('items');
    items[index] = updatedItem;
    setValue('items', items);
  };

  useEffect(() => {
    if (invoiceData) {
      // Handle signature data
      const signType = invoiceData.sign_type || 'eSignature';
      setValue('sign_type', signType);
      setSignType(signType);

      if (signType === 'manualSignature' && invoiceData.signatureId) {
        // Format the signature data for the select input
        const signatureData = {
          _id: invoiceData.signatureId._id,
          signatureName: invoiceData.signatureId.signatureName,
          signatureImage: invoiceData.signatureId.signatureImage,
        };

        setValue('signatureId', signatureData);
        setSelectedSignature(signatureData.signatureImage);
      } else if (signType === 'eSignature') {
        setValue('signatureName', invoiceData.signatureName || '');
        setSignatureDataURL(invoiceData.signatureImage || '');
      }
    }
  }, [invoiceData]);




  const handleSignatureSelection = (selectedOption, field) => {
    field.onChange(selectedOption); // This will store the full signature object
    setSelectedSignature(selectedOption?.signatureImage);
    trigger('signatureId');
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className={`transition-opacity duration-500 ${showHeader ? 'opacity-100' : 'opacity-0'}`}>
          <Typography variant="h5" gutterBottom>
            Edit Invoice
          </Typography>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={`transition-opacity duration-500 ${showInvoiceDetails ? 'opacity-100' : 'opacity-0'}`}>
            <Card>
              <CardContent>
                <Grid container spacing={6}>
                  {/* Invoice Number */}
                  <Grid item xs={12} md={4}>
                    {isLoading ? (
                      <Skeleton variant="rectangular" height={40} />
                    ) : (
                      <Controller
                        name="invoiceNumber"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Invoice Number"
                            variant="outlined"
                            disabled
                            fullWidth
                            size="small"
                            error={!!errors.invoiceNumber}
                            helperText={errors.invoiceNumber?.message}
                          />
                        )}
                      />
                    )}
                  </Grid>

                  {/* Customer */}
                  <Grid item xs={12} md={4}>
                    {isLoading ? (
                      <Skeleton variant="rectangular" height={40} />
                    ) : (
                      <Controller
                        name="customerId"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth variant="outlined" error={!!errors.customerId}>
                            <InputLabel>Customer</InputLabel>
                            <Select {...field} label="Customer" size="small">
                              {customersData.map((customer) => (
                                <MenuItem key={customer._id} value={customer._id}>
                                  {customer.name}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.customerId && (
                              <FormHelperText error>{errors.customerId.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    )}
                  </Grid>

                  {/* Invoice Date */}
                  <Grid item xs={12} md={4}>
                    {isLoading ? (
                      <Skeleton variant="rectangular" height={40} />
                    ) : (
                      <Controller
                        name="invoiceDate"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Invoice Date"
                            type="date"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            size="small"
                            error={!!errors.invoiceDate}
                            helperText={errors.invoiceDate?.message}
                            inputProps={{
                              max: formatDateForInput(new Date()),
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
                          <TextField
                            {...field}
                            label="Due Date"
                            type="date"
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            size="small"
                            error={!!errors.dueDate}
                            helperText={errors.dueDate?.message}
                            inputProps={{
                              min: formatDateForInput(getValues('invoiceDate')),
                            }}
                          />
                        )}
                      />
                    )}
                  </Grid>

                  {/* Payment Method */}
                  <Grid item xs={12} md={4}>
                    {isLoading ? (
                      <Skeleton variant="rectangular" height={40} />
                    ) : (
                      <Controller
                        name="payment_method"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth variant="outlined" error={!!errors.payment_method}>
                            <InputLabel>Payment Method</InputLabel>
                            <Select {...field} label="Payment Method" size="small">
                              {paymentMethods.map((method) => (
                                <MenuItem key={method.value} value={method.value}>
                                  {method.label}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.payment_method && (
                              <FormHelperText error>{errors.payment_method.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    )}
                  </Grid>

                  {/* Reference No */}
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
                          <Add />
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

                {/* Products Table */}
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
                      {fields.length > 0 ? (
                        fields.map((item, index) => {
                          const { rate, discount, tax, amount } = calculateItemValues(item);
                          return (
                            <TableRow key={item.id || index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.units}</TableCell>
                              <TableCell>
                                <Controller
                                  name={`items.${index}.quantity`}
                                  control={control}
                                  render={({ field }) => (
                                    <FormControl error={!!errors.items?.[index]?.quantity} fullWidth size="small">
                                      <TextField
                                        {...field}
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        inputProps={{
                                          style: { padding: '8px', fontSize: '0.875rem' },
                                          min: 1,
                                        }}
                                        onChange={(e) => {
                                          handleQuantityChange(e, index, item);
                                        }}
                                        error={!!errors.items?.[index]?.quantity}
                                        helperText={errors.items?.[index]?.quantity?.message}
                                      />
                                    </FormControl>
                                  )}
                                />
                              </TableCell>
                              <TableCell>{Number(rate).toFixed(2)}</TableCell>
                              <TableCell>{Number(discount).toFixed(2)}</TableCell>
                              <TableCell>{Number(tax).toFixed(2)}</TableCell>
                              <TableCell>{Number(amount).toFixed(2)}</TableCell>
                              <TableCell>
                                <IconButton
                                  className="transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
                                  sx={{
                                    color: 'secondary',
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      color: 'primary.main',
                                    },
                                  }}
                                  onClick={() => handleEditItem(index)}
                                >
                                  <i className="icon-[mdi--edit] color-primary" color="primary.main" />
                                </IconButton>

                                <IconButton
                                  className="transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
                                  sx={{
                                    color: 'text.info',
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      color: 'primary.main',
                                    },
                                  }}
                                  onClick={() => handleDeleteItem(index)}
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })
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
              </CardContent>
            </Card>
          </div>

          <Grid container spacing={2} sx={{ mt: 2, mb: 14 }}>
            <Grid item xs={6}>
              <div className={`transition-opacity duration-500 ${showTotals ? 'opacity-100' : 'opacity-0'}`}>
                <Card>
                  <CardContent>
                    <Box className="flex flex-row gap-4 justify-evenly">
                      <Controller
                        name="bank"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth variant="outlined" error={!!errors.bank}>
                            <InputLabel>Select Bank</InputLabel>
                            <Select
                              {...field}
                              label="Select Bank"
                              size="small"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            >
                              {banks.map((bank) => (
                                <MenuItem key={bank._id} value={bank._id}>
                                  {bank.bankName}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.bank && (
                              <FormHelperText error>{errors.bank.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                      <Button
                        className="min-w-[140px] flex flex-row justify-between items-center"
                        variant="outlined"
                        color="primary"
                        onClick={() => setOpenBankModal(true)}
                        startIcon={<i className="icon-[mdi--bank-plus] size-6" />}
                      >
                        Add Bank
                      </Button>
                    </Box>

                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Notes"
                          multiline
                          rows={4}
                          variant="outlined"
                          className="mt-4"
                          fullWidth
                        />
                      )}
                    />
                    <Controller
                      name="termsAndCondition"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Terms and Conditions"
                          multiline
                          rows={4}
                          variant="outlined"
                          className="mt-4"
                          fullWidth
                        />
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </Grid>

            <Grid item xs={6}>
              <div className={`transition-opacity duration-500 ${showTotals ? 'opacity-100' : 'opacity-0'}`}>
                <Card>
                  <CardContent>
                    <Grid container spacing={0} sx={{ mt: 2 }}>
                      <Grid item xs={6} gap={2} className="flex flex-col items-start">
                        <Typography variant="subtitle1" sx={{ textAlign: 'left' }}>
                          Amount:
                        </Typography>
                        <Typography variant="subtitle1" sx={{ textAlign: 'left' }}>
                          Discount:
                        </Typography>
                        <Typography variant="subtitle1" sx={{ textAlign: 'left' }}>
                          VAT:
                        </Typography>

                        <Controller
                          name="roundOff"
                          control={control}
                          render={({ field }) => (
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: '100%',
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  textAlign: 'center',
                                }}
                              >
                                Round Off
                              </Typography>
                              <Switch
                                {...field}
                                checked={field.value}
                                color="primary"
                                size="small"
                                sx={{
                                  padding: 0,
                                  height: '16px',
                                  width: '26px',
                                  '& .MuiSwitch-switchBase': {
                                    padding: 0,
                                  },
                                }}
                              />
                            </Box>
                          )}
                        />
                        <Divider sx={{ width: '100%', my: 1 }} />

                        <Typography variant="h6" sx={{ textAlign: 'left' }}>
                          Total Amount:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} gap={2} className="flex flex-col items-end">
                        <Controller
                          name="taxableAmount"
                          control={control}
                          render={({ field }) => (
                            <Typography variant="h6" sx={{ textAlign: 'right' }}>
                              {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                            </Typography>
                          )}
                        />
                        <Controller
                          name="totalDiscount"
                          control={control}
                          render={({ field }) => (
                            <Typography variant="h6" sx={{ textAlign: 'right' }}>
                              {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                            </Typography>
                          )}
                        />
                        <Controller
                          name="vat"
                          control={control}
                          render={({ field }) => (
                            <Typography variant="h6" sx={{ textAlign: 'right' }}>
                              {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                            </Typography>
                          )}
                        />
                        <Controller
                          name="roundOffValue"
                          control={control}
                          render={({ field }) => (
                            <Typography variant="h6" sx={{ textAlign: 'right' }}>
                              ({isNaN(Number(field.value)) ? '0.00' : field.value})
                            </Typography>
                          )}
                        />
                        <Divider sx={{ width: '100%', my: 1 }} />
                        <Controller
                          name="TotalAmount"
                          control={control}
                          render={({ field }) => (
                            <Typography variant="h6" sx={{ textAlign: 'right' }}>
                              {field.value ? Number(field.value).toFixed(2) : '0.00'}
                            </Typography>
                          )}
                        />
                      </Grid>
                    </Grid>
                    <Box className="flex flex-col mt-12" gap={1}>
                      <Controller
                        name="sign_type"
                        control={control}
                        defaultValue="eSignature"
                        render={({ field: { onChange, value } }) => (
                          <RadioGroup
                            row
                            value={value || 'eSignature'}
                            onChange={(e) => {
                              onChange(e.target.value);
                              setSignType(e.target.value);
                              if (e.target.value === 'eSignature') {
                                setValue('signatureId', '');
                                setValue('signatureName', '');
                              } else {
                                setValue('signatureData', '');
                                setValue('signatureName', '');
                                setSignatureDataURL('');
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
                      {signType === 'eSignature' ? (
                        <>
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
                          <Controller
                            name="signatureData"
                            control={control}
                            render={({ field }) => (
                              <Box>
                                {errors.signatureData && (
                                  <Typography color="error" variant="caption">
                                    {errors.signatureData.message}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          />
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
                                '& .MuiTouchRipple-root': {
                                  borderRadius: '10px',
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
                        </>
                      ) : (
                        <div className="tab-content">
                          <div className="tab-pane fade show active">
                            <div className="input-block mb-3">
                              <div className="form-group mb-0">
                                <Typography variant="subtitle1" gutterBottom>
                                  Select Signature Name <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <Controller
                                  name="signatureId"
                                  control={control}
                                  render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.signatureId}>
                                      <Select
                                        value={field.value || ''}
                                        onChange={(event) => {
                                          handleSignatureSelection(event.target.value, field);
                                        }}
                                        size="small"
                                      >
                                        {signOptions.map((option) => (
                                          <MenuItem key={option._id} value={option}>
                                            {option.signatureName}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                      {errors.signatureId && (
                                        <FormHelperText>{errors.signatureId.message}</FormHelperText>
                                      )}
                                    </FormControl>
                                  )}
                                />
                              </div>
                            </div>

                            {/* Signature Image Display */}
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
                          </div>
                        </div>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </div>
            </Grid>
          </Grid>

          <Box
            className="flex flex-row justify-center gap-8 p-3 shadow-md border-round"
            sx={{
              position: 'fixed',
              bottom: 50,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              backgroundColor: (theme) => theme.palette.background.paper,
              borderRadius: '8px',
            }}
          >
            <Button className="pr-12 pl-12 " variant="contained" type="submit" color="primary">
              Savee
            </Button>

            <Link href="/invoices/invoice-list" passHref>
              <Button className="pr-10 pl-10 bg-light" variant="outlined" color="secondary">
                Cancel
              </Button>
            </Link>
          </Box>
        </form>
      </Grid>

      {/* Edit Item Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box className="bg-white p-6 mx-auto mt-20 max-w-md rounded shadow">
          {editingItemIndex !== null && (
            <form onSubmit={handleSubmit(handleSaveEditItem)} className="space-y-4">
              <Typography variant="h6">Edit Item</Typography>

              {/* Rate Field */}
              <Controller
                name={`items.${editingItemIndex}.rate`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Rate"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.items?.[editingItemIndex]?.rate}
                    helperText={errors.items?.[editingItemIndex]?.rate?.message}
                  />
                )}
              />

              {/* Discount Type Selection */}
              <Controller
                name={`items.${editingItemIndex}.discountType`}
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Discount Type</InputLabel>
                    <Select {...field} label="Discount Type">
                      <MenuItem value="INR">Amount (SAR)</MenuItem>
                      <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              {/* Discount Field */}
              <Controller
                name={`items.${editingItemIndex}.discount`}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={`Discount ${watch(`items.${editingItemIndex}.discountType`) === 'PERCENTAGE' ? '(%)' : '(SAR)'}`}
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.items?.[editingItemIndex]?.discount}
                    helperText={errors.items?.[editingItemIndex]?.discount?.message}
                  />
                )}
              />

              {/* Tax Selection */}
              <Controller
                name={`items.${editingItemIndex}.taxInfo.taxRate`}
                control={control}
                render={({ field }) => (
                  <FormControl
                    variant="outlined"
                    fullWidth
                    error={!!errors.items?.[editingItemIndex]?.taxInfo}
                  >
                    <InputLabel>Select VAT</InputLabel>
                    <Select
                      {...field}
                      label="Select VAT"
                      value={field.value || ''}  // Ensure there's always a value
                      onChange={(e) => {
                        const selectedTaxRate = Number(e.target.value);
                        setValue(`items.${editingItemIndex}.taxInfo.taxRate`, selectedTaxRate);
                        field.onChange(selectedTaxRate);
                      }}
                    >
                      {taxRates.map((tax) => (
                        <MenuItem key={tax._id} value={tax.taxRate}>
                          {`${tax.name} (${tax.taxRate}%)`}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.items?.[editingItemIndex]?.taxInfo && (
                      <FormHelperText error>
                        {errors.items[editingItemIndex].taxInfo.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <Button variant="outlined" onClick={() => setOpenModal(false)} color="secondary">
                  Cancel
                </Button>
                <Button variant="contained" type="submit" color="primary">
                  Save
                </Button>
              </div>
            </form>
          )}
        </Box>
      </Modal>

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
          }}
        >
          <Typography variant="h6" component="h2">
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
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpenBankModal(false)} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          variant="filled"
          size="small"
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          className="is-full shadow-xs p-2 text-md"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={showSignatureDialog} onClose={handleCloseSignatureDialog}>
        <DialogTitle>Draw Your Signature</DialogTitle>
        <DialogContent>
          <SignaturePad
            ref={signaturePadRef}
            canvasProps={{
              width: 500,
              height: 200,
              className: 'signature-canvas',
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSignatureDialog}>Cancel</Button>
          <Button onClick={handleSaveSignature} color="primary">
            Save Signature
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => !isUpdating && setOpenConfirmDialog(false)}
        PaperProps={{
          style: {
            minHeight: '300px',
            minWidth: '400px',
          },
        }}
      >
        <DialogContent className="flex flex-col items-center justify-between">
          <Image
            src={confirmationStatus.image}
            alt="Confirmation GIF"
            width={150}
            height={150}
            unoptimized={true}
          />
          <DialogContentText>
            <Typography
              variant="h5"
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {isUpdating ? updatingMessage : confirmationStatus.message}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions className='flex flex-row justify-center gap-4'>
          {!isUpdating && (
            showSuccessOptions ? (
              <>
                <Button onClick={handleContinueEditing}>
                  Continue Editing
                </Button>
                <Link href="/invoices/invoice-list" passHref>
                  <Button component="a">Return to Invoice List</Button>
                </Link>
              </>
            ) : (
              <>
                <Button size='medium' className='pr-8 pl-8' variant="contained" onClick={handleConfirmUpdate} autoFocus>
                  Yes
                </Button>
                <Button size='medium' className='pr-8 pl-8' variant="outlined" color='secondary' onClick={() => setOpenConfirmDialog(false)}>
                  No
                </Button>
              </>
            )
          )}
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={updateSuccess}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Invoice Updated'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            The invoice has been successfully updated.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Link href="/invoices/invoice-list" passHref>
            <Button color="primary" autoFocus>
              Go to Invoice List
            </Button>
          </Link>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default EditInvoice;


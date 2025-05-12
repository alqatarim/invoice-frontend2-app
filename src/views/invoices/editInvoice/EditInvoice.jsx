// app/(dashboard)/invoices/[id]/EditInvoice.jsx

'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  addBank
} from '@/app/(dashboard)/invoices/actions';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Divider,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
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
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  FormHelperText,
  InputAdornment,
  ButtonGroup,
  Menu,
  Collapse,
  Autocomplete,
  Paper,
  Fade,
  Grow,
} from '@mui/material';
import CustomOriginalIconButton from '@core/components/mui/CustomOriginalIconButton';
import { Add, Delete, Clear, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';;
import { sellCalculations, formatDateForInput, parseDateForSubmission } from '../../../utils/helpers';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomIconButtonTwo from '@core/components/mui/CustomIconButtonTwo';
import { useRouter } from 'next/navigation';
import { EditInvoiceSchema } from '@/views/invoices/editInvoice/EditInvoiceSchema';
import CustomerAutocomplete from './CustomerAutocomplete';
import Avatar from '@/@core/components/mui/Avatar';




// Helper to update all calculated fields for an item row
const updateCalculatedFields = (index, values, setValue) => {
  const computed = sellCalculations.calculateItemValues(values);
  setValue(`items.${index}.rate`, computed.rate);
  setValue(`items.${index}.discount`, computed.discount);
  setValue(`items.${index}.tax`, computed.tax);
  setValue(`items.${index}.amount`, computed.amount);
  setValue(`items.${index}.taxableAmount`, computed.taxableAmount);
};



const EditInvoice = ({
  invoiceData,
  customersData,
  productData,
  taxRates,
  initialBanks,
  signatures,
  onSave,
  enqueueSnackbar,
  closeSnackbar
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(EditInvoiceSchema),
    defaultValues: {
      invoiceNumber: invoiceData?.invoiceNumber || '',
      referenceNo: invoiceData?.referenceNo || '',
      customerId: invoiceData?.customerId?._id || '',
      payment_method: invoiceData?.payment_method || '',
      invoiceDate: formatDateForInput(invoiceData?.invoiceDate),
      dueDate: formatDateForInput(invoiceData?.dueDate),
      taxableAmount: invoiceData?.taxableAmount || 0,
      TotalAmount: Number(invoiceData?.TotalAmount) || 0,
      notes: invoiceData?.notes || '',
      vat: invoiceData?.vat || 0,
      totalDiscount: invoiceData?.totalDiscount || 0,
      roundOff: invoiceData?.roundOff || false,
      termsAndCondition: invoiceData?.termsAndCondition || '',
      bank: invoiceData?.bank?._id || '',
      roundOffValue: invoiceData?.roundOffValue || 0,
      sign_type: 'manualSignature',
      signatureName: invoiceData?.signatureName || '',
      signatureId: invoiceData?.signatureId?._id || '',
      items: invoiceData?.items.map((item) => ({
        ...item,
        taxInfo: item.taxInfo ? (() => {
          const parsedTaxInfo = JSON.parse(item.taxInfo);
          return {
            ...parsedTaxInfo,
            taxRate: Number(parsedTaxInfo.taxRate)
          };
        })() : null
      })) || []
    },
  });

const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });

  const [productsCloneData, setProductsCloneData] = useState(() => {
    // Initialize with filtered products on component mount
    if (productData && invoiceData) {
      const selectedProductIds = invoiceData.items.map((item) => item.productId);
      return productData.filter((product) => !selectedProductIds.includes(product._id));
    }
    return productData || [];
  });
  const [selectedProduct, setSelectedProduct] = useState('');

  const [paymentMethods] = useState([
    { label: 'Cash', value: 'Cash' },
    { label: 'Bank', value: 'Bank' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'Online', value: 'Online' },
  ]);
  // const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [openBankModal, setOpenBankModal] = useState(false);
  const [newBank, setNewBank] = useState({
    name: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    IFSCCode: '',
  });

  const [banks, setBanks] = useState(initialBanks || []);

  const theme = useTheme();

  const [signOptions, setSignOptions] = useState(signatures || []);

  // Initialize selectedSignature directly
  const [selectedSignature, setSelectedSignature] = useState(
    invoiceData?.sign_type === 'manualSignature' && invoiceData?.signatureId?.signatureImage ?
    invoiceData.signatureId.signatureImage : null
  );

  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [taxMenu, setTaxMenu] = useState({ anchorEl: null, rowIndex: null });

  // Add temporary state for notes and terms
  const [tempNotes, setTempNotes] = useState('');
  const [tempTerms, setTempTerms] = useState('');

  const headerHeight = 70; // Default estimate for header height



  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTaxClick = (event, index) => {
    setTaxMenu({ anchorEl: event.currentTarget, rowIndex: index });
  };

  const handleTaxClose = () => {
    setTaxMenu({ anchorEl: null, rowIndex: null });
  };

  const handleMenuItemClick = (index, newValue) => {
    if (newValue !== null) {
      setValue(`items.${index}.discountType`, newValue);
      setValue(`items.${index}.form_updated_discounttype`, newValue);
      setValue(`items.${index}.isRateFormUpadted`, true);
      const item = getValues(`items.${index}`);
      updateCalculatedFields(index, item, setValue);
    }
    handleClose();
  };

  const handleTaxMenuItemClick = (index, tax) => {
    // Set values with proper typing
    setValue(`items.${index}.taxInfo`, tax);
    setValue(`items.${index}.tax`, Number(tax.taxRate || 0));
    setValue(`items.${index}.form_updated_tax`, Number(tax.taxRate || 0));

    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item, setValue);

    handleTaxClose();
  };

  useEffect(() => {
    if (watchItems) {
      const { taxableAmount, totalDiscount, vat, TotalAmount, roundOffValue } = sellCalculations.calculateInvoiceTotals(
        watchItems,
        watchRoundOff,
        getValues
      );

      setValue('taxableAmount', taxableAmount);
      setValue('totalDiscount', totalDiscount);
      setValue('vat', vat);
      setValue('TotalAmount', TotalAmount);
      setValue('roundOffValue', roundOffValue);
    }
  }, [watchItems, watchRoundOff]);



  // New function to handle updating a product at a specific index
  const handleUpdateItemProduct = (index, productId, previousProductId) => {
    if (!productId) {
      closeSnackbar();
      enqueueSnackbar('Please select a product', { variant: 'error' });
      return;
    }

    const product = productData.find((p) => p._id === productId);
    if (!product) {
      closeSnackbar();
      enqueueSnackbar('Invalid product selected', { variant: 'error' });
      return;
    }

    // Format the product data using the same method as handleAddProduct
    const newData = sellCalculations.formatInvoiceItem(product);
    if (!newData) {
      closeSnackbar();
      enqueueSnackbar('Error formatting product data', { variant: 'error' });
      return;
    }

    // Update the form fields at the specified index
    Object.keys(newData).forEach(key => {
      setValue(`items.${index}.${key}`, newData[key]);
    });

    // Update the available products
    setProductsCloneData(prev => {
      let updatedProducts = [...prev];

      // Add back the previously selected product if it exists
      if (previousProductId) {
        const previousProduct = productData.find(p => p._id === previousProductId);
        if (previousProduct) {
          updatedProducts.push(previousProduct);
        }
      }

      // Remove the newly selected product
      return updatedProducts.filter(p => p._id !== productId);
    });
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
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    try {
      closeSnackbar(); // Close any existing snackbars
      const loadingKey = enqueueSnackbar('Adding bank details...', {
        variant: 'info',
        persist: true
      });

      const response = await addBank(newBank);
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

        enqueueSnackbar('Bank details added successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Failed to add bank:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'Failed to add bank details', { variant: 'error' });
    }
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

  const handleFormSubmit = async (data) => {
    try {
      closeSnackbar(); // Close any existing snackbars

      const isValid = await trigger();
      if (!isValid) {
        handleError(errors);
        return;
      }

      const currentFormData = data;
      if (currentFormData) {
        // Format the data for submission as before
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
          items: currentFormData.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            units: item.units,
            unit: item.unit,
            quantity: item.quantity,
            rate: item.rate,
            discount: item.discount,
            discountType: item.discountType,
            amount: item.amount,
            key: item.key,
            isRateFormUpadted: item.isRateFormUpadted,
            form_updated_rate: item.form_updated_rate,
            form_updated_discount: item.form_updated_discount,
            form_updated_discounttype: item.form_updated_discounttype,
            form_updated_tax: item.form_updated_tax,
            tax: item.tax,
            taxInfo: JSON.stringify(item.taxInfo),
          })),
          sign_type: 'manualSignature',
          signatureId: currentFormData.signatureId
        };

        const loadingKey = enqueueSnackbar('Updating invoice...', {
          variant: 'info',
          persist: true,
          preventDuplicate: true
        });

        // Use the onSave prop to handle update and get result
        const result = await onSave(updatedFormData);

        // Close the loading snackbar
        closeSnackbar(loadingKey);

        if (!result.success) {
          const errorMessage = result.error?.message || result.message || 'Failed to update invoice';
          enqueueSnackbar(errorMessage, {
            variant: 'error',
            autoHideDuration: 5000,
            preventDuplicate: true,
          });
          return { success: false, message: errorMessage };
        }

        return { success: true };
      }
    } catch (error) {
      console.error('Error in form submission:', error);

      // Close any existing snackbars first
     closeSnackbar(loadingKey);

      enqueueSnackbar(error.message || 'An error occurred during submission', {
        variant: 'error',
        autoHideDuration: 5000
      });

      return { success: false, message: error.message || 'An error occurred during submission' };
    }
  };

  const onSubmit = async (data) => {
    handleFormSubmit(data);
  };



  // Add a function to handle form submission errors
  const handleError = (errors) => {
    // First close any existing snackbars
    closeSnackbar();

    // Add a small delay before showing new snackbars
    setTimeout(() => {
      const errorCount = Object.keys(errors).length;
      if (errorCount === 0) return;

      // Get current form values to access product names
      const formValues = getValues();

      // Process all errors
      Object.entries(errors).forEach(([key, error]) => {
        // Handle nested errors in items array
        if (key === 'items') {
          // Handle array-level errors (e.g., min length)
          if (error.message) {
            enqueueSnackbar(error.message, {
              variant: 'error',
              preventDuplicate: true,
              key: `error-items-${Date.now()}`,
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
              }
            });
          }

          // Handle individual item errors
          if (Array.isArray(error)) {
            error.forEach((itemError, index) => {
              if (itemError) {
                // Get the product name from the form values
                const productName = formValues.items?.[index]?.name || `Item ${index + 1}`;

                Object.entries(itemError).forEach(([fieldKey, fieldError]) => {
                  if (fieldError && fieldError.message) {
                    enqueueSnackbar(`${productName}: ${fieldError.message}`, {
                      variant: 'error',
                      preventDuplicate: true,
                      key: `error-item-${index}-${fieldKey}-${Date.now()}`,
                      anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right'
                      }
                    });
                  }
                });
              }
            });
          }
        }
        // Handle regular field errors (like dueDate, invoiceDate, etc.)
        else if (error && error.message) {
          enqueueSnackbar(error.message, {
            variant: 'error',
            preventDuplicate: true,
            key: `error-${key}-${Date.now()}`,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right'
            }
          });
        }
      });
    }, 200);
  };

  const handleOpenTermsDialog = () => {
    setTempTerms(getValues('termsAndCondition') || '');
    setTermsDialogOpen(true);
  };

  const handleCloseTermsDialog = () => {
    setTermsDialogOpen(false);
  };

  const handleSaveTerms = () => {
    setValue('termsAndCondition', tempTerms);
    setTermsDialogOpen(false);
  };

  const handleToggleNotes = () => {
    setNotesExpanded(!notesExpanded);
  };

  const handleAddEmptyRow = () => {
    append({
      productId: '',
      name: '',
      units: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 2,
      tax: 0,
      taxInfo: {
        _id: '',
        name: '',
        taxRate: 0
      },
      amount: 0,
      taxableAmount: 0,
      key: Date.now(),
      isRateFormUpadted: false,
      form_updated_rate: '',
      form_updated_discount: '',
      form_updated_discounttype: '',
      form_updated_tax: ''
    });

  };

  // 1. Add new state for discount menu anchor and row index
  const [discountMenu, setDiscountMenu] = useState({ anchorEl: null, rowIndex: null });

  return (
   <Grid container rowSpacing={4} columnSpacing={3}>


              <Grid item xs={12} md={12}>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  Edit Invoice
                </Typography>

              </Grid>

              {/* Top Section - Invoice Details*/}
            <Grid item xs={12} md={12}>
              {/* Make the invoice details card floating */}

                <Card>
                  <CardContent className='py-3.5'>

                     <Box className='pb-1'>
                    <Typography variant="overline" className='text-[0.95rem] text-secondary' gutterBottom>
                      Details
                    </Typography>
                  </Box>


                    <Grid container columnSpacing={3} rowSpacing={4}>
                     <Grid item xs={12} sm={6} md={4} lg={3}>

                     <Box  className="flex flex-row items-center px-3 justify-between bg-tableHeader rounded-md w-full h-full">

                     <Typography variant="caption" className='text-[0.9rem]' color="text.secondary">
                              Invoice Number
                            </Typography>

                            <Typography variant="h6" className='text-[1.1rem] font-medium'>
                              {getValues('invoiceNumber') || ''}
                            </Typography>

                     </Box>



                      </Grid>

                          {/* Customer */}
                          <Grid item xs={12} sm={6} md={4} lg={3}>
                            <CustomerAutocomplete control={control} errors={errors} customersData={customersData} />
                          </Grid>


                            {/* Invoice Date */}
                           <Grid item xs={12} sm={6} md={4} lg={3}>
                              <Controller
                                name="invoiceDate"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Invoice Date"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    error={!!errors.invoiceDate}
                                    inputProps={{
                                      max: formatDateForInput(new Date()),
                                    }}
                                  />
                                )}
                              />
                            </Grid>

                            {/* Due Date */}
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                              <Controller
                                name="dueDate"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Due Date"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    error={!!errors.dueDate}
                                    inputProps={{
                                      min: formatDateForInput(getValues('invoiceDate')),
                                    }}
                                  />
                                )}
                              />
                            </Grid>


                          {/* Payment Method */}
                         <Grid item xs={12} sm={6} md={4} lg={3}>
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
                          </Grid>

   {/* Bank Selection */}

                            <Grid item xs={12} sm={6} md={4} lg={3}
                            className="flex flex-row gap-1 justify-between">
                              <Controller
                                name="bank"
                                control={control}
                              render={({ field }) => (
                                <FormControl size='small' fullWidth variant="outlined" error={!!errors.bank}>
                                  <InputLabel size="small">Select Bank</InputLabel>
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

                            <CustomIconButton
                              color="primary"
                              size='small'
                              variant='tonal'
                              skin='lighter'
                              onClick={() => setOpenBankModal(true)}

                            >
                              <Icon  icon="mdi:bank-plus" width={26}/>
                            </CustomIconButton>
                          </Grid>

                          {/* Reference No */}
                          <Grid item xs={12} sm={6} md={4} lg={3}>
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
                          </Grid>


                          {/* Signature Section - Simplified */}
                         <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {/* Only Manual Signature Section */}
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Controller
                                  name="signatureId"
                                  control={control}
                                  render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.signatureId} variant="outlined" size="small">
                                      <InputLabel>Select Signature Name</InputLabel>
                                      <Select
                                        className='h-[39px]'
                                        label="Select Signature Name"
                                        value={field.value || ''}
                                        onChange={(event) => {
                                          const selected = signOptions.find(sig => sig._id === event.target.value);
                                          handleSignatureSelection(selected, field);
                                        }}
                                      >
                                        {signOptions.map((option) => (
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
                              </Box>
                            </Box>
                          </Grid>



                            {/* Notes TextField */}
                            <Grid item xs={12} sm={12} md={8} lg={6}>
                              <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    multiline
                                    rows={notesExpanded ? 4 : 1}
                                    variant="outlined"
                                    size="small"
                                    placeholder="Add notes..."
                                    fullWidth
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">

                                            <CustomOriginalIconButton
                                            onClick={handleToggleNotes}
                                            color='primary'
                                            skin='light'
                                            >
                                              {notesExpanded ? <Icon icon="mdi:keyboard-arrow-up" width={24} color= {theme.palette.primary.main} /> : <Icon icon="mdi:keyboard-arrow-down" width={24} color= {theme.palette.primary.main} />}
                                            </CustomOriginalIconButton>

                                        </InputAdornment>
                                      ),
                                      sx: {
                                        '& .MuiOutlinedInput-input': {
                                          overflow: 'auto',
                                          '&::-webkit-scrollbar': {
                                            width: '4px',
                                          },
                                          '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                            borderRadius: '4px',
                                          },
                                        },
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Grid>


                            {/* Terms & Conditions */}
                            <Grid item xs={12} sm={6} md={4} lg={3}>


                                {/* Terms & Conditions CustomIconButton */}
                                <Button
                                fullWidth
                                 className="flex flex-row items-center gap-0 justify-center"
                                  variant="text"
                                  color="primary"
                                  size="small"
                                  startIcon={<Icon icon="mdi:file-document-outline" width={24} color= {theme.palette.primary.main} />}
                                  onClick={handleOpenTermsDialog}
                                >
                                    {/* <Typography variant="button" color="primary.main" fontSize={13} fontWeight={500}> */}
                                      Terms & Conditions
                                    {/* </Typography> */}

                                </Button>

                            </Grid>





                        </Grid>




                      </CardContent>

                    </Card>



                </Grid>



            {/* Middle Section - Products Table*/}
            <Grid item xs={12} md={9.5}>
 <form onSubmit={handleSubmit(onSubmit, handleError)}>
              <Card>
                <CardContent spacing={12} className='flex flex-col gap-2 px-0 pt-0'>
                  {/* Products Selection */}

                    {/* <Typography variant="overline" className='px-5 mt-1 text-[1rem] text-secondary' gutterBottom>
                      Products
                    </Typography> */}

                  {/* Products Table */}
                  <Box >

                    {fields.length > 0 && (
                      <Table
                        //  size='small'
                      >
                        <TableHead
                            className=' bg-tableHeader  border-b-0'
                        >
                          <TableRow
                            className='h-[45px] bg-tableHeader border-b-0'
                            sx={{
                              '& .MuiTableCell-root': { borderBottom: 'none' }
                            }}
                          >
                            <TableCell className='size-sm w-[24%] pl-2 text-center' >
                              <Typography variant="overline" className='text-[0.79rem] font-[500]' >
                                Product/Service
                              </Typography>
                            </TableCell>
                            <TableCell className='size-sm w-[12%] text-center'>
                              <Typography variant="overline" className='text-[0.79rem] font-[500]' >
                                Quantity
                              </Typography>
                            </TableCell>
                            <TableCell className='size-sm w-[19%] text-center'  >
                              <Typography variant="overline" className='text-[0.79rem] font-[500]' >
                                Rate
                              </Typography>
                            </TableCell>
                            <TableCell className='size-sm w-[19%] text-center'  >
                              <Typography variant="overline" className='text-[0.79rem] font-[500]' >
                                Discount
                              </Typography>
                            </TableCell>
                            <TableCell className='size-sm w-[16%] text-center'  >
                              <Typography variant="overline" className='text-[0.79rem] font-[500]' >
                                VAT
                              </Typography>
                            </TableCell>
                             <TableCell className='size-sm w-[13%] text-center'   >
                              <Typography variant="overline" className='text-[0.79rem] font-[500]' >
                                Amount
                              </Typography>
                            </TableCell>
                            <TableCell className='size-sm w-[4%] text-center'   >

                            </TableCell>
                          </TableRow>
                        </TableHead>

                        {/* Items List */}
                        <TableBody

                        >
                          {fields.map((item, index) => {
                            const watched = watchItems[index] || {};
                            return (
                              <TableRow
                                key={item.id || index}
                                className="[&_td]:py-2.5 [&_th]:py-1"
                                size='small'
                                // className='border-b-[1.5px] border-secondaryLighter'

                              >
                                {/* Product/Service Column */}
                                <TableCell className='border-red' size='small' >
                                  <Controller

                                    name={`items.${index}.productId`}
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl fullWidth size="small" error={!!errors.items?.[index]?.productId}>
                                        <Select
                                        className={`
                                                    py-0.5
                                                    min-h-[0]
                                                    [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight
                                                    [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary
                                                    [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary
                                                    [&.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary
                                                  `}
                                        size='small'
                                        // className='py-0.5 min-h-[0] '
                                            sx={{
                                            '& .MuiOutlinedInput-input': {
                                              py: 0.3, // Also target input padding
                                              pl: 2.5,
                                            },
                                          }}
                                          {...field}
                                          displayEmpty
                                          value={field.value || ''}
                                          onChange={(e) => {
                                            const productId = e.target.value;
                                            const previousProductId = field.value;
                                            handleUpdateItemProduct(index, productId, previousProductId);
                                          }}
                                          renderValue={

                                            (selected) => {
                                            if (!selected) {
                                              return (
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                  Select Product
                                                </Typography>
                                              );
                                            }

                                            return (
                                              <Box className='flex flex-col gap-0'  sx={{ overflow: 'hidden' }}>
                                                <Typography
                                                  variant="body1"
                                                  color="text.primary"
                                                  sx={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '160px'
                                                  }}
                                                >
                                                  {watchItems[index].name}
                                                </Typography>
                                                <Typography variant="caption" fontSize={12} color= 'text.secondary'>
                                                  Unit: {watchItems[index].units}

                                                </Typography>
                                              </Box>
                                            );
                                          }}


                                        >
                                          <MenuItem value="" disabled>
                                              Select Product
                                          </MenuItem>
                                          {productsCloneData.map((product) => (
                                            <MenuItem key={product._id} value={product._id}>
                                              {product.name}
                                            </MenuItem>
                                          ))}
                                          </Select>
                                      </FormControl>
                                    )}
                                  />
                                </TableCell>

                                {/* Quantity Column */}
                                <TableCell size='small'>
                                  <Controller
                                    name={`items.${index}.quantity`}
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl error={!!errors.items?.[index]?.quantity} fullWidth>
                                        <TextField
                                          {...field}
                                          type="number"
                                          variant="outlined"
                                          size="small"
                                          placeholder="Quantity"
                                          className="
                                                          [&_input::-webkit-outer-spin-button]:hidden
    [&_input::-webkit-inner-spin-button]:hidden
    [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight
    [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary
    [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary
    [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary
                                                    "
                                          inputProps={{
                                            min: 1,
                                            step: 1,

                                            onKeyDown: (e) => {
                                              if (e.key === '.') e.preventDefault();
                                            }
                                          }}
                                          onChange={e => {
                                            const raw = e.target.value;
                                            const quantity = Math.max(0, Math.floor(Number(raw)));
                                            setValue(`items.${index}.quantity`, quantity, { shouldValidate: true, shouldDirty: true });
                                            const item = getValues(`items.${index}`);
                                            updateCalculatedFields(index, { ...item, quantity }, setValue);
                                          }}
                                          error={!!errors.items?.[index]?.quantity}
                                        />
                                      </FormControl>
                                    )}
                                  />
                                </TableCell>

                                {/* Rate Column */}
                                <TableCell size='small'>
                                  <Controller
                                    name={`items.${index}.rate`}
                                    control={control}
                                    render={({ field }) => (
                                      <FormControl error={!!errors.items?.[index]?.rate} size="small" fullWidth>
                                        <TextField

                                          {...field}
                                          type="number"
                                          variant="outlined"
                                          placeholder="Rate"
                                          size="small"
                                          className="
                                                      min-w-[90px]
                                                          [&_input::-webkit-outer-spin-button]:hidden
    [&_input::-webkit-inner-spin-button]:hidden
    [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight
    [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary
    [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary
    [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary
                                                    "


                                          InputProps={{
                                              sx: { paddingLeft: '8px' },
                                            startAdornment: (
                                                <Icon icon="lucide:saudi-riyal" width={22} color={theme.palette.secondary.main}/>
                                            ),
                                          }}
                                          inputProps={{
                                                sx: { paddingLeft: '4px' },
                                            min: 0,
                                            step: 1,


                                            onKeyDown: (e) => {
                                              if (e.key === '.') e.preventDefault();
                                            }
                                          }}
                                          onChange={e => {
                                            const rate = Number(e.target.value);

                                            // First update the rate fields
                                            setValue(`items.${index}.rate`, rate);
                                            setValue(`items.${index}.form_updated_rate`, (Number(rate) / Number(watched.quantity)).toFixed(4))
                                            setValue(`items.${index}.form_updated_discount`, Number(watched.discount))
                                            setValue(`items.${index}.form_updated_discounttype`, Number(watched.discountType))
                                            setValue(`items.${index}.isRateFormUpadted`, 'true')

                                            const item = getValues(`items.${index}`);
                                            updateCalculatedFields(index, item, setValue);

                                          }}
                                          error={!!errors.items?.[index]?.rate}
                                        />
                                      </FormControl>
                                    )}
                                  />
                                </TableCell>

                                {/* Discount Column */}
                                <TableCell>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
                                      <CustomIconButton
                                        variant="tonal"
                                        onClick={e => setDiscountMenu({ anchorEl: e.currentTarget, rowIndex: index })}
                                        color="primary"
                                        skin="lightest"
                                        size="small"
                                        className=" min-w-[32px] min-h-[36px] px-2 py-0"
                                      >
                                        {/* <Box > */}
                                          {Number(watched.discountType) === 2 ? (
                                            <Icon
                                              icon="lucide:percent"
                                              color={theme.palette.primary.light}
                                              width={19}
                                            />
                                          ) : Number(watched.discountType) === 3 ? (
                                            <Icon
                                              icon="lucide:saudi-riyal"
                                              color={theme.palette.primary.light}
                                              width={30}
                                            />
                                          ) : ''}
                                        {/* </Box> */}
                                      </CustomIconButton>

                                      {Number(watched.discountType) === 2 ? (
                                        <Controller
                                          name={`items.${index}.form_updated_discount`}
                                          control={control}
                                          render={({ field }) => {
                                            const handleChange = (e) => {
                                              let value = Number(e.target.value);
                                              value = Math.min(100, value);
                                              field.onChange(value);

                                              setValue(`items.${index}.isRateFormUpadted`, true);

                                              const item = getValues(`items.${index}`);
                                              updateCalculatedFields(index, item, setValue)

                                            };
                                            return (
                                              <TextField
                                                {...field}
                                                value={field.value}
                                                type="number"
                                                variant="outlined"
                                                size="small"
                                                placeholder="Discount (%)"
                                                aria-label="Discount Percentage"
                                                tabIndex={0}

                                                className="
    min-w-[110px]
    [&_input::-webkit-outer-spin-button]:hidden
    [&_input::-webkit-inner-spin-button]:hidden
    [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight
    [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary
    [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary
    [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary
  "

                                                inputProps={{
                                                  min: 0,
                                                  max: 100,
                                                  step: 1,
                                                  sx: { paddingLeft: '8px' },
                                                }}
                                                InputProps={{
                                                  sx: { paddingRight: '8px' },
                                                  endAdornment: Number(watched.discount) > 0 ? (
                                                    <Box className='flex flex-row items-center gap-0'>
                                                      <Icon icon="lucide:saudi-riyal" width={14} color={theme.palette.secondary.main} />
                                                      <Typography variant="subtitle2" color="secondary.main">
                                                        {Number(watched.discount).toFixed(2)}
                                                      </Typography>
                                                    </Box>
                                                  ) : null
                                                }}
                                                onChange={handleChange}
                                                error={!!errors.items?.[index]?.form_updated_discount}
                                              />
                                            );
                                          }}
                                        />
                                      ) : (
                                        <Controller
                                          name={`items.${index}.discount`}
                                          control={control}
                                          render={({ field }) => {
                                            const handleChange = (e) => {
                                              let value = Number(e.target.value);
                                              field.onChange(value);
                                              setValue(`items.${index}.form_updated_discount`, value);
                                              setValue(`items.${index}.isRateFormUpadted`, true);
                                              setValue(`items.${index}.discount`, value);

                                              const item = getValues(`items.${index}`);
                                              updateCalculatedFields(index, item, setValue);


                                            };
                                            return (
                                              <TextField
                                                {...field}
                                                value={field.value}
                                                type="number"
                                                variant="outlined"
                                                size="small"
                                                placeholder="Discount"
                                                aria-label="Discount Fixed Amount"
                                                tabIndex={0}
                                                className="
    min-w-[110px]
    [&_input::-webkit-outer-spin-button]:hidden
    [&_input::-webkit-inner-spin-button]:hidden
    [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight
    [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary
    [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary
    [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary
  "
                                                inputProps={{
                                                  min: 0,
                                                  step: 1,
                                                  sx: { paddingLeft: '8px' },
                                                }}
                                                onChange={handleChange}
                                                error={!!errors.items?.[index]?.discount}
                                              />
                                            );
                                          }}
                                        />
                                      )}

                                      <Menu

                                        anchorEl={discountMenu.anchorEl}
                                        open={discountMenu.rowIndex === index && Boolean(discountMenu.anchorEl)}
                                        onClose={() => setDiscountMenu({ anchorEl: null, rowIndex: null })}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                        PaperProps={{ sx: { borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } }}
                                      >
                                        <MenuItem
                                        dense
                                          size='small'
                                          onClick={() => {
                                            handleMenuItemClick(index, 2);
                                            setDiscountMenu({ anchorEl: null, rowIndex: null });
                                          }}
                                          className='flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight'

                                        >

                                              <Typography variant="body2">Percentage</Typography>

                                                <Avatar

                                                  variant="rounded"
                                                  color="primary"
                                                  skin="light"
                                                  size="1.8rem"


                                                >
                                               <Icon icon="material-symbols:percent-rounded"/>
                                                </Avatar>

                                        </MenuItem>
                                        <MenuItem

                                        className='flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight'
                                          onClick={() => {
                                            handleMenuItemClick(index, 3);
                                            setDiscountMenu({ anchorEl: null, rowIndex: null });
                                          }}
                                        >

                                              <Typography variant="body2">Fixed Amount</Typography>



                                                 <Avatar

                                                  variant="rounded"
                                                  color="primary"
                                                  skin="light"
                                                  size="1.8rem"


                                                >
                                               <Icon icon="lucide:saudi-riyal" />
                                                </Avatar>

                                        </MenuItem>
                                      </Menu>

                                  </Box>
                                </TableCell>

                                {/* VAT Column */}
                                <TableCell size='small'>
                                  <Box className='flex flex-row items-center gap-2 h-[36px]'>
                                    <CustomIconButton
                                      variant="tonal"
                                      onClick={(e) => handleTaxClick(e, index)}
                                      color="primary"
                                      skin="lightest"
                                      size="small"
                                     className='flex flex-row items-center gap-0.5 px-1'
                                    >
                                      <Typography variant="button" fontSize={13} color="primary.light">
                                        {watched.taxInfo && typeof watched.taxInfo === 'object' ?
                                          (watched.taxInfo.taxRate || 0) : 0}%
                                      </Typography>
                                      <Icon icon="garden:chevron-down-fill-12" color={theme.palette.primary.light} width={11} />
                                    </CustomIconButton>
                                          <Box className='flex flex-row items-center gap-0.5'>

                                    <Icon icon="lucide:saudi-riyal" color={theme.palette.secondary.light} width={18} />
                                    <Typography variant='body1'>
                                      {isNaN(Number(watched.tax)) ? '0.00' : Number(watched.tax).toFixed(2)}
                                    </Typography>

                                          </Box>

                                  </Box>

                                  <Menu
                                    anchorEl={taxMenu.anchorEl}
                                    open={taxMenu.rowIndex === index && Boolean(taxMenu.anchorEl)}
                                    onClose={handleTaxClose}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                  >
                                    {taxRates.map((tax) => (
                                      <MenuItem
                                        key={tax._id}
                                        onClick={() => handleTaxMenuItemClick(index, tax)}
                                        sx={{
                                          py: 1,
                                          '&:hover': {
                                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08)
                                          }
                                        }}
                                      >
                                        <Box className='flex flex-row items-center justify-between w-[8em]'>
                                          <Typography variant="body2">{tax.name}</Typography>
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontWeight: 600,
                                              color: 'primary.main',
                                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                              px: 1,
                                              py: 0.5,
                                              borderRadius: '4px'
                                            }}
                                          >
                                            {tax.taxRate}%
                                          </Typography>
                                        </Box>
                                      </MenuItem>
                                    ))}
                                  </Menu>
                                </TableCell>

                                {/* Amount Column */}
                                <TableCell size='small'>

                                                               <Box className='flex flex-row items-center gap-0.5'>

                                    <Icon icon="lucide:saudi-riyal" color={theme.palette.secondary.light} width={18} />

                                  <Typography
                                    variant="body1"
                                    className='font-medium whitespace-nowrap'
                                  >
                                    {isNaN(Number(watched.amount)) ? '0.00' : Number(watched.amount).toFixed(2)}
                                  </Typography>

                                  </Box>
                                </TableCell>

                                {/* Actions Column */}
                                <TableCell size='small' align="center" >
                                  <IconButton
                                    size="small"
                                    color="error"
                                    className="bg-errorLighter rounded-full w-7 h-7 [&:hover]:bg-errorLight"
                                    onClick={() => handleDeleteItem(index)}
                                    onKeyDown={(e) => {
                                      // When Tab key is pressed on the delete button of the last row
                                      if (e.key === 'Tab' && !e.shiftKey && index === fields.length - 1) {
                                        e.preventDefault(); // Prevent default tab behavior
                                        handleAddEmptyRow();
                                      }
                                    }}
                                    tabIndex={0}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}

                    {fields.length === 0 && (
                      <Card
                        sx={{
                          borderStyle: 'dashed',
                          borderWidth: '2px',
                          borderColor: (theme) => alpha(theme.palette.divider, 0.8),
                          borderRadius: '12px',
                          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.7),
                          p: 2
                        }}
                      >
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          py: 6,
                          gap: 2,
                          textAlign: 'center'
                        }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 70,
                              height: 70,
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                              borderRadius: '50%'
                            }}
                          >
                            <Icon icon="mdi:cart-outline" width={36} color={theme.palette.primary.main} />
                          </Box>
                          <Typography variant="h6" color="text.primary">
                            No Products Added Yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '300px' }}>
                            Click the Add Item button to add products to your invoice
                          </Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Add />}
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={handleAddEmptyRow}
                          >
                            Add Item
                          </Button>
                        </Box>
                      </Card>
                    )}

                    {/* Add New Item Button at bottom if there are already items */}
                    {fields.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3, ml: 4 }}>

                        <CustomIconButton
                          variant="tonal"
                          skin='lighter'
                          color="primary"
                          size="medium"
                          onClick={handleAddEmptyRow}
                        >
                                <Box className='flex flex-row items-center justify-start px-2 gap-5 w-[135px]'>
                                  <Icon icon="mingcute:add-fill" color={theme.palette.primary.main} width={16} />
                                  <Typography variant="button" color="primary.main" fontSize={14}>
                                       Add Row
                                  </Typography>
                            </Box>
                        </CustomIconButton>
                    </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
                </form>

            </Grid>

            {/* right side totals card */}
                    <Grid item xs={12} md={2.5}>
                      <Card>
                        <CardContent className='px-4 py-3'>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="body1">Amount:</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                              <Controller
                                name="taxableAmount"
                                control={control}
                                render={({ field }) => (
                                  <Typography variant="body1" fontWeight="medium">
                                    {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                                  </Typography>
                                )}
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <Typography variant="body1">Discount:</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                              <Controller
                                name="totalDiscount"
                                control={control}
                                render={({ field }) => (
                                  <Typography variant="body1" fontWeight="medium">
                                    {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                                  </Typography>
                                )}
                              />
                            </Grid>

                            <Grid item xs={6}>
                              <Typography variant="body1">VAT:</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                              <Controller
                                name="vat"
                                control={control}
                                render={({ field }) => (
                                  <Typography variant="body1" fontWeight="medium">
                                    {isNaN(Number(field.value)) ? '0.00' : Number(field.value).toFixed(2)}
                                  </Typography>
                                )}
                              />
                            </Grid>

                            <Grid item xs={12}>
                              <Divider sx={{ my: 1 }} />
                            </Grid>

                            <Grid item xs={6}>
                              <Typography variant="h6">Total:</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                              <Controller
                                name="TotalAmount"
                                control={control}
                                render={({ field }) => (
                                  <Typography variant="h6" color="primary.main">
                                    {field.value ? Number(field.value).toFixed(2) : '0.00'}
                                  </Typography>
                                )}
                              />
                            </Grid>
                          </Grid>

                          {/* Action Buttons */}
                          <Box className='flex flex-row gap-3 justify-between mt-3'>
                            <Button

                              variant="outlined"
                              color="secondary"
                              component={Link}
                              href="/invoices/invoice-list"
                            >
                              Cancel
                            </Button>
                            <Button
                              // className='flex-1'
                              className='flex-1'
                              variant="contained"
                              onClick={handleSubmit(onSubmit, handleError)}
                              color="primary"
                            >
                              Save
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>









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

      {/* Notes Dialog */}
      <Dialog
        open={termsDialogOpen}
        onClose={handleCloseTermsDialog}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04), py: 3, px: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Terms and Conditions
          </Typography>
        </Box>

        <DialogContent sx={{ py: 5, px: 5 }}>
          <TextField
            value={tempTerms}
            onChange={(e) => setTempTerms(e.target.value)}
            fullWidth
            multiline
            rows={5}
            variant="filled"
            placeholder="Enter your standard terms and conditions (payment terms, delivery terms, warranty information, etc.)"
            InputProps={{
              endAdornment: tempTerms.trim() !== '' && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleCloseTermsDialog}
                    edge="end"
                    className="transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
                    title="Clear terms and conditions"
                    size="small"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>

        <Box
         className='flex flex-row justify-end gap-2 px-5 pb-4 pt-1'
        >
          <Button
            onClick={handleCloseTermsDialog}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTerms}
            color="primary"
            variant="contained"
          >
            Save Changes
          </Button>
        </Box>
      </Dialog>
    </Grid>
  );
};

export default EditInvoice;


// app/(dashboard)/invoices/[id]/EditInvoice.jsx

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  IconButton,
  Box,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogContent,
  DialogActions,
  Collapse,
  FormHelperText,
  InputAdornment,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import CustomOriginalIconButton from '@core/components/mui/CustomOriginalIconButton';
import { Clear } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles'
import { calculateInvoiceTotals } from '@/utils/salesTotals';
import { formatDateForInput } from '@/utils/dateUtils';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomerAutocomplete from '@/components/custom-components/CustomerAutocomplete';
import useInvoiceHandlers from '@/handlers/invoices/useInvoiceHandlers';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import InvoiceTotals from '@/components/custom-components/InvoiceTotals';
import AppSnackbar from '@/components/shared/AppSnackbar';
import { getInvoiceFormColumns } from '@/views/invoices/invoiceColumns';

const EditInvoice = (props) => {
  // Destructure props for clarity
  const {
    invoiceData,
    customersData,
    productData,
    taxRates,
    initialBanks,
    signatures,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
  } = props;

  // Use new composing hook for all handlers and state
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    errors,
    fields,
    watchItems,
    watchRoundOff,
    productsCloneData,
    banks,
    newBank,
    setNewBank,
    signOptions,
    paymentMethods,
    // UI states and handlers
    notesExpanded,
    termsDialogOpen,
    tempTerms,
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    // Functions
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow,
    handleAddBank,
    handleSignatureSelection,
    handleFormSubmit: originalHandleFormSubmit,
    handleError,
    // UI action handlers
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    handleToggleNotes,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
  } = useInvoiceHandlers({
    invoiceData,
    productData,
    initialBanks,
    signatures,
    onSave,
    enqueueSnackbar,
    closeSnackbar
  });

  const walkInCustomerId = (Array.isArray(customersData) ? customersData : [])
    .find((customer) => String(customer?.name || '').trim().toLowerCase() === 'walk-in customer')
    ?._id || 'walk-in';

  // UI-only state (dialogs, expanded notes, etc.)
  const [openBankModal, setOpenBankModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [quickEntryMode, setQuickEntryMode] = useState('standard');
  const [barcodeDraft, setBarcodeDraft] = useState('');
  const [posMode, setPosMode] = useState(Boolean(invoiceData?.posMode));
  const [isWalkIn, setIsWalkIn] = useState(Boolean(invoiceData?.isWalkIn));
  const [tenderedAmount, setTenderedAmount] = useState(
    invoiceData?.tenderedAmount ? String(invoiceData.tenderedAmount) : ''
  );
  const [posReceiptOpen, setPosReceiptOpen] = useState(false);
  const [posReceiptData, setPosReceiptData] = useState(null);
  const [heldSales, setHeldSales] = useState([]);
  const [showHeldSales, setShowHeldSales] = useState(false);
  const [checkoutSummaryHeight, setCheckoutSummaryHeight] = useState(0);
  const [checkoutSummaryBounds, setCheckoutSummaryBounds] = useState({ left: 24, width: 0 });
  const scanBufferRef = useRef('');
  const scanTimeoutRef = useRef(null);
  const initialRowAddedRef = useRef(false);
  const checkoutSummaryRef = useRef(null);
  const itemsSectionRef = useRef(null);
  const theme = useTheme();

  const handleFormSubmit = (data) => {
    data.posMode = posMode;
    data.isWalkIn = isWalkIn;
    if (isWalkIn) {
      // Use the real Walk-in Customer record (fallback to legacy sentinel).
      data.customerId = walkInCustomerId || data.customerId || '';
    }
    if (posMode) {
      data.tenderedAmount = Number(tenderedAmount || 0);
      data.changeAmount = Number(changeAmount || 0);
      data.sign_type = data.sign_type || 'manualSignature';
      data.signatureId = data.signatureId || '';
      data.signatureName = data.signatureName || '';
    }
    return originalHandleFormSubmit(data);
  };

  useEffect(() => {
    if (watchItems) {
      const { taxableAmount, totalDiscount, vat, TotalAmount, roundOffValue } = calculateInvoiceTotals(
        watchItems,
        watchRoundOff
      );

      setValue('taxableAmount', taxableAmount);
      setValue('totalDiscount', totalDiscount);
      setValue('vat', vat);
      setValue('TotalAmount', TotalAmount);
      setValue('roundOffValue', roundOffValue);
    }
  }, [watchItems, watchRoundOff]);

  const totalAmount = Number(watch('TotalAmount') || 0);
  const changeAmount = Math.max(0, Number(tenderedAmount || 0) - totalAmount);
  const quickProducts = Array.isArray(productsCloneData) ? productsCloneData.slice(0, 8) : [];
  const posQuickAmounts = [
    { label: 'Exact', value: totalAmount },
    { label: '+10', value: Math.ceil(totalAmount / 10) * 10 },
    { label: '+50', value: Math.ceil(totalAmount / 50) * 50 },
    { label: '+100', value: Math.ceil(totalAmount / 100) * 100 },
    { label: '200', value: 200 },
    { label: '500', value: 500 },
  ];
  const posPaymentMethods = [
    { value: 'Cash Value', label: 'Cash Value' },
    ...paymentMethods.filter((method) => method.value !== 'Cash')
  ];
  const checkoutSummarySpacer = checkoutSummaryHeight
    ? `${checkoutSummaryHeight - 45}px`
    : '360px';
  const checkoutSummaryPosition = checkoutSummaryBounds.width
    ? { left: checkoutSummaryBounds.left, width: checkoutSummaryBounds.width }
    : { left: 24, right: 24 };

  useEffect(() => {
    setValue('posMode', posMode);
  }, [posMode, setValue]);

  useEffect(() => {
    setValue('isWalkIn', isWalkIn);
    if (isWalkIn) {
      setValue('customerId', walkInCustomerId);
    }
  }, [isWalkIn, walkInCustomerId, setValue]);

  useEffect(() => {
    if (!posMode) return;
    const currentMethod = getValues('payment_method');
    if (!currentMethod || currentMethod === 'Cash') {
      setValue('payment_method', 'Cash Value');
    }
  }, [posMode, getValues, setValue]);

  useEffect(() => {
    if (initialRowAddedRef.current) return;
    const currentItems = getValues('items');
    if (!Array.isArray(currentItems) || currentItems.length === 0) {
      handleAddEmptyRow();
    }
    initialRowAddedRef.current = true;
  }, [getValues, handleAddEmptyRow]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('posHeldSales');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setHeldSales(parsed);
      } catch (error) {
        // ignore
      }
    }
  }, []);

  const updateHeldSales = (next) => {
    setHeldSales(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('posHeldSales', JSON.stringify(next));
    }
  };

  const getNextHoldNumber = () => {
    const maxValue = heldSales.reduce((max, sale) => Math.max(max, sale?.holdNumber || 0), 0);
    return maxValue + 1;
  };

  const clearItems = () => {
    const currentItems = Array.isArray(getValues('items')) ? getValues('items') : [];
    for (let index = currentItems.length - 1; index >= 0; index -= 1) {
      handleDeleteItem(index);
    }
  };

  const resetPosForm = () => {
    clearItems();
    setValue('customerId', walkInCustomerId);
    setValue('payment_method', 'Cash Value');
    setTenderedAmount('');
    setIsWalkIn(true);
  };

  const handleHoldSale = () => {
    const items = Array.isArray(getValues('items')) ? getValues('items') : [];
    if (items.length === 0) {
      setSnackbar({ open: true, message: 'Nothing to hold yet', severity: 'info' });
      return;
    }
    const holdNumber = getNextHoldNumber();
    const snapshot = {
      id: Date.now(),
      holdNumber,
      customerId: isWalkIn ? '' : getValues('customerId'),
      isWalkIn,
      payment_method: getValues('payment_method'),
      tenderedAmount,
      items,
      total: totalAmount,
      createdAt: new Date().toISOString(),
    };
    updateHeldSales([snapshot, ...heldSales].slice(0, 5));
    resetPosForm();
    setSnackbar({ open: true, message: 'Sale held (mock)', severity: 'success' });
  };

  const loadHeldSale = (sale) => {
    clearItems();
    (sale.items || []).forEach((item) => {
      handleAddEmptyRow();
      const index = getValues('items').length - 1;
      Object.keys(item).forEach((key) => {
        setValue(`items.${index}.${key}`, item[key]);
      });
      updateCalculatedFields(index, item);
    });
    setIsWalkIn(Boolean(sale.isWalkIn));
    setValue('customerId', sale.isWalkIn ? walkInCustomerId : (sale.customerId || ''));
    setValue('payment_method', sale.payment_method || 'Cash Value');
    setTenderedAmount(sale.tenderedAmount || '');
  };

  const handleDeleteHeldSale = (saleId) => {
    updateHeldSales(heldSales.filter((sale) => sale.id !== saleId));
  };

  const handleLoadHeldSale = (sale) => {
    loadHeldSale(sale);
    updateHeldSales(heldSales.filter((item) => item.id !== sale.id));
    setSnackbar({ open: true, message: 'Held sale loaded', severity: 'success' });
  };

  const handleResumeLast = () => {
    if (heldSales.length === 0) {
      setSnackbar({ open: true, message: 'No held sales available', severity: 'info' });
      return;
    }
    const [latest, ...rest] = heldSales;
    loadHeldSale(latest);
    updateHeldSales(rest);
    setSnackbar({ open: true, message: 'Resumed last held sale', severity: 'success' });
  };

  const handleCompleteSale = async (data) => {
    const result = await handleFormSubmit(data);
    if (result?.success === false) return;
    setPosReceiptData({
      invoiceNumber: data.invoiceNumber || getValues('invoiceNumber'),
      customerId: data.customerId,
      payment_method: data.payment_method,
      items: Array.isArray(getValues('items')) ? getValues('items') : [],
      total: totalAmount,
      tenderedAmount,
      changeAmount,
      createdAt: new Date().toISOString(),
    });
    setPosReceiptOpen(true);
  };

  const handlePrintReceipt = () => {
    setSnackbar({ open: true, message: 'Receipt printing integration pending', severity: 'info' });
    setPosReceiptOpen(false);
  };

  const handleNewSale = () => {
    resetPosForm();
    setPosReceiptOpen(false);
  };

  const handleQuickAddProduct = useCallback((product) => {
    if (!product?._id) return;

    const currentItems = Array.isArray(getValues('items')) ? getValues('items') : [];

    // If product already exists, increment quantity
    const existingIndex = currentItems.findIndex((item) => item?.productId === product._id);
    if (existingIndex >= 0) {
      const existingItem = currentItems[existingIndex];
      const nextQuantity = Number(existingItem?.quantity || 0) + 1;
      const updatedItem = {
        ...existingItem,
        quantity: nextQuantity,
        isRateFormUpadted: true,
      };

      setValue(`items.${existingIndex}.quantity`, nextQuantity, {
        shouldValidate: true,
        shouldDirty: true,
      });
      updateCalculatedFields(existingIndex, updatedItem);
      return;
    }

    // Prefer filling an existing empty row
    const emptyIndex = currentItems.findIndex((item) => !item?.productId);
    if (emptyIndex >= 0) {
      handleUpdateItemProduct(emptyIndex, product._id, currentItems[emptyIndex]?.productId || '');
      return;
    }

    // Otherwise, add a new row and assign product
    handleAddEmptyRow();
    const nextIndex = currentItems.length;
    handleUpdateItemProduct(nextIndex, product._id, '');
  }, [getValues, handleAddEmptyRow, handleUpdateItemProduct, setValue, updateCalculatedFields]);

  const handleQuickAddWithTracking = (product) => {
    handleQuickAddProduct(product);
    setSnackbar({ open: true, message: 'Product added', severity: 'success' });
  };

  const handleBarcodeQuickAdd = () => {
    const barcode = barcodeDraft.trim();
    if (!barcode) {
      setSnackbar({ open: true, message: 'Enter a barcode first', severity: 'error' });
      return;
    }

    const match = (Array.isArray(productData) ? productData : []).find(
      (product) => String(product?.barcode || '').trim() === barcode
    );

    if (!match) {
      setSnackbar({ open: true, message: 'No product found for this barcode', severity: 'error' });
      return;
    }

    handleQuickAddProduct(match);
    setSnackbar({ open: true, message: 'Product added', severity: 'success' });
    setBarcodeDraft('');
  };

  const handleBarcodeScan = useCallback((barcodeValue) => {
    const barcode = String(barcodeValue || '').trim();
    if (!barcode) return;
    const match = (Array.isArray(productData) ? productData : []).find(
      (product) => String(product?.barcode || '').trim() === barcode
    );
    if (!match) {
      setSnackbar({ open: true, message: 'No product found for this barcode', severity: 'error' });
      return;
    }

    const currentItems = Array.isArray(getValues('items')) ? getValues('items') : [];
    const emptyIndex = currentItems.findIndex((item) => !item?.productId);
    if (emptyIndex >= 0) {
      handleUpdateItemProduct(emptyIndex, match._id, currentItems[emptyIndex]?.productId || '');
      setSnackbar({ open: true, message: 'Product added', severity: 'success' });
      return;
    }

    handleAddEmptyRow();
    const nextIndex = currentItems.length;
    handleUpdateItemProduct(nextIndex, match._id, '');
    setSnackbar({ open: true, message: 'Product added', severity: 'success' });
  }, [productData, getValues, handleAddEmptyRow, handleUpdateItemProduct]);

  useEffect(() => {
    if (typeof window === 'undefined' || !posMode) return;
    const handleKeyDown = (event) => {
      const active = document.activeElement;
      const tagName = active?.tagName?.toLowerCase();
      const isEditable = ['input', 'textarea', 'select'].includes(tagName) || active?.isContentEditable;
      if (isEditable) return;

      if (event.key === 'Enter') {
        const scanned = scanBufferRef.current;
        scanBufferRef.current = '';
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
          scanTimeoutRef.current = null;
        }
        if (scanned) {
          handleBarcodeScan(scanned);
        }
        return;
      }

      if (event.key && event.key.length === 1) {
        scanBufferRef.current += event.key;
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }
        scanTimeoutRef.current = setTimeout(() => {
          scanBufferRef.current = '';
        }, 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [posMode, handleBarcodeScan]);

  useEffect(() => {
    if (typeof window === 'undefined' || !posMode) return;
    const element = checkoutSummaryRef.current;
    const container = itemsSectionRef.current;
    if (!element) return;

    const updateLayout = () => {
      const nextHeight = element.getBoundingClientRect().height;
      setCheckoutSummaryHeight((prev) => (Math.abs(prev - nextHeight) > 1 ? nextHeight : prev));

      if (container) {
        const rect = container.getBoundingClientRect();
        setCheckoutSummaryBounds((prev) => {
          const next = { left: rect.left, width: rect.width };
          if (Math.abs(prev.left - next.left) < 1 && Math.abs(prev.width - next.width) < 1) {
            return prev;
          }
          return next;
        });
      }
    };

    updateLayout();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateLayout);
      return () => window.removeEventListener('resize', updateLayout);
    }

    const observer = new ResizeObserver(() => updateLayout());
    observer.observe(element);
    if (container) observer.observe(container);
    return () => observer.disconnect();
  }, [posMode, showHeldSales, heldSales.length]);

  // Get columns for InvoiceItemsTable
  const columns = getInvoiceFormColumns({
    control,
    errors,
    setValue,
    getValues,
    watchItems,
    productData,
    productsCloneData,
    discountMenu,
    setDiscountMenu,
    taxMenu,
    taxRates,
    theme,
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    fields
  });

  const addRowButton = (
    <CustomIconButton
      className='flex flex-row items-center justify-center gap-3 w-[13rem]'
      variant="tonal"
      skin='lighter'
      color="primary"
      size="medium"
      onClick={handleAddEmptyRow}
    >
      <Icon icon="mingcute:add-fill" color={theme.palette.primary.main} width={16} />
      <Typography variant="button" color="primary.main" fontSize={14}>
        Add Row
      </Typography>
    </CustomIconButton>
  );

  const emptyContent = (
    <Box className="flex flex-col items-center justify-center py-6 gap-2 text-center">
      <Icon icon="mdi:cart-outline" width={36} color={theme.palette.primary.main} />
      <Typography variant="h6" color="text.primary">
        No Items Added Yet
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '300px' }}>
        Click the 'Add Item' button to add items to your invoice
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<Icon icon="mingcute:add-fill" width={16} />}
        size="small"
        sx={{ mt: 1 }}
        onClick={handleAddEmptyRow}
      >
        Add Item
      </Button>
    </Box>
  );

  return (
    <Grid container rowSpacing={4} columnSpacing={3}>
      {/* Header Section */}
      <Grid size={{ xs: 12, md: 12 }}>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <div className='bg-primary/12 text-primary bg-primaryLight w-12 h-12 rounded-full flex items-center justify-center'>
              <Icon icon="tabler:file-invoice" fontSize={26} />
            </div>
            <Typography variant="h5" className="font-semibold text-primary">
              Edit Invoice
            </Typography>
          </div>
          <Tabs
            value={posMode ? 'pos' : 'invoice'}
            onChange={(_, value) => {
              if (!value) return;
              setPosMode(value === 'pos');
              if (value === 'invoice') {
                setIsWalkIn(false);
                setValue('customerId', '');
              } else {
                setIsWalkIn(true);
                setValue('customerId', walkInCustomerId);
                setValue('payment_method', 'Cash Value');
              }
            }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab value="pos" label="POS" />
            <Tab value="invoice" label="Invoice" />
          </Tabs>
        </div>
      </Grid>

      {posMode && (
        <>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent className="py-4">
                <Grid container spacing={3} alignItems="center">
                  <Grid size={{ xs: 12, md: 2 }}>
                    <TextField
                      label="Invoice No"
                      value={getValues('invoiceNumber') || ''}
                      variant="outlined"
                      fullWidth
                      size="medium"
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
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
                          size="medium"
                          error={!!errors.invoiceDate}
                          inputProps={{
                            max: new Date().toISOString().split('T')[0],
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <Controller
                      name="payment_method"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined" error={!!errors.payment_method}>
                          <InputLabel size="medium">Payment Method</InputLabel>
                          <Select {...field} label="Payment Method" size="medium">
                            {posPaymentMethods.map((method) => (
                              <MenuItem key={method.value} value={method.value}>
                                {method.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <Controller
                      name="signatureId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.signatureId} variant="outlined">
                          <InputLabel size="medium">Cashier</InputLabel>
                          <Select
                            label="Cashier"
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
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CustomerAutocomplete
                      size='medium'
                      control={control}
                      errors={errors}
                      customersData={customersData}
                      includeWalkInOption
                      onCustomerChange={(selected) => {
                        if (!selected || selected.isWalkIn || selected._id === walkInCustomerId) {
                          setIsWalkIn(true);
                          setValue('customerId', walkInCustomerId);
                        } else {
                          setIsWalkIn(false);
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box ref={itemsSectionRef} sx={{ position: 'relative', mb: checkoutSummarySpacer }}>
              <Card>
                <CardContent className='flex flex-col px-0 pt-0'>
                  <InvoiceItemsTable
                    tableHeadClassName='bg-errorLightest'
                    columns={columns}
                    rows={fields}
                    rowKey={(row, idx) => row.id || idx}
                    addRowButton={addRowButton}
                    emptyContent={emptyContent}
                  />
                </CardContent>
              </Card>

              <Box
                ref={checkoutSummaryRef}
                sx={{
                  position: 'fixed',
                  bottom: 16,
                  zIndex: theme.zIndex.appBar + 1,
                  ...checkoutSummaryPosition
                }}
              >
                <Card
                  // variant="outlined"
                  sx={{
                    borderRadius: 2,
                    // boxShadow: theme.shadows[8],
                    // borderColor: alpha(theme.palette.primary.main, 0.12),
                    // borderTop: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                    // backdropFilter: 'blur(8px)',
                    width: '100%',
                    maxWidth: 520,
                    ml: 'auto'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
                    <Grid container spacing={2} alignItems="stretch" direction={{ xs: 'row-reverse', md: 'row-reverse' }}>
                      {/* Payment & Actions column */}
                      <Grid size={{ xs: 6, md: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                          }}
                        >
                          {/* Tendered & Change inputs */}
                          <Box className="flex flex-col gap-1.5">
                            <TextField
                              label="Tendered Amount"
                              size="small"
                              value={tenderedAmount}
                              onChange={(e) => setTenderedAmount(e.target.value)}
                              placeholder="Enter tendered amount"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start" sx={{ color: theme.palette.secondary.main }}>
                                    <Icon icon="lucide:saudi-riyal" width={15} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <TextField
                              label="Change"
                              size="small"
                              value={changeAmount.toFixed(2)}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start" sx={{ color: theme.palette.secondary.main }}>
                                    <Icon icon="lucide:saudi-riyal" width={15} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>

                          {/* Action buttons */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
                            <Button
                              fullWidth
                              variant="contained"
                              color="success"
                              startIcon={<Icon icon="mdi:check-circle-outline" width={18} />}
                              onClick={handleSubmit(handleCompleteSale, handleError)}
                            >
                              Complete Sale
                            </Button>

                            <Box className="flex flex-row gap-1.5 items-center">
                              <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                startIcon={<Icon icon="mdi:pause-circle-outline" width={16} />}
                                onClick={handleHoldSale}
                                sx={{ flex: 1 }}
                              >
                                Hold
                              </Button>
                              <Button
                                variant="text"
                                size="small"
                                startIcon={<Icon icon="mdi:history" width={16} />}
                                onClick={() => setShowHeldSales((prev) => !prev)}
                                sx={{ flex: 1, whiteSpace: 'nowrap' }}
                              >
                                Held ({heldSales.length})
                              </Button>
                            </Box>

                            <Collapse in={showHeldSales}>
                              <Box className="flex flex-col gap-1" sx={{ maxHeight: 150, overflowY: 'auto', pr: 0.5 }}>
                                {heldSales.length === 0 && (
                                  <Typography variant="caption" color="text.secondary">
                                    No held sales yet.
                                  </Typography>
                                )}
                                {heldSales.map((sale, index) => {
                                  const holdLabel = sale.holdNumber || index + 1;
                                  return (
                                    <Box
                                      key={sale.id}
                                      className="flex items-center justify-between gap-2 rounded-md border px-2 py-1"
                                      sx={{
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.15s',
                                        '&:hover': { backgroundColor: 'action.hover' }
                                      }}
                                      onClick={() => handleLoadHeldSale(sale)}
                                    >
                                      <Box className="flex flex-col">
                                        <Typography variant="caption" color="text.secondary">
                                          Hold {String(holdLabel).padStart(2, '0')}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                          {Number(sale.total || 0).toFixed(2)} · {sale.items?.length || 0} items
                                        </Typography>
                                      </Box>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleDeleteHeldSale(sale.id);
                                        }}
                                      >
                                        <Icon icon="mdi:trash-can-outline" width={16} />
                                      </IconButton>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Collapse>
                          </Box>
                        </Box>
                      </Grid>

                      {/* Totals column */}
                      <Grid size={{ xs: 6, md: 6 }} sx={{ display: 'flex' }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                          }}
                        >
                          <Box className="flex flex-col gap-1.5" sx={{ mt: 0.5 }}>
                            <Box className="flex justify-between items-center">
                              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {Number(watch('taxableAmount') || 0).toFixed(2)}
                              </Typography>
                            </Box>
                            <Box className="flex justify-between items-center">
                              <Typography variant="body2" color="text.secondary">Discount</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {Number(watch('totalDiscount') || 0).toFixed(2)}
                              </Typography>
                            </Box>
                            <Box className="flex justify-between items-center">
                              <Typography variant="body2" color="text.secondary">VAT</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {Number(watch('vat') || 0).toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 1.25 }} />
                          <Box
                            className="flex justify-between items-center"
                            sx={{
                              py: 0.75,
                              px: 1,
                              mx: -0.5,
                              borderRadius: 1.5,
                              bgcolor: alpha(theme.palette.primary.main, 0.06),
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={600}>Total</Typography>
                            <Typography variant="subtitle1" fontWeight={700} color="primary">
                              {totalAmount.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Grid>
        </>
      )}

      {!posMode && (
        <>
          {/* Top Section - Invoice Details*/}
          <Grid size={{ xs: 12, md: 12 }}>
            <Card>
              <CardContent className='py-3.5'>




                <Grid container columnSpacing={3} rowSpacing={4} >

                  {/* Invoice Details Header */}
                  <Grid size={{ xs: 12 }} className='flex flex-col gap-2'>
                    <Box className='flex flex-row gap-1.5 items-center'>
                      <Box className='w-2 h-8 bg-secondaryLight rounded-md' />
                      <Typography variant="caption" fontWeight={500} fontSize='1rem'>
                        Invoice Details
                      </Typography>
                    </Box>
                    <Divider light textAlign='left' width='400px' />

                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Box className="flex flex-row items-center px-3 justify-between bg-tableHeader rounded-md w-full h-full">
                      <Typography variant="caption" className='text-[0.9rem]' color="text.secondary">
                        Invoice Number
                      </Typography>
                      <Typography variant="h6" className='text-[1.1rem] font-medium'>
                        {getValues('invoiceNumber') || ''}
                      </Typography>
                    </Box>
                  </Grid>


                  {/* Invoice Date */}
                  <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
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
                            max: new Date().toISOString().split('T')[0],
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Due Date */}
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                            min: getValues('invoiceDate'),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Payment Method */}
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
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
                      <Icon icon="mdi:bank-plus" width={26} />
                    </CustomIconButton>
                  </Grid>

                  {/* Reference No */}
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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

                  {/* Signature Section */}
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Controller
                        name="signatureId"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.signatureId} variant="outlined" size="small">
                            <InputLabel>Cashier Name</InputLabel>
                            <Select
                              className='h-[39px]'
                              label="Cashier Name"
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
                  </Grid>

                  {/* Notes TextField */}
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Controller
                      name="notes"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          className='overflow-auto scrollbar-thin scrollbar-thumb-primary scrollbar-thumb-opacity-20 scrollbar-thumb-rounded'
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
                                  {notesExpanded ? <Icon icon="mdi:keyboard-arrow-up" width={24} color={theme.palette.primary.main} /> : <Icon icon="mdi:keyboard-arrow-down" width={24} color={theme.palette.primary.main} />}
                                </CustomOriginalIconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Customer */}
                  <Grid size={{ xs: 12, sm: 6, md: 8, lg: 6 }}>
                    <CustomerAutocomplete
                      control={control}
                      errors={errors}
                      customersData={customersData}
                      includeWalkInOption
                      onCustomerChange={(selected) => {
                        if (!selected || selected.isWalkIn || selected._id === walkInCustomerId) {
                          setIsWalkIn(true);
                          setValue('customerId', walkInCustomerId);
                        } else {
                          setIsWalkIn(false);
                        }
                      }}
                    />
                  </Grid>

                  {/* Terms & Conditions */}
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <Button
                      fullWidth className="flex flex-row items-center gap-0 justify-center" variant="text" color="primary" size="small"
                      startIcon={<Icon icon="mdi:file-document-outline" width={24} color={theme.palette.primary.main} />}
                      onClick={handleOpenTermsDialog}
                    >
                      Terms & Conditions
                    </Button>
                  </Grid>



                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* POS & Quick Entry */}
          <Grid size={{ xs: 12, md: 12 }}>
            <Card>
              <CardContent className='py-3.5'>
                <Grid container columnSpacing={3} rowSpacing={3}>
                  <Grid size={{ xs: 12 }} className='flex flex-col gap-2'>
                    <Box className='flex flex-row gap-1.5 items-center'>
                      <Box className='w-2 h-8 bg-primaryLight rounded-md' />
                      <Typography variant="caption" fontWeight={500} fontSize='1rem'>
                        POS & Quick Entry
                      </Typography>
                    </Box>
                    <Divider light textAlign='left' width='400px' />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <ToggleButtonGroup
                      value={quickEntryMode}
                      exclusive
                      onChange={(_, value) => value && setQuickEntryMode(value)}
                      size="small"
                      fullWidth
                    >
                      <ToggleButton value="standard">Standard</ToggleButton>
                      <ToggleButton value="quick">Quick</ToggleButton>
                    </ToggleButtonGroup>
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Box className='flex flex-row gap-2 items-center'>
                      <TextField
                        fullWidth
                        label="Barcode"
                        size="small"
                        value={barcodeDraft}
                        onChange={(e) => setBarcodeDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleBarcodeQuickAdd();
                          }
                        }}
                        placeholder="Enter barcode"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Icon icon="mdi:barcode-scan" width={20} color={theme.palette.primary.main} />
                            </InputAdornment>
                          )
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBarcodeQuickAdd}
                        startIcon={<Icon icon="mdi:plus" width={18} />}
                      >
                        Add
                      </Button>
                    </Box>
                  </Grid>
                  {quickEntryMode === 'quick' && (
                    <>
                      <Grid size={{ xs: 12 }} className='bg-red'>
                        <Box className='flex flex-row flex-wrap gap-2 '>
                          {quickProducts.map((product) => (
                            <Chip
                              key={product._id}
                              label={product.name}
                              color="primary"
                              variant="outlined"
                              onClick={() => handleQuickAddWithTracking(product)}
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Tendered Amount"
                          size="small"
                          value={tenderedAmount}
                          onChange={(e) => setTenderedAmount(e.target.value)}
                          placeholder="Enter tendered amount"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Icon icon="lucide:saudi-riyal" width={18} color={theme.palette.secondary.main} />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Change"
                          size="small"
                          value={changeAmount.toFixed(2)}
                          InputProps={{
                            readOnly: true,
                            startAdornment: (
                              <InputAdornment position="start">
                                <Icon icon="lucide:saudi-riyal" width={18} color={theme.palette.secondary.main} />
                              </InputAdornment>
                            )
                          }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Middle Section - Products Table*/}
          <Grid size={{ xs: 12, lg: 9.5 }}>
            <form onSubmit={handleSubmit(handleFormSubmit, handleError)}>
              <Card>
                <CardContent spacing={12} className='flex flex-col gap-2 px-0 pt-0'>
                  {/* Products Table */}
                  <Box sx={{
                    overflowX: 'auto',
                    '@media (max-width: 1024px)': {
                      marginBottom: 2
                    }
                  }}>
                    <InvoiceItemsTable
                      columns={columns}
                      rows={fields}
                      rowKey={(row, idx) => row.id || idx}
                      addRowButton={addRowButton}
                      emptyContent={emptyContent}
                    />
                  </Box>
                </CardContent>
              </Card>
            </form>
          </Grid>

          {/* Left side totals card */}
          <Grid size={{ xs: 12, lg: 2.5 }}>
            <InvoiceTotals
              control={control}
              handleSubmit={handleSubmit}
              handleFormSubmit={handleFormSubmit}
              handleError={handleError}
            />
          </Grid>
        </>
      )}

      <Dialog
        open={posReceiptOpen}
        onClose={() => setPosReceiptOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ py: 4 }}>
          <Box className="flex flex-col gap-2">
            <Typography variant="h6">Receipt Preview (Mock)</Typography>
            <Typography variant="body2" color="text.secondary">
              Invoice: {posReceiptData?.invoiceNumber || getValues('invoiceNumber')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment: {posReceiptData?.payment_method || watch('payment_method')}
            </Typography>
            <Divider />
            <Box className="flex flex-col gap-1">
              {(posReceiptData?.items || []).map((item, index) => (
                <Box key={`${item.productId}-${index}`} className="flex justify-between">
                  <Typography variant="body2">
                    {item.name || 'Item'} × {item.quantity || 1}
                  </Typography>
                  <Typography variant="body2">
                    {Number(item.amount || 0).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider />
            <Box className="flex justify-between">
              <Typography variant="body2">Total</Typography>
              <Typography variant="body2" fontWeight={600}>
                {Number(posReceiptData?.total || totalAmount).toFixed(2)}
              </Typography>
            </Box>
            <Box className="flex justify-between">
              <Typography variant="body2">Tendered</Typography>
              <Typography variant="body2">{Number(posReceiptData?.tenderedAmount || 0).toFixed(2)}</Typography>
            </Box>
            <Box className="flex justify-between">
              <Typography variant="body2">Change</Typography>
              <Typography variant="body2">{Number(posReceiptData?.changeAmount || 0).toFixed(2)}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setPosReceiptOpen(false)}>
            Close
          </Button>
          <Button variant="outlined" color="secondary" onClick={handlePrintReceipt}>
            Print Receipt
          </Button>
          <Button variant="contained" onClick={handleNewSale}>
            New Sale
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Bank Modal */}
      <BankDetailsDialog
        open={openBankModal}
        onClose={() => setOpenBankModal(false)}
        newBank={newBank}
        setNewBank={setNewBank}
        handleAddBank={handleAddBank}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        autoHideDuration={3000}
      />

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


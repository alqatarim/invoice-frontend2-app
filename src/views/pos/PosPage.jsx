'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomerAutocomplete from '@/components/custom-components/CustomerAutocomplete';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import AppSnackbar from '@/components/shared/AppSnackbar';
import { getPosColumns } from './posColumns';
import PosReceiptDialog from './components/PosReceiptDialog';
import PosAdvancedDrawer from './components/PosAdvancedDrawer';

const formatCurrency = (v) => Number(v || 0).toFixed(2);

const getBranchIdentifiers = (branch) =>
  [branch?.branchId, branch?._id]
    .map((entry) => String(entry || '').trim())
    .filter(Boolean);

const resolveBranchId = (branch) => getBranchIdentifiers(branch)[0] || '';

const PosPage = ({
  initialCustomersData = [],
  initialProductData = [],
  initialTaxRates = [],
  initialInvoiceNumber = '',
  controller,
  canAccessPos,
  canCreateInvoice,
  primaryStore,
}) => {
  const theme = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHeldSales, setShowHeldSales] = useState(false);
  const [quickEntryMode, setQuickEntryMode] = useState('quick');
  const barcodeInputRef = useRef(null);
  const customerInputRef = useRef(null);
  const tenderInputRef = useRef(null);
  const handlers = controller;

  const {
    control,
    watch,
    getValues,
    setValue,
    errors,
    fields,
    banks,
    signOptions,
    paymentMethodOptions,
    quickPayAmounts,
    quickProducts,
    productsCloneData,
    branches,
    activeBranch,
    branchError,
    hasValidSelectedBranch,
    selectedBranchId,
    setSelectedBranchId,
    isWalkIn,
    setIsWalkIn,
    tenderedAmount,
    setTenderedAmount,
    totalAmount,
    changeAmount,
    discountMenu,
    setDiscountMenu,
    taxMenu,
    watchItems,
    posReceiptOpen,
    setPosReceiptOpen,
    posReceiptData,
    heldSales,
    snackbar,
    setSnackbar,
    isSubmitting,
    barcodeDraft,
    setBarcodeDraft,
    handleCustomerChange,
    handleBarcodeQuickAdd,
    handleHoldSale,
    handleLoadHeldSale,
    handleDeleteHeldSale,
    handleResumeLatest,
    handleQuickTenderAmount,
    handleCompleteSale,
    handleNewSale,
    handleQuickAddProduct,
    handleUpdateItemProduct,
    handleClearAppliedPromotion,
    handleClearScaleBarcode,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    handleDeleteItem,
    handleAddEmptyRow,
    updateCalculatedFields,
  } = handlers;

  const rows = Array.isArray(watchItems) ? watchItems : fields;
  const selectedPaymentMethod = watch('payment_method') || 'Cash';
  const isCashPayment = selectedPaymentMethod === 'Cash';
  const selectedCustomerId = watch('customerId') || '';
  const tenderedValue = Number(tenderedAmount || 0);
  const tenderShortfall = Math.max(0, Number((totalAmount - tenderedValue).toFixed(2)));
  const quickTenderOptions = useMemo(() => {
    const nextTotal = Number(totalAmount || 0);
    if (nextTotal <= 0) {
      return quickPayAmounts.slice(0, 4);
    }

    const roundedCandidates = [
      nextTotal,
      Math.ceil(nextTotal),
      Math.ceil(nextTotal / 5) * 5,
      Math.ceil(nextTotal / 10) * 10,
      ...quickPayAmounts,
    ];

    return Array.from(
      new Set(
        roundedCandidates
          .map((value) => Number(Number(value || 0).toFixed(2)))
          .filter((value) => Number.isFinite(value) && value > 0 && value >= nextTotal)
      )
    )
      .sort((left, right) => left - right)
      .slice(0, 5);
  }, [quickPayAmounts, totalAmount]);
  const checkoutSummarySpacer = showHeldSales && heldSales.length > 0 ? '520px' : '360px';
  const hasAllowedStores = branches.length > 0;
  const storeAlertSeverity = !hasAllowedStores ? 'error' : hasValidSelectedBranch ? 'info' : 'warning';
  const activeStoreLabel = activeBranch?.name || (hasAllowedStores ? 'Selection required' : 'Unavailable');
  const tenderHelperState = useMemo(() => {
    if (!isCashPayment) {
      return {
        severity: 'info',
        message: `${selectedPaymentMethod || 'Selected payment'} uses the exact total automatically.`,
      };
    }

    if (!String(tenderedAmount || '').trim()) {
      return {
        severity: 'info',
        message: 'Enter cash received or tap a quick tender amount.',
      };
    }

    if (tenderShortfall > 0) {
      return {
        severity: 'warning',
        message: `Cash tender is short by ${formatCurrency(tenderShortfall)}.`,
      };
    }

    if (changeAmount > 0) {
      return {
        severity: 'success',
        message: `Change due: ${formatCurrency(changeAmount)}.`,
      };
    }

    return {
      severity: 'success',
      message: 'Exact cash received.',
    };
  }, [changeAmount, isCashPayment, selectedPaymentMethod, tenderShortfall, tenderedAmount]);

  const focusBarcodeInput = useCallback(() => {
    if (typeof window === 'undefined') return;

    window.requestAnimationFrame(() => {
      barcodeInputRef.current?.focus?.();
      barcodeInputRef.current?.select?.();
    });
  }, []);

  const focusCustomerInput = useCallback(() => {
    if (typeof window === 'undefined') return;

    setIsWalkIn(false);
    window.requestAnimationFrame(() => {
      customerInputRef.current?.focus?.();
      customerInputRef.current?.select?.();
    });
  }, [setIsWalkIn]);

  const focusTenderInput = useCallback(() => {
    if (typeof window === 'undefined' || !isCashPayment) return;

    window.requestAnimationFrame(() => {
      tenderInputRef.current?.focus?.();
      tenderInputRef.current?.select?.();
    });
  }, [isCashPayment]);

  const handleBarcodeSubmit = useCallback(() => {
    handleBarcodeQuickAdd();
    focusBarcodeInput();
  }, [focusBarcodeInput, handleBarcodeQuickAdd]);

  const handleQuickProductSelect = useCallback((product) => {
    handleQuickAddProduct(product);
    focusBarcodeInput();
  }, [focusBarcodeInput, handleQuickAddProduct]);

  const handleResumeLatestSale = useCallback(() => {
    handleResumeLatest();
    focusBarcodeInput();
  }, [focusBarcodeInput, handleResumeLatest]);

  const handleStartNewSale = useCallback(() => {
    handleNewSale();
    focusBarcodeInput();
  }, [focusBarcodeInput, handleNewSale]);

  const handleCustomerModeChange = useCallback((_, value) => {
    if (!value) return;

    const nextIsWalkIn = value === 'walk-in';
    setIsWalkIn(nextIsWalkIn);

    if (nextIsWalkIn) {
      focusBarcodeInput();
      return;
    }

    if (isWalkIn) {
      setValue('customerId', '');
    }

    window.requestAnimationFrame(() => {
      customerInputRef.current?.focus?.();
      customerInputRef.current?.select?.();
    });
  }, [focusBarcodeInput, isWalkIn, setIsWalkIn, setValue]);

  useEffect(() => {
    if (!hasAllowedStores || !hasValidSelectedBranch || posReceiptOpen) return;

    const focusTimer = window.setTimeout(() => {
      focusBarcodeInput();
    }, 120);

    return () => window.clearTimeout(focusTimer);
  }, [focusBarcodeInput, hasAllowedStores, hasValidSelectedBranch, posReceiptOpen]);

  useEffect(() => {
    if (typeof window === 'undefined' || posReceiptOpen) return undefined;

    const handleShortcutKeyDown = (event) => {
      const key = String(event.key || '').toLowerCase();
      if (event.altKey && key === 'b') {
        event.preventDefault();
        focusBarcodeInput();
        return;
      }

      if (event.altKey && key === 'c') {
        event.preventDefault();
        focusCustomerInput();
        return;
      }

      if (event.altKey && key === 't') {
        event.preventDefault();
        focusTenderInput();
        return;
      }

      if (event.altKey && key === 'e') {
        event.preventDefault();
        if (isCashPayment) {
          handleQuickTenderAmount('exact');
          focusTenderInput();
        }
        return;
      }

      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        handleCompleteSale();
        return;
      }

      const active = document.activeElement;
      const tagName = active?.tagName?.toLowerCase();
      const isEditable =
        ['input', 'textarea', 'select'].includes(tagName) || active?.isContentEditable;

      if (isEditable) return;

      if (!event.altKey) return;

      if (key === 'h') {
        event.preventDefault();
        handleHoldSale();
      } else if (key === 'r') {
        event.preventDefault();
        handleResumeLatestSale();
      }
    };

    window.addEventListener('keydown', handleShortcutKeyDown);

    return () => {
      window.removeEventListener('keydown', handleShortcutKeyDown);
    };
  }, [
    focusBarcodeInput,
    focusCustomerInput,
    focusTenderInput,
    handleQuickTenderAmount,
    handleCompleteSale,
    handleHoldSale,
    handleResumeLatestSale,
    isCashPayment,
    posReceiptOpen,
  ]);

  const posColumns = useMemo(
    () =>
      getPosColumns({
        control,
        errors,
        setValue,
        getValues,
        watchItems,
        productData: initialProductData,
        productsCloneData,
        discountMenu,
        setDiscountMenu,
        taxMenu,
        taxRates: initialTaxRates,
        theme,
        updateCalculatedFields,
        handleUpdateItemProduct,
        handleClearAppliedPromotion,
        handleClearScaleBarcode,
        handleMenuItemClick,
        handleTaxClick,
        handleTaxClose,
        handleTaxMenuItemClick,
        handleDeleteItem,
        handleAddEmptyRow,
        fields,
      }),
    [
      control,
      errors,
      setValue,
      getValues,
      watchItems,
      initialProductData,
      productsCloneData,
      discountMenu,
      setDiscountMenu,
      taxMenu,
      initialTaxRates,
      theme,
      updateCalculatedFields,
      handleUpdateItemProduct,
      handleClearAppliedPromotion,
      handleClearScaleBarcode,
      handleMenuItemClick,
      handleTaxClick,
      handleTaxClose,
      handleTaxMenuItemClick,
      handleDeleteItem,
      handleAddEmptyRow,
      fields,
    ]
  );

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
        Click the Add Row button to start building this sale.
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

  if (!canAccessPos) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="error">You don&apos;t have permission to access POS.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Grid container rowSpacing={4} columnSpacing={3}>
        <Grid size={{ xs: 12, md: 12 }}>

          <div className="flex items-center gap-2">
            <div className="bg-primary/12 text-primary bg-primaryLight w-12 h-12 rounded-full flex items-center justify-center">
              <Icon icon="tabler:file-invoice" fontSize={26} />
            </div>
            <Typography variant="h5" className="font-semibold text-primary">
              Point Of Sale
            </Typography>
          </div>

        </Grid>

        <Grid size={{ xs: 12 }}>
          <Alert severity={storeAlertSeverity} variant="outlined">
            {!hasAllowedStores ? (
              'No assigned store is available for this cashier. POS checkout is blocked until an admin assigns a store.'
            ) : (
              <>
                Active store: <strong>{activeStoreLabel}</strong>. Allowed stores: <strong>{branches.length}</strong>.
                {primaryStore?.name ? ` Primary store: ${primaryStore.name}.` : ''}
                {branchError ? ` ${branchError}` : ''}
              </>
            )}
          </Alert>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className="py-4">
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 1.5 }}>
                  <TextField
                    label="Invoice No"
                    value={watch('invoiceNumber') || initialInvoiceNumber || ''}
                    variant="outlined"
                    fullWidth
                    size="medium"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth variant="outlined" error={Boolean(branchError)}>
                    <InputLabel size="medium">Store</InputLabel>
                    <Select
                      value={selectedBranchId || ''}
                      label="Store"
                      size="medium"
                      onChange={(event) => setSelectedBranchId(event.target.value)}
                      disabled={!hasAllowedStores}
                    >
                      {branches.map((branch) => {
                        const branchValue = resolveBranchId(branch);
                        if (!branchValue) return null;

                        return (
                          <MenuItem key={branchValue} value={branchValue}>
                            {[branch.storeCode, branch.name].filter(Boolean).join(' · ') || branch.name || branchValue}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {branchError ? <FormHelperText>{branchError}</FormHelperText> : null}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth variant="outlined" error={!!errors.payment_method}>
                    <InputLabel size="medium">Payment Method</InputLabel>
                    <Select
                      value={selectedPaymentMethod}
                      label="Payment Method"
                      size="medium"
                      onChange={(event) => setValue('payment_method', event.target.value)}
                    >
                      {paymentMethodOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Box className="flex flex-col gap-1">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Customer Flow
                    </Typography>
                    <ToggleButtonGroup
                      value={isWalkIn ? 'walk-in' : 'customer'}
                      exclusive
                      size="small"
                      fullWidth
                      onChange={handleCustomerModeChange}
                    >
                      <ToggleButton value="walk-in">Walk-in</ToggleButton>
                      <ToggleButton value="customer">Customer</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4.5 }}>
                  {isWalkIn ? (
                    <Box
                      sx={{
                        minHeight: 56,
                        px: 2,
                        py: 1.25,
                        borderRadius: 1.5,
                        border: `1px dashed ${alpha(theme.palette.divider, 0.9)}`,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Walk-in customer
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Keep checkout fast. Switch only when you need a saved customer.
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined" onClick={() => handleCustomerModeChange(null, 'customer')}>
                        Pick Customer
                      </Button>
                    </Box>
                  ) : (
                    <CustomerAutocomplete
                      size="medium"
                      label="Named Customer"
                      placeholder="Search saved customer"
                      inputRef={customerInputRef}
                      control={control}
                      errors={errors}
                      customersData={initialCustomersData}
                      includeWalkInOption={false}
                      onCustomerChange={handleCustomerChange}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 12, md: 0.5 }}>
                  <IconButton
                    color="secondary"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Open more options"
                  // sx={{
                  //   minHeight: 56,
                  //   minWidth: 56,
                  //   borderRadius: 2,
                  //   border: '1px solid',
                  //   borderColor: 'divider',
                  // }}
                  >
                    <Icon icon="mdi:unfold-more-vertical" />
                  </IconButton>
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className="py-4">
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box className="flex flex-col gap-1">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Barcode & Quick Entry
                    </Typography>
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
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box className="flex flex-row gap-2 items-center">
                    <TextField
                      fullWidth
                      label="Scan / Enter Barcode"
                      size="small"
                      value={barcodeDraft}
                      inputRef={barcodeInputRef}
                      onChange={(event) => setBarcodeDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleBarcodeSubmit();
                        }
                      }}
                      placeholder="Scan barcode and press Enter"
                      disabled={!hasValidSelectedBranch}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="mdi:barcode-scan" width={20} color={theme.palette.primary.main} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleBarcodeSubmit}
                      disabled={!hasValidSelectedBranch}
                      startIcon={<Icon icon="mdi:plus" width={18} />}
                    >
                      Add
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleResumeLatestSale}
                      disabled={heldSales.length === 0}
                      startIcon={<Icon icon="mdi:play-circle-outline" width={18} />}
                    >
                      Resume Latest
                    </Button>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Chip size="small" variant="outlined" label="Enter: Add" />
                    <Chip size="small" variant="outlined" label="Ctrl+Enter: Checkout" />
                    <Chip size="small" variant="outlined" label="Alt+B/C/T" />
                    <Chip size="small" variant="outlined" label="Alt+E: Exact" />
                  </Stack>
                </Grid>

                {quickEntryMode === 'quick' ? (
                  <Grid size={{ xs: 12 }}>
                    <Box className="flex flex-row flex-wrap gap-2">
                      {quickProducts.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          No quick-add products are available right now.
                        </Typography>
                      ) : (
                        quickProducts.map((product) => (
                          <Chip
                            key={product._id}
                            label={product.name}
                            color="primary"
                            variant="outlined"
                            onClick={() => handleQuickProductSelect(product)}
                          />
                        ))
                      )}
                    </Box>
                  </Grid>
                ) : null}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ position: 'relative', mb: checkoutSummarySpacer }}>
            <Card>
              <CardContent className="flex flex-col px-0 pt-0">
                <InvoiceItemsTable
                  tableHeadClassName="bg-errorLightest"
                  columns={posColumns}
                  rows={rows}
                  rowKey={(row, i) => row?.key || row?.id || row?.productId || i}
                  addRowButton={addRowButton}
                  emptyContent={emptyContent}
                />
              </CardContent>
            </Card>

            <Box
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 24,
                zIndex: theme.zIndex.appBar + 1,
                width: { xs: 'calc(100% - 32px)', md: 'min(520px, calc(100vw - 48px))' },
                maxWidth: 520,
              }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  width: '100%',
                  ml: 'auto',
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
                  <Grid container spacing={2} alignItems="stretch" direction={{ xs: 'row-reverse', md: 'row-reverse' }}>
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
                        {isCashPayment ? (
                          <Box className="flex flex-col gap-1.5">
                            <TextField
                              label="Tendered Amount"
                              size="small"
                              value={tenderedAmount}
                              inputRef={tenderInputRef}
                              onChange={(event) => setTenderedAmount(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  handleCompleteSale();
                                }
                              }}
                              placeholder="Enter cash received"
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
                              value={formatCurrency(changeAmount)}
                              InputProps={{
                                readOnly: true,
                                startAdornment: (
                                  <InputAdornment position="start" sx={{ color: theme.palette.secondary.main }}>
                                    <Icon icon="lucide:saudi-riyal" width={15} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                            <Alert severity={tenderHelperState.severity} variant="outlined" sx={{ py: 0 }}>
                              {tenderHelperState.message}
                            </Alert>
                            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                              <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleQuickTenderAmount('exact')}
                              >
                                Exact
                              </Button>
                              {quickTenderOptions.map((amount) => (
                                <Button
                                  key={amount}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleQuickTenderAmount(amount)}
                                  disabled={amount === Number(totalAmount.toFixed(2))}
                                >
                                  {formatCurrency(amount)}
                                </Button>
                              ))}
                            </Stack>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 1.5,
                              border: `1px dashed ${alpha(theme.palette.info.main, 0.35)}`,
                              bgcolor: alpha(theme.palette.info.main, 0.05),
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                            }}
                          >
                            <Typography variant="body2" fontWeight={600}>
                              No cash tender required
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {tenderHelperState.message}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
                          <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={<Icon icon="mdi:check-circle-outline" width={18} />}
                            onClick={handleCompleteSale}
                            disabled={isSubmitting || !canCreateInvoice || !hasValidSelectedBranch}
                          >
                            {!canCreateInvoice
                              ? 'No Permission'
                              : isSubmitting
                                ? 'Processing...'
                                : 'Complete Sale'}
                          </Button>

                          <Box className="flex flex-row gap-1.5 items-center">
                            <Button
                              variant="outlined"
                              color="warning"
                              size="small"
                              startIcon={<Icon icon="mdi:pause-circle-outline" width={16} />}
                              onClick={handleHoldSale}
                              disabled={!hasValidSelectedBranch}
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
                                      '&:hover': { backgroundColor: 'action.hover' },
                                    }}
                                    onClick={() => handleLoadHeldSale(sale.id)}
                                  >
                                    <Box className="flex flex-col">
                                      <Typography variant="caption" color="text.secondary">
                                        Hold {String(holdLabel).padStart(2, '0')}
                                      </Typography>
                                      {sale.branchName ? (
                                        <Typography variant="caption" color="text.secondary">
                                          {sale.branchName}
                                        </Typography>
                                      ) : null}
                                      <Typography variant="body2" fontWeight={600}>
                                        {Number(sale.total || 0).toFixed(2)} · {sale.items?.length || 0} items
                                      </Typography>
                                    </Box>
                                    <Button
                                      size="small"
                                      color="error"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleDeleteHeldSale(sale.id);
                                      }}
                                    >
                                      <Icon icon="mdi:trash-can-outline" width={16} />
                                    </Button>
                                  </Box>
                                );
                              })}
                            </Box>
                          </Collapse>
                        </Box>
                      </Box>
                    </Grid>

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
                              {formatCurrency(watch('taxableAmount'))}
                            </Typography>
                          </Box>
                          <Box className="flex justify-between items-center">
                            <Typography variant="body2" color="text.secondary">Discount</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(watch('totalDiscount'))}
                            </Typography>
                          </Box>
                          <Box className="flex justify-between items-center">
                            <Typography variant="body2" color="text.secondary">VAT</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(watch('vat'))}
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
                            {formatCurrency(totalAmount)}
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
      </Grid>

      <PosAdvancedDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        control={control}
        errors={errors}
        setValue={setValue}
        banks={banks}
        signOptions={signOptions}
        heldSales={heldSales}
        activeStoreName={activeBranch?.name || ''}
        onLoadHeldSale={handleLoadHeldSale}
        onDeleteHeldSale={handleDeleteHeldSale}
        onResumeLatest={handleResumeLatestSale}
      />

      <PosReceiptDialog
        open={posReceiptOpen}
        onClose={() => setPosReceiptOpen(false)}
        receiptData={posReceiptData}
        onNewSale={handleStartNewSale}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default PosPage;

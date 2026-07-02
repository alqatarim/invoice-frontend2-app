'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomerAutocomplete from '@/components/custom-components/CustomerAutocomplete';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import { Totals } from '@/components/totals';
import { getPosColumns } from './posColumns';
import PosReceiptDialog from './PosReceiptDialog';
import PosAdvancedDrawer from './PosAdvancedDrawer';

const PosPage = ({
  initialCustomersData = [],
  initialProductData = [],
  initialTaxRates = [],
  initialInvoiceNumber = '',
  controller,
  canAccessPos,
  canCreateInvoice,
  isPermissionsLoading,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
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
    cashierOptions,
    paymentMethodOptions,
    productsCloneData,
    branches,
    activeBranch,
    selectedLocation,
    selectedLocationType,
    branchError,
    hasValidSelectedBranch,
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
    isSubmitting,
    handleCustomerChange,
    handleHoldSale,
    handleLoadHeldSale,
    handleDeleteHeldSale,
    handleCompleteSale,
    handleNewSale,
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
    autoFocusFirstProductCell,
  } = handlers;

  const watchedRows = Array.isArray(watchItems) ? watchItems : [];
  const rows = fields.map((field, index) => ({
    ...(watchedRows[index] || {}),
    _fieldArrayId: field.id,
  }));
  const selectedPaymentMethod = watch('payment_method') || 'Cash';
  const isCashPayment = selectedPaymentMethod === 'Cash';
  const isFormDisabled = isSubmitting;
  const hasAllowedStores = branches.length > 0;
  const storeAlertSeverity = !hasAllowedStores ? 'error' : hasValidSelectedBranch ? 'info' : 'warning';
  const selectedLocationLabel = selectedLocation?.name || (hasAllowedStores ? 'Selection required' : 'Unavailable');
  const storeFieldError = errors.branchId?.message || branchError || '';

  const focusCustomerInput = useCallback(() => {
    if (typeof window === 'undefined') return;

    window.requestAnimationFrame(() => {
      customerInputRef.current?.focus?.();
      customerInputRef.current?.select?.();
    });
  }, []);

  const focusTenderInput = useCallback(() => {
    if (typeof window === 'undefined' || !isCashPayment) return;

    window.requestAnimationFrame(() => {
      tenderInputRef.current?.focus?.();
      tenderInputRef.current?.select?.();
    });
  }, [isCashPayment]);

  const handleStartNewSale = useCallback(() => {
    handleNewSale();
  }, [handleNewSale]);

  useEffect(() => {
    if (typeof window === 'undefined' || posReceiptOpen || isFormDisabled) return undefined;

    const handleShortcutKeyDown = (event) => {
      const key = String(event.key || '').toLowerCase();
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
      }
    };

    window.addEventListener('keydown', handleShortcutKeyDown);

    return () => {
      window.removeEventListener('keydown', handleShortcutKeyDown);
    };
  }, [
    focusCustomerInput,
    focusTenderInput,
    handleCompleteSale,
    handleHoldSale,
    isFormDisabled,
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
        disabled: isFormDisabled,
        autoFocusFirstProductCell,
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
      isFormDisabled,
      autoFocusFirstProductCell,
    ]
  );

  const addRowButton = (
    <CustomIconButton
      className='flex flex-row items-center justify-center gap-3 max-sm:is-full sm:w-[13rem]'
      variant="tonal"
      skin='lighter'
      color="primary"
      size="medium"
      onClick={handleAddEmptyRow}
      disabled={isFormDisabled}
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
        disabled={isFormDisabled}
      >
        Add Item
      </Button>
    </Box>
  );

  if (isPermissionsLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">Loading POS permissions...</Typography>
        </CardContent>
      </Card>
    );
  }

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
          <Card>
            <CardContent className="py-4">
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 2 }}>
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
                  <TextField
                    fullWidth
                    label="Store"
                    size="medium"
                    value={selectedLocation?.name || ''}
                    placeholder="Choose a location from the top bar"
                    error={Boolean(storeFieldError)}
                    InputProps={{
                      readOnly: true,
                      endAdornment: storeFieldError ? (
                        <InputAdornment position="end">
                          <Tooltip title={storeFieldError} arrow>
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-flex',
                                color: 'error.main',
                                cursor: 'help',
                              }}
                            >
                              <Icon icon="mdi:alert-circle-outline" width={18} />
                            </Box>
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <FormControl fullWidth variant="outlined" error={!!errors.payment_method}>
                    <InputLabel size="medium">Payment Method</InputLabel>
                    <Select
                      value={selectedPaymentMethod}
                      label="Payment Method"
                      size="medium"
                      onChange={(event) => setValue('payment_method', event.target.value)}
                      disabled={isFormDisabled}
                    >
                      {paymentMethodOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4.5 }}>
                  <CustomerAutocomplete
                    size="medium"
                    label="Customer"
                    placeholder="Keep walk-in or search saved customer"
                    inputRef={customerInputRef}
                    control={control}
                    errors={errors}
                    customersData={initialCustomersData}
                    includeWalkInOption
                    onCustomerChange={handleCustomerChange}
                    disabled={isFormDisabled}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 0.5 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                  <IconButton
                    color="secondary"
                    onClick={() => setDrawerOpen(true)}
                    aria-label="Open more options"
                    disabled={isFormDisabled}
                  >
                    <Icon icon="mdi:unfold-more-vertical" />
                  </IconButton>
                </Grid>

                <Grid size={{ xs: 12 }} sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    startIcon={<Icon icon="mdi:unfold-more-vertical" width={18} />}
                    onClick={() => setDrawerOpen(true)}
                    disabled={isFormDisabled}
                  >
                    More options
                  </Button>
                </Grid>

              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ position: 'relative', mb: isMobile ? 0 : '360px' }}>
            <Card>
              <CardContent className="flex flex-col px-0 pt-0">
                <Box sx={{ overflowX: 'auto' }}>
                <InvoiceItemsTable
                  tableHeadClassName="bg-errorLightest"
                  columns={posColumns}
                  rows={rows}
                  rowKey={(row, i) => row?._fieldArrayId || i}
                  addRowButton={addRowButton}
                  emptyContent={emptyContent}
                />
                </Box>
              </CardContent>
            </Card>

            <Totals
              layout="floating"
              control={control}
              showTenderFields={isCashPayment}
              disabled={isSubmitting}
              tenderedAmount={tenderedAmount}
              tenderedInputRef={tenderInputRef}
              onTenderedAmountChange={setTenderedAmount}
              onTenderedKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleCompleteSale();
                }
              }}
              onExactTenderedAmount={amount => setTenderedAmount(Number(amount || 0).toFixed(2))}
              changeAmount={changeAmount}
              showHoldActions
              heldCount={heldSales.length}
              onHold={handleHoldSale}
              onHeld={() => setDrawerOpen(true)}
              holdDisabled={!hasValidSelectedBranch}
              primaryActionLabel="Complete Sale"
              primaryActionDisabled={isSubmitting || !canCreateInvoice || !hasValidSelectedBranch}
              onPrimaryAction={handleCompleteSale}
            />
          </Box>
        </Grid>
      </Grid >

      <PosAdvancedDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        control={control}
        errors={errors}
        setValue={setValue}
        banks={banks}
        cashierOptions={cashierOptions}
        heldSales={heldSales}
        activeStoreName={activeBranch?.name || ''}
        onLoadHeldSale={handleLoadHeldSale}
        onDeleteHeldSale={handleDeleteHeldSale}
        disabled={isFormDisabled}
      />

      <PosReceiptDialog
        open={posReceiptOpen}
        onClose={handleStartNewSale}
        receiptData={posReceiptData}
        onNewSale={handleStartNewSale}
      />

    </>
  );
};

export default PosPage;

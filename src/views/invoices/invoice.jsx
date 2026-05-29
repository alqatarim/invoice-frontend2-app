'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
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
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomerAutocomplete from '@/components/custom-components/CustomerAutocomplete';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import { Totals } from '@/components/totals';
import { getInvoiceFormColumns } from '@/views/invoices/invoiceColumns';
import InvoiceOptionsDrawer from './InvoiceOptionsDrawer';
import InvoiceCompletedDialog from './InvoiceCompletedDialog';

const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const HELD_INVOICES_KEY = 'invoiceForm.heldInvoices';

const InvoicePosLikeForm = ({
  controller,
  customersData = [],
  productData = [],
  resetOnCompleteClose = true,
}) => {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [heldInvoices, setHeldInvoices] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const parsed = JSON.parse(window.localStorage.getItem(HELD_INVOICES_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  });
  const [completedDialogOpen, setCompletedDialogOpen] = useState(false);
  const [completedInvoiceData, setCompletedInvoiceData] = useState(null);
  const watchedInvoiceNumber = useWatch({ control: controller.control, name: 'invoiceNumber' });
  const watchedTenderedAmount = useWatch({ control: controller.control, name: 'tenderedAmount' });
  const watchedTotalAmount = useWatch({ control: controller.control, name: 'TotalAmount' });
  const storeFieldError = controller.errors.branchId?.message || controller.branchSelectionError || '';
  const totalAmount = toNumber(watchedTotalAmount);
  const tenderedValue = toNumber(watchedTenderedAmount);
  const balanceDue = Math.max(0, Number((totalAmount - tenderedValue).toFixed(2)));
  const displayInvoiceNumber = watchedInvoiceNumber || controller.displayInvoiceNumber || '';

  const persistHeldInvoices = nextHeldInvoices => {
    setHeldInvoices(nextHeldInvoices);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HELD_INVOICES_KEY, JSON.stringify(nextHeldInvoices));
    }
  };

  const resetInvoiceDraft = nextInvoiceNumber => {
    controller.clearItems?.();
    controller.handleAddEmptyRow?.();
    controller.setValue('referenceNo', '');
    controller.setValue('notes', '');
    controller.setValue('termsAndCondition', '');
    controller.setValue('bank', '');
    controller.setValue('roundOff', false);
    controller.setValue('tenderedAmount', 0);
    controller.setValue('changeAmount', 0);

    const today = new Date().toISOString().split('T')[0];
    controller.setValue('invoiceDate', today);
    controller.setValue('dueDate', today);

    if (nextInvoiceNumber) {
      controller.setValue('invoiceNumber', nextInvoiceNumber);
    }
  };

  const handleHoldInvoice = () => {
    const current = controller.getValues();
    const items = Array.isArray(current.items) ? current.items.filter(item => item?.productId) : [];

    if (!items.length) return;

    const snapshot = {
      id: Date.now(),
      holdNumber: (heldInvoices[0]?.holdNumber || 0) + 1,
      ...current,
      items,
      total: totalAmount,
      createdAt: new Date().toISOString(),
    };

    persistHeldInvoices([snapshot, ...heldInvoices].slice(0, 10));
    resetInvoiceDraft();
  };

  const handleLoadHeldInvoice = invoiceId => {
    const heldInvoice = heldInvoices.find(item => item.id === invoiceId);
    if (!heldInvoice) return;

    controller.clearItems?.();
    (heldInvoice.items || []).forEach((item, index) => {
      controller.appendItem?.({
        ...item,
        key: `${Date.now()}-${index}`,
      });
    });

    Object.entries(heldInvoice).forEach(([key, value]) => {
      if (['id', 'holdNumber', 'items', 'total', 'createdAt'].includes(key)) return;
      controller.setValue(key, value);
    });

    persistHeldInvoices(heldInvoices.filter(item => item.id !== invoiceId));
  };

  const handleDeleteHeldInvoice = invoiceId => {
    persistHeldInvoices(heldInvoices.filter(item => item.id !== invoiceId));
  };

  const openCompletedInvoiceDialog = (result, submittedData) => {
    const resultData = result?.data?.data || result?.data || {};
    const current = submittedData || controller.getValues();
    const invoiceData = {
      ...current,
      ...resultData,
      status: resultData?.status || current.status || 'DRAFTED',
      items: Array.isArray(current.items) ? current.items.filter(item => item?.productId) : [],
      customerId: customersData.find(customer => customer?._id === current.customerId) || current.customerId,
      bank: (controller.banks || []).find(bank => bank?._id === current.bank) || current.bank,
      paidAmount: current.tenderedAmount || 0,
    };

    setCompletedInvoiceData(invoiceData);
    setCompletedDialogOpen(true);
  };

  const handleCompleteInvoice = async (event) => {
    event?.preventDefault?.();

    const submit = controller.handleSubmit(async (data) => {
      const result = await controller.handleFormSubmit(data);

      if (result?.success) {
        openCompletedInvoiceDialog(result, data);
      }

      return result;
    }, controller.handleError);

    return submit(event);
  };

  const handleNewInvoice = () => {
    setCompletedDialogOpen(false);
    setCompletedInvoiceData(null);

    if (resetOnCompleteClose) {
      resetInvoiceDraft(completedInvoiceData?.nextInvoiceNumber || '');
    }
  };

  useEffect(() => {
    controller.setValue('changeAmount', 0, { shouldDirty: false });
  }, [controller.setValue, tenderedValue, totalAmount]);

  const columns = useMemo(
    () =>
      getInvoiceFormColumns({
        control: controller.control,
        errors: controller.errors,
        setValue: controller.setValue,
        getValues: controller.getValues,
        watchItems: controller.watchItems,
        productData,
        productsCloneData: controller.productsCloneData,
        discountMenu: controller.discountMenu,
        setDiscountMenu: controller.setDiscountMenu,
        taxMenu: controller.taxMenu,
        taxRates: controller.taxRates,
        theme,
        updateCalculatedFields: controller.updateCalculatedFields,
        handleUpdateItemProduct: controller.handleUpdateItemProduct,
        handleClearAppliedPromotion: controller.handleClearAppliedPromotion,
        handleClearScaleBarcode: controller.handleClearScaleBarcode,
        handleDeleteItem: controller.handleDeleteItem,
        handleAddEmptyRow: controller.handleAddEmptyRow,
        handleMenuItemClick: controller.handleMenuItemClick,
        handleTaxClick: controller.handleTaxClick,
        handleTaxClose: controller.handleTaxClose,
        handleTaxMenuItemClick: controller.handleTaxMenuItemClick,
        fields: controller.fields,
        autoFocusFirstProductCell: controller.autoFocusFirstProductCell,
      }),
    [
      controller.autoFocusFirstProductCell,
      controller.control,
      controller.discountMenu,
      controller.errors,
      controller.fields,
      controller.getValues,
      controller.handleAddEmptyRow,
      controller.handleClearAppliedPromotion,
      controller.handleClearScaleBarcode,
      controller.handleDeleteItem,
      controller.handleMenuItemClick,
      controller.handleTaxClick,
      controller.handleTaxClose,
      controller.handleTaxMenuItemClick,
      controller.handleUpdateItemProduct,
      controller.productsCloneData,
      controller.setDiscountMenu,
      controller.setValue,
      controller.taxMenu,
      controller.taxRates,
      controller.updateCalculatedFields,
      controller.watchItems,
      productData,
      theme,
    ]
  );

  const addRowButton = (
    <CustomIconButton
      className="flex flex-row items-center justify-center gap-3 w-[13rem]"
      variant="tonal"
      skin="lighter"
      color="primary"
      size="medium"
      onClick={controller.handleAddEmptyRow}
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
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
        Click the Add Row button to start building this invoice.
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<Icon icon="mingcute:add-fill" width={16} />}
        size="small"
        sx={{ mt: 1 }}
        onClick={controller.handleAddEmptyRow}
      >
        Add Item
      </Button>
    </Box>
  );

  return (
    <Grid container rowSpacing={4} columnSpacing={3}>
      <Grid size={{ xs: 12 }}>
        <div className="flex items-center gap-2">
          <div className="bg-primary/12 text-primary bg-primaryLight w-12 h-12 rounded-full flex items-center justify-center">
            <Icon icon="tabler:file-invoice" fontSize={26} />
          </div>
          <Typography variant="h5" className="font-semibold text-primary">
            {controller.title}
          </Typography>
        </div>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className="py-4">
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Invoice No"
                  value={displayInvoiceNumber}
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
                  value={controller.selectedLocation?.name || ''}
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

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomerAutocomplete
                  size="medium"
                  label="Customer"
                  placeholder="Keep walk-in or search saved customer"
                  control={controller.control}
                  errors={controller.errors}
                  customersData={customersData}
                  includeWalkInOption
                  onCustomerChange={controller.handleCustomerChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="payment_method"
                  control={controller.control}
                  render={({ field }) => (
                    <FormControl fullWidth variant="outlined" error={!!controller.errors.payment_method}>
                      <InputLabel>Payment Method</InputLabel>
                      <Select {...field} label="Payment Method" size="medium">
                        {(controller.paymentMethods || []).map(method => (
                          <MenuItem key={method.value} value={method.value}>
                            {method.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {controller.errors.payment_method ? (
                        <FormHelperText error>{controller.errors.payment_method.message}</FormHelperText>
                      ) : null}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="invoiceDate"
                  control={controller.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Invoice Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      size="medium"
                      error={!!controller.errors.invoiceDate}
                      inputProps={{ max: new Date().toISOString().split('T')[0] }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Controller
                  name="dueDate"
                  control={controller.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Due Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      size="medium"
                      error={!!controller.errors.dueDate}
                      inputProps={{ min: controller.getValues('invoiceDate') }}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2.5 }}>
                <Controller
                  name="cashierId"
                  control={controller.control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!controller.errors.cashierId} variant="outlined">
                      <InputLabel>Cashier</InputLabel>
                      <Select
                        label="Cashier"
                        size="medium"
                        value={field.value || ''}
                        onChange={event => {
                          const selected = (controller.cashierOptions || []).find(
                            cashier => cashier._id === event.target.value
                          );
                          controller.handleCashierSelection(selected, field);
                        }}
                      >
                        {(controller.cashierOptions || []).length === 0 ? (
                          <MenuItem value="" disabled>
                            No cashiers available
                          </MenuItem>
                        ) : (
                          (controller.cashierOptions || []).map(option => (
                            <MenuItem key={option._id} value={option._id}>
                              {option.label || option.fullName || option.email || 'Cashier'}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {controller.errors.cashierId ? (
                        <FormHelperText>{controller.errors.cashierId.message}</FormHelperText>
                      ) : null}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 0.5 }}>
                <IconButton
                  color="secondary"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open more options"
                >
                  <Icon icon="mdi:unfold-more-vertical" />
                </IconButton>
              </Grid>

            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <InvoiceOptionsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        controller={controller}
        activeStoreName={controller.selectedLocation?.name || ''}
        heldInvoices={heldInvoices}
        onLoadHeldInvoice={handleLoadHeldInvoice}
        onDeleteHeldInvoice={handleDeleteHeldInvoice}
      />

      <Grid size={{ xs: 12 }}>
        <Box sx={{ position: 'relative', mb: '280px' }}>
          <Card>
            <CardContent className="flex flex-col px-0 pt-0">
              <Box sx={{ overflowX: 'auto' }}>
                <InvoiceItemsTable
                  tableHeadClassName="bg-errorLightest"
                  columns={columns}
                  rows={controller.fields}
                  rowKey={(row, index) => row.id || index}
                  addRowButton={addRowButton}
                  emptyContent={emptyContent}
                />
              </Box>
            </CardContent>
          </Card>

          <Totals
            layout="floating"
            control={controller.control}
            showTenderFields
            tenderedFieldName="tenderedAmount"
            onTenderedAmountChange={() => controller.setValue('changeAmount', 0)}
            tenderedPlaceholder="Amount received"
            tenderedError={controller.errors.tenderedAmount}
            tenderedHelperText={controller.errors.tenderedAmount?.message}
            onExactTenderedAmount={amount => {
              controller.setValue('tenderedAmount', Number(amount || 0).toFixed(2), {
                shouldValidate: true,
                shouldDirty: true,
              });
              controller.setValue('changeAmount', 0);
            }}
            changeLabel="Balance Due"
            changeAmount={balanceDue}
            showHoldActions
            heldCount={heldInvoices.length}
            onHold={handleHoldInvoice}
            onHeld={() => setDrawerOpen(true)}
            primaryActionLabel="Complete"
            onPrimaryAction={handleCompleteInvoice}
          />
        </Box>
      </Grid>
      <InvoiceCompletedDialog
        open={completedDialogOpen}
        onClose={handleNewInvoice}
        invoiceData={completedInvoiceData}
        onNewInvoice={handleNewInvoice}
      />
    </Grid>
  );
};

export default InvoicePosLikeForm;

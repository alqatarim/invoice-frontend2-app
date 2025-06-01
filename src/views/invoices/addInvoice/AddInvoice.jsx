import React, { useState, useEffect } from 'react';
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
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  FormHelperText,
  InputAdornment,
  Menu,
  Divider,
} from '@mui/material';
import CustomOriginalIconButton from '@core/components/mui/CustomOriginalIconButton';
import { Clear } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomerAutocomplete from '@/components/custom-components/CustomerAutocomplete';
import useAddInvoiceHandlers from '@/handlers/invoices/addInvoice/useAddInvoiceHandlers';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import InvoiceTotals from '@/components/custom-components/InvoiceTotals';
import { calculateInvoiceTotals } from '@/utils/invoiceTotals';

const AddInvoice = ({ customersData, productData, taxRates, initialBanks, signatures, onSave, enqueueSnackbar, closeSnackbar, invoiceNumber }) => {
  const theme = useTheme();
  const [openBankModal, setOpenBankModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handlers = useAddInvoiceHandlers({
    invoiceNumber,
    productData,
    initialBanks,
    signatures,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank: null,
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
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
    notesExpanded,
    termsDialogOpen,
    tempTerms,
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow,
    handleAddBank,
    handleSignatureSelection,
    handleFormSubmit: originalHandleFormSubmit,
    handleError,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    handleToggleNotes,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
  } = handlers;

  // Wrap handleFormSubmit to ensure invoiceNumber is included
  const handleFormSubmit = (data) => {
    if (!data.invoiceNumber) {
      data.invoiceNumber = invoiceNumber;
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

  // Define columns for InvoiceItemsTable (copied from EditInvoice)
  const columns = [
    {
      key: 'product',
      label: <Typography variant="overline" fontWeight={500} color="text.secondary">Product/Service</Typography>,
      width: '24%',
      align: 'center',
      renderCell: (item, index) => (
        <Controller
          name={`items.${index}.productId`}
          control={control}
          render={({ field }) => (
            <FormControl fullWidth size="small" error={!!errors.items?.[index]?.productId}>
              <Select
                className={`py-0.5 min-h-[0] [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&.MuiOutlinedInput-input]:py-0.3 px-2.5`}
                size='small'
                sx={{ '& .MuiOutlinedInput-input': { py: 0.3, pl: 2.5 } }}
                {...field}
                displayEmpty
                value={field.value || ''}
                onChange={(e) => {
                  const productId = e.target.value;
                  const previousProductId = field.value;
                  handleUpdateItemProduct(index, productId, previousProductId);
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Select Product
                      </Typography>
                    );
                  }
                  return (
                    <Box className='flex flex-col gap-0' sx={{ overflow: 'hidden' }}>
                      <Typography variant="body1" color="text.primary" className='whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]'>
                        {watchItems[index]?.name}
                      </Typography>
                      <Typography variant="caption" fontSize={12} color='text.secondary'>
                        Unit: {watchItems[index]?.units}
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
      )
    },
    {
      key: 'quantity',
      label: <Typography variant="overline" fontWeight={500} color="text.secondary">Quantity</Typography>,
      width: '12%',
      align: 'center',
      renderCell: (item, index) => (
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
                className="[&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
                inputProps={{
                  min: 1,
                  step: 1,
                  onKeyDown: (e) => { if (e.key === '.') e.preventDefault(); }
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
      )
    },
    {
      key: 'rate',
      label: <Typography variant="overline" fontWeight={500} color="text.secondary">Rate</Typography>,
      width: '19%',
      align: 'center',
      renderCell: (item, index) => (
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
                className="min-w-[90px] [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
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
                  onKeyDown: (e) => { if (e.key === '.') e.preventDefault(); }
                }}
                onChange={e => {
                  const rate = Number(e.target.value);
                  setValue(`items.${index}.rate`, rate);
                  setValue(`items.${index}.form_updated_rate`, (Number(rate) / Number(watchItems[index]?.quantity)).toFixed(4))
                  setValue(`items.${index}.form_updated_discount`, Number(watchItems[index]?.discount))
                  setValue(`items.${index}.form_updated_discounttype`, Number(watchItems[index]?.discountType))
                  setValue(`items.${index}.isRateFormUpadted`, 'true')
                  const item = getValues(`items.${index}`);
                  updateCalculatedFields(index, item, setValue);
                }}
                error={!!errors.items?.[index]?.rate}
              />
            </FormControl>
          )}
        />
      )
    },
    {
      key: 'discount',
      label: <Typography variant="overline" fontWeight={500} color="text.secondary">Discount</Typography>,
      width: '19%',
      align: 'center',
      renderCell: (item, index) => {
        const watched = watchItems[index] || {};
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CustomIconButton
              variant="tonal"
              onClick={e => setDiscountMenu({ anchorEl: e.currentTarget, rowIndex: index })}
              color="primary"
              skin="lightest"
              size="small"
              className="min-w-[32px] min-h-[36px] px-2 py-0"
            >
              {Number(watched.discountType) === 2 ? (
                <Icon icon="lucide:percent" color={theme.palette.primary.light} width={19} />
              ) : Number(watched.discountType) === 3 ? (
                <Icon icon="lucide:saudi-riyal" color={theme.palette.primary.light} width={30} />
              ) : ''}
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
                      className="min-w-[110px] [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
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
                      className="min-w-[110px] [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
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
              className='[&_.MuiMenuItem-root]:py-1'
            >
              <MenuItem
                onClick={() => {
                  handleMenuItemClick(index, 2);
                  setDiscountMenu({ anchorEl: null, rowIndex: null });
                }}
                className='flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight'
              >
                <Typography variant="overline">Percentage</Typography>
                <Box className='flex flex-row items-center gap-1'>
                  <Icon icon="material-symbols:percent-rounded" width="20" color={theme.palette.primary.main} />
                </Box>
              </MenuItem>
              <MenuItem
                className='flex flex-row gap-4 items-center justify-between [&:hover]:bg-primaryLight'
                onClick={() => {
                  handleMenuItemClick(index, 3);
                  setDiscountMenu({ anchorEl: null, rowIndex: null });
                }}
              >
                <Typography variant="overline">Fixed Amount</Typography>
                <Box className='flex flex-row items-center gap-1'>
                  <Icon icon="lucide:saudi-riyal" width="20" color={theme.palette.primary.main} />
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        );
      }
    },
    {
      key: 'vat',
      label: <Typography variant="overline" fontWeight={500} color="text.secondary">VAT</Typography>,
      width: '16%',
      align: 'center',
      renderCell: (item, index) => {
        const watched = watchItems[index] || {};
        return (
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
                {watched.taxInfo && typeof watched.taxInfo === 'object' ? (watched.taxInfo.taxRate || 0) : 0}%
              </Typography>
              <Icon icon="garden:chevron-down-fill-12" color={theme.palette.primary.light} width={11} />
            </CustomIconButton>
            <Box className='flex flex-row items-center gap-0.5'>
              <Icon icon="lucide:saudi-riyal" color={theme.palette.secondary.light} width={18} />
              <Typography variant='body1'>
                {isNaN(Number(watched.tax)) ? '0.00' : Number(watched.tax).toFixed(2)}
              </Typography>
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
          </Box>
        );
      }
    },
    {
      key: 'amount',
      label: <Typography variant="overline" fontWeight={500} color="text.secondary">Amount</Typography>,
      width: '13%',
      align: 'center',
      renderCell: (item, index) => {
        const watched = watchItems[index] || {};
        return (
          <Box className='flex flex-row items-center gap-0.5'>
            <Icon icon="lucide:saudi-riyal" color={theme.palette.secondary.light} width={18} />
            <Typography variant="body1" className='font-medium whitespace-nowrap'>
              {isNaN(Number(watched.amount)) ? '0.00' : Number(watched.amount).toFixed(2)}
            </Typography>
          </Box>
        );
      }
    },
    {
      key: 'actions',
      label: '',
      width: '4%',
      align: 'center',
      renderCell: (item, index) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDeleteItem(index)}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey && index === fields.length - 1) {
              e.preventDefault();
              handleAddEmptyRow();
            }
          }}
          tabIndex={0}
        >
          <Icon icon="ic:twotone-delete" width={20} color={theme.palette.error.main} />
        </IconButton>
      )
    },
  ];

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
      <Grid item xs={12} md={12}>
        <Typography variant="h5" sx={{ fontWeight: 500 }}>
          Add Invoice
        </Typography>
      </Grid>
      {/* Top Section - Invoice Details */}
      <Grid item xs={12} md={12}>
        <Card>
          <CardContent className='py-3.5'>
            <Grid container columnSpacing={3} rowSpacing={4} >
              {/* Invoice Details Header */}
              <Grid item xs={12} className='flex flex-col gap-2'>
                <Box className='flex flex-row gap-1.5 items-center'>
                  <Box className='w-2 h-8 bg-secondaryLight rounded-md' />
                  <Typography variant="caption" fontWeight={500} fontSize='1rem'>
                    Invoice Details
                  </Typography>
                </Box>
                <Divider light textAlign='left' width='400px' />
              </Grid>
              {/* Invoice Number (read-only, styled like EditInvoice) */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Box className="flex flex-row items-center px-3 justify-between bg-tableHeader rounded-md w-full h-full">
                  <Typography variant="caption" className='text-[0.9rem]' color="text.secondary">
                    Invoice Number
                  </Typography>
                  <Typography variant="h6" className='text-[1.1rem] font-medium'>
                    {invoiceNumber || ''}
                  </Typography>
                </Box>
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
                        max: new Date().toISOString().split('T')[0],
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
                        min: getValues('invoiceDate'),
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
              <Grid item xs={12} sm={6} md={4} lg={3} className="flex flex-row gap-1 justify-between">
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
              {/* Signature Section */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
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
              </Grid>
              {/* Notes TextField */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
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
              <Grid item xs={12} sm={6} md={8} lg={6}>
                <CustomerAutocomplete control={control} errors={errors} customersData={customersData} />
              </Grid>
              {/* Terms & Conditions */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
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
      {/* Middle Section - Products Table */}
      <Grid item xs={12} md={9.5}>
        <form onSubmit={handleSubmit(handleFormSubmit, handleError)}>
          <Card>
            <CardContent spacing={12} className='flex flex-col gap-2 px-0 pt-0'>
              <Box>
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
      <Grid item xs={12} md={2.5}>
        <InvoiceTotals
          control={control}
          handleSubmit={handleSubmit}
          handleFormSubmit={handleFormSubmit}
          handleError={handleError}
        />
      </Grid>
      {/* Add Bank Modal */}
      <BankDetailsDialog
        open={openBankModal}
        onClose={() => setOpenBankModal(false)}
        newBank={newBank}
        setNewBank={setNewBank}
        handleAddBank={handleAddBank}
      />
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
        <Box className='flex flex-row justify-end gap-2 px-5 pb-4 pt-1'>
          <Button onClick={handleCloseTermsDialog} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveTerms} color="primary" variant="contained">
            Save Changes
          </Button>
        </Box>
      </Dialog>
    </Grid>
  );
};

export default AddInvoice;
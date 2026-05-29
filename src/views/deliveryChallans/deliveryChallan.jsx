'use client';

import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  TextField,
     Drawer,
     Tooltip,
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
  FormHelperText,
  InputAdornment,
  Menu,
  Divider,
} from '@mui/material';
import CustomOriginalIconButton from '@core/components/mui/CustomOriginalIconButton';
import { Clear } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { calculateInvoiceTotals } from '@/utils/salesTotals';
import { formatDateForInput } from '@/utils/dateUtils';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomerAutocomplete from '@/components/custom-components/CustomerAutocomplete';
import useDeliveryChallanHandlers from './handler';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import { Totals } from '@/components/totals';
import { useGlobalLocationScope } from '@/contexts/GlobalLocationContext';

const DeliveryChallan = ({
    mode = 'edit',
    id,
    deliveryChallanData,
    customersData,
    productData,
    taxRates,
    initialBanks,
    employees,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
  }) => {

  // Use new composing hook for all handlers and state
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    errors,
    fields,
    watchItems,
    watchRoundOff,
    watchCustomer,
    productsCloneData,
    banks,
    newBank,
    setNewBank,
    signOptions,
    // UI states and handlers
    notesExpanded,
    termsDialogOpen,
    tempTerms,
          setTempTerms,
          addressDialogOpen,
    tempAddress,
    setTempAddress,
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
    handleFormSubmit,
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
    handleOpenAddressDialog,
    handleCloseAddressDialog,
    handleSaveAddress,
  } = useDeliveryChallanHandlers({
    deliveryChallanData,
    productData,
    initialBanks,
    employees,
    onSave,
    enqueueSnackbar,
    closeSnackbar
  });

  // UI-only state (dialogs, expanded notes, etc.)
  const [openBankModal, setOpenBankModal] = useState(false);
     const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
     const { selectedLocation } = useGlobalLocationScope();

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

  // Handle customer change
  useEffect(() => {
    if (watchCustomer && customersData) {
      const customer = customersData.find(c => c._id === watchCustomer);
      if (customer?.shippingAddress) {
        const address = `${customer.shippingAddress.addressLine1 || ''}, ${customer.shippingAddress.city || ''}, ${customer.shippingAddress.state || ''} ${customer.shippingAddress.pincode || ''}`.trim();
        setValue('address', address);
      }
    }
  }, [watchCustomer, customersData, setValue]);

  // Define columns for InvoiceItemsTable
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
                        {watchItems[index].name}
                      </Typography>
                      <Typography variant="caption" fontSize={12} color='text.secondary'>
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
                    <Icon icon="lucide:saudi-riyal" width={22} color={theme.palette.secondary.main} />
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
                  setValue(`items.${index}.form_updated_rate`, Number(rate || 0).toFixed(4))
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
          <CustomIconButton className="flex flex-row items-center justify-center gap-3 w-[13rem]" variant="tonal" skin="lighter" color="primary" size="medium" onClick={handleAddEmptyRow}>
               <Icon icon="mingcute:add-fill" color={theme.palette.primary.main} width={16} />
               <Typography variant="button" color="primary.main" fontSize={14}>Add Row</Typography>
          </CustomIconButton>
     );
     const emptyContent = (
          <Box className="flex flex-col items-center justify-center py-6 gap-2 text-center">
               <Icon icon="mdi:cart-outline" width={36} color={theme.palette.primary.main} />
               <Typography variant="h6" color="text.primary">No Items Added Yet</Typography>
               <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>Click the Add Item button to add items to your delivery challan.</Typography>
               <Button variant="outlined" color="primary" startIcon={<Icon icon="mingcute:add-fill" width={16} />} size="small" sx={{ mt: 1 }} onClick={handleAddEmptyRow}>Add Item</Button>
          </Box>
     );
     return (
          <Grid container rowSpacing={4} columnSpacing={3}>
               <Grid size={{ xs: 12 }}><div className="flex items-center gap-2"><div className="bg-primary/12 text-primary bg-primaryLight w-12 h-12 rounded-full flex items-center justify-center"><Icon icon="tabler:truck-delivery" fontSize={26} /></div><Typography variant="h5" className="font-semibold text-primary">{mode === 'edit' ? 'Edit Delivery Challan' : 'Add Delivery Challan'}</Typography></div></Grid>
               <Grid size={{ xs: 12 }}><Card><CardContent className="py-4"><Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 3 }}><TextField label="Delivery Challan No" value={deliveryChallanData?.deliveryChallanId || getValues('deliveryChallanNumber') || ''} variant="outlined" fullWidth size="medium" InputProps={{ readOnly: true }} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth label="Store" size="medium" value={selectedLocation?.name || ''} placeholder="Choose a location from the top bar" InputProps={{ readOnly: true, endAdornment: !selectedLocation?.name ? (<InputAdornment position="end"><Tooltip title="Choose a location from the top bar" arrow><Box component="span" sx={{ display: 'inline-flex', color: 'error.main', cursor: 'help' }}><Icon icon="mdi:alert-circle-outline" width={18} /></Box></Tooltip></InputAdornment>) : null }} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><CustomerAutocomplete control={control} errors={errors} customersData={customersData} /></Grid>
                    
                    <Grid size={{ xs: 12, md: 3 }}><Controller name="deliveryChallanDate" control={control} render={({ field }) => <TextField {...field} label="Delivery Challan Date" type="date" variant="outlined" fullWidth size="medium" error={!!errors.deliveryChallanDate} inputProps={{ max: new Date().toISOString().split('T')[0] }} InputLabelProps={{ shrink: true }} />} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><Controller name="dueDate" control={control} render={({ field }) => <TextField {...field} label="Due Date" type="date" variant="outlined" fullWidth size="medium" error={!!errors.dueDate} inputProps={{ min: getValues('deliveryChallanDate') }} InputLabelProps={{ shrink: true }} />} /></Grid>
                    <Grid size={{ xs: 12, md: 2.5 }}><Controller name="employee" control={control} render={({ field }) => (<FormControl fullWidth error={!!errors.employee} variant="outlined"><InputLabel>Employee</InputLabel><Select label="Employee" size="medium" value={field.value || ''} onChange={event => { const selected = (signOptions || []).find(option => option._id === event.target.value); handleSignatureSelection(selected, field); }}>{(signOptions || []).length === 0 ? <MenuItem value="" disabled>No employees available</MenuItem> : (signOptions || []).map(option => <MenuItem key={option._id} value={option._id}>{option.employeeName || option.signatureName || option.label || option.fullName || option.email || 'Employee'}</MenuItem>)}</Select>{errors.employee ? <FormHelperText>{errors.employee.message}</FormHelperText> : null}</FormControl>)} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><Button fullWidth variant="outlined" color="primary" onClick={handleOpenAddressDialog}>Shipping Address</Button></Grid>
                    <Grid size={{ xs: 12, md: 0.5 }}><IconButton color="secondary" onClick={() => setDrawerOpen(true)} aria-label="Open more options"><Icon icon="mdi:unfold-more-vertical" /></IconButton></Grid>
               </Grid></CardContent></Card></Grid>
               <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, px: 6, py: 5 } }}><Box className="flex items-center justify-between"><Box className="flex items-center gap-2"><Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}><Icon icon="mdi:cog-outline" width={20} color={theme.palette.primary.main} /></Box><Typography variant="h6" sx={{ fontWeight: 600 }}>Delivery Challan Options</Typography></Box><IconButton onClick={() => setDrawerOpen(false)} size="small"><Icon icon="mdi:close" width={18} /></IconButton></Box><Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 9, mt: 5 }}><Box className="flex flex-col gap-3"><Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Reference & Bank</Typography><Box className="flex flex-row justify-between gap-1"><Controller name="bank" control={control} render={({ field }) => (<FormControl fullWidth size="medium" error={!!errors.bank}><InputLabel>Select Bank</InputLabel><Select {...field} label="Select Bank" value={field.value || ''}><MenuItem value=""><em>None</em></MenuItem>{(banks || []).map(bank => <MenuItem key={bank._id} value={bank._id}>{bank.bankName || bank.name || 'Bank'}</MenuItem>)}</Select>{errors.bank ? <FormHelperText>{errors.bank.message}</FormHelperText> : null}</FormControl>)} /><CustomIconButton color="primary" size="medium" variant="tonal" skin="lighter" onClick={() => setOpenBankModal(true)}><Icon icon="mdi:bank-plus" width={24} /></CustomIconButton></Box><Controller name="referenceNo" control={control} render={({ field }) => <TextField {...field} fullWidth size="medium" label="Reference No" error={!!errors.referenceNo} helperText={errors.referenceNo?.message} />} /></Box><Box className="flex flex-col gap-3"><Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Notes & Terms</Typography><Controller name="notes" control={control} render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} size="medium" label="Notes" error={!!errors.notes} helperText={errors.notes?.message} />} /><Controller name="termsAndCondition" control={control} render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} size="medium" label="Terms & Conditions" error={!!errors.termsAndCondition} helperText={errors.termsAndCondition?.message} />} /><Button fullWidth variant="text" color="primary" startIcon={<Icon icon="mdi:file-document-outline" width={22} />} onClick={handleOpenTermsDialog}>Open Terms Editor</Button></Box></Box></Drawer>
               <Grid size={{ xs: 12 }}><Box sx={{ position: 'relative', mb: '280px' }}><Card><CardContent className="flex flex-col px-0 pt-0"><Box sx={{ overflowX: 'auto' }}><InvoiceItemsTable tableHeadClassName="bg-errorLightest" columns={columns} rows={fields} rowKey={(row, index) => row.id || index} addRowButton={addRowButton} emptyContent={emptyContent} /></Box></CardContent></Card><Totals
            layout="floating"
            control={control}
            primaryActionLabel={mode === 'edit' ? 'Update' : 'Complete'}
            onPrimaryAction={handleSubmit(handleFormSubmit, handleError)}
          /></Box></Grid>
               <BankDetailsDialog open={openBankModal} onClose={() => setOpenBankModal(false)} newBank={newBank} setNewBank={setNewBank} handleAddBank={handleAddBank} />
               <Dialog open={termsDialogOpen} onClose={handleCloseTermsDialog} maxWidth="sm" fullWidth><Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04), py: 3, px: 5 }}><Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>Terms and Conditions</Typography></Box><DialogContent sx={{ py: 5, px: 5 }}><TextField value={tempTerms || ''} onChange={event => setTempTerms(event.target.value)} fullWidth multiline rows={5} variant="filled" placeholder="Enter your standard terms and conditions (payment terms, delivery terms, warranty information, etc.)" InputProps={{ endAdornment: String(tempTerms || '').trim() !== '' && (<InputAdornment position="end"><IconButton onClick={handleCloseTermsDialog} edge="end" title="Clear terms and conditions" size="small"><Clear /></IconButton></InputAdornment>) }} /></DialogContent><Box className="flex flex-row justify-end gap-2 px-5 pb-4 pt-1"><Button onClick={handleCloseTermsDialog} variant="outlined" color="secondary">Cancel</Button><Button onClick={handleSaveTerms} color="primary" variant="contained">Save Changes</Button></Box></Dialog>
               <Dialog open={addressDialogOpen} onClose={handleCloseAddressDialog} maxWidth="sm" fullWidth><Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04), py: 3, px: 5 }}><Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>Shipping Address</Typography></Box><DialogContent sx={{ py: 5, px: 5 }}><TextField value={tempAddress} onChange={event => setTempAddress(event.target.value)} fullWidth multiline rows={4} variant="filled" placeholder="Enter shipping address (street, city, state, postal code)" InputProps={{ endAdornment: tempAddress.trim() !== '' && (<InputAdornment position="end"><IconButton onClick={() => setTempAddress('')} edge="end" title="Clear address" size="small"><Clear /></IconButton></InputAdornment>) }} /></DialogContent><Box className="flex flex-row justify-end gap-2 px-5 pb-4 pt-1"><Button onClick={handleCloseAddressDialog} variant="outlined" color="secondary">Cancel</Button><Button onClick={handleSaveAddress} color="primary" variant="contained">Save Address</Button></Box></Dialog>
          </Grid>
     );
};

export default DeliveryChallan;

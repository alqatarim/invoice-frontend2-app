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
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import { TotalsTwo } from '@/components/totals';
import { useGlobalLocationScope } from '@/contexts/GlobalLocationContext';

const DeliveryChallan = ({
  mode = 'add',
  id,
  deliveryChallanData,
  customersData = [],
  taxRates = [],
  handlers,
  columnsFactory,
  disabled = false,
}) => {
  const theme = useTheme();
  const { selectedLocation } = useGlobalLocationScope();
  const [openBankModal, setOpenBankModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    productData,
    banks,
    signOptions,
    newBank,
    setNewBank,
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
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow,
    handleAddBank,
    handleSignatureSelection,
    handleFormSubmit,
    handleError,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
    handleOpenAddressDialog,
    handleCloseAddressDialog,
    handleSaveAddress,
  } = handlers;

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
  }, [setValue, watchItems, watchRoundOff]);

  // Handle customer change
  useEffect(() => {
    if (watchCustomer && customersData) {
      const customer = customersData.find(c => c._id === watchCustomer);
      if (customer?.shippingAddress) {
        const shipping = customer.shippingAddress;
        const address = `${shipping.addressLine1 || ''}, ${shipping.city || ''}, ${shipping.state || ''} ${shipping.pincode || ''}`.trim();
        setValue('address', address);
        setValue('deliveryAddress', {
          name: customer.name || shipping.name || '',
          addressLine1: shipping.addressLine1 || '',
          addressLine2: shipping.addressLine2 || '',
          city: shipping.city || '',
          state: shipping.state || '',
          pincode: shipping.pincode || '',
          country: shipping.country || '',
        });
      }
    }
  }, [watchCustomer, customersData, setValue]);

  const columns = columnsFactory({
    theme,
    control,
    errors,
    fields,
    watchItems,
    productsCloneData,
    productData,
    taxRates,
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    setValue,
    getValues,
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    disabled,
  });
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
        <Grid size={{ xs: 12, md: 3 }}><Controller name="employee" control={control} render={({ field }) => (<FormControl fullWidth variant="outlined" error={!!errors.employee}><InputLabel>Employee</InputLabel><Select {...field} label="Employee" size="medium" value={field.value || ''} onChange={(event) => { const selected = (signOptions || []).find(employee => employee._id === event.target.value); handleSignatureSelection(selected, field); }}><MenuItem value=""><em>None</em></MenuItem>{(signOptions || []).map(employee => <MenuItem key={employee._id} value={employee._id}>{employee.employeeName || employee.signatureName || employee.fullName || employee.email || 'Employee'}</MenuItem>)}</Select></FormControl>)} /></Grid>
        <Grid size={{ xs: 12, md: 3 }}><Button fullWidth variant="outlined" color="primary" onClick={handleOpenAddressDialog}>Shipping Address</Button></Grid>
        <Grid size={{ xs: 12, md: 3 }}><IconButton color="secondary" onClick={() => setDrawerOpen(true)} aria-label="Open more options"><Icon icon="mdi:unfold-more-vertical" /></IconButton></Grid>
      </Grid></CardContent></Card></Grid>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, px: 6, py: 5 } }}><Box className="flex items-center justify-between"><Box className="flex items-center gap-2"><Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}><Icon icon="mdi:cog-outline" width={20} color={theme.palette.primary.main} /></Box><Typography variant="h6" sx={{ fontWeight: 600 }}>Delivery Challan Options</Typography></Box><IconButton onClick={() => setDrawerOpen(false)} size="small"><Icon icon="mdi:close" width={18} /></IconButton></Box><Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 9, mt: 5 }}><Box className="flex flex-col gap-3"><Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Reference & Bank</Typography><Box className="flex flex-row justify-between gap-1"><Controller name="bank" control={control} render={({ field }) => (<FormControl fullWidth size="medium" error={!!errors.bank}><InputLabel>Select Bank</InputLabel><Select {...field} label="Select Bank" value={field.value || ''}><MenuItem value=""><em>None</em></MenuItem>{(banks || []).map(bank => <MenuItem key={bank._id} value={bank._id}>{bank.bankName || bank.name || 'Bank'}</MenuItem>)}</Select></FormControl>)} /><CustomIconButton color="primary" size="medium" variant="tonal" skin="lighter" onClick={() => setOpenBankModal(true)}><Icon icon="mdi:bank-plus" width={24} /></CustomIconButton></Box><Controller name="referenceNo" control={control} render={({ field }) => <TextField {...field} fullWidth size="medium" label="Reference No" error={!!errors.referenceNo} />} /></Box><Box className="flex flex-col gap-3"><Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Notes & Terms</Typography><Controller name="notes" control={control} render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} size="medium" label="Notes" error={!!errors.notes} />} /><Controller name="termsAndCondition" control={control} render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} size="medium" label="Terms & Conditions" error={!!errors.termsAndCondition} />} /><Button fullWidth variant="text" color="primary" startIcon={<Icon icon="mdi:file-document-outline" width={22} />} onClick={handleOpenTermsDialog}>Open Terms Editor</Button></Box></Box></Drawer>
      <Grid size={{ xs: 12 }}><Box sx={{ position: 'relative', mb: '280px' }}><Card><CardContent className="flex flex-col px-0 pt-0"><Box sx={{ overflowX: 'auto' }}><InvoiceItemsTable tableHeadClassName="bg-errorLightest" columns={columns} rows={fields} rowKey={(row, index) => row.id || index} addRowButton={addRowButton} emptyContent={emptyContent} /></Box></CardContent></Card><TotalsTwo
        layout="floating"
        control={control}
        primaryActionLabel={mode === 'edit' ? 'Update' : 'Complete'}
        onPrimaryAction={handleSubmit(handleFormSubmit, handleError)}
        disabled={disabled}
      /></Box></Grid>
      <BankDetailsDialog open={openBankModal} onClose={() => setOpenBankModal(false)} newBank={newBank} setNewBank={setNewBank} handleAddBank={handleAddBank} />
      <Dialog open={termsDialogOpen} onClose={handleCloseTermsDialog} maxWidth="sm" fullWidth><Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04), py: 3, px: 5 }}><Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>Terms and Conditions</Typography></Box><DialogContent sx={{ py: 5, px: 5 }}><TextField value={tempTerms || ''} onChange={event => setTempTerms(event.target.value)} fullWidth multiline rows={5} variant="filled" placeholder="Enter your standard terms and conditions (payment terms, delivery terms, warranty information, etc.)" InputProps={{ endAdornment: String(tempTerms || '').trim() !== '' && (<InputAdornment position="end"><IconButton onClick={handleCloseTermsDialog} edge="end" title="Clear terms and conditions" size="small"><Clear /></IconButton></InputAdornment>) }} /></DialogContent><Box className="flex flex-row justify-end gap-2 px-5 pb-4 pt-1"><Button onClick={handleCloseTermsDialog} variant="outlined" color="secondary">Cancel</Button><Button onClick={handleSaveTerms} color="primary" variant="contained">Save Changes</Button></Box></Dialog>
      <Dialog open={addressDialogOpen} onClose={handleCloseAddressDialog} maxWidth="sm" fullWidth><Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04), py: 3, px: 5 }}><Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>Shipping Address</Typography></Box><DialogContent sx={{ py: 5, px: 5 }}><TextField value={tempAddress} onChange={event => setTempAddress(event.target.value)} fullWidth multiline rows={4} variant="filled" placeholder="Enter shipping address (street, city, state, postal code)" InputProps={{ endAdornment: tempAddress.trim() !== '' && (<InputAdornment position="end"><IconButton onClick={() => setTempAddress('')} edge="end" title="Clear address" size="small"><Clear /></IconButton></InputAdornment>) }} /></DialogContent><Box className="flex flex-row justify-end gap-2 px-5 pb-4 pt-1"><Button onClick={handleCloseAddressDialog} variant="outlined" color="secondary">Cancel</Button><Button onClick={handleSaveAddress} color="primary" variant="contained">Save Address</Button></Box></Dialog>
    </Grid>
  );
};

export default DeliveryChallan;

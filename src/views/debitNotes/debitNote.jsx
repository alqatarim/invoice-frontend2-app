import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Drawer,
  FormControl,
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
import { Clear } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import { Totals } from '@/components/totals';
import { useGlobalLocationScope } from '@/contexts/GlobalLocationContext';
import VendorAutocomplete from '@/components/custom-components/VendorAutocomplete';
import { calculateDebitNoteTotals } from '@/utils/debitNoteTotals';

const DebitNote = ({ mode = 'add', title = 'Add Debit Note', documentNumber = '', recordId = '', vendorsData, taxRates, handlers, columnsFactory }) => {
  const theme = useTheme();
  const { selectedLocation } = useGlobalLocationScope();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openBankModal, setOpenBankModal] = useState(false);

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
    termsDialogOpen,
    tempTerms,
    setTempTerms,
    discountMenu,
    setDiscountMenu,
    taxMenu,
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
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
  } = handlers;

  const handleFormSubmit = data => {
    if (mode === 'edit') {
      if (!data.id) data.id = recordId;
    } else {
      if (!data.debitNoteNumber) data.debitNoteNumber = documentNumber;
    }

    return originalHandleFormSubmit(data);
  };

  useEffect(() => {
    if (!watchItems) return;
    const { taxableAmount, totalDiscount, vat, TotalAmount, roundOffValue } = calculateDebitNoteTotals(watchItems, watchRoundOff);
    setValue('taxableAmount', taxableAmount);
    setValue('totalDiscount', totalDiscount);
    setValue('vat', vat);
    setValue('TotalAmount', TotalAmount);
    setValue('roundOffValue', roundOffValue);
  }, [setValue, watchItems, watchRoundOff]);

  const columns = columnsFactory({
    control,
    errors,
    fields,
    watchItems,
    productsCloneData,
    taxRates,
    discountMenu,
    setDiscountMenu,
    taxMenu,
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
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>Click the Add Item button to add items to your debit note.</Typography>
      <Button variant="outlined" color="primary" startIcon={<Icon icon="mingcute:add-fill" width={16} />} size="small" sx={{ mt: 1 }} onClick={handleAddEmptyRow}>Add Item</Button>
    </Box>
  );

  return (
    <Grid container rowSpacing={4} columnSpacing={3}>
      <Grid size={{ xs: 12 }}>
        <div className="flex items-center gap-2">
          <div className="bg-primary/12 text-primary bg-primaryLight w-12 h-12 rounded-full flex items-center justify-center">
            <Icon icon="tabler:file-minus" fontSize={26} />
          </div>
          <Typography variant="h5" className="font-semibold text-primary">{title}</Typography>
        </div>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className="py-4">
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField label="Debit Note No" value={documentNumber || getValues('purchaseOrderNumber') || getValues('debitNoteNumber') || getValues('salesReturnNumber') || ''} variant="outlined" fullWidth size="medium" InputProps={{ readOnly: true }} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Store"
                  size="medium"
                  value={selectedLocation?.name || ''}
                  placeholder="Choose a location from the top bar"
                  InputProps={{
                    readOnly: true,
                    endAdornment: !selectedLocation?.name ? (
                      <InputAdornment position="end">
                        <Tooltip title="Choose a location from the top bar" arrow>
                          <Box component="span" sx={{ display: 'inline-flex', color: 'error.main', cursor: 'help' }}>
                            <Icon icon="mdi:alert-circle-outline" width={18} />
                          </Box>
                        </Tooltip>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}><VendorAutocomplete control={control} errors={errors} vendorsData={vendorsData} /></Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Controller name="payment_method" control={control} render={({ field }) => (
                  <FormControl fullWidth variant="outlined" error={!!errors.payment_method}>
                    <InputLabel>Payment Method</InputLabel>
                    <Select {...field} label="Payment Method" size="medium" value={field.value || ''}>
                      {(paymentMethods || []).map(method => <MenuItem key={method.value} value={method.value}>{method.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Controller name="purchaseOrderDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Debit Note Date" type="date" variant="outlined" fullWidth size="medium" error={!!errors.purchaseOrderDate} inputProps={{ max: new Date().toISOString().split('T')[0] }} InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Controller name="dueDate" control={control} render={({ field }) => (
                  <TextField {...field} label="Due Date" type="date" variant="outlined" fullWidth size="medium" error={!!errors.dueDate} inputProps={{ min: getValues('purchaseOrderDate') }} InputLabelProps={{ shrink: true }} />
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 2.5 }}>
                <Controller name="employee" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.employee} variant="outlined">
                    <InputLabel>Employee</InputLabel>
                    <Select label="Employee" size="medium" value={field.value || ''} onChange={event => {
                      const selected = (signOptions || []).find(option => option._id === event.target.value);
                      handleSignatureSelection(selected, field);
                    }}>
                      {(signOptions || []).length === 0 ? <MenuItem value="" disabled>No employees available</MenuItem> : (signOptions || []).map(option => <MenuItem key={option._id} value={option._id}>{option.employeeName || option.signatureName || option.label || option.fullName || option.email || 'Employee'}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
              </Grid>
              <Grid size={{ xs: 12, md: 0.5 }}>
                <IconButton color="secondary" onClick={() => setDrawerOpen(true)} aria-label="Open more options">
                  <Icon icon="mdi:unfold-more-vertical" />
                </IconButton>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, px: 6, py: 5 } }}>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <Icon icon="mdi:cog-outline" width={20} color={theme.palette.primary.main} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Debit Note Options</Typography>
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} size="small"><Icon icon="mdi:close" width={18} /></IconButton>
        </Box>
        <Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 9, mt: 5 }}>
          <Box className="flex flex-col gap-3">
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Reference & Bank</Typography>
            <Box className="flex flex-row justify-between gap-1">
              <Controller name="bank" control={control} render={({ field }) => (
                <FormControl fullWidth size="medium" error={!!errors.bank}>
                  <InputLabel>Select Bank</InputLabel>
                  <Select {...field} label="Select Bank" value={field.value || ''}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {(banks || []).map(bank => <MenuItem key={bank._id} value={bank._id}>{bank.bankName || bank.name || 'Bank'}</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
              <CustomIconButton color="primary" size="medium" variant="tonal" skin="lighter" onClick={() => setOpenBankModal(true)}>
                <Icon icon="mdi:bank-plus" width={24} />
              </CustomIconButton>
            </Box>
            <Controller name="referenceNo" control={control} render={({ field }) => <TextField {...field} fullWidth size="medium" label="Reference No" error={!!errors.referenceNo} />} />
          </Box>
          <Box className="flex flex-col gap-3">
            <Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Notes & Terms</Typography>
            <Controller name="notes" control={control} render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} size="medium" label="Notes" error={!!errors.notes} />} />
            <Controller name="termsAndCondition" control={control} render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} size="medium" label="Terms & Conditions" error={!!errors.termsAndCondition} />} />
            <Button fullWidth variant="text" color="primary" startIcon={<Icon icon="mdi:file-document-outline" width={22} />} onClick={handleOpenTermsDialog}>Open Terms Editor</Button>
          </Box>
        </Box>
      </Drawer>

      <Grid size={{ xs: 12 }}>
        <Box sx={{ position: 'relative', mb: '280px' }}>
          <Card>
            <CardContent className="flex flex-col px-0 pt-0">
              <Box sx={{ overflowX: 'auto' }}>
                <InvoiceItemsTable tableHeadClassName="bg-errorLightest" columns={columns} rows={fields} rowKey={(row, index) => row.id || index} addRowButton={addRowButton} emptyContent={emptyContent} />
              </Box>
            </CardContent>
          </Card>
          <Totals
            layout="floating"
            control={control}
            primaryActionLabel={mode === 'edit' ? 'Update' : 'Complete'}
            onPrimaryAction={handleSubmit(handleFormSubmit, handleError)}
          />
        </Box>
      </Grid>

      <BankDetailsDialog open={openBankModal} onClose={() => setOpenBankModal(false)} newBank={newBank} setNewBank={setNewBank} handleAddBank={handleAddBank} />

      <Dialog open={termsDialogOpen} onClose={handleCloseTermsDialog} maxWidth="sm" fullWidth>
        <Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04), py: 3, px: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>Terms and Conditions</Typography>
        </Box>
        <DialogContent sx={{ py: 5, px: 5 }}>
          <TextField value={tempTerms || ''} onChange={event => setTempTerms(event.target.value)} fullWidth multiline rows={5} variant="filled" placeholder="Enter your standard terms and conditions (payment terms, delivery terms, warranty information, etc.)" InputProps={{ endAdornment: String(tempTerms || '').trim() !== '' && (
            <InputAdornment position="end"><IconButton onClick={handleCloseTermsDialog} edge="end" title="Clear terms and conditions" size="small"><Clear /></IconButton></InputAdornment>
          ) }} />
        </DialogContent>
        <Box className="flex flex-row justify-end gap-2 px-5 pb-4 pt-1">
          <Button onClick={handleCloseTermsDialog} variant="outlined" color="secondary">Cancel</Button>
          <Button onClick={handleSaveTerms} color="primary" variant="contained">Save Changes</Button>
        </Box>
      </Dialog>
    </Grid>
  );
};

export default DebitNote;

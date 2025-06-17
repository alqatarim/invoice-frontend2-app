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
import VendorAutocomplete from '@/components/custom-components/VendorAutocomplete';
import useAddDebitNoteHandlers from '@/handlers/debitNotes/addDebitNote/useAddDebitNoteHandlers';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import DebitNoteItemsTable from '@/components/custom-components/DebitNoteItemsTable';
import DebitNoteTotals from '@/components/custom-components/DebitNoteTotals';
import { calculateDebitNoteTotals } from '@/utils/debitNoteTotals';

const AddDebitNote = ({ vendorsData, productData, taxRates, initialBanks, signatures, onSave, enqueueSnackbar, closeSnackbar, debitNoteNumber }) => {
  const theme = useTheme();
  const [openBankModal, setOpenBankModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handlers = useAddDebitNoteHandlers({
    debitNoteNumber,
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

  // Wrap handleFormSubmit to ensure debitNoteNumber is included
  const handleFormSubmit = (data) => {
    if (!data.debitNoteNumber) {
      data.debitNoteNumber = debitNoteNumber;
    }
    return originalHandleFormSubmit(data);
  };

  useEffect(() => {
    if (watchItems) {
      const { taxableAmount, totalDiscount, vat, TotalAmount, roundOffValue } = calculateDebitNoteTotals(
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

  // Define columns for DebitNoteItemsTable
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
                  setValue(`items.${index}.form_updated_rate`, (Number(rate) / Number(watchItems[index]?.quantity || 1)).toFixed(4))
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
      key: 'discountValue',
      label: <Typography variant="overline" fontWeight={500} color="text.secondary">Discount</Typography>,
      width: '15%',
      align: 'center',
      renderCell: (item, index) => (
        <Box className="flex items-center gap-1 min-w-[90px]">
          <Controller
            name={`items.${index}.discountValue`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                variant="outlined"
                placeholder="0"
                size="small"
                className="flex-1 [&_input::-webkit-outer-spin-button]:hidden [&_input::-webkit-inner-spin-button]:hidden [&_.MuiOutlinedInput-notchedOutline]:border-secondaryLight [&:hover_.MuiOutlinedInput-notchedOutline]:border-secondary [&:focus-within_.MuiOutlinedInput-notchedOutline]:border-primary [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary"
                inputProps={{
                  min: 0,
                  step: 1,
                  onKeyDown: (e) => { if (e.key === '.') e.preventDefault(); }
                }}
                onChange={e => {
                  const discountValue = Number(e.target.value);
                  setValue(`items.${index}.discountValue`, discountValue);
                  const item = getValues(`items.${index}`);
                  updateCalculatedFields(index, { ...item, discountValue }, setValue);
                }}
              />
            )}
          />
          <Button
            variant="text"
            size="small"
            onClick={(e) => handleMenuItemClick(e, index)}
            className="min-w-[40px] px-2 py-1"
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.22)}`,
              borderRadius: 1,
              fontSize: '0.75rem',
            }}
          >
            {watchItems[index]?.discountType === 1 ? '%' : '$'}
          </Button>
        </Box>
      )
    },
    {
      key: 'tax',
      label: <Typography variant="overline" fontWeight={500} color="text.secondary">Tax</Typography>,
      width: '15%',
      align: 'center',
      renderCell: (item, index) => (
        <Button
          variant="text"
          size="small"
          onClick={(e) => handleTaxClick(e, index)}
          className="min-w-[60px] px-2 py-1 capitalize"
          sx={{
            border: `1px solid ${alpha(theme.palette.divider, 0.22)}`,
            borderRadius: 1,
            fontSize: '0.75rem',
          }}
        >
          {watchItems[index]?.taxInfo ? `${watchItems[index]?.taxInfo?.name} (${watchItems[index]?.taxInfo?.taxRate}%)` : 'Select'}
        </Button>
      )
    },
    {
      key: 'amount',
      label: <Typography variant="overline" fontWeight={500} color="text.secondary">Amount</Typography>,
      width: '15%',
      align: 'center',
      renderCell: (item, index) => (
        <Box className="flex items-center gap-1 justify-end min-w-[80px]">
          <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
          <Typography variant="body2" color="text.primary" className="font-medium">
            {Number(watchItems[index]?.amount || 0).toFixed(2)}
          </Typography>
        </Box>
      )
    },
    {
      key: 'action',
      label: '',
      width: '5%',
      align: 'center',
      renderCell: (item, index) => (
        <IconButton
          size="small"
          onClick={() => handleDeleteItem(index)}
          className="text-error"
          disabled={fields.length <= 1}
        >
          <Icon icon="tabler:trash" fontSize={18} />
        </IconButton>
      )
    }
  ];

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className="flex justify-start items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Icon icon="tabler:file-minus" className="text-white text-2xl" />
          </div>
          <div>
            <Typography variant="h5" className="font-semibold text-primary">
              Add Debit Note
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a new debit note
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-6'>
        <Grid container spacing={6}>
          {/* Vendor Selection */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <Typography variant='h6' className='font-semibold text-textSecondary'>
                  Vendor Details
                </Typography>
                <VendorAutocomplete
                  control={control}
                  errors={errors}
                  vendorsData={vendorsData}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Debit Note Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <Typography variant='h6' className='font-semibold text-textSecondary'>
                  Debit Note Details
                </Typography>
                <div className='flex flex-col gap-4'>
                  <Controller
                    name='debitNoteNumber'
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label='Debit Note Number'
                        placeholder='DN-001'
                        error={!!error}
                        helperText={error?.message}
                        InputProps={{ readOnly: true }}
                      />
                    )}
                  />
                  <Controller
                    name='purchaseOrderDate'
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='date'
                        label='Date'
                        error={!!error}
                        helperText={error?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                  <Controller
                    name='dueDate'
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='date'
                        label='Due Date'
                        error={!!error}
                        helperText={error?.message}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Items Table */}
        <Card>
          <CardContent>
            <DebitNoteItemsTable
              columns={columns}
              items={watchItems}
              onAddRow={handleAddEmptyRow}
            />
          </CardContent>
        </Card>

        {/* Totals */}
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            {/* Notes and Terms */}
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <div className='flex items-center justify-between'>
                  <Typography variant='h6' className='font-semibold text-textSecondary'>
                    Additional Information
                  </Typography>
                  <IconButton size='small' onClick={handleToggleNotes}>
                    <Icon icon={notesExpanded ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
                  </IconButton>
                </div>

                {notesExpanded && (
                  <div className='flex flex-col gap-4'>
                    <Controller
                      name='notes'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={3}
                          label='Notes'
                          placeholder='Additional notes...'
                        />
                      )}
                    />
                    <div className='flex items-center gap-2'>
                      <Controller
                        name='termsAndCondition'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={2}
                            label='Terms & Conditions'
                            placeholder='Terms and conditions...'
                          />
                        )}
                      />
                      <IconButton
                        size='small'
                        onClick={handleOpenTermsDialog}
                        className='self-start mt-2'
                      >
                        <Icon icon='tabler:edit' />
                      </IconButton>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <DebitNoteTotals control={control} />
          </Grid>
        </Grid>

        {/* Bank and Signature */}
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <Typography variant='h6' className='font-semibold text-textSecondary'>
                  Bank Details
                </Typography>
                <Controller
                  name='bankId'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Select Bank</InputLabel>
                      <Select {...field} label='Select Bank'>
                        {banks.map(bank => (
                          <MenuItem key={bank._id} value={bank._id}>
                            {bank.bankName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
                <Button
                  variant='outlined'
                  startIcon={<Icon icon='tabler:plus' />}
                  onClick={() => setOpenBankModal(true)}
                >
                  Add New Bank
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <Typography variant='h6' className='font-semibold text-textSecondary'>
                  Signature
                </Typography>
                <Controller
                  name='signatureId'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Select Signature</InputLabel>
                      <Select
                        {...field}
                        label='Select Signature'
                        onChange={(e) => handleSignatureSelection(e.target.value)}
                      >
                        {signOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <div className='flex gap-4 justify-end'>
          <Button variant='outlined' size='large'>
            Cancel
          </Button>
          <Button variant='contained' size='large' type='submit'>
            Save Debit Note
          </Button>
        </div>
      </form>

      {/* Discount Menu */}
      <Menu
        anchorEl={discountMenu.anchorEl}
        open={Boolean(discountMenu.anchorEl)}
        onClose={() => setDiscountMenu({ anchorEl: null, index: null })}
      >
        <MenuItem onClick={() => handleMenuItemClick(null, discountMenu.index, 0)}>$</MenuItem>
        <MenuItem onClick={() => handleMenuItemClick(null, discountMenu.index, 1)}>%</MenuItem>
      </Menu>

      {/* Tax Menu */}
      <Menu
        anchorEl={taxMenu.anchorEl}
        open={Boolean(taxMenu.anchorEl)}
        onClose={handleTaxClose}
      >
        {taxRates.map(tax => (
          <MenuItem
            key={tax._id}
            onClick={() => handleTaxMenuItemClick(tax, taxMenu.index)}
          >
            {tax.name} ({tax.taxRate}%)
          </MenuItem>
        ))}
      </Menu>

      {/* Terms Dialog */}
      <Dialog open={termsDialogOpen} onClose={handleCloseTermsDialog} maxWidth='md' fullWidth>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            label='Terms & Conditions'
            value={tempTerms}
            onChange={(e) => setTempTerms(e.target.value)}
          />
          <div className='flex gap-2 justify-end mt-4'>
            <Button onClick={handleCloseTermsDialog}>Cancel</Button>
            <Button variant='contained' onClick={handleSaveTerms}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Modal */}
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
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          className='w-full'
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddDebitNote;
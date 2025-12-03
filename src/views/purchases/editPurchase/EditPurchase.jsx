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
import useEditPurchaseHandlers from '@/handlers/purchases/editPurchase/useEditPurchaseHandlers';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import InvoiceTotals from '@/components/custom-components/InvoiceTotals';
import { calculatePurchaseInvoiceTotals } from '@/utils/purchaseTotals';
import { getEditPurchaseColumns } from './EditPurchaseColumns';

const EditPurchase = ({ vendorsData, productData, taxRates, initialBanks, signatures, onSave, enqueueSnackbar, closeSnackbar, purchaseData }) => {
     const theme = useTheme();
     const [openBankModal, setOpenBankModal] = useState(false);
     const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });




     const handlers = useEditPurchaseHandlers({
          purchaseData,
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
          setTempTerms,
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

     // Wrap handleFormSubmit to ensure purchaseId is included
     const handleFormSubmit = (data) => {
          if (!data.id) {
               data.id = purchaseData._id;
          }
          return originalHandleFormSubmit(data);
     };

     useEffect(() => {
          if (watchItems) {
               const { taxableAmount, totalDiscount, vat, TotalAmount, roundOffValue } = calculatePurchaseInvoiceTotals(
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

     // Get columns configuration for InvoiceItemsTable
     const columns = getEditPurchaseColumns({
          control,
          errors,
          fields,
          watchItems,
          productsCloneData,
          taxRates,
          setValue,
          getValues,
          updateCalculatedFields,
          handleUpdateItemProduct,
          handleDeleteItem,
          handleAddEmptyRow,
          discountMenu,
          setDiscountMenu,
          taxMenu,
          handleMenuItemClick,
          handleTaxClick,
          handleTaxClose,
          handleTaxMenuItemClick,
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
                    Click the 'Add Item' button to add items to your purchase
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
               <Grid size={{ xs: 12, md: 12 }}>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                         Edit Purchase
                    </Typography>
               </Grid>
               {/* Top Section - Purchase Details */}
               <Grid size={{ xs: 12, md: 12 }}>
                    <Card>
                         <CardContent className='py-3.5'>
                              <Grid container columnSpacing={3} rowSpacing={4} >
                                   {/* Purchase Details Header */}
                                   <Grid size={{ xs: 12 }} className='flex flex-col gap-2'>
                                        <Box className='flex flex-row gap-1.5 items-center'>
                                             <Box className='w-2 h-8 bg-secondaryLight rounded-md' />
                                             <Typography variant="caption" fontWeight={500} fontSize='1rem'>
                                                  Purchase Details
                                             </Typography>
                                        </Box>
                                        <Divider light textAlign='left' width='400px' />
                                   </Grid>

                                   {/* Purchase Number (read-only) */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Box className="flex flex-row items-center px-3 justify-between bg-tableHeader rounded-md w-full h-full">
                                             <Typography variant="caption" className='text-[0.9rem]' color="text.secondary">
                                                  Purchase Number
                                             </Typography>
                                             <Typography variant="h6" className='text-[1rem] font-medium'>
                                                  {purchaseData?.purchaseId || ''}
                                             </Typography>
                                        </Box>
                                   </Grid>

                                   {/* Purchase Date */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Controller
                                             name="purchaseDate"
                                             control={control}
                                             render={({ field }) => (
                                                  <TextField
                                                       {...field}
                                                       label="Purchase Date"
                                                       type="date"
                                                       variant="outlined"
                                                       fullWidth
                                                       size="small"
                                                       error={!!errors.purchaseDate}
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
                                                            min: getValues('purchaseDate'),
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
                                                       <InputLabel size="small">Payment Method</InputLabel>
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
                                   <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} className="flex flex-row gap-1 justify-between">
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
                                   {/* Supplier Invoice Serial Number */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Controller
                                             name="supplierInvoiceSerialNumber"
                                             control={control}
                                             render={({ field }) => (
                                                  <TextField
                                                       {...field}
                                                       label="Supplier Invoice #"
                                                       variant="outlined"
                                                       fullWidth
                                                       size="small"
                                                       error={!!errors.supplierInvoiceSerialNumber}
                                                       helperText={errors.supplierInvoiceSerialNumber?.message}
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
                                                                 <InputAdornment position="end" className=' max-h-[14px]'>
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

                                   {/* Vendor */}
                                   <Grid size={{ xs: 12, sm: 6, md: 8, lg: 6 }}>
                                        <VendorAutocomplete control={control} errors={errors} vendorsData={vendorsData} />
                                   </Grid>

                              </Grid>
                         </CardContent>
                    </Card>
               </Grid>
               {/* Middle Section - Products Table */}
               <Grid size={{ xs: 12, md: 9.5 }}>
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
               <Grid size={{ xs: 12, md: 2.5 }}>
                    <InvoiceTotals
                         control={control}
                         handleSubmit={handleSubmit}
                         handleFormSubmit={handleFormSubmit}
                         handleError={handleError}
                         buttonText="Update Purchase"
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

export default EditPurchase;

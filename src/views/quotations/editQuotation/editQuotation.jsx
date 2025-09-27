'use client';

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
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import InvoiceTotals from '@/components/custom-components/InvoiceTotals';
import { calculateInvoiceTotals } from '@/utils/invoiceTotals';
import { paymentMethods } from '@/data/dataSets';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { quotationSchema } from './QuotationSchema';
import { formatDateForInput } from '@/utils/dateUtils';
import { createQuotationColumns } from './quotationColumns';

const EditQuotation = ({
     quotation,
     customers = [],
     productData = [],
     taxRates = [],
     initialBanks = [],
     signatures = [],
     isSubmitting = false,
     onSubmit,
     resetData,
     enqueueSnackbar,
     closeSnackbar
}) => {
     const theme = useTheme();
     const [openBankModal, setOpenBankModal] = useState(false);
     const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

     // State for UI controls
     const [productsCloneData, setProductsCloneData] = useState([]);
     const [banks, setBanks] = useState(initialBanks || []);
     const [newBank, setNewBank] = useState({
          name: '',
          bankName: '',
          accountNumber: '',
          branch: '',
          ifscCode: ''
     });
     const [signOptions, setSignOptions] = useState(signatures || []);
     const [notesExpanded, setNotesExpanded] = useState(false);
     const [termsDialogOpen, setTermsDialogOpen] = useState(false);
     const [tempTerms, setTempTerms] = useState('');
     const [discountMenu, setDiscountMenu] = useState({ anchorEl: null, rowIndex: null });
     const [taxMenu, setTaxMenu] = useState({ anchorEl: null, rowIndex: null });

     // Form setup
     const {
          control,
          handleSubmit,
          setValue,
          getValues,
          watch,
          reset,
          formState: { errors }
     } = useForm({
          resolver: yupResolver(quotationSchema),
          defaultValues: {
               quotationNumber: '',
               customerId: '',
               quotationDate: '',
               expiryDate: '',
               payment_method: '',
               bank: '',
               referenceNo: '',
               signatureId: '',
               notes: '',
               termsAndConditions: '',
               items: [],
               taxableAmount: 0,
               totalDiscount: 0,
               vat: 0,
               TotalAmount: 0,
               roundOff: false,
               roundOffValue: 0,
          }
     });

     // Field array for items
     const { fields, append, remove } = useFieldArray({
          control,
          name: 'items'
     });

     // Watch fields
     const watchItems = watch('items');
     const watchRoundOff = watch('roundOff');

     // Initialize form with quotation data
     useEffect(() => {
          if (quotation) {
               reset({
                    quotationNumber: quotation.quotation_id || '',
                    customerId: quotation.customerId?._id || '',
                    quotationDate: formatDateForInput(quotation.quotation_date),
                    expiryDate: formatDateForInput(quotation.due_date),
                    payment_method: quotation.payment_method || '',
                    bank: quotation.bank?._id || '',
                    referenceNo: quotation.referenceNo || '',
                    signatureId: quotation.signatureId?._id || '',
                    notes: quotation.notes || '',
                    termsAndConditions: quotation.termsAndCondition || '',
                    items: quotation.items || [],
                    taxableAmount: quotation.taxableAmount || 0,
                    totalDiscount: quotation.totalDiscount || 0,
                    vat: quotation.vat || 0,
                    TotalAmount: quotation.TotalAmount || 0,
                    roundOff: quotation.roundOff || false,
                    roundOffValue: quotation.roundOffValue || 0,
               });

               // Initialize products clone data - exclude products already in the quotation
               if (productData && quotation.items) {
                    const usedProductIds = quotation.items.map(item => item.productId);
                    setProductsCloneData(productData.filter(product => !usedProductIds.includes(product._id)));
               } else if (productData) {
                    setProductsCloneData([...productData]);
               }
          }
     }, [quotation, productData, reset]);

     // Calculate totals when items change
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
     }, [watchItems, watchRoundOff, setValue]);

     // Utility functions
     const updateCalculatedFields = (index, item, setValue) => {
          const quantity = Number(item.quantity) || 0;
          const rate = Number(item.rate) || 0;
          const discountValue = Number(item.discount) || 0;
          const discountType = Number(item.discountType) || 3;
          const taxRate = Number(item.taxInfo?.taxRate) || 0;

          let discountAmount = 0;
          if (discountType === 2) {
               discountAmount = (quantity * rate * discountValue) / 100;
          } else {
               discountAmount = discountValue;
          }

          const taxableAmount = (quantity * rate) - discountAmount;
          const taxAmount = (taxableAmount * taxRate) / 100;
          const totalAmount = taxableAmount + taxAmount;

          setValue(`items.${index}.amount`, totalAmount);
          setValue(`items.${index}.tax`, taxAmount);
          setValue(`items.${index}.discount`, discountAmount);
     };

     const handleUpdateItemProduct = (index, productId, previousProductId) => {
          if (previousProductId && previousProductId !== productId) {
               const previousProduct = productData.find(p => p._id === previousProductId);
               if (previousProduct) {
                    setProductsCloneData(prev => [...prev, previousProduct]);
               }
          }

          if (productId) {
               const selectedProduct = productData.find(p => p._id === productId);
               if (selectedProduct) {
                    setValue(`items.${index}.productId`, selectedProduct._id);
                    setValue(`items.${index}.name`, selectedProduct.name);
                    setValue(`items.${index}.description`, selectedProduct.description || '');
                    setValue(`items.${index}.units`, selectedProduct.units?.name || '');
                    setValue(`items.${index}.rate`, selectedProduct.sellingPrice || 0);
                    setValue(`items.${index}.quantity`, 1);
                    setValue(`items.${index}.discountType`, selectedProduct.discountType || 3);
                    setValue(`items.${index}.discount`, selectedProduct.discountValue || 0);
                    setValue(`items.${index}.taxInfo`, selectedProduct.tax || {});

                    setProductsCloneData(prev => prev.filter(p => p._id !== productId));
                    const item = getValues(`items.${index}`);
                    updateCalculatedFields(index, item, setValue);
               }
          }
     };

     const handleDeleteItem = (index) => {
          const item = getValues(`items.${index}`);
          if (item.productId) {
               const product = productData.find(p => p._id === item.productId);
               if (product) {
                    setProductsCloneData(prev => [...prev, product]);
               }
          }
          remove(index);
     };

     const handleAddEmptyRow = () => {
          append({
               productId: '',
               name: '',
               description: '',
               quantity: 1,
               units: '',
               rate: 0,
               discountType: 3,
               discount: 0,
               taxInfo: {},
               tax: 0,
               amount: 0,
          });
     };

     const handleAddBank = async () => {
          try {
               const bankData = {
                    ...newBank,
                    _id: Date.now().toString(),
               };
               setBanks(prev => [...prev, bankData]);
               setNewBank({
                    name: '',
                    bankName: '',
                    accountNumber: '',
                    branch: '',
                    ifscCode: ''
               });
               if (enqueueSnackbar) {
                    enqueueSnackbar('Bank added successfully', { variant: 'success' });
               }
          } catch (error) {
               console.error('Error adding bank:', error);
               if (enqueueSnackbar) {
                    enqueueSnackbar('Failed to add bank', { variant: 'error' });
               }
          }
     };

     const handleSignatureSelection = (selected, field) => {
          field.onChange(selected ? selected._id : '');
     };

     const handleFormSubmit = async (data) => {
          try {
               if (onSubmit) {
                    await onSubmit(data);
               }
          } catch (error) {
               console.error('Error saving quotation:', error);
               if (enqueueSnackbar) {
                    enqueueSnackbar(error.message || 'Failed to save quotation', { variant: 'error' });
               }
          }
     };

     const handleError = (errors) => {
          console.error('Form validation errors:', errors);
          if (enqueueSnackbar) {
               enqueueSnackbar('Please fix the form errors', { variant: 'error' });
          }
     };

     // Menu handlers
     const handleMenuItemClick = (index, discountType) => {
          setValue(`items.${index}.discountType`, discountType);
          setValue(`items.${index}.discount`, 0);
          setValue(`items.${index}.form_updated_discount`, 0);
     };

     const handleTaxClick = (event, index) => {
          setTaxMenu({ anchorEl: event.currentTarget, rowIndex: index });
     };

     const handleTaxClose = () => {
          setTaxMenu({ anchorEl: null, rowIndex: null });
     };

     const handleTaxMenuItemClick = (index, tax) => {
          setValue(`items.${index}.taxInfo`, tax);
          const item = getValues(`items.${index}`);
          updateCalculatedFields(index, item, setValue);
          handleTaxClose();
     };

     // UI handlers
     const handleToggleNotes = () => {
          setNotesExpanded(prev => !prev);
     };

     const handleOpenTermsDialog = () => {
          setTempTerms(getValues('termsAndConditions') || '');
          setTermsDialogOpen(true);
     };

     const handleCloseTermsDialog = () => {
          setTermsDialogOpen(false);
          setTempTerms('');
     };

     const handleSaveTerms = () => {
          setValue('termsAndConditions', tempTerms);
          setTermsDialogOpen(false);
     };

     // Create columns using the imported function
     const columns = createQuotationColumns({
          control,
          errors,
          watchItems,
          productsCloneData,
          taxRates,
          setValue,
          getValues,
          handleUpdateItemProduct,
          handleDeleteItem,
          updateCalculatedFields,
          discountMenu,
          setDiscountMenu,
          taxMenu,
          handleTaxClick,
          handleTaxClose,
          handleTaxMenuItemClick,
          handleMenuItemClick
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
                    Click the 'Add Item' button to add items to your quotation
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
                         Edit Quotation
                    </Typography>
               </Grid>
               {/* Top Section - Quotation Details */}
               <Grid size={{ xs: 12, md: 12 }}>
                    <Card>
                         <CardContent className='py-3.5'>
                              <Grid container columnSpacing={3} rowSpacing={4}>
                                   {/* Quotation Details Header */}
                                   <Grid size={{ xs: 12 }} className='flex flex-col gap-2'>
                                        <Box className='flex flex-row gap-1.5 items-center'>
                                             <Box className='w-2 h-8 bg-secondaryLight rounded-md' />
                                             <Typography variant="caption" fontWeight={500} fontSize='1rem'>
                                                  Quotation Details
                                             </Typography>
                                        </Box>
                                        <Divider light textAlign='left' width='400px' />
                                   </Grid>
                                   {/* Quotation Number (read-only) */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Box className="flex flex-row items-center px-3 justify-between bg-tableHeader rounded-md w-full h-full">
                                             <Typography variant="caption" className='text-[0.9rem]' color="text.secondary">
                                                  Quotation Number
                                             </Typography>
                                             <Typography variant="h6" className='text-[1rem] font-medium'>
                                                  {quotation?.quotation_id || ''}
                                             </Typography>
                                        </Box>
                                   </Grid>
                                   {/* Quotation Date */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Controller
                                             name="quotationDate"
                                             control={control}
                                             render={({ field }) => (
                                                  <TextField
                                                       {...field}
                                                       label="Quotation Date"
                                                       type="date"
                                                       variant="outlined"
                                                       fullWidth
                                                       size="small"
                                                       error={!!errors.quotationDate}
                                                       inputProps={{
                                                            max: new Date().toISOString().split('T')[0],
                                                       }}
                                                  />
                                             )}
                                        />
                                   </Grid>
                                   {/* Expiry Date */}
                                   <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Controller
                                             name="expiryDate"
                                             control={control}
                                             render={({ field }) => (
                                                  <TextField
                                                       {...field}
                                                       label="Expiry Date"
                                                       type="date"
                                                       variant="outlined"
                                                       fullWidth
                                                       size="small"
                                                       error={!!errors.expiryDate}
                                                       inputProps={{
                                                            min: getValues('quotationDate'),
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

                                   {/* Customer */}
                                   <Grid size={{ xs: 12, sm: 6, md: 8, lg: 6 }}>
                                        <CustomerAutocomplete control={control} errors={errors} customersData={customers} />
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
                         buttonText="Update Quotation"
                         isSubmitting={isSubmitting}
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
               {/* Terms Dialog */}
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

export default EditQuotation;

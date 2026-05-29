'use client';

import React, { useState, useEffect } from 'react';
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
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomerAutocomplete from '@/components/custom-components/CustomerAutocomplete';
import BankDetailsDialog from '@/components/custom-components/BankDetailsDialog';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import { Totals } from '@/components/totals';
import { useGlobalLocationScope } from '@/contexts/GlobalLocationContext';
import { calculateInvoiceTotals } from '@/utils/salesTotals';
import { calculateItemValues } from '@/utils/salesItemsCalc';
import { paymentMethods } from '@/data/dataSets';
import { notifyNotistackFormValidationErrors } from '@/utils/notifyNotistackFormValidationErrors';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { quotationSchema } from './QuotationSchema';
import { formatDateForInput } from '@/utils/dateUtils';
import { createQuotationColumns } from './quotationColumns';

const Quotation = ({
     mode = 'edit',
     quotation = null,
     quotationNumber = '',
     customers = [],
     productData = [],
     taxRates = [],
     initialBanks = [],
     employees = [],
     isSubmitting = false,
     onSubmit,
     resetData,
     enqueueSnackbar,
     closeSnackbar
}) => {
     const theme = useTheme();
     const { selectedLocation } = useGlobalLocationScope();
     const [openBankModal, setOpenBankModal] = useState(false);
     const [drawerOpen, setDrawerOpen] = useState(false);

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
     const [signOptions, setSignOptions] = useState(employees || []);
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
               quotationNumber: quotationNumber || '',
               customerId: '',
               quotationDate: '',
               expiryDate: '',
               payment_method: '',
               bank: '',
               referenceNo: '',
               employee: '',
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
          if (!quotation) {
               if (productData) setProductsCloneData([...productData]);
               return;
          }

          if (quotation) {
               reset({
                    quotationNumber: quotation.quotation_id || '',
                    customerId: quotation.customerId?._id || '',
                    quotationDate: formatDateForInput(quotation.quotation_date),
                    expiryDate: formatDateForInput(quotation.due_date),
                    payment_method: quotation.payment_method || '',
                    bank: quotation.bank?._id || '',
                    referenceNo: quotation.referenceNo || '',
                    employee: quotation.employee?._id || '',
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
          const computed = calculateItemValues(item);
          setValue(`items.${index}.discount`, computed.discount);
          setValue(`items.${index}.tax`, computed.tax);
          setValue(`items.${index}.amount`, computed.amount);
          setValue(`items.${index}.taxableAmount`, computed.taxableAmount);
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
                    const nextValues = {
                         rate: selectedProduct.sellingPrice || 0,
                         quantity: 1,
                         discountType: selectedProduct.discountType || 3,
                         discount: selectedProduct.discountValue || 0,
                         form_updated_discounttype: selectedProduct.discountType || 3,
                         form_updated_discount: Number(selectedProduct.discountValue || 0),
                         taxInfo: selectedProduct.tax || {},
                         form_updated_tax: Number(selectedProduct.tax?.taxRate || 0)
                    };
                    Object.entries(nextValues).forEach(([key, value]) => {
                         setValue(`items.${index}.${key}`, value);
                    });

                    setProductsCloneData(prev => prev.filter(p => p._id !== productId));
                    const item = { ...getValues(`items.${index}`), ...nextValues };
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
               form_updated_discount: 0,
               form_updated_discounttype: 3,
               form_updated_tax: 0,
               taxInfo: {},
               tax: 0,
               amount: 0,
               taxableAmount: 0
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
          notifyNotistackFormValidationErrors({
               errors,
               closeSnackbar,
               enqueueSnackbar,
               getValues,
          });
     };

     // Menu handlers
     const handleMenuItemClick = (index, discountType) => {
          setValue(`items.${index}.discountType`, discountType);
          setValue(`items.${index}.form_updated_discounttype`, discountType);
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
          const nextValues = {
               taxInfo: tax,
               form_updated_tax: Number(tax?.taxRate || 0)
          };
          Object.entries(nextValues).forEach(([key, value]) => {
               setValue(`items.${index}.${key}`, value);
          });
          const item = { ...getValues(`items.${index}`), ...nextValues };
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
          <CustomIconButton className="flex flex-row items-center justify-center gap-3 w-[13rem]" variant="tonal" skin="lighter" color="primary" size="medium" onClick={handleAddEmptyRow}>
               <Icon icon="mingcute:add-fill" color={theme.palette.primary.main} width={16} />
               <Typography variant="button" color="primary.main" fontSize={14}>Add Row</Typography>
          </CustomIconButton>
     );
     const emptyContent = (
          <Box className="flex flex-col items-center justify-center py-6 gap-2 text-center">
               <Icon icon="mdi:cart-outline" width={36} color={theme.palette.primary.main} />
               <Typography variant="h6" color="text.primary">No Items Added Yet</Typography>
               <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>Click the Add Item button to add items to your quotation.</Typography>
               <Button variant="outlined" color="primary" startIcon={<Icon icon="mingcute:add-fill" width={16} />} size="small" sx={{ mt: 1 }} onClick={handleAddEmptyRow}>Add Item</Button>
          </Box>
     );
     return (
          <Grid container rowSpacing={4} columnSpacing={3}>
               <Grid size={{ xs: 12 }}><div className="flex items-center gap-2"><div className="bg-primary/12 text-primary bg-primaryLight w-12 h-12 rounded-full flex items-center justify-center"><Icon icon="tabler:file-description" fontSize={26} /></div><Typography variant="h5" className="font-semibold text-primary">{mode === 'edit' ? 'Edit Quotation' : 'Add Quotation'}</Typography></div></Grid>
               <Grid size={{ xs: 12 }}><Card><CardContent className="py-4"><Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 3 }}><TextField label="Quotation No" value={quotation?.quotationId || getValues('quotationNumber') || ''} variant="outlined" fullWidth size="medium" InputProps={{ readOnly: true }} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><TextField fullWidth label="Store" size="medium" value={selectedLocation?.name || ''} placeholder="Choose a location from the top bar" InputProps={{ readOnly: true, endAdornment: !selectedLocation?.name ? (<InputAdornment position="end"><Tooltip title="Choose a location from the top bar" arrow><Box component="span" sx={{ display: 'inline-flex', color: 'error.main', cursor: 'help' }}><Icon icon="mdi:alert-circle-outline" width={18} /></Box></Tooltip></InputAdornment>) : null }} /></Grid>
                    <Grid size={{ xs: 12, md: 6 }}><CustomerAutocomplete control={control} errors={errors} customersData={customers} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><Controller name="payment_method" control={control} render={({ field }) => (<FormControl fullWidth variant="outlined" error={!!errors.payment_method}><InputLabel>Payment Method</InputLabel><Select {...field} label="Payment Method" size="medium" value={field.value || ''}>{(paymentMethods || []).map(method => <MenuItem key={method.value} value={method.value}>{method.label}</MenuItem>)}</Select>{errors.payment_method ? <FormHelperText>{errors.payment_method.message}</FormHelperText> : null}</FormControl>)} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><Controller name="quotationDate" control={control} render={({ field }) => <TextField {...field} label="Quotation Date" type="date" variant="outlined" fullWidth size="medium" error={!!errors.quotationDate} inputProps={{ max: new Date().toISOString().split('T')[0] }} InputLabelProps={{ shrink: true }} />} /></Grid>
                    <Grid size={{ xs: 12, md: 3 }}><Controller name="expiryDate" control={control} render={({ field }) => <TextField {...field} label="Expiry Date" type="date" variant="outlined" fullWidth size="medium" error={!!errors.expiryDate} inputProps={{ min: getValues('quotationDate') }} InputLabelProps={{ shrink: true }} />} /></Grid>
                    <Grid size={{ xs: 12, md: 2.5 }}><Controller name="employee" control={control} render={({ field }) => (<FormControl fullWidth error={!!errors.employee} variant="outlined"><InputLabel>Employee</InputLabel><Select label="Employee" size="medium" value={field.value || ''} onChange={event => { const selected = (signOptions || []).find(option => option._id === event.target.value); handleSignatureSelection(selected, field); }}>{(signOptions || []).length === 0 ? <MenuItem value="" disabled>No employees available</MenuItem> : (signOptions || []).map(option => <MenuItem key={option._id} value={option._id}>{option.employeeName || option.signatureName || option.label || option.fullName || option.email || 'Employee'}</MenuItem>)}</Select>{errors.employee ? <FormHelperText>{errors.employee.message}</FormHelperText> : null}</FormControl>)} /></Grid>
                    
                    <Grid size={{ xs: 12, md: 0.5 }}><IconButton color="secondary" onClick={() => setDrawerOpen(true)} aria-label="Open more options"><Icon icon="mdi:unfold-more-vertical" /></IconButton></Grid>
               </Grid></CardContent></Card></Grid>
               <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, px: 6, py: 5 } }}><Box className="flex items-center justify-between"><Box className="flex items-center gap-2"><Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}><Icon icon="mdi:cog-outline" width={20} color={theme.palette.primary.main} /></Box><Typography variant="h6" sx={{ fontWeight: 600 }}>Quotation Options</Typography></Box><IconButton onClick={() => setDrawerOpen(false)} size="small"><Icon icon="mdi:close" width={18} /></IconButton></Box><Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 9, mt: 5 }}><Box className="flex flex-col gap-3"><Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Reference & Bank</Typography><Box className="flex flex-row justify-between gap-1"><Controller name="bank" control={control} render={({ field }) => (<FormControl fullWidth size="medium" error={!!errors.bank}><InputLabel>Select Bank</InputLabel><Select {...field} label="Select Bank" value={field.value || ''}><MenuItem value=""><em>None</em></MenuItem>{(banks || []).map(bank => <MenuItem key={bank._id} value={bank._id}>{bank.bankName || bank.name || 'Bank'}</MenuItem>)}</Select>{errors.bank ? <FormHelperText>{errors.bank.message}</FormHelperText> : null}</FormControl>)} /><CustomIconButton color="primary" size="medium" variant="tonal" skin="lighter" onClick={() => setOpenBankModal(true)}><Icon icon="mdi:bank-plus" width={24} /></CustomIconButton></Box><Controller name="referenceNo" control={control} render={({ field }) => <TextField {...field} fullWidth size="medium" label="Reference No" error={!!errors.referenceNo} helperText={errors.referenceNo?.message} />} /></Box><Box className="flex flex-col gap-3"><Typography variant="h6" sx={{ fontWeight: 500, fontSize: 15 }}>Notes & Terms</Typography><Controller name="notes" control={control} render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} size="medium" label="Notes" error={!!errors.notes} helperText={errors.notes?.message} />} /><Controller name="termsAndConditions" control={control} render={({ field }) => <TextField {...field} fullWidth multiline minRows={3} size="medium" label="Terms & Conditions" error={!!errors.termsAndConditions} helperText={errors.termsAndConditions?.message} />} /><Button fullWidth variant="text" color="primary" startIcon={<Icon icon="mdi:file-document-outline" width={22} />} onClick={handleOpenTermsDialog}>Open Terms Editor</Button></Box></Box></Drawer>
               <Grid size={{ xs: 12 }}><Box sx={{ position: 'relative', mb: '280px' }}><Card><CardContent className="flex flex-col px-0 pt-0"><Box sx={{ overflowX: 'auto' }}><InvoiceItemsTable tableHeadClassName="bg-errorLightest" columns={columns} rows={fields} rowKey={(row, index) => row.id || index} addRowButton={addRowButton} emptyContent={emptyContent} /></Box></CardContent></Card><Totals
            layout="floating"
            control={control}
            primaryActionLabel={mode === 'edit' ? 'Update' : 'Complete'}
            onPrimaryAction={handleSubmit(handleFormSubmit, handleError)}
          /></Box></Grid>
               <BankDetailsDialog open={openBankModal} onClose={() => setOpenBankModal(false)} newBank={newBank} setNewBank={setNewBank} handleAddBank={handleAddBank} />
               <Dialog open={termsDialogOpen} onClose={handleCloseTermsDialog} maxWidth="sm" fullWidth><Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04), py: 3, px: 5 }}><Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>Terms and Conditions</Typography></Box><DialogContent sx={{ py: 5, px: 5 }}><TextField value={tempTerms || ''} onChange={event => setTempTerms(event.target.value)} fullWidth multiline rows={5} variant="filled" placeholder="Enter your standard terms and conditions (payment terms, delivery terms, warranty information, etc.)" InputProps={{ endAdornment: String(tempTerms || '').trim() !== '' && (<InputAdornment position="end"><IconButton onClick={handleCloseTermsDialog} edge="end" title="Clear terms and conditions" size="small"><Clear /></IconButton></InputAdornment>) }} /></DialogContent><Box className="flex flex-row justify-end gap-2 px-5 pb-4 pt-1"><Button onClick={handleCloseTermsDialog} variant="outlined" color="secondary">Cancel</Button><Button onClick={handleSaveTerms} color="primary" variant="contained">Save Changes</Button></Box></Dialog>
               
          </Grid>
     );
};

export default Quotation;

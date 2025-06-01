import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from 'react';
import { editSalesReturnSchema } from '@/views/salesReturn/SalesReturnSchema';
import { paymentMethods } from '@/data/dataSets';
import { calculateItemTotals } from '@/utils/itemCalculations';
import { formatDateForInput } from '@/utils/dateUtils';
import { useRouter } from 'next/navigation';

export default function useSalesReturnHandlers({
  salesReturnData,
  productData,
  initialBanks,
  signatures,
  onSave,
  enqueueSnackbar,
  closeSnackbar
}) {
  const router = useRouter();
  const [productsCloneData, setProductsCloneData] = useState([]);
  const [banks, setBanks] = useState(initialBanks || []);
  const [signOptions] = useState(signatures || []);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState('');
  const [discountMenu, setDiscountMenu] = useState({ anchorEl: null, rowIndex: null });
  const [taxMenu, setTaxMenu] = useState({ anchorEl: null, rowIndex: null });
  const [newBank, setNewBank] = useState({
    name: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    ifscCode: ''
  });

  // Initialize form with sales return data
  const defaultValues = {
    id: salesReturnData?._id || '',
    credit_note_id: salesReturnData?._id || '',
    salesReturnNumber: salesReturnData?.salesReturnNumber || '',
    salesReturnDate: formatDateForInput(salesReturnData?.salesReturnDate) || formatDateForInput(new Date()),
    dueDate: formatDateForInput(salesReturnData?.dueDate) || formatDateForInput(new Date()),
    customerId: salesReturnData?.customerId?._id || salesReturnData?.customerId || '',
    bank: salesReturnData?.bank?._id || salesReturnData?.bank || '',
    payment_method: salesReturnData?.payment_method || '',
    referenceNo: salesReturnData?.referenceNo || '',
    taxableAmount: salesReturnData?.taxableAmount || 0,
    TotalAmount: salesReturnData?.TotalAmount || 0,
    vat: salesReturnData?.vat || 0,
    totalDiscount: salesReturnData?.totalDiscount || 0,
    roundOff: salesReturnData?.roundOff || false,
    roundOffValue: salesReturnData?.roundOffValue || 0,
    sign_type: salesReturnData?.sign_type || 'manualSignature',
    signatureName: salesReturnData?.signatureName || '',
    signatureId: salesReturnData?.signatureId || '',
    signatureImage: salesReturnData?.signatureImage || '',
    notes: salesReturnData?.notes || '',
    termsAndCondition: salesReturnData?.termsAndCondition || '',
    items: salesReturnData?.items?.map(item => ({
      productId: item.productId?._id || item.productId || '',
      name: item.name || '',
      quantity: item.quantity || 1,
      units: item.units || item.unit || '',
      rate: item.rate || 0,
      form_updated_rate: item.form_updated_rate || item.rate || 0,
      discount: item.discount || 0,
      form_updated_discount: item.form_updated_discount || item.discount || 0,
      discountType: item.discountType || item.form_updated_discounttype || 3,
      form_updated_discounttype: item.form_updated_discounttype || item.discountType || 3,
      tax: item.tax || 0,
      form_updated_tax: item.form_updated_tax || 0,
      taxInfo: item.taxInfo || { taxRate: 0 },
      amount: item.amount || 0,
      isRateFormUpadted: item.isRateFormUpadted || false
    })) || []
  };

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(editSalesReturnSchema),
    defaultValues
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchRoundOff = watch('roundOff');

  // Initialize available products
  useEffect(() => {
    if (productData && salesReturnData?.items) {
      const usedProductIds = salesReturnData.items.map(item => 
        item.productId?._id || item.productId
      );
      const availableProducts = productData.filter(
        product => !usedProductIds.includes(product._id)
      );
      setProductsCloneData(availableProducts);
    } else {
      setProductsCloneData(productData || []);
    }
  }, [productData, salesReturnData]);

  // Item handlers
  const updateCalculatedFields = (index, item, setValue) => {
    const calculated = calculateItemTotals(item);
    
    setValue(`items.${index}.discount`, calculated.discount);
    setValue(`items.${index}.tax`, calculated.tax);
    setValue(`items.${index}.amount`, calculated.amount);
  };

  const handleUpdateItemProduct = (index, productId, previousProductId) => {
    const product = productData.find(p => p._id === productId);
    
    if (!product) {
      setValue(`items.${index}.productId`, '');
      return;
    }

    // Update form fields with product data
    setValue(`items.${index}.productId`, productId);
    setValue(`items.${index}.name`, product.name);
    setValue(`items.${index}.units`, product.units?.name || '');
    setValue(`items.${index}.rate`, product.sellingPrice || 0);
    setValue(`items.${index}.form_updated_rate`, product.sellingPrice || 0);
    setValue(`items.${index}.discountType`, product.discountType || 3);
    setValue(`items.${index}.form_updated_discounttype`, product.discountType || 3);
    setValue(`items.${index}.discount`, product.discountValue || 0);
    setValue(`items.${index}.form_updated_discount`, product.discountValue || 0);
    setValue(`items.${index}.taxInfo`, product.tax || { taxRate: 0 });
    setValue(`items.${index}.form_updated_tax`, product.tax?.taxRate || 0);
    setValue(`items.${index}.isRateFormUpadted`, false);

    // Set default quantity if not set
    const currentQuantity = getValues(`items.${index}.quantity`);
    if (!currentQuantity) {
      setValue(`items.${index}.quantity`, 1);
    }

    // Update calculated fields
    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item, setValue);

    // Update available products
    const updatedProducts = productsCloneData.filter(p => p._id !== productId);
    if (previousProductId) {
      const prevProduct = productData.find(p => p._id === previousProductId);
      if (prevProduct) {
        updatedProducts.push(prevProduct);
      }
    }
    setProductsCloneData(updatedProducts);
  };

  const handleDeleteItem = (index) => {
    const item = getValues(`items.${index}`);
    if (item.productId) {
      const product = productData.find(p => p._id === item.productId);
      if (product) {
        setProductsCloneData([...productsCloneData, product]);
      }
    }
    remove(index);
  };

  const handleAddEmptyRow = () => {
    append({
      productId: '',
      name: '',
      quantity: 1,
      units: '',
      rate: 0,
      form_updated_rate: 0,
      discount: 0,
      form_updated_discount: 0,
      discountType: 3,
      form_updated_discounttype: 3,
      tax: 0,
      form_updated_tax: 0,
      taxInfo: { taxRate: 0 },
      amount: 0,
      isRateFormUpadted: false
    });
  };

  const handleMenuItemClick = (index, discountType) => {
    setValue(`items.${index}.discountType`, discountType);
    setValue(`items.${index}.form_updated_discounttype`, discountType);
    setValue(`items.${index}.isRateFormUpadted`, true);
    
    if (discountType === 2) {
      setValue(`items.${index}.form_updated_discount`, 0);
    } else {
      setValue(`items.${index}.discount`, 0);
    }
    
    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item, setValue);
  };

  const handleTaxClick = (event, index) => {
    setTaxMenu({ anchorEl: event.currentTarget, rowIndex: index });
  };

  const handleTaxClose = () => {
    setTaxMenu({ anchorEl: null, rowIndex: null });
  };

  const handleTaxMenuItemClick = (index, tax) => {
    setValue(`items.${index}.taxInfo`, tax);
    setValue(`items.${index}.form_updated_tax`, tax.taxRate);
    setValue(`items.${index}.isRateFormUpadted`, true);
    
    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item, setValue);
    handleTaxClose();
  };

  // Bank handlers
  const handleAddBank = async () => {
    try {
      if (!newBank.name || !newBank.bankName || !newBank.accountNumber) {
        throw new Error('Please fill in all required bank details');
      }

      const tempBank = { ...newBank, _id: Date.now().toString() };
      setBanks([...banks, tempBank]);

      // Reset form
      setNewBank({
        name: '',
        bankName: '',
        branch: '',
        accountNumber: '',
        ifscCode: ''
      });

      return true;
    } catch (error) {
      console.error('Error adding bank:', error);
      return false;
    }
  };

  // Signature handlers
  const handleSignatureSelection = (selected, field) => {
    if (selected) {
      field.onChange(selected._id);
      setValue('signatureName', selected.signatureName);
      setValue('signatureImage', selected.signatureImage);
      setValue('sign_type', 'manualSignature');
    } else {
      field.onChange('');
      setValue('signatureName', '');
      setValue('signatureImage', '');
    }
  };

  // Dialog handlers
  const handleToggleNotes = () => {
    setNotesExpanded(!notesExpanded);
  };

  const handleOpenTermsDialog = () => {
    setTempTerms(getValues('termsAndCondition') || '');
    setTermsDialogOpen(true);
  };

  const handleCloseTermsDialog = () => {
    setTermsDialogOpen(false);
    setTempTerms('');
  };

  const handleSaveTerms = () => {
    setValue('termsAndCondition', tempTerms);
    handleCloseTermsDialog();
  };

  // Form submission
  const handleFormSubmit = async (data) => {
    try {
      const isValid = await trigger();
      if (!isValid) {
        console.error('Form validation failed');
        return;
      }

      closeSnackbar();

      const result = await onSave(data);

      if (result.success) {
        setTimeout(() => {
          router.push('/sales-return/sales-return-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar('Failed to update sales return: ' + error.message, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: false
      });
    }
  };

  const handleError = (errors) => {
    console.error('Form validation errors:', errors);
    
    let firstError = 'Please check all required fields';
    
    if (errors.customerId) {
      firstError = 'Please select a customer';
    } else if (errors.items && errors.items.length > 0) {
      firstError = 'Please check product details';
    } else if (errors.bank) {
      firstError = 'Please select a bank';
    } else if (errors.payment_method) {
      firstError = 'Please select a payment method';
    }

    enqueueSnackbar(firstError, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: false
    });
  };

  return {
    // Form state and methods
    control,
    handleSubmit,
    setValue,
    getValues,
    errors,
    fields,
    watchItems,
    watchRoundOff,
    productsCloneData,

    // Bank state and methods
    banks,
    newBank,
    setNewBank,
    handleAddBank,

    // Signature state and methods
    signOptions,
    handleSignatureSelection,

    // Static data
    paymentMethods,

    // Dialog state and methods
    notesExpanded,
    termsDialogOpen,
    tempTerms,
    setTempTerms: (value) => setTempTerms(value),
    handleToggleNotes,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,

    // Item table state and methods
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,

    // Form submission methods
    handleFormSubmit,
    handleError
  };
}
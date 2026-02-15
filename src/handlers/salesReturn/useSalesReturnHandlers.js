import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect } from 'react';
import { editSalesReturnSchema } from '@/views/salesReturn/SalesReturnSchema';
import { paymentMethods } from '@/data/dataSets';
import { calculateItemValues } from '@/utils/salesItemsCalc';
import { formatInvoiceItem } from '@/utils/formatNewSellItem';
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
    credit_note_id: salesReturnData?.credit_note_id || '',
    salesReturnNumber: salesReturnData?.credit_note_id || '',
    salesReturnDate: formatDateForInput(salesReturnData?.credit_note_date) || formatDateForInput(new Date()),
    dueDate: formatDateForInput(salesReturnData?.due_date) || formatDateForInput(new Date()),
    customerId: salesReturnData?.customerId?._id || salesReturnData?.customerId || '',
    bank: salesReturnData?.bank?._id || salesReturnData?.bank || '',
    payment_method: salesReturnData?.payment_method || 'Cash',
    referenceNo: salesReturnData?.reference_no || '',
    taxableAmount: salesReturnData?.taxableAmount || 0,
    TotalAmount: salesReturnData?.TotalAmount || 0,
    vat: salesReturnData?.vat || 0,
    totalDiscount: salesReturnData?.totalDiscount || 0,
    roundOff: salesReturnData?.roundOff || false,
    roundOffValue: salesReturnData?.roundOffValue || 0,
    sign_type: salesReturnData?.sign_type || 'manualSignature',
    signatureName: salesReturnData?.signatureName || '',
    signatureId: salesReturnData?.signatureId?._id || salesReturnData?.signatureId || '',
    signatureImage: salesReturnData?.signatureImage || '',
    notes: salesReturnData?.notes || '',
    termsAndCondition: salesReturnData?.termsAndCondition || '',
    items: salesReturnData?.items?.map(item => ({
      productId: item.productId?._id || item.productId || '',
      name: item.name || '',
      quantity: item.quantity || 1,
      units: item.units || item.unit || '',
      unit: item.unit || item.units?._id || '',
      rate: item.rate || 0,
      form_updated_rate: item.form_updated_rate || item.rate || 0,
      discount: item.discount || 0,
      form_updated_discount: item.form_updated_discount || item.discount || 0,
      discountType: item.discountType || item.form_updated_discounttype || 3,
      form_updated_discounttype: item.form_updated_discounttype || item.discountType || 3,
      tax: item.tax || 0,
      taxInfo: item.taxInfo ? (typeof item.taxInfo === 'string' ? JSON.parse(item.taxInfo) : item.taxInfo) : { taxRate: 0 },
      form_updated_tax: item.form_updated_tax || (item.taxInfo ? (typeof item.taxInfo === 'string' ? JSON.parse(item.taxInfo) : item.taxInfo).taxRate || 0 : 0),
      amount: item.amount || 0,
      isRateFormUpadted: item.isRateFormUpadted || false,
      images: (() => {
        // Handle images - could be string, array, or JSON stringified array
        let images = item.images || item.productId?.images || null;
        if (!images) return null;

        // If it's a string that looks like JSON array, parse it
        if (typeof images === 'string' && images.trim().startsWith('[')) {
          try {
            images = JSON.parse(images);
          } catch (e) {
            // If parsing fails, treat as regular string
            return images;
          }
        }

        // If it's an array, return first element or the array itself
        if (Array.isArray(images)) {
          return images.length > 0 ? images[0] : null;
        }

        // Otherwise return as string
        return images;
      })()
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

  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });

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
  const updateCalculatedFields = (index, values) => {
    const computed = calculateItemValues(values);
    setValue(`items.${index}.discount`, computed.discount);
    setValue(`items.${index}.tax`, computed.tax);
    setValue(`items.${index}.amount`, computed.amount);
    setValue(`items.${index}.taxableAmount`, computed.taxableAmount);
  };

  const handleUpdateItemProduct = (index, productId, previousProductId) => {
    if (!productId) {
      return;
    }

    const product = productData.find((p) => p._id === productId);
    if (!product) {
      setValue(`items.${index}.productId`, '');
      return;
    }

    const newData = formatInvoiceItem(product);
    if (!newData) {
      return;
    }

    // Set all product fields
    Object.keys(newData).forEach(key => {
      setValue(`items.${index}.${key}`, newData[key]);
    });

    // Update products clone data
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
    const currentItems = getValues('items');
    const deletedItem = currentItems[index];
    remove(index);

    // Add the deleted product back to available products
    if (deletedItem && deletedItem.productId) {
      const product = productData.find((p) => p._id === deletedItem.productId);
      if (product) {
        setProductsCloneData((prev) => [...prev, product]);
      }
    }
  };

  const handleAddEmptyRow = () => {
    append({
      productId: '',
      name: '',
      units: '',
      unit: '',
      quantity: 1,
      rate: 0,
      discount: 0,
      discountType: 2,
      tax: 0,
      taxInfo: {
        _id: '',
        name: '',
        taxRate: 0
      },
      amount: 0,
      taxableAmount: 0,
      key: Date.now(),
      isRateFormUpadted: false,
      form_updated_rate: '',
      form_updated_discount: '',
      form_updated_discounttype: '',
      form_updated_tax: ''
    });
  };

  const handleMenuItemClick = (index, newValue) => {
    if (newValue !== null) {
      setValue(`items.${index}.discountType`, newValue);
      setValue(`items.${index}.form_updated_discounttype`, newValue);
      setValue(`items.${index}.isRateFormUpadted`, true);
      const item = getValues(`items.${index}`);
      updateCalculatedFields(index, item);
    }
  };

  const handleTaxClick = (event, index) => {
    setTaxMenu({ anchorEl: event.currentTarget, rowIndex: index });
  };

  const handleTaxClose = () => {
    setTaxMenu({ anchorEl: null, rowIndex: null });
  };

  const handleTaxMenuItemClick = (index, tax) => {
    setValue(`items.${index}.taxInfo`, tax);
    setValue(`items.${index}.tax`, Number(tax.taxRate || 0));
    setValue(`items.${index}.form_updated_tax`, Number(tax.taxRate || 0));
    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item);
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

      // Format data similar to invoice edit handler
      const updatedFormData = {
        customerId: data.customerId,
        payment_method: data.payment_method,
        taxableAmount: data.taxableAmount,
        vat: data.vat,
        roundOff: data.roundOff,
        totalDiscount: data.totalDiscount,
        TotalAmount: data.TotalAmount,
        credit_note_id: data.credit_note_id || data.salesReturnNumber,
        salesReturnNumber: data.salesReturnNumber,
        salesReturnDate: data.salesReturnDate,
        dueDate: data.dueDate,
        referenceNo: data.referenceNo || '',
        notes: data.notes || '',
        bank: data.bank || '',
        termsAndCondition: data.termsAndCondition || '',
        items: data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          units: item.units,
          unit: item.unit,
          quantity: item.quantity,
          rate: item.rate,
          discount: item.discount,
          discountType: item.discountType,
          amount: item.amount,
          key: item.key,
          isRateFormUpadted: item.isRateFormUpadted,
          form_updated_rate: item.form_updated_rate,
          form_updated_discount: item.form_updated_discount,
          form_updated_discounttype: item.form_updated_discounttype,
          form_updated_tax: item.form_updated_tax,
          tax: item.tax,
          taxInfo: item.taxInfo,
          images: item.images || null,
        })),
        sign_type: data.sign_type || 'manualSignature',
        signatureId: data.signatureId || '',
        signatureImage: data.signatureImage || null,
      };

      const result = await onSave(updatedFormData);

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
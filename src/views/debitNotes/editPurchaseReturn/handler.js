import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DebitNoteSchema } from '@/views/debitNotes/DebitNoteSchema';
import { formatDateForInput } from '@/utils/dateUtils';
import { calculatePurchaseItemValues } from '@/utils/purchaseItemCalculations';
import { formatPurchaseItem } from '@/utils/formatNewBuyItem';
import { paymentMethods } from '@/data/dataSets';

function useFormHandler({ debitNoteData }) {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(DebitNoteSchema),
    defaultValues: {
      debitNoteNumber: debitNoteData?.debit_note_id || '',
      referenceNo: debitNoteData?.referenceNo || '',
      vendorId: debitNoteData?.vendorId?._id || '',
      payment_method: debitNoteData?.payment_method || '',
      purchaseOrderDate: debitNoteData?.purchaseOrderDate ? formatDateForInput(new Date(debitNoteData.purchaseOrderDate)) : formatDateForInput(new Date()),
      dueDate: debitNoteData?.dueDate ? formatDateForInput(new Date(debitNoteData.dueDate)) : formatDateForInput(new Date()),
      taxableAmount: debitNoteData?.taxableAmount || 0,
      TotalAmount: debitNoteData?.TotalAmount || 0,
      notes: debitNoteData?.notes || '',
      vat: debitNoteData?.vat || 0,
      totalDiscount: debitNoteData?.totalDiscount || 0,
      roundOff: debitNoteData?.roundOff || false,
      termsAndCondition: debitNoteData?.termsAndCondition || '',
      bankId: debitNoteData?.bankId || '',
      roundOffValue: debitNoteData?.roundOffValue || 0,
      sign_type: debitNoteData?.sign_type || 'manualSignature',
      signatureName: debitNoteData?.signatureName || '',
      signatureId: debitNoteData?.signatureId || '',
      signatureImage: debitNoteData?.signatureImage || null,
      items: debitNoteData?.items || []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });

  return {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    errors,
    fields,
    append,
    remove,
    watchItems,
    watchRoundOff
  };
}

function useItemsHandler({
  setValue,
  getValues,
  append,
  remove,
  productData,
  enqueueSnackbar,
  closeSnackbar,
  setProductsCloneData
}) {
  const [discountMenu, setDiscountMenu] = useState({ anchorEl: null, rowIndex: null });
  const [taxMenu, setTaxMenu] = useState({ anchorEl: null, rowIndex: null });

  const updateCalculatedFields = (index, values) => {
    const computed = calculatePurchaseItemValues(values);
    setValue(`items.${index}.rate`, computed.rate);
    setValue(`items.${index}.discount`, computed.discount);
    setValue(`items.${index}.tax`, computed.tax);
    setValue(`items.${index}.amount`, computed.amount);
    setValue(`items.${index}.taxableAmount`, computed.taxableAmount);
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

  const handleUpdateItemProduct = (index, productId, previousProductId) => {
    if (!productId) {
      closeSnackbar();
      enqueueSnackbar('Please select a product', { variant: 'error' });
      return;
    }

    const product = productData.find((item) => item._id === productId);
    if (!product) {
      closeSnackbar();
      enqueueSnackbar('Invalid product selected', { variant: 'error' });
      return;
    }

    const newData = formatPurchaseItem(product);
    if (!newData) {
      closeSnackbar();
      enqueueSnackbar('Error formatting product data', { variant: 'error' });
      return;
    }

    Object.keys(newData).forEach((key) => {
      setValue(`items.${index}.${key}`, newData[key]);
    });

    setProductsCloneData((prev) => {
      let updatedProducts = [...prev];

      if (previousProductId) {
        const previousProduct = productData.find((item) => item._id === previousProductId);
        if (previousProduct) {
          updatedProducts.push(previousProduct);
        }
      }

      return updatedProducts.filter((item) => item._id !== productId);
    });
  };

  const handleDeleteItem = (index) => {
    const currentItems = getValues('items');
    const deletedItem = currentItems[index];
    remove(index);

    if (deletedItem?.productId) {
      const product = productData.find((item) => item._id === deletedItem.productId);
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

  return {
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    updateCalculatedFields,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow
  };
}

function useBankHandler({ initialBanks, addBank }) {
  const [banks, setBanks] = useState(initialBanks || []);
  const [newBank, setNewBank] = useState({
    bankName: '',
    branch: '',
    accountNumber: '',
    IFSCCode: ''
  });

  useEffect(() => {
    setBanks(initialBanks || []);
  }, [initialBanks]);

  const handleAddBank = async (bankData) => {
    if (addBank) {
      const result = await addBank(bankData);
      if (result.success && result.data) {
        setBanks([...banks, result.data]);
        setNewBank({
          bankName: '',
          branch: '',
          accountNumber: '',
          IFSCCode: ''
        });
      }
      return result;
    }

    return { success: false, message: 'Add bank function not provided' };
  };

  return {
    banks,
    setBanks,
    newBank,
    setNewBank,
    handleAddBank
  };
}

function useSignatureHandler({ signatures, setValue }) {
  const [signOptions, setSignOptions] = useState([]);

  useEffect(() => {
    if (signatures?.length > 0) {
      const signArray = signatures.map((item) => ({
        value: item?._id,
        label: item?.signatureName,
        ...item
      }));
      setSignOptions(signArray);
    }
  }, [signatures]);

  const handleSignatureSelection = (selected, field) => {
    if (selected) {
      field.onChange(selected._id);
      setValue('sign_type', 'manualSignature');
      return;
    }

    field.onChange('');
  };

  return {
    signOptions,
    handleSignatureSelection
  };
}

function useDialogHandler({ setValue, getValues }) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState('');

  const handleToggleNotes = () => {
    setNotesExpanded(!notesExpanded);
  };

  const handleOpenTermsDialog = () => {
    const currentTerms = getValues('termsAndCondition') || '';
    setTempTerms(currentTerms);
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

  return {
    notesExpanded,
    termsDialogOpen,
    tempTerms,
    setTempTerms,
    handleToggleNotes,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms
  };
}

function useDebitNoteSubmissionHandler({
  trigger,
  closeSnackbar,
  enqueueSnackbar,
  onSave,
  getValues,
  includeId = false,
  failureMessage = 'Failed to save debit note'
}) {
  const handleFormSubmit = async (data, errors, handleError) => {
    try {
      closeSnackbar?.();

      const isValid = await trigger();
      if (!isValid) {
        handleError(errors);
        return;
      }

      const currentFormData = data;
      if (!currentFormData) {
        return { success: false, message: failureMessage };
      }

      const debitNoteData = {
        debit_note_id: currentFormData.debit_note_id || currentFormData.debitNoteNumber || '',
        vendorId: currentFormData.vendorId,
        paymentMode: currentFormData.paymentMode || currentFormData.payment_method || '',
        taxableAmount: currentFormData.taxableAmount,
        vat: currentFormData.vat,
        roundOff: currentFormData.roundOff,
        totalDiscount: currentFormData.totalDiscount,
        TotalAmount: currentFormData.TotalAmount,
        referenceNo: currentFormData.referenceNo || '',
        dueDate: currentFormData.dueDate,
        purchaseOrderDate: currentFormData.purchaseOrderDate || currentFormData.debitNoteDate || '',
        notes: currentFormData.notes || '',
        bank:
          currentFormData.bank?._id ||
          currentFormData.bank ||
          currentFormData.bankId ||
          '',
        termsAndCondition: currentFormData.termsAndCondition || '',
        sign_type: currentFormData.sign_type || 'manualSignature',
        signatureName: currentFormData.signatureName || '',
        signatureId: currentFormData.signatureId || '',
        signatureImage: currentFormData.signatureImage || null,
        items: (currentFormData.items || []).map((item) => ({
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
          taxInfo: item.taxInfo
        }))
      };

      if (includeId && currentFormData.id) {
        debitNoteData.id = currentFormData.id;
      }

      const result = await onSave(debitNoteData);

      if (!result?.success) {
        const errorMessage = result?.error?.message || result?.message || failureMessage;
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true
        });
        return { success: false, message: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in form submission:', error);
      closeSnackbar?.();
      enqueueSnackbar(error.message || 'An error occurred during submission', {
        variant: 'error',
        autoHideDuration: 5000
      });
      return { success: false, message: error.message || 'An error occurred during submission' };
    }
  };

  const handleError = (errors) => {
    closeSnackbar?.();

    setTimeout(() => {
      const errorCount = Object.keys(errors).length;
      if (errorCount === 0) {
        return;
      }

      const formValues = getValues();
      Object.entries(errors).forEach(([key, error]) => {
        if (key === 'items') {
          if (error.message) {
            enqueueSnackbar(error.message, {
              variant: 'error',
              preventDuplicate: true,
              key: `error-items-${Date.now()}`,
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
              }
            });
          }

          if (Array.isArray(error)) {
            error.forEach((itemError, index) => {
              if (!itemError) {
                return;
              }

              const productName = formValues.items?.[index]?.name || `Item ${index + 1}`;
              Object.entries(itemError).forEach(([fieldKey, fieldError]) => {
                if (fieldError && fieldError.message) {
                  enqueueSnackbar(`${productName}: ${fieldError.message}`, {
                    variant: 'error',
                    preventDuplicate: true,
                    key: `error-item-${index}-${fieldKey}-${Date.now()}`,
                    anchorOrigin: {
                      vertical: 'top',
                      horizontal: 'right'
                    }
                  });
                }
              });
            });
          }
        } else if (error && error.message) {
          enqueueSnackbar(error.message, {
            variant: 'error',
            preventDuplicate: true,
            key: `error-${key}-${Date.now()}`,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right'
            }
          });
        }
      });
    }, 200);
  };

  return {
    handleFormSubmit,
    handleError
  };
}

export default function useEditDebitNoteHandlers({
  debitNoteData,
  productData,
  initialBanks,
  signatures,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  addBank
}) {
  const [productsCloneData, setProductsCloneData] = useState(productData || []);

  const formHandler = useFormHandler({ debitNoteData });
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    errors,
    fields,
    append,
    remove,
    watchItems,
    watchRoundOff
  } = formHandler;

  const itemsHandler = useItemsHandler({
    setValue,
    getValues,
    append,
    remove,
    productData,
    enqueueSnackbar,
    closeSnackbar,
    setProductsCloneData
  });

  const bankHandler = useBankHandler({
    initialBanks,
    addBank
  });

  const signatureHandler = useSignatureHandler({
    signatures,
    setValue
  });

  const dialogHandler = useDialogHandler({
    setValue,
    getValues
  });

  const submissionHandler = useDebitNoteSubmissionHandler({
    trigger,
    closeSnackbar,
    enqueueSnackbar,
    onSave,
    getValues,
    includeId: true,
    failureMessage: 'Failed to update debit note'
  });

  return {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    errors,
    fields,
    append,
    remove,
    watchItems,
    watchRoundOff,
    productsCloneData,
    paymentMethods,
    ...bankHandler,
    ...signatureHandler,
    ...itemsHandler,
    ...dialogHandler,
    ...submissionHandler
  };
}

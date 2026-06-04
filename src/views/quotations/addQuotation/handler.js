'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { quotationStatusValues } from '@/data/dataSets';
import { calculateItemValues } from '@/utils/salesItemsCalc';
import { formatInvoiceItem } from '@/utils/formatNewSellItem';
import { notifyNotistackFormValidationErrors } from '@/utils/notifyNotistackFormValidationErrors';
import {
  buildAddQuotationDefaultValues,
  buildQuotationPayload,
  createEmptyQuotationItem,
} from '@/utils/quotationFormUtils';
import { quotationSchema } from '@/views/quotations/QuotationSchema';

export default function useAddQuotationFeatureHandler({
  initialQuotationNumber = '',
  customersData = [],
  productData = [],
  taxRates = [],
  initialBanks = [],
  employees = [],
  onSave,
  addBank = null,
  enqueueSnackbar,
  closeSnackbar,
}) {
  const router = useRouter();
  const [productsCloneData, setProductsCloneData] = useState(productData || []);
  const [banks, setBanks] = useState(initialBanks || []);
  const [signOptions] = useState(employees || []);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState('');
  const [discountMenu, setDiscountMenu] = useState({ anchorEl: null, rowIndex: null });
  const [taxMenu, setTaxMenu] = useState({ anchorEl: null, rowIndex: null });
  const [openBankModal, setOpenBankModal] = useState(false);
  const [newBank, setNewBank] = useState({
    name: '',
    bankName: '',
    accountNumber: '',
    branch: '',
    ifscCode: '',
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(quotationSchema),
    defaultValues: buildAddQuotationDefaultValues(initialQuotationNumber),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });

  useEffect(() => {
    setProductsCloneData(productData || []);
  }, [productData]);

  const updateCalculatedFields = useCallback((index, values) => {
    const computed = calculateItemValues(values);
    setValue(`items.${index}.discount`, computed.discount);
    setValue(`items.${index}.tax`, computed.tax);
    setValue(`items.${index}.amount`, computed.amount);
    setValue(`items.${index}.taxableAmount`, computed.taxableAmount);
  }, [setValue]);

  const handleUpdateItemProduct = useCallback((index, productId, previousProductId) => {
    if (!productId) return;

    const product = (productData || []).find(item => item._id === productId);
    if (!product) {
      setValue(`items.${index}.productId`, '');
      closeSnackbar?.();
      enqueueSnackbar?.('Invalid product selected', { variant: 'error' });
      return;
    }

    const newData = formatInvoiceItem(product);
    if (!newData) {
      closeSnackbar?.();
      enqueueSnackbar?.('Error formatting product data', { variant: 'error' });
      return;
    }

    Object.keys(newData).forEach(key => {
      setValue(`items.${index}.${key}`, newData[key]);
    });

    setProductsCloneData(prev => {
      let updatedProducts = [...prev];

      if (previousProductId) {
        const previousProduct = (productData || []).find(item => item._id === previousProductId);
        if (previousProduct) {
          updatedProducts.push(previousProduct);
        }
      }

      return updatedProducts.filter(item => item._id !== productId);
    });

    updateCalculatedFields(index, { ...getValues(`items.${index}`), ...newData });
  }, [closeSnackbar, enqueueSnackbar, getValues, productData, setValue, updateCalculatedFields]);

  const handleDeleteItem = useCallback((index) => {
    const item = getValues(`items.${index}`);
    remove(index);

    if (item?.productId) {
      const product = (productData || []).find(productItem => productItem._id === item.productId);
      if (product) {
        setProductsCloneData(prev => [...prev, product]);
      }
    }
  }, [getValues, productData, remove]);

  const handleAddEmptyRow = useCallback(() => {
    append(createEmptyQuotationItem());
  }, [append]);

  const handleMenuItemClick = useCallback((index, discountType) => {
    setValue(`items.${index}.discountType`, discountType);
    setValue(`items.${index}.form_updated_discounttype`, discountType);
    setValue(`items.${index}.discount`, 0);
    setValue(`items.${index}.form_updated_discount`, 0);
    setValue(`items.${index}.isRateFormUpadted`, true);
    updateCalculatedFields(index, getValues(`items.${index}`));
  }, [getValues, setValue, updateCalculatedFields]);

  const handleTaxClick = useCallback((event, index) => {
    setTaxMenu({ anchorEl: event.currentTarget, rowIndex: index });
  }, []);

  const handleTaxClose = useCallback(() => {
    setTaxMenu({ anchorEl: null, rowIndex: null });
  }, []);

  const handleTaxMenuItemClick = useCallback((index, tax) => {
    setValue(`items.${index}.taxInfo`, tax);
    setValue(`items.${index}.tax`, Number(tax?.taxRate || 0));
    setValue(`items.${index}.form_updated_tax`, Number(tax?.taxRate || 0));
    setValue(`items.${index}.isRateFormUpadted`, true);
    updateCalculatedFields(index, getValues(`items.${index}`));
    handleTaxClose();
  }, [getValues, handleTaxClose, setValue, updateCalculatedFields]);

  const handleAddBank = useCallback(async () => {
    if (addBank) {
      try {
        closeSnackbar?.();
        const loadingKey = enqueueSnackbar?.('Adding bank details...', {
          variant: 'info',
          persist: true,
        });
        const response = await addBank(newBank);
        closeSnackbar?.(loadingKey);

        if (response?._id) {
          setBanks(prev => [...prev, { ...newBank, _id: response._id }]);
          setValue('bank', response._id);
          setNewBank({ name: '', bankName: '', accountNumber: '', branch: '', ifscCode: '' });
          enqueueSnackbar?.('Bank details added successfully', { variant: 'success' });
          return true;
        }
      } catch (error) {
        closeSnackbar?.();
        enqueueSnackbar?.(error.message || 'Failed to add bank details', { variant: 'error' });
        return false;
      }
    }

    setBanks(prev => [...prev, { ...newBank, _id: Date.now().toString() }]);
    setNewBank({ name: '', bankName: '', accountNumber: '', branch: '', ifscCode: '' });
    return true;
  }, [addBank, closeSnackbar, enqueueSnackbar, newBank, setValue]);

  const handleOpenTermsDialog = useCallback(() => {
    setTempTerms(getValues('termsAndConditions') || '');
    setTermsDialogOpen(true);
  }, [getValues]);

  const handleCloseTermsDialog = useCallback(() => {
    setTermsDialogOpen(false);
    setTempTerms('');
  }, []);

  const handleSaveTerms = useCallback(() => {
    setValue('termsAndConditions', tempTerms);
    handleCloseTermsDialog();
  }, [handleCloseTermsDialog, setValue, tempTerms]);

  const submitWithStatus = useCallback(async (data, status, options = {}) => {
    try {
      closeSnackbar?.();
      const payload = buildQuotationPayload(data, status);
      const result = await onSave(payload, options);

      if (result?.success) {
        setTimeout(() => {
          router.push('/quotations/quotation-list');
        }, 1500);
      }

      return result;
    } catch (error) {
      enqueueSnackbar?.(error.message || 'Failed to save quotation', {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
      return { success: false, message: error.message || 'Failed to save quotation' };
    }
  }, [closeSnackbar, enqueueSnackbar, onSave, router]);

  const handleFormSubmit = useCallback(
    data => submitWithStatus(data, quotationStatusValues.OPEN, { isDraft: false }),
    [submitWithStatus]
  );

  const handleDraftSubmit = useCallback(
    data => submitWithStatus(data, quotationStatusValues.DRAFTED, { isDraft: true }),
    [submitWithStatus]
  );

  const handleError = useCallback((formErrors) => {
    notifyNotistackFormValidationErrors({
      errors: formErrors,
      closeSnackbar,
      enqueueSnackbar,
      getValues,
    });
  }, [closeSnackbar, enqueueSnackbar, getValues]);

  return {
    title: 'Add Quotation',
    displayQuotationNumber: initialQuotationNumber || '',
    control,
    handleSubmit,
    setValue,
    getValues,
    errors,
    fields,
    watchItems,
    watchRoundOff,
    productsCloneData,
    customersData,
    productData,
    taxRates,
    banks,
    signOptions,
    newBank,
    setNewBank,
    handleAddBank,
    termsDialogOpen,
    tempTerms,
    setTempTerms,
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    openBankModal,
    setOpenBankModal,
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
    handleFormSubmit,
    handleDraftSubmit,
    handleError,
  };
}

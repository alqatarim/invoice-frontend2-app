'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { quotationStatusValues } from '@/data/dataSets';
import { calculateItemValues } from '@/utils/salesItemsCalc';
import { formatInvoiceItem } from '@/utils/formatNewSellItem';
import { notifyNotistackFormValidationErrors } from '@/utils/notifyNotistackFormValidationErrors';
import {
  buildEditQuotationDefaultValues,
  buildQuotationPayload,
  createEmptyQuotationItem,
} from '@/utils/quotationFormUtils';
import { quotationSchema } from '@/views/quotations/QuotationSchema';

const getUsedProductIds = quotation =>
  (quotation?.items || []).map(item => item.productId?._id || item.productId).filter(Boolean);

export default function useEditQuotationFeatureHandler({
  initialQuotationData,
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
  const defaultValues = useMemo(
    () => buildEditQuotationDefaultValues(initialQuotationData),
    [initialQuotationData]
  );

  const [productsCloneData, setProductsCloneData] = useState([]);
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
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });

  useEffect(() => {
    const usedProductIds = getUsedProductIds(initialQuotationData);
    setProductsCloneData((productData || []).filter(product => !usedProductIds.includes(product._id)));
  }, [initialQuotationData, productData]);

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

  const handleFormSubmit = useCallback(async (data) => {
    try {
      closeSnackbar?.();
      const payload = buildQuotationPayload(data, quotationStatusValues.OPEN);
      const result = await onSave(payload, { isDraft: false });

      if (result?.success) {
        setTimeout(() => {
          router.push(`/quotations/quotation-view/${initialQuotationData?._id}`);
        }, 1500);
      }

      return result;
    } catch (error) {
      enqueueSnackbar?.(error.message || 'Failed to update quotation', {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: true,
      });
      return { success: false, message: error.message || 'Failed to update quotation' };
    }
  }, [closeSnackbar, enqueueSnackbar, initialQuotationData?._id, onSave, router]);

  const handleError = useCallback((formErrors) => {
    notifyNotistackFormValidationErrors({
      errors: formErrors,
      closeSnackbar,
      enqueueSnackbar,
      getValues,
    });
  }, [closeSnackbar, enqueueSnackbar, getValues]);

  return {
    title: 'Edit Quotation',
    displayQuotationNumber: initialQuotationData?.quotation_id || '',
    recordId: initialQuotationData?._id || '',
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
    handleError,
  };
}

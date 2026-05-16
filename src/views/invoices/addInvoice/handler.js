'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InvoiceSchema } from '@/views/invoices/InvoiceSchema';
import { formatDateForInput } from '@/utils/dateUtils';
import { paymentMethods } from '@/data/dataSets';
import { useGlobalLocationScope } from '@/contexts/GlobalLocationContext';
import { calculateItemValues } from '@/utils/salesItemsCalc';
import { formatInvoiceItem } from '@/utils/formatNewSellItem';
import { calculateInvoiceTotals } from '@/utils/salesTotals';
import { notifyNotistackFormValidationErrors } from '@/utils/notifyNotistackFormValidationErrors';
const CASHIER_SIGNATURE_STORAGE_KEY = 'addInvoice.cashierSignatureId';

const createEmptyInvoiceItem = () => ({
  productId: '',
  name: '',
  sku: '',
  units: '',
  quantity: 1,
  rate: 0,
  discount: 0,
  discountType: 2,
  tax: 0,
  taxInfo: {
    _id: '',
    name: '',
    taxRate: 0,
  },
  amount: 0,
  taxableAmount: 0,
  key: Date.now(),
  isRateFormUpadted: false,
  form_updated_rate: '',
  form_updated_discount: '',
  form_updated_discounttype: '',
  form_updated_tax: '',
  promotionMeta: null,
  promotionAutoApplied: false,
  promotionSummary: '',
  scaleBarcodeMeta: null,
  scaleBarcodeSummary: '',
});

const buildAddInvoicePayload = (currentFormData) => ({
  customerId:
    currentFormData.customerId && currentFormData.customerId !== 'walk-in'
      ? currentFormData.customerId
      : '',
  payment_method: currentFormData.payment_method,
  branchId: currentFormData.branchId,
  taxableAmount: currentFormData.taxableAmount,
  vat: currentFormData.vat,
  roundOff: currentFormData.roundOff,
  totalDiscount: currentFormData.totalDiscount,
  TotalAmount: currentFormData.TotalAmount,
  invoiceNumber: currentFormData.invoiceNumber,
  referenceNo: currentFormData.referenceNo || '',
  dueDate: currentFormData.dueDate,
  invoiceDate: currentFormData.invoiceDate,
  notes: currentFormData.notes || '',
  bank: currentFormData.bank || '',
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
    taxInfo: item.taxInfo,
    promotionSummary: item.promotionSummary || '',
    promotionAutoApplied: Boolean(item.promotionAutoApplied),
    promotionMeta: item.promotionMeta || null,
    scaleBarcodeSummary: item.scaleBarcodeSummary || '',
    scaleBarcodeMeta: item.scaleBarcodeMeta || null,
  })),
});

export default function useAddInvoiceFeatureHandler({
  initialInvoiceNumber,
  customersData = [],
  productData = [],
  taxRates = [],
  initialBanks = [],
  signatures = [],
  onSave,
  addBank,
  enqueueSnackbar,
  closeSnackbar,
  schema = InvoiceSchema,
}) {
  const signOptions = useMemo(
    () =>
      Array.isArray(signatures)
        ? signatures.map((signature) => ({
            value: signature?._id,
            label: signature?.signatureName,
            ...signature,
          }))
        : [],
    [signatures]
  );
  const walkInCustomerId = useMemo(
    () =>
      (Array.isArray(customersData) ? customersData : []).find(
        (customer) => String(customer?.name || '').trim().toLowerCase() === 'walk-in customer'
      )?._id || 'walk-in',
    [customersData]
  );
  const {
    selectedLocation,
    selectedLocationId,
    selectedLocationType,
    storeOnlyValidationMessage,
  } = useGlobalLocationScope();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      invoiceNumber: initialInvoiceNumber || '',
      referenceNo: '',
      customerId: '',
      payment_method: '',
      branchId: '',
      branchType: '',
      isWalkIn: false,
      invoiceDate: formatDateForInput(new Date()),
      dueDate: formatDateForInput(new Date()),
      taxableAmount: 0,
      TotalAmount: 0,
      notes: '',
      vat: 0,
      totalDiscount: 0,
      roundOff: false,
      termsAndCondition: '',
      bank: '',
      roundOffValue: 0,
      sign_type: 'manualSignature',
      signatureName: '',
      signatureId: '',
      signatureImage: null,
      items: [createEmptyInvoiceItem()],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });
  const selectedCashierSignatureId = useWatch({ control, name: 'signatureId' });
  const isWalkIn = Boolean(useWatch({ control, name: 'isWalkIn' }));

  const [productsCloneData, setProductsCloneData] = useState(productData || []);
  const [banks, setBanks] = useState(() => initialBanks || []);
  const [newBank, setNewBank] = useState({
    bankName: '',
    branch: '',
    accountNumber: '',
    IFSCCode: '',
  });
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState('');
  const [discountMenu, setDiscountMenu] = useState({ anchorEl: null, rowIndex: null });
  const [taxMenu, setTaxMenu] = useState({ anchorEl: null, rowIndex: null });
  const [openBankModal, setOpenBankModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = window.localStorage.getItem(CASHIER_SIGNATURE_STORAGE_KEY);
    if (!stored) return;

    const current = getValues('signatureId');
    if (!current) {
      setValue('signatureId', stored);
      setValue('sign_type', 'manualSignature');
    }
  }, [getValues, setValue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!selectedCashierSignatureId) {
      window.localStorage.removeItem(CASHIER_SIGNATURE_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(CASHIER_SIGNATURE_STORAGE_KEY, selectedCashierSignatureId);
  }, [selectedCashierSignatureId]);

  useEffect(() => {
    setValue('branchId', selectedLocationId || '', { shouldValidate: true });
    setValue('branchType', selectedLocationType || '', { shouldValidate: true });
  }, [selectedLocationId, selectedLocationType, setValue]);

  useEffect(() => {
    const totals = calculateInvoiceTotals(watchItems, watchRoundOff);
    setValue('taxableAmount', totals.taxableAmount);
    setValue('totalDiscount', totals.totalDiscount);
    setValue('vat', totals.vat);
    setValue('TotalAmount', totals.TotalAmount);
    setValue('roundOffValue', totals.roundOffValue);
  }, [setValue, watchItems, watchRoundOff]);

  const updateCalculatedFields = useCallback((index, values) => {
    const computed = calculateItemValues(values);

    setValue(`items.${index}.discount`, computed.discount);
    setValue(`items.${index}.tax`, computed.tax);
    setValue(`items.${index}.amount`, computed.amount);
    setValue(`items.${index}.taxableAmount`, computed.taxableAmount);
  }, [setValue]);

  const handleClearAppliedPromotion = useCallback((index) => {
    setValue(`items.${index}.promotionMeta`, null);
    setValue(`items.${index}.promotionAutoApplied`, false);
    setValue(`items.${index}.promotionSummary`, '');
  }, [setValue]);

  const handleClearScaleBarcode = useCallback((index) => {
    setValue(`items.${index}.scaleBarcodeMeta`, null);
    setValue(`items.${index}.scaleBarcodeSummary`, '');
  }, [setValue]);

  const handleMenuItemClick = useCallback((index, newValue) => {
    if (newValue === null) return;

    handleClearAppliedPromotion(index);
    setValue(`items.${index}.discountType`, newValue);
    setValue(`items.${index}.form_updated_discounttype`, newValue);
    setValue(`items.${index}.isRateFormUpadted`, true);

    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item);
  }, [getValues, handleClearAppliedPromotion, setValue, updateCalculatedFields]);

  const handleTaxClick = useCallback((event, index) => {
    setTaxMenu({ anchorEl: event.currentTarget, rowIndex: index });
  }, []);

  const handleTaxClose = useCallback(() => {
    setTaxMenu({ anchorEl: null, rowIndex: null });
  }, []);

  const handleTaxMenuItemClick = useCallback((index, tax) => {
    setValue(`items.${index}.taxInfo`, tax);
    setValue(`items.${index}.tax`, Number(tax.taxRate || 0));
    setValue(`items.${index}.form_updated_tax`, Number(tax.taxRate || 0));

    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item);
    handleTaxClose();
  }, [getValues, handleTaxClose, setValue, updateCalculatedFields]);

  const handleUpdateItemProduct = useCallback((index, productId, previousProductId) => {
    if (!productId) {
      closeSnackbar();
      enqueueSnackbar('Please select a product', { variant: 'error' });
      return;
    }

    const product = productData.find((entry) => entry._id === productId);
    if (!product) {
      closeSnackbar();
      enqueueSnackbar('Invalid product selected', { variant: 'error' });
      return;
    }

    const newItem = formatInvoiceItem(product, { applyPromotions: true });
    if (!newItem) {
      closeSnackbar();
      enqueueSnackbar('Error formatting product data', { variant: 'error' });
      return;
    }

    Object.entries(newItem).forEach(([key, value]) => {
      setValue(`items.${index}.${key}`, value);
    });

    setProductsCloneData((prev) => {
      const next = [...prev];

      if (previousProductId) {
        const previousProduct = productData.find((entry) => entry._id === previousProductId);
        if (previousProduct) {
          next.push(previousProduct);
        }
      }

      return next.filter((entry) => entry._id !== productId);
    });
  }, [closeSnackbar, enqueueSnackbar, productData, setValue]);

  const handleDeleteItem = useCallback((index) => {
    const currentItems = getValues('items');
    const deletedItem = currentItems[index];

    remove(index);

    if (!deletedItem?.productId) return;

    const deletedProduct = productData.find((product) => product._id === deletedItem.productId);
    if (deletedProduct) {
      setProductsCloneData((prev) => [...prev, deletedProduct]);
    }
  }, [getValues, productData, remove]);

  const clearItems = useCallback(() => {
    replace([]);
    setProductsCloneData(Array.isArray(productData) ? productData : []);
  }, [productData, replace]);

  const appendItem = useCallback((item = {}) => {
    const nextItem = {
      ...createEmptyInvoiceItem(),
      ...item,
      key: item?.key || Date.now(),
    };

    append(nextItem);

    if (nextItem.productId) {
      setProductsCloneData((prev) =>
        prev.filter((entry) => entry?._id !== nextItem.productId)
      );
    }
  }, [append]);

  const handleAddEmptyRow = useCallback(() => {
    append(createEmptyInvoiceItem());
  }, [append]);

  const handleQuickAddProduct = useCallback((product, options = {}) => {
    if (!product?._id) return;

    const {
      forceNewLine = false,
      quantityOverride,
      rateOverride,
      barcodeOverride,
      scaleBarcodeMeta = null,
    } = options;

    const currentItems = Array.isArray(getValues('items')) ? getValues('items') : [];
    const parsedQuantity = Number(quantityOverride);
    const quantityToAdd = Number.isFinite(parsedQuantity) && parsedQuantity > 0
      ? parsedQuantity
      : 1;

    const existingIndex = forceNewLine
      ? -1
      : currentItems.findIndex(
          (item) => String(item?.productId || '') === String(product._id)
        );

    if (existingIndex >= 0) {
      const currentItem = currentItems[existingIndex] || {};
      const nextQuantity = Number(
        (Number(currentItem.quantity || 0) + quantityToAdd).toFixed(3)
      );
      const updatedItem = {
        ...currentItem,
        quantity: nextQuantity,
        barcode: barcodeOverride || currentItem.barcode || product.barcode || '',
        scaleBarcodeMeta: scaleBarcodeMeta || currentItem.scaleBarcodeMeta || null,
        scaleBarcodeSummary:
          scaleBarcodeMeta?.summary ||
          currentItem.scaleBarcodeSummary ||
          '',
        isRateFormUpadted: true,
      };

      setValue(`items.${existingIndex}.quantity`, nextQuantity, { shouldDirty: true });
      setValue(`items.${existingIndex}.barcode`, updatedItem.barcode, { shouldDirty: true });
      setValue(
        `items.${existingIndex}.scaleBarcodeMeta`,
        updatedItem.scaleBarcodeMeta,
        { shouldDirty: true }
      );
      setValue(
        `items.${existingIndex}.scaleBarcodeSummary`,
        updatedItem.scaleBarcodeSummary,
        { shouldDirty: true }
      );
      updateCalculatedFields(existingIndex, updatedItem);
      return;
    }

    const formattedItem = {
      ...createEmptyInvoiceItem(),
      ...formatInvoiceItem(product, {
        applyPromotions: true,
        quantityOverride,
        rateOverride,
        barcodeOverride,
        scaleBarcodeMeta,
      }),
      key: Date.now(),
    };

    const emptyRowIndex = forceNewLine
      ? -1
      : currentItems.findIndex((item) => !item?.productId);

    if (emptyRowIndex >= 0) {
      Object.entries(formattedItem).forEach(([key, value]) => {
        setValue(`items.${emptyRowIndex}.${key}`, value, { shouldDirty: true });
      });

      setProductsCloneData((prev) =>
        prev.filter((entry) => entry?._id !== formattedItem.productId)
      );
      return;
    }

    appendItem(formattedItem);
  }, [appendItem, getValues, setValue, updateCalculatedFields]);

  const handleSignatureSelection = (selected, field) => {
    if (selected) {
      field.onChange(selected._id);
      setValue('sign_type', 'manualSignature');
      return;
    }

    field.onChange('');
  };

  const handleAddBank = async (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    if (!addBank) {
      enqueueSnackbar('Add bank action is not available.', { variant: 'error' });
      return;
    }

    try {
      closeSnackbar();
      const loadingKey = enqueueSnackbar('Adding bank details...', {
        variant: 'info',
        persist: true,
      });

      const response = await addBank(newBank);
      closeSnackbar(loadingKey);

      if (!response?._id) {
        throw new Error('Failed to add bank details');
      }

      const createdBank = {
        _id: response._id,
        name: newBank.name,
        bankName: newBank.bankName,
        branch: newBank.branch,
        accountNumber: newBank.accountNumber,
        IFSCCode: newBank.IFSCCode,
      };

      setBanks((prev) => [...prev, createdBank]);
      setValue('bank', createdBank._id);
      trigger('bank');
      setNewBank({
        name: '',
        bankName: '',
        branch: '',
        accountNumber: '',
        IFSCCode: '',
      });
      setOpenBankModal(false);
      enqueueSnackbar('Bank details added successfully', { variant: 'success' });
    } catch (error) {
      console.error('Failed to add bank:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'Failed to add bank details', { variant: 'error' });
    }
  };

  const handleToggleNotes = () => {
    setNotesExpanded((prev) => !prev);
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

  const handleFormSubmit = async (data) => {
    try {
      closeSnackbar();

      const isValid = await trigger();
      if (!isValid) {
        notifyNotistackFormValidationErrors({ errors, closeSnackbar, enqueueSnackbar, getValues });
        return { success: false };
      }

      const currentFormData = {
        ...data,
        invoiceNumber: data.invoiceNumber || initialInvoiceNumber,
        customerId: isWalkIn ? walkInCustomerId : data.customerId,
        sign_type: data.sign_type || 'manualSignature',
        signatureId: data.signatureId || '',
        signatureName: data.signatureName || '',
      };

      const result = await onSave(buildAddInvoicePayload(currentFormData));

      if (!result?.success) {
        const errorMessage = result?.error?.message || result?.message || 'Failed to add invoice';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });

        return { success: false, message: errorMessage };
      }

      return result;
    } catch (error) {
      console.error('Error in form submission:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'An error occurred during submission', {
        variant: 'error',
        autoHideDuration: 5000,
      });
      return { success: false, message: error.message || 'An error occurred during submission' };
    }
  };

  const handleError = (formErrors) => {
    notifyNotistackFormValidationErrors({
      errors: formErrors,
      closeSnackbar,
      enqueueSnackbar,
      getValues,
    });
  };

  const handleCustomerChange = (selected) => {
    if (!selected) {
      setValue('isWalkIn', false);
      setValue('customerId', '');
      return;
    }

    if (selected.isWalkIn || selected._id === walkInCustomerId) {
      setValue('isWalkIn', true);
      setValue('customerId', walkInCustomerId);
      return;
    }

    setValue('isWalkIn', false);
  };

  return {
    title: 'Add Invoice',
    displayInvoiceNumber: initialInvoiceNumber || '',
    autoFocusFirstProductCell: true,
    control,
    handleSubmit,
    watch,
    trigger,
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
    openBankModal,
    setOpenBankModal,
    snackbar,
    setSnackbar,
    selectedLocation,
    branchSelectionError: storeOnlyValidationMessage,
    taxRates,
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleClearAppliedPromotion,
    handleClearScaleBarcode,
    handleDeleteItem,
    clearItems,
    appendItem,
    handleAddEmptyRow,
    handleQuickAddProduct,
    handleAddBank,
    handleSignatureSelection,
    handleFormSubmit,
    handleError,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    handleToggleNotes,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
    handleCustomerChange,
  };
}

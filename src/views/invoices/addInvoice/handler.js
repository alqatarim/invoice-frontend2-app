'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InvoiceSchema } from '@/views/invoices/InvoiceSchema';
import { formatDateForInput } from '@/utils/dateUtils';
import { paymentMethods } from '@/data/dataSets';
import { notifyNotistackFormValidationErrors } from '@/handlers/shared/notifyNotistackFormValidationErrors';
import { calculateItemValues } from '@/utils/salesItemsCalc';
import { formatInvoiceItem } from '@/utils/formatNewSellItem';
import { calculateInvoiceTotals } from '@/utils/salesTotals';
const CASHIER_SIGNATURE_STORAGE_KEY = 'addInvoice.cashierSignatureId';

const isStoreBranch = (branch) =>
  String(branch?.branchType || branch?.kind || '').trim().toLowerCase() === 'store';

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
  branchesData = [],
  onSave,
  addBank,
  enqueueSnackbar,
  closeSnackbar,
  schema = InvoiceSchema,
}) {
  const storeBranches = useMemo(
    () => (Array.isArray(branchesData) ? branchesData : []).filter(isStoreBranch),
    [branchesData]
  );
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
  const defaultBranchId =
    storeBranches.length === 1 ? storeBranches[0]?.branchId || '' : '';

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      invoiceNumber: initialInvoiceNumber || '',
      referenceNo: '',
      customerId: '',
      payment_method: '',
      branchId: defaultBranchId,
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

  const { fields, append, remove } = useFieldArray({
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

  const handleAddEmptyRow = useCallback(() => {
    append(createEmptyInvoiceItem());
  }, [append]);

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
    setValue,
    getValues,
    errors,
    fields,
    watchItems,
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
    openBankModal,
    setOpenBankModal,
    snackbar,
    setSnackbar,
    storeBranches,
    taxRates,
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleClearAppliedPromotion,
    handleClearScaleBarcode,
    handleDeleteItem,
    handleAddEmptyRow,
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

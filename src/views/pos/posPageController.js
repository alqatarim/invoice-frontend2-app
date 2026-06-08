'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAddInvoiceFeatureHandler from '@/views/invoices/addInvoice/handler';
import { calculateInvoiceTotals } from '@/utils/salesTotals';
import { formatDateForInput } from '@/utils/dateUtils';
import { useGlobalLocationScope } from '@/contexts/GlobalLocationContext';
import {
  findBranchByIdentifier,
  isStoreBranch,
  resolveBranchId,
} from '@/utils/branchAccess';
import { PosSchema } from '@/views/pos/PosSchema';

const HELD_SALES_KEY = 'standalonePos.heldSales';
const LEGACY_CASHIER_SIGNATURE_STORAGE_KEY = 'standalonePos.cashierSignatureId';

const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePaymentOption = option => {
  if (!option) return null;

  if (typeof option === 'string') {
    return { value: option, label: option };
  }

  return {
    value: option.value || option.label || '',
    label: option.label || option.value || '',
  };
};

const getCashierLabel = cashier => {
  const joinedName = [cashier?.firstName, cashier?.lastName]
    .map(part => String(part || '').trim())
    .filter(Boolean)
    .join(' ');

  return (
    String(cashier?.label || '').trim() ||
    String(cashier?.fullName || '').trim() ||
    String(cashier?.fullname || '').trim() ||
    joinedName ||
    String(cashier?.userName || '').trim() ||
    String(cashier?.email || '').trim() ||
    'Cashier'
  );
};

const normalizeCashierOption = cashier => {
  if (!cashier) return null;
  const id = String(cashier._id || cashier.value || cashier.id || '').trim();
  if (!id) return null;

  const assignedBranches = Array.isArray(cashier.assignedBranches)
    ? cashier.assignedBranches
    : [];
  const assignedBranchCodes = [
    ...(Array.isArray(cashier.assignedBranchCodes) ? cashier.assignedBranchCodes : []),
    ...assignedBranches.map(branch => branch?.branchId),
  ]
    .map(value => String(value || '').trim())
    .filter(Boolean);
  const assignedBranchIds = [
    ...(Array.isArray(cashier.assignedBranchIds) ? cashier.assignedBranchIds : []),
    ...assignedBranches.map(branch => branch?._id),
  ]
    .map(value => String(value || '').trim())
    .filter(Boolean);

  return {
    ...cashier,
    _id: id,
    value: id,
    label: getCashierLabel(cashier),
    assignedBranches,
    assignedBranchCodes: [...new Set(assignedBranchCodes)],
    assignedBranchIds: [...new Set(assignedBranchIds)],
  };
};

const cashierHasBranchAccess = (cashier, branchId) => {
  const normalizedBranchId = String(branchId || '').trim();
  if (!normalizedBranchId) return true;

  return (
    (cashier?.assignedBranchIds || []).some(value => String(value) === normalizedBranchId) ||
    (cashier?.assignedBranches || []).some(branch =>
      String(branch?._id || '') === normalizedBranchId
    )
  );
};

const getBranchValidationMessage = (
  branches = [],
  selectedBranchId = '',
  selectedLocation = null,
  storeOnlyValidationMessage = ''
) => {
  if (!selectedLocation) {
    return 'Choose a location from the top bar before continuing.';
  }

  if (!isStoreBranch(selectedLocation)) {
    return (
      storeOnlyValidationMessage ||
      `${selectedLocation?.name || 'The selected location'} is not a store. Choose a store from the top bar before continuing.`
    );
  }

  if (!Array.isArray(branches) || branches.length === 0) {
    return 'No assigned store is available for this cashier. Ask an admin to assign a store.';
  }

  if (!String(selectedBranchId || '').trim()) {
    return 'Choose one of your assigned stores before continuing.';
  }

  if (!findBranchByIdentifier(branches, selectedBranchId)) {
    return 'Selected store is outside your assigned access. Choose one of your assigned stores.';
  }

  return '';
};

export default function usePosPageController({
  customersData,
  productData,
  initialBanks,
  signatures,
  invoiceNumber,
  allowedBranchesData,
  posSettings,
  bootstrapPaymentMethods,
  cashiersData,
  currentUserId,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  initialErrorMessage = '',
}) {
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [heldSales, setHeldSales] = useState([]);
  const [posReceiptOpen, setPosReceiptOpen] = useState(false);
  const [posReceiptData, setPosReceiptData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchError, setBranchError] = useState('');

  const initialRowAddedRef = useRef(false);

  const handlers = useAddInvoiceFeatureHandler({
    initialInvoiceNumber: invoiceNumber,
    customersData,
    productData,
    initialBanks,
    cashiersData,
    currentUserId,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank: null,
    schema: PosSchema,
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    setError,
    clearErrors,
    errors,
    fields,
    watchItems,
    watchRoundOff,
    productsCloneData,
    banks,
    signOptions,
    paymentMethods,
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    updateCalculatedFields,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow,
    handleClearScaleBarcode,
    handleClearAppliedPromotion,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    clearItems,
    appendItem,
    handleError,
  } = handlers;

  const customers = Array.isArray(customersData) ? customersData : [];
  const cashierOptions = useMemo(
    () =>
      (Array.isArray(cashiersData) ? cashiersData : [])
        .map(normalizeCashierOption)
        .filter(Boolean),
    [cashiersData]
  );
  const branches = useMemo(
    () => (Array.isArray(allowedBranchesData) ? allowedBranchesData : []).filter(isStoreBranch),
    [allowedBranchesData]
  );
  const {
    selectedLocation,
    selectedLocationId: globalLocationId,
    selectedLocationType,
    isStoreSelected,
    storeOnlyValidationMessage,
  } = useGlobalLocationScope();
  const productLookup = useMemo(
    () =>
      new Map(
        (Array.isArray(productData) ? productData : [])
          .filter(product => product?._id)
          .map(product => [String(product._id), product])
      ),
    [productData]
  );

  const walkInRecord = useMemo(
    () =>
      customers.find(
        customer =>
          String(customer?.name || '').trim().toLowerCase() === 'walk-in customer'
      ) || null,
    [customers]
  );

  const walkInCustomerId = walkInRecord?._id || 'walk-in';

  const defaultBranchId = useMemo(() => {
    const globalStore = findBranchByIdentifier(branches, globalLocationId);
    return resolveBranchId(globalStore);
  }, [branches, globalLocationId]);

  const paymentMethodOptions = useMemo(() => {
    const source =
      Array.isArray(bootstrapPaymentMethods) && bootstrapPaymentMethods.length > 0
        ? bootstrapPaymentMethods
        : paymentMethods;

    return source
      .map(normalizePaymentOption)
      .filter(option => option?.value && option?.label);
  }, [bootstrapPaymentMethods, paymentMethods]);

  const defaultPaymentMethod = useMemo(() => {
    const configured = String(posSettings?.posDefaultPaymentMethod || '').trim();
    if (configured && paymentMethodOptions.some(option => option.value === configured)) {
      return configured;
    }
    if (paymentMethodOptions.some(option => option.value === 'Cash')) {
      return 'Cash';
    }
    return paymentMethodOptions[0]?.value || 'Cash';
  }, [paymentMethodOptions, posSettings?.posDefaultPaymentMethod]);

  const totals = useMemo(
    () =>
      calculateInvoiceTotals(
        Array.isArray(watchItems) ? watchItems.filter(item => item?.productId) : [],
        Boolean(watchRoundOff)
      ),
    [watchItems, watchRoundOff]
  );

  const totalAmount = toNumber(totals.TotalAmount);
  const tenderedValue = toNumber(tenderedAmount);
  const changeAmount = Math.max(0, Number((tenderedValue - totalAmount).toFixed(2)));

  const activeBranch = useMemo(
    () => findBranchByIdentifier(branches, selectedBranchId),
    [branches, selectedBranchId]
  );
  const activeBranchId = useMemo(() => resolveBranchId(activeBranch), [activeBranch]);
  const hasValidSelectedBranch = Boolean(activeBranchId) && isStoreSelected;
  const availableCashiers = useMemo(
    () => cashierOptions.filter(cashier => cashierHasBranchAccess(cashier, activeBranchId)),
    [activeBranchId, cashierOptions]
  );

  const selectedCashierId = watch('cashierId');
  const selectedCashier = useMemo(
    () => cashierOptions.find(cashier => cashier._id === selectedCashierId) || null,
    [cashierOptions, selectedCashierId]
  );

  const pushSnackbar = useCallback((message, severity = 'success') => {
    if (!message) return;

    enqueueSnackbar(message, {
      variant: severity,
      preventDuplicate: true,
      autoHideDuration: severity === 'error' ? 5000 : 3000,
    });
  }, [enqueueSnackbar]);

  const persistHeldSales = useCallback(nextHeldSales => {
    setHeldSales(nextHeldSales);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HELD_SALES_KEY, JSON.stringify(nextHeldSales));
    }
  }, []);

  const resetSale = useCallback(
    nextInvoiceNumber => {
      clearItems();
      handleAddEmptyRow();
      setTenderedAmount('');
      setIsWalkIn(true);
      setValue('customerId', walkInCustomerId);
      setValue('payment_method', defaultPaymentMethod);
      setValue('referenceNo', '');
      setValue('notes', '');
      setValue('termsAndCondition', '');
      setValue('bank', '');
      setValue('roundOff', false);
      const today = formatDateForInput(new Date());
      setValue('invoiceDate', today);
      setValue('dueDate', today);
      if (nextInvoiceNumber) {
        setValue('invoiceNumber', nextInvoiceNumber);
      }
    },
    [
      clearItems,
      defaultPaymentMethod,
      handleAddEmptyRow,
      setValue,
      walkInCustomerId,
    ]
  );

  useEffect(() => {
    setValue('posMode', true);
  }, [setValue]);

  useEffect(() => {
    if (initialErrorMessage) {
      pushSnackbar(initialErrorMessage, 'error');
    }
  }, [initialErrorMessage, pushSnackbar]);

  useEffect(() => {
    const nextBranchId = String(globalLocationId || '').trim();
    setSelectedBranchId(currentValue =>
      currentValue === nextBranchId ? currentValue : nextBranchId
    );
  }, [globalLocationId]);

  useEffect(() => {
    const nextBranchError = getBranchValidationMessage(
      branches,
      selectedBranchId,
      selectedLocation,
      storeOnlyValidationMessage
    );

    setBranchError(currentValue =>
      currentValue === nextBranchError ? currentValue : nextBranchError
    );
  }, [branches, selectedBranchId, selectedLocation, storeOnlyValidationMessage]);

  useEffect(() => {
    setValue('branchId', globalLocationId || '', { shouldValidate: true });
    setValue('branchType', selectedLocationType || '', { shouldValidate: true });
  }, [globalLocationId, selectedLocationType, setValue]);

  useEffect(() => {
    const current = getValues('payment_method');
    if (!current) {
      setValue('payment_method', defaultPaymentMethod);
    }
  }, [defaultPaymentMethod, getValues, setValue]);

  useEffect(() => {
    setValue('isWalkIn', isWalkIn);
    if (isWalkIn) {
      setValue('customerId', walkInCustomerId);
    }
  }, [isWalkIn, setValue, walkInCustomerId]);

  useEffect(() => {
    if (initialRowAddedRef.current) return;

    const items = getValues('items');
    if (!Array.isArray(items) || items.length === 0) {
      handleAddEmptyRow();
    }

    initialRowAddedRef.current = true;
  }, [getValues, handleAddEmptyRow]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedHeldSales = window.localStorage.getItem(HELD_SALES_KEY);
    if (storedHeldSales) {
      try {
        const parsed = JSON.parse(storedHeldSales);
        if (Array.isArray(parsed)) {
          setHeldSales(parsed);
        }
      } catch (error) {
        // Ignore stale local data.
      }
    }

    window.localStorage.removeItem(LEGACY_CASHIER_SIGNATURE_STORAGE_KEY);
  }, [setValue]);

  const handleCustomerChange = useCallback(
    customer => {
      const shouldUseWalkIn =
        !customer || customer?.isWalkIn || customer?._id === walkInCustomerId;

      setIsWalkIn(shouldUseWalkIn);
      setValue('customerId', shouldUseWalkIn ? walkInCustomerId : customer?._id || '');
    },
    [setValue, walkInCustomerId]
  );

  const buildHeldSaleSnapshot = useCallback(() => {
    const current = getValues();
    const items = Array.isArray(current.items)
      ? current.items.filter(item => item?.productId)
      : [];

    return {
      id: Date.now(),
      holdNumber: (heldSales[0]?.holdNumber || 0) + 1,
      branchId: activeBranchId,
      branchName: activeBranch?.name || '',
      customerId: current.customerId || '',
      isWalkIn,
      payment_method: current.payment_method || defaultPaymentMethod,
      tenderedAmount: tenderedValue,
      referenceNo: current.referenceNo || '',
      notes: current.notes || '',
      termsAndCondition: current.termsAndCondition || '',
      bank: current.bank || '',
      cashierId: current.cashierId || selectedCashier?._id || '',
      cashierName: current.cashierName || selectedCashier?.label || '',
      signatureId: current.signatureId || '',
      items,
      total: totalAmount,
      createdAt: new Date().toISOString(),
    };
  }, [
    activeBranch?.name,
    activeBranchId,
    defaultPaymentMethod,
    getValues,
    heldSales,
    isWalkIn,
    selectedCashier,
    tenderedValue,
    totalAmount,
  ]);

  const handleHoldSale = useCallback(() => {
    if (isSubmitting) return;

    const currentItems = Array.isArray(getValues('items'))
      ? getValues('items').filter(item => item?.productId)
      : [];

    if (currentItems.length === 0) {
      pushSnackbar('Nothing to hold yet', 'info');
      return;
    }

    if (!hasValidSelectedBranch) {
      pushSnackbar(
        branchError || 'Choose one of your assigned stores before holding this sale',
        'error'
      );
      return;
    }

    const snapshot = buildHeldSaleSnapshot();
    persistHeldSales([snapshot, ...heldSales].slice(0, 10));
    resetSale();
    pushSnackbar('Sale held successfully', 'success');
  }, [
    branchError,
    buildHeldSaleSnapshot,
    getValues,
    hasValidSelectedBranch,
    heldSales,
    isSubmitting,
    persistHeldSales,
    pushSnackbar,
    resetSale,
  ]);

  const restoreHeldSale = useCallback(
    sale => {
      const storedBranchId = String(sale?.branchId || '').trim();
      const restoredBranch = findBranchByIdentifier(branches, storedBranchId);
      const nextBranchId = resolveBranchId(restoredBranch) || defaultBranchId || '';

      clearItems();
      (sale?.items || []).forEach((item, index) => {
        appendItem({
          ...item,
          key: `${Date.now()}-${index}`,
        });
      });

      setSelectedBranchId(nextBranchId);
      setIsWalkIn(Boolean(sale?.isWalkIn));
      setValue(
        'customerId',
        sale?.isWalkIn ? walkInCustomerId : sale?.customerId || ''
      );
      setValue('payment_method', sale?.payment_method || defaultPaymentMethod);
      setValue('referenceNo', sale?.referenceNo || '');
      setValue('notes', sale?.notes || '');
      setValue('termsAndCondition', sale?.termsAndCondition || '');
      setValue('bank', sale?.bank || '');
      const fallbackCashier =
        availableCashiers.find(cashier => cashier._id === String(currentUserId || '')) ||
        availableCashiers[0] ||
        null;
      setValue('cashierId', sale?.cashierId || fallbackCashier?._id || '');
      setValue('cashierName', sale?.cashierName || fallbackCashier?.label || '');
      setValue('signatureId', sale?.signatureId || '');
      setTenderedAmount(String(sale?.tenderedAmount || ''));

      return {
        usedFallbackBranch: Boolean(storedBranchId) && !restoredBranch && Boolean(nextBranchId),
      };
    },
    [
      appendItem,
      availableCashiers,
      branches,
      clearItems,
      currentUserId,
      defaultBranchId,
      defaultPaymentMethod,
      setValue,
      walkInCustomerId,
    ]
  );

  const handleLoadHeldSale = useCallback(
    saleId => {
      if (isSubmitting) return;

      if (!hasValidSelectedBranch) {
        pushSnackbar(
          branchError || 'No assigned store is available to restore held sales',
          'error'
        );
        return;
      }

      const sale = heldSales.find(item => item.id === saleId);
      if (!sale) return;

      const restoreResult = restoreHeldSale(sale);
      persistHeldSales(heldSales.filter(item => item.id !== saleId));
      pushSnackbar(
        restoreResult?.usedFallbackBranch
          ? 'Held sale loaded into your current assigned store because the original store is no longer accessible'
          : 'Held sale loaded',
        restoreResult?.usedFallbackBranch ? 'warning' : 'success'
      );
    },
    [branchError, hasValidSelectedBranch, heldSales, isSubmitting, persistHeldSales, pushSnackbar, restoreHeldSale]
  );

  const handleDeleteHeldSale = useCallback(
    saleId => {
      if (isSubmitting) return;
      persistHeldSales(heldSales.filter(item => item.id !== saleId));
    },
    [heldSales, isSubmitting, persistHeldSales]
  );

  const buildCheckoutPayload = useCallback(() => {
    const current = getValues();
    const validItems = Array.isArray(current.items)
      ? current.items
        .filter(item => item?.productId)
        .map(item => {
          const product = productLookup.get(String(item.productId));

          return {
            ...item,
            name: item.name || product?.name || '',
            sku: item.sku || product?.sku || '',
            barcode: item.barcode || product?.barcode || '',
            units: item.units || product?.units?.name || '',
            unit: item.unit || product?.units?._id || '',
            taxInfo: item.taxInfo || product?.tax || null,
          };
        })
      : [];

    return {
      ...current,
      branchId: activeBranchId,
      branchName: activeBranch?.name || '',
      branchType: activeBranch?.branchType || activeBranch?.type || '',
      cashierId: current.cashierId || selectedCashier?._id || '',
      cashierName: current.cashierName || selectedCashier?.label || '',
      posMode: true,
      type: 'receipt',
      isWalkIn,
      customerId: isWalkIn ? walkInCustomerId : current.customerId || '',
      dueDate: current.invoiceDate || current.dueDate,
      tenderedAmount: tenderedValue,
      changeAmount,
      items: validItems,
    };
  }, [
    activeBranch?.branchType,
    activeBranch?.type,
    activeBranch?.name,
    activeBranchId,
    changeAmount,
    getValues,
    isWalkIn,
    productLookup,
    selectedCashier,
    tenderedValue,
    walkInCustomerId,
  ]);

  const handleCompleteSale = useCallback(async () => {
    if (isSubmitting) {
      return { success: false };
    }

    if (!hasValidSelectedBranch) {
      pushSnackbar(branchError || 'Choose one of your assigned stores before checkout', 'error');
      return { success: false };
    }

    let validationErrors = null;
    let isValid = false;

    await handleSubmit(
      () => {
        isValid = true;
      },
      formErrors => {
        validationErrors = formErrors;
      }
    )();

    const currentItems = Array.isArray(getValues('items')) ? getValues('items') : [];
    const noProductSelected = !currentItems.some((item) => item?.productId);
    if (noProductSelected) {
      setError('items.0.productId', {
        type: 'manual',
        message: 'Select a product before checkout',
      });
    } else {
      clearErrors('items.0.productId');
    }

    if (!isValid || noProductSelected) {
      const itemErrors = Array.isArray(validationErrors?.items)
        ? [...validationErrors.items]
        : [];
      if (noProductSelected) {
        itemErrors[0] = {
          ...(itemErrors[0] || {}),
          productId: {
            type: 'manual',
            message: 'Product is required',
          },
        };
      }

      handleError({
        ...(validationErrors || {}),
        ...(itemErrors.length ? { items: itemErrors } : {}),
      });
      return { success: false };
    }

    const payload = buildCheckoutPayload();

    if (!payload.branchId) {
      pushSnackbar('Choose one of your assigned stores before checkout', 'error');
      return { success: false };
    }

    if (!payload.items.length) {
      pushSnackbar('Add at least one product before checkout', 'error');
      return { success: false };
    }

    if (payload.payment_method === 'Cash' && tenderedValue < totalAmount) {
      pushSnackbar('Tendered amount must cover the total for cash sales', 'error');
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      const result = await onSave(payload);
      if (!result?.success) {
        pushSnackbar(result?.message || 'Checkout failed', 'error');
        return result;
      }

      const responseData = result?.data || {};
      setPosReceiptData(responseData);
      setPosReceiptOpen(true);

      if (responseData?.nextInvoiceNumber) {
        setValue('invoiceNumber', responseData.nextInvoiceNumber);
      }

      return result;
    } catch (error) {
      pushSnackbar('An unexpected error occurred', 'error');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }, [
    branchError,
    buildCheckoutPayload,
    clearErrors,
    getValues,
    handleError,
    handleSubmit,
    hasValidSelectedBranch,
    isSubmitting,
    onSave,
    pushSnackbar,
    setError,
    setValue,
    tenderedValue,
    totalAmount,
  ]);

  const handleUpdateCartQuantity = useCallback(
    (index, newQuantity) => {
      if (newQuantity <= 0) {
        handleDeleteItem(index);
        return;
      }

      const currentItem = getValues(`items.${index}`);
      if (!currentItem) return;

      const updatedItem = {
        ...currentItem,
        quantity: newQuantity,
        isRateFormUpadted: true,
      };

      setValue(`items.${index}.quantity`, newQuantity, { shouldDirty: true });
      updateCalculatedFields(index, updatedItem);
    },
    [getValues, handleDeleteItem, setValue, updateCalculatedFields]
  );

  const handleNewSale = useCallback(() => {
    resetSale(posReceiptData?.nextInvoiceNumber || '');
    setPosReceiptOpen(false);
    setPosReceiptData(null);
  }, [posReceiptData?.nextInvoiceNumber, resetSale]);

  return {
    autoFocusFirstProductCell: true,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    errors,
    fields,
    banks,
    signOptions,
    cashierOptions: availableCashiers,
    paymentMethodOptions,
    productsCloneData,
    branches,
    activeBranch,
    selectedLocation,
    selectedLocationType,
    branchError,
    hasValidSelectedBranch,
    selectedBranchId,
    setSelectedBranchId,
    isWalkIn,
    setIsWalkIn,
    tenderedAmount,
    setTenderedAmount,
    totalAmount,
    changeAmount,
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    watchItems,
    posReceiptOpen,
    setPosReceiptOpen,
    posReceiptData,
    heldSales,
    isSubmitting,
    handleCustomerChange,
    handleHoldSale,
    handleLoadHeldSale,
    handleDeleteHeldSale,
    handleCompleteSale,
    handleNewSale,
    handleUpdateItemProduct,
    handleClearAppliedPromotion,
    handleUpdateCartQuantity,
    handleDeleteItem,
    handleAddEmptyRow,
    handleClearScaleBarcode,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    updateCalculatedFields,
  };
}

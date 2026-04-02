import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAddInvoiceHandlers from '@/views/invoices/addInvoice/handler';
import { calculateInvoiceTotals } from '@/utils/salesTotals';
import { formatDateForInput } from '@/utils/dateUtils';
import { resolveProductBarcodeMatch } from '@/utils/productScaleBarcode';
import { PosSchema } from '@/views/pos/PosSchema';

const HELD_SALES_KEY = 'standalonePos.heldSales';
const CASHIER_STORAGE_KEY = 'standalonePos.cashierSignatureId';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePaymentOption = (option) => {
  if (!option) return null;
  if (typeof option === 'string') {
    return { value: option, label: option };
  }

  return {
    value: option.value || option.label || '',
    label: option.label || option.value || '',
  };
};

const isStoreBranch = (branch) =>
  String(branch?.branchType || branch?.kind || '').trim().toLowerCase() === 'store';

const getBranchIdentifiers = (branch) =>
  [branch?.branchId, branch?._id]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

const findBranchByIdentifier = (branches = [], value = '') => {
  const normalizedValue = String(value || '').trim();
  if (!normalizedValue) return null;

  return (Array.isArray(branches) ? branches : []).find((branch) =>
    getBranchIdentifiers(branch).includes(normalizedValue)
  ) || null;
};

const resolveBranchId = (branch) => getBranchIdentifiers(branch)[0] || '';

const getBranchValidationMessage = (branches = [], selectedBranchId = '') => {
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

export default function usePosPageHandlers({
  customersData,
  productData,
  initialBanks,
  signatures,
  invoiceNumber,
  allowedBranchesData,
  posSettings,
  bootstrapPaymentMethods,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  preferredBranchId = '',
  initialErrorMessage = '',
}) {
  const [barcodeDraft, setBarcodeDraft] = useState('');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [isWalkIn, setIsWalkIn] = useState(true);
  const [heldSales, setHeldSales] = useState([]);
  const [posReceiptOpen, setPosReceiptOpen] = useState(false);
  const [posReceiptData, setPosReceiptData] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'success',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branchError, setBranchError] = useState('');

  const scanBufferRef = useRef('');
  const scanTimeoutRef = useRef(null);
  const initialRowAddedRef = useRef(false);

  const handlers = useAddInvoiceHandlers({
    invoiceNumber,
    productData,
    initialBanks,
    signatures,
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
    trigger,
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
    handleQuickAddProduct,
    handleClearScaleBarcode,
    handleClearAppliedPromotion,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    clearItems,
    appendItem,
  } = handlers;

  const customers = Array.isArray(customersData) ? customersData : [];
  const branches = useMemo(
    () => (Array.isArray(allowedBranchesData) ? allowedBranchesData : []).filter(isStoreBranch),
    [allowedBranchesData]
  );
  const productLookup = useMemo(
    () =>
      new Map(
        (Array.isArray(productData) ? productData : [])
          .filter((product) => product?._id)
          .map((product) => [String(product._id), product])
      ),
    [productData]
  );

  const walkInRecord = useMemo(
    () =>
      customers.find(
        (customer) =>
          String(customer?.name || '').trim().toLowerCase() ===
          'walk-in customer'
      ) || null,
    [customers]
  );

  const walkInCustomerId = walkInRecord?._id || 'walk-in';

  const defaultBranchId = useMemo(() => {
    const preferredBranch = findBranchByIdentifier(branches, preferredBranchId);
    if (preferredBranch) {
      return resolveBranchId(preferredBranch);
    }

    const configuredBranch = findBranchByIdentifier(branches, posSettings?.posDefaultBranchId);
    if (configuredBranch) {
      return resolveBranchId(configuredBranch);
    }

    return resolveBranchId(branches[0]);
  }, [branches, posSettings?.posDefaultBranchId, preferredBranchId]);

  const paymentMethodOptions = useMemo(() => {
    const source =
      Array.isArray(bootstrapPaymentMethods) && bootstrapPaymentMethods.length > 0
        ? bootstrapPaymentMethods
        : paymentMethods;

    return source
      .map(normalizePaymentOption)
      .filter((option) => option?.value && option?.label);
  }, [bootstrapPaymentMethods, paymentMethods]);

  const defaultPaymentMethod = useMemo(() => {
    const configured = String(posSettings?.posDefaultPaymentMethod || '').trim();
    if (configured && paymentMethodOptions.some((option) => option.value === configured)) {
      return configured;
    }
    if (paymentMethodOptions.some((option) => option.value === 'Cash')) {
      return 'Cash';
    }
    return paymentMethodOptions[0]?.value || 'Cash';
  }, [paymentMethodOptions, posSettings?.posDefaultPaymentMethod]);

  const quickPayAmounts = useMemo(() => {
    const raw = Array.isArray(posSettings?.posQuickPayAmounts)
      ? posSettings.posQuickPayAmounts
      : [];

    const cleaned = raw
      .map((value) => toNumber(value))
      .filter((value) => value > 0);

    return cleaned.length > 0 ? cleaned : [10, 50, 100, 200, 500];
  }, [posSettings?.posQuickPayAmounts]);

  const totals = useMemo(
    () =>
      calculateInvoiceTotals(
        Array.isArray(watchItems) ? watchItems.filter((item) => item?.productId) : [],
        Boolean(watchRoundOff)
      ),
    [watchItems, watchRoundOff]
  );

  const totalAmount = toNumber(totals.TotalAmount);
  const tenderedValue = toNumber(tenderedAmount);
  const changeAmount = Math.max(0, Number((tenderedValue - totalAmount).toFixed(2)));
  const quickProducts = Array.isArray(productsCloneData)
    ? productsCloneData.slice(0, 10)
    : [];

  const activeBranch = useMemo(
    () => findBranchByIdentifier(branches, selectedBranchId),
    [branches, selectedBranchId]
  );
  const activeBranchId = useMemo(() => resolveBranchId(activeBranch), [activeBranch]);
  const hasValidSelectedBranch = Boolean(activeBranchId);

  const selectedCashierId = watch('signatureId');
  const selectedPaymentMethod = watch('payment_method');

  const pushSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const persistHeldSales = useCallback((nextHeldSales) => {
    setHeldSales(nextHeldSales);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(HELD_SALES_KEY, JSON.stringify(nextHeldSales));
    }
  }, []);

  const resetSale = useCallback(
    (nextInvoiceNumber) => {
      clearItems();
      handleAddEmptyRow();
      setBarcodeDraft('');
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
      handleAddEmptyRow,
      setValue,
      walkInCustomerId,
      defaultPaymentMethod,
    ]
  );

  useEffect(() => {
    setValue('posMode', true);
  }, [setValue]);

  useEffect(() => {
    if (branches.length === 0) {
      if (selectedBranchId) {
        setSelectedBranchId('');
      }
      return;
    }

    if (!selectedBranchId) {
      if (defaultBranchId) {
        setSelectedBranchId(defaultBranchId);
      }
      return;
    }

    const matchedBranch = findBranchByIdentifier(branches, selectedBranchId);
    if (!matchedBranch) {
      if (defaultBranchId !== selectedBranchId) {
        setSelectedBranchId(defaultBranchId || '');
      }
      return;
    }

    const canonicalBranchId = resolveBranchId(matchedBranch);
    if (canonicalBranchId && canonicalBranchId !== selectedBranchId) {
      setSelectedBranchId(canonicalBranchId);
    }
  }, [branches, defaultBranchId, selectedBranchId]);

  useEffect(() => {
    const nextBranchError = getBranchValidationMessage(branches, selectedBranchId);
    setBranchError((currentValue) =>
      currentValue === nextBranchError ? currentValue : nextBranchError
    );
  }, [branches, selectedBranchId]);

  useEffect(() => {
    setValue('branchId', activeBranchId);
  }, [activeBranchId, setValue]);

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
    setValue('taxableAmount', Number(totals.taxableAmount || 0).toFixed(2));
    setValue('totalDiscount', Number(totals.totalDiscount || 0).toFixed(2));
    setValue('vat', Number(totals.vat || 0).toFixed(2));
    setValue('TotalAmount', Number(totals.TotalAmount || 0).toFixed(2));
    setValue('roundOffValue', Number(totals.roundOffValue || 0).toFixed(2));
  }, [totals, setValue]);

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
        // ignore stale local data
      }
    }

    const storedCashierId = window.localStorage.getItem(CASHIER_STORAGE_KEY);
    if (storedCashierId) {
      setValue('signatureId', storedCashierId);
      setValue('sign_type', 'manualSignature');
    }
  }, [setValue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!selectedCashierId) {
      window.localStorage.removeItem(CASHIER_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(CASHIER_STORAGE_KEY, selectedCashierId);
  }, [selectedCashierId]);

  const handleBarcodeScan = useCallback(
    (value) => {
      const barcode = String(value || '').trim();
      if (!barcode) return;

      const barcodeMatch = resolveProductBarcodeMatch(productData, barcode);
      if (!barcodeMatch?.product) {
        pushSnackbar('No product found for this barcode', 'error');
        return;
      }

      handleQuickAddProduct(barcodeMatch.product, barcodeMatch.scaleBarcodeMeta
        ? {
          forceNewLine: true,
          quantityOverride: barcodeMatch.scaleBarcodeMeta.quantity,
          rateOverride: barcodeMatch.scaleBarcodeMeta.rate,
          barcodeOverride: barcodeMatch.scaleBarcodeMeta.barcode,
          scaleBarcodeMeta: barcodeMatch.scaleBarcodeMeta,
        }
        : undefined);
      pushSnackbar(barcodeMatch.scaleBarcodeMeta?.summary || 'Product added', 'success');
    },
    [handleQuickAddProduct, productData, pushSnackbar]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleKeyDown = (event) => {
      const active = document.activeElement;
      const tagName = active?.tagName?.toLowerCase();
      const isEditable =
        ['input', 'textarea', 'select'].includes(tagName) || active?.isContentEditable;

      if (isEditable) return;

      if (event.key === 'Enter') {
        const scannedValue = scanBufferRef.current;
        scanBufferRef.current = '';

        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
          scanTimeoutRef.current = null;
        }

        if (scannedValue) {
          handleBarcodeScan(scannedValue);
        }
        return;
      }

      if (event.key.length === 1) {
        scanBufferRef.current += event.key;
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }
        scanTimeoutRef.current = window.setTimeout(() => {
          scanBufferRef.current = '';
          scanTimeoutRef.current = null;
        }, 120);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [handleBarcodeScan]);

  const handleCustomerChange = useCallback(
    (customer) => {
      const shouldUseWalkIn =
        !customer || customer?.isWalkIn || customer?._id === walkInCustomerId;
      setIsWalkIn(shouldUseWalkIn);
      if (!shouldUseWalkIn) {
        setValue('customerId', customer?._id || '');
      }
    },
    [setValue, walkInCustomerId]
  );

  const handleBarcodeQuickAdd = useCallback(() => {
    const value = barcodeDraft.trim();
    if (!value) {
      pushSnackbar('Enter a barcode first', 'error');
      return;
    }

    handleBarcodeScan(value);
    setBarcodeDraft('');
  }, [barcodeDraft, handleBarcodeScan, pushSnackbar]);

  const buildHeldSaleSnapshot = useCallback(() => {
    const current = getValues();
    const items = Array.isArray(current.items)
      ? current.items.filter((item) => item?.productId)
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
    tenderedValue,
    totalAmount,
  ]);

  const handleHoldSale = useCallback(() => {
    const currentItems = Array.isArray(getValues('items'))
      ? getValues('items').filter((item) => item?.productId)
      : [];

    if (currentItems.length === 0) {
      pushSnackbar('Nothing to hold yet', 'info');
      return;
    }

    if (!hasValidSelectedBranch) {
      pushSnackbar(branchError || 'Choose one of your assigned stores before holding this sale', 'error');
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
    persistHeldSales,
    pushSnackbar,
    resetSale,
  ]);

  const restoreHeldSale = useCallback(
    (sale) => {
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
      setValue('signatureId', sale?.signatureId || '');
      setTenderedAmount(String(sale?.tenderedAmount || ''));

      return {
        usedFallbackBranch: Boolean(storedBranchId) && !restoredBranch && Boolean(nextBranchId),
      };
    },
    [
      appendItem,
      branches,
      clearItems,
      defaultBranchId,
      defaultPaymentMethod,
      setValue,
      walkInCustomerId,
    ]
  );

  const handleLoadHeldSale = useCallback(
    (saleId) => {
      if (!branches.length) {
        pushSnackbar(branchError || 'No assigned store is available to restore held sales', 'error');
        return;
      }

      const sale = heldSales.find((item) => item.id === saleId);
      if (!sale) return;

      const restoreResult = restoreHeldSale(sale);
      persistHeldSales(heldSales.filter((item) => item.id !== saleId));
      pushSnackbar(
        restoreResult?.usedFallbackBranch
          ? 'Held sale loaded into your current assigned store because the original store is no longer accessible'
          : 'Held sale loaded',
        restoreResult?.usedFallbackBranch ? 'warning' : 'success'
      );
    },
    [branchError, branches.length, heldSales, persistHeldSales, pushSnackbar, restoreHeldSale]
  );

  const handleDeleteHeldSale = useCallback(
    (saleId) => {
      persistHeldSales(heldSales.filter((item) => item.id !== saleId));
    },
    [heldSales, persistHeldSales]
  );

  const handleResumeLatest = useCallback(() => {
    if (!branches.length) {
      pushSnackbar(branchError || 'No assigned store is available to resume held sales', 'error');
      return;
    }

    if (heldSales.length === 0) {
      pushSnackbar('No held sales available', 'info');
      return;
    }

    const [latest, ...rest] = heldSales;
    const restoreResult = restoreHeldSale(latest);
    persistHeldSales(rest);
    pushSnackbar(
      restoreResult?.usedFallbackBranch
        ? 'Resumed held sale in your current assigned store because the original store is no longer accessible'
        : 'Resumed latest held sale',
      restoreResult?.usedFallbackBranch ? 'warning' : 'success'
    );
  }, [branchError, branches.length, heldSales, persistHeldSales, pushSnackbar, restoreHeldSale]);

  const handleQuickTenderAmount = useCallback(
    (value) => {
      if (value === 'exact') {
        setTenderedAmount(Number(totalAmount).toFixed(2));
        return;
      }
      setTenderedAmount(String(value));
    },
    [totalAmount]
  );

  const buildCheckoutPayload = useCallback(() => {
    const current = getValues();
    const validItems = Array.isArray(current.items)
      ? current.items
        .filter((item) => item?.productId)
        .map((item) => {
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
      branchType: activeBranch?.branchType || activeBranch?.kind || '',
      cashierId: current.signatureId || '',
      cashierName:
        signOptions.find((option) => option?._id === current.signatureId)?.signatureName ||
        signOptions.find((option) => option?._id === current.signatureId)?.label ||
        '',
      posMode: true,
      documentType: 'receipt',
      isWalkIn,
      customerId: isWalkIn ? walkInCustomerId : current.customerId || '',
      dueDate: current.invoiceDate || current.dueDate,
      tenderedAmount: tenderedValue,
      changeAmount,
      items: validItems,
    };
  }, [
    activeBranchId,
    activeBranch?.branchType,
    activeBranch?.kind,
    activeBranch?.name,
    changeAmount,
    getValues,
    isWalkIn,
    signOptions,
    productLookup,
    tenderedValue,
    walkInCustomerId,
  ]);

  const handleCompleteSale = useCallback(async () => {
    if (!hasValidSelectedBranch) {
      pushSnackbar(branchError || 'Choose one of your assigned stores before checkout', 'error');
      return { success: false };
    }

    const isValid = await trigger();
    if (!isValid) {
      pushSnackbar('Please correct the highlighted POS fields before checkout', 'error');
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
    hasValidSelectedBranch,
    onSave,
    pushSnackbar,
    setValue,
    tenderedValue,
    totalAmount,
    trigger,
  ]);

  const handleUpdateCartQuantity = useCallback((index, newQuantity) => {
    if (newQuantity <= 0) {
      handleDeleteItem(index);
      return;
    }
    const currentItem = getValues(`items.${index}`);
    if (!currentItem) return;
    
    const updatedItem = {
      ...currentItem,
      quantity: newQuantity,
      isRateFormUpadted: true
    };
    setValue(`items.${index}.quantity`, newQuantity, { shouldDirty: true });
    updateCalculatedFields(index, updatedItem);
  }, [getValues, setValue, updateCalculatedFields, handleDeleteItem]);

  const handleNewSale = useCallback(() => {
    resetSale(posReceiptData?.nextInvoiceNumber || '');
    setPosReceiptOpen(false);
    setPosReceiptData(null);
  }, [posReceiptData?.nextInvoiceNumber, resetSale]);

  return {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    errors,
    fields,
    banks,
    signOptions,
    paymentMethodOptions,
    quickPayAmounts,
    quickProducts,
    productsCloneData,
    branches,
    activeBranch,
    branchError,
    hasValidSelectedBranch,
    selectedBranchId,
    setSelectedBranchId,
    isWalkIn,
    setIsWalkIn,
    barcodeDraft,
    setBarcodeDraft,
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
    snackbar,
    setSnackbar,
    isSubmitting,
    handleCustomerChange,
    handleBarcodeQuickAdd,
    handleHoldSale,
    handleLoadHeldSale,
    handleDeleteHeldSale,
    handleResumeLatest,
    handleQuickTenderAmount,
    handleCompleteSale,
    handleNewSale,
    handleUpdateItemProduct,
    handleClearAppliedPromotion,
    handleUpdateCartQuantity,
    handleDeleteItem,
    handleAddEmptyRow,
    handleQuickAddProduct,
    handleClearScaleBarcode,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    updateCalculatedFields,
  };
}

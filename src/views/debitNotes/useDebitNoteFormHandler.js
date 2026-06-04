'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { paymentMethods, purchaseReturnStatuses } from '@/data/dataSets';
import { DebitNoteSchema } from '@/views/debitNotes/DebitNoteSchema';
import { formatDateForInput } from '@/utils/dateUtils';
import { calculatePurchaseItemValues } from '@/utils/purchaseItemCalculations';
import { formatNewBuyItem } from '@/utils/formatNewBuyItem';
import { notifyNotistackFormValidationErrors } from '@/utils/notifyNotistackFormValidationErrors';

export function mapDebitNoteItems(items = []) {
  return items.map(item => ({
    productId: item.productId?._id || item.productId || '',
    name: item.name || '',
    sku: item.sku || item.productId?.sku || '',
    category: item.category || item.productId?.category || null,
    quantity: item.quantity || 1,
    units: item.units || item.unit || '',
    unit: item.unit || item.unit_id || '',
    rate: item.rate || 0,
    form_updated_rate: item.form_updated_rate || item.rate || 0,
    discount: item.discount || 0,
    form_updated_discount: item.form_updated_discount || item.discount || 0,
    discountType: item.discountType || item.form_updated_discounttype || 3,
    form_updated_discounttype: item.form_updated_discounttype || item.discountType || 3,
    tax: item.tax || 0,
    form_updated_tax: item.form_updated_tax || item.taxInfo?.taxRate || item.tax || 0,
    taxInfo: item.taxInfo || { taxRate: 0 },
    amount: item.amount || 0,
    taxableAmount: item.taxableAmount || 0,
    key: item.key || Date.now(),
    isRateFormUpadted: item.isRateFormUpadted || false,
  }));
}

function useFormHandler({ mode, debitNoteNumber, debitNoteData }) {
  const today = formatDateForInput(new Date());
  const isEdit = mode === 'edit';
  const resolvedDebitNoteNumber =
    debitNoteData?.debit_note_id || debitNoteData?.debitNoteNumber || debitNoteNumber || '';

  const defaultValues = isEdit
    ? {
        id: debitNoteData?._id || '',
        debitNoteNumber: resolvedDebitNoteNumber,
        debit_note_id: resolvedDebitNoteNumber,
        referenceNo: debitNoteData?.referenceNo || '',
        vendorId: debitNoteData?.vendorId?._id || debitNoteData?.vendorId || '',
        employee: debitNoteData?.employee?._id || debitNoteData?.employee || '',
        payment_method: debitNoteData?.payment_method || debitNoteData?.paymentMode || '',
        paymentMode: debitNoteData?.paymentMode || debitNoteData?.payment_method || '',
        purchaseOrderDate: debitNoteData?.purchaseOrderDate
          ? formatDateForInput(new Date(debitNoteData.purchaseOrderDate))
          : today,
        dueDate: debitNoteData?.dueDate
          ? formatDateForInput(new Date(debitNoteData.dueDate))
          : today,
        taxableAmount: debitNoteData?.taxableAmount || 0,
        TotalAmount: debitNoteData?.TotalAmount || 0,
        notes: debitNoteData?.notes || '',
        vat: debitNoteData?.vat || 0,
        totalDiscount: debitNoteData?.totalDiscount || 0,
        roundOff: debitNoteData?.roundOff || false,
        termsAndCondition: debitNoteData?.termsAndCondition || '',
        bank: debitNoteData?.bank?._id || debitNoteData?.bank || '',
        roundOffValue: debitNoteData?.roundOffValue || 0,
        status: debitNoteData?.status || purchaseReturnStatuses.find(item => item.summaryKey === 'pending')?.value,
        items: mapDebitNoteItems(debitNoteData?.items),
      }
    : {
        debitNoteNumber: debitNoteNumber || '',
        debit_note_id: debitNoteNumber || '',
        referenceNo: '',
        vendorId: '',
        employee: '',
        payment_method: '',
        paymentMode: '',
        purchaseOrderDate: today,
        dueDate: today,
        taxableAmount: 0,
        TotalAmount: 0,
        notes: '',
        vat: 0,
        totalDiscount: 0,
        roundOff: false,
        termsAndCondition: '',
        bank: '',
        roundOffValue: 0,
        status: purchaseReturnStatuses.find(item => item.summaryKey === 'draft')?.value,
        items: [],
      };

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(DebitNoteSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  return {
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    errors,
    fields,
    append,
    remove,
    watchItems: watch('items'),
    watchRoundOff: watch('roundOff'),
    isEdit,
  };
}

function useItemsHandler({ setValue, getValues, append, remove, productData, productsCloneData, setProductsCloneData }) {
  const [discountMenu, setDiscountMenu] = useState({ anchorEl: null, rowIndex: null });
  const [taxMenu, setTaxMenu] = useState({ anchorEl: null, rowIndex: null });

  const updateCalculatedFields = (index, item) => {
    const calculated = calculatePurchaseItemValues(item);

    setValue(`items.${index}.rate`, calculated.rate);
    setValue(`items.${index}.discount`, calculated.discount);
    setValue(`items.${index}.tax`, calculated.tax);
    setValue(`items.${index}.amount`, calculated.amount);
    setValue(`items.${index}.taxableAmount`, calculated.taxableAmount);
  };

  const handleUpdateItemProduct = (index, productId, previousProductId) => {
    const product = productData.find(item => item._id === productId);

    if (!product) {
      setValue(`items.${index}.productId`, '');
      return;
    }

    setValue(`items.${index}.productId`, productId);
    setValue(`items.${index}.name`, product.name);
    setValue(`items.${index}.sku`, product.sku || '');
    setValue(`items.${index}.category`, product.category || null);
    setValue(`items.${index}.units`, product.units?.name || '');
    setValue(`items.${index}.unit`, product.units?._id || '');
    setValue(`items.${index}.rate`, product.purchasePrice || product.sellingPrice || 0);
    setValue(`items.${index}.form_updated_rate`, product.purchasePrice || product.sellingPrice || 0);
    setValue(`items.${index}.discountType`, product.discountType || 3);
    setValue(`items.${index}.form_updated_discounttype`, product.discountType || 3);
    setValue(`items.${index}.discount`, product.discountValue || 0);
    setValue(`items.${index}.form_updated_discount`, product.discountValue || 0);
    setValue(`items.${index}.taxInfo`, product.tax || { taxRate: 0 });
    setValue(`items.${index}.form_updated_tax`, product.tax?.taxRate || 0);
    setValue(`items.${index}.isRateFormUpadted`, false);

    if (!getValues(`items.${index}.quantity`)) {
      setValue(`items.${index}.quantity`, 1);
    }

    updateCalculatedFields(index, getValues(`items.${index}`));

    const updatedProducts = productsCloneData.filter(item => item._id !== productId);
    if (previousProductId) {
      const previousProduct = productData.find(item => item._id === previousProductId);
      if (previousProduct) {
        updatedProducts.push(previousProduct);
      }
    }
    setProductsCloneData(updatedProducts);
  };

  const handleDeleteItem = index => {
    const item = getValues(`items.${index}`);
    if (item.productId) {
      const product = productData.find(productItem => productItem._id === item.productId);
      if (product) {
        setProductsCloneData([...productsCloneData, product]);
      }
    }
    remove(index);
  };

  const handleAddEmptyRow = () => {
    append(formatNewBuyItem());
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

    updateCalculatedFields(index, getValues(`items.${index}`));
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
    updateCalculatedFields(index, getValues(`items.${index}`));
    handleTaxClose();
  };

  return {
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
  };
}

function useBankHandler({ initialBanks, addBank }) {
  const [banks, setBanks] = useState(initialBanks || []);
  const [newBank, setNewBank] = useState({
    bankName: '',
    branch: '',
    accountNumber: '',
    IFSCCode: '',
  });

  useEffect(() => {
    setBanks(initialBanks || []);
  }, [initialBanks]);

  const handleAddBank = async bankData => {
    if (addBank) {
      const result = await addBank(bankData);
      if (result.success && result.data) {
        setBanks([...banks, result.data]);
        setNewBank({
          bankName: '',
          branch: '',
          accountNumber: '',
          IFSCCode: '',
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
    handleAddBank,
  };
}

function useDialogHandler({ setValue, getValues }) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState('');

  const handleToggleNotes = () => {
    setNotesExpanded(previous => !previous);
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

  return {
    notesExpanded,
    termsDialogOpen,
    tempTerms,
    setTempTerms,
    handleToggleNotes,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
  };
}

function useSubmissionHandler({ closeSnackbar, onSave, isEdit }) {
  const router = useRouter();

  const buildDebitNotePayload = (data, status) => {
    const debitNoteId = data.debit_note_id || data.debitNoteNumber || '';
    const paymentMethod = data.payment_method || data.paymentMode || 'Cash';
    const bankValue = data.bank?._id || data.bank || '';

    const payload = {
      debit_note_id: debitNoteId,
      vendorId: data.vendorId,
      employee: data.employee || '',
      payment_method: paymentMethod,
      paymentMode: paymentMethod,
      taxableAmount: Number(data.taxableAmount),
      vat: Number(data.vat),
      roundOff: data.roundOff || false,
      totalDiscount: Number(data.totalDiscount),
      TotalAmount: Number(data.TotalAmount),
      referenceNo: data.referenceNo || '',
      dueDate: data.dueDate,
      purchaseOrderDate: data.purchaseOrderDate || data.debitNoteDate || '',
      notes: data.notes || '',
      bank: bankValue,
      termsAndCondition: data.termsAndCondition || '',
      status,
      items: (data.items || []).map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: Number(item.quantity),
        units: item.units,
        unit: item.unit,
        rate: Number(item.rate),
        discount: Number(item.discount),
        discountType: Number(item.discountType),
        tax: Number(item.tax),
        taxInfo: item.taxInfo,
        amount: Number(item.amount),
        key: item.key,
        form_updated_rate: item.form_updated_rate,
        form_updated_discount: item.form_updated_discount,
        form_updated_discounttype: item.form_updated_discounttype,
        form_updated_tax: item.form_updated_tax,
        isRateFormUpadted: item.isRateFormUpadted,
      })),
    };

    if (isEdit && data.id) {
      payload.id = data.id;
    }

    return payload;
  };

  const handleFormSubmit = async data => {
    try {
      closeSnackbar?.();

      const pendingStatus = purchaseReturnStatuses.find(item => item.summaryKey === 'pending')?.value;
      const status = isEdit ? data.status || pendingStatus : pendingStatus;
      const payload = buildDebitNotePayload(data, status);
      const result = await onSave(payload);

      if (result?.success) {
        setTimeout(() => {
          router.push('/debitNotes/purchaseReturn-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting debit note:', error);
    }
  };

  const handleDraftSubmit = async data => {
    if (isEdit) {
      return;
    }

    try {
      closeSnackbar?.();

      const draftStatus = purchaseReturnStatuses.find(item => item.summaryKey === 'draft')?.value;
      const payload = buildDebitNotePayload(data, draftStatus);
      const result = await onSave(payload, { isDraft: true });

      if (result?.success) {
        setTimeout(() => {
          router.push('/debitNotes/purchaseReturn-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving debit note draft:', error);
    }
  };

  return {
    handleFormSubmit,
    handleDraftSubmit,
  };
}

export default function useDebitNoteFormHandler({
  mode = 'add',
  debitNoteNumber,
  debitNoteData,
  productData = [],
  employees = [],
  initialBanks,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  addBank,
}) {
  const [productsCloneData, setProductsCloneData] = useState(productData || []);
  const [signOptions] = useState(employees || []);

  const formHandler = useFormHandler({ mode, debitNoteNumber, debitNoteData });
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    errors,
    fields,
    append,
    remove,
    watchItems,
    watchRoundOff,
    isEdit,
  } = formHandler;

  const itemsHandler = useItemsHandler({
    setValue,
    getValues,
    append,
    remove,
    productData,
    productsCloneData,
    setProductsCloneData,
  });

  useEffect(() => {
    if (!isEdit && fields.length === 0) {
      append(formatNewBuyItem());
    }
  }, [isEdit, fields.length, append]);

  const bankHandler = useBankHandler({
    initialBanks,
    addBank,
  });

  const dialogHandler = useDialogHandler({
    setValue,
    getValues,
  });

  const submissionHandler = useSubmissionHandler({
    closeSnackbar,
    onSave,
    isEdit,
  });

  const handleSignatureSelection = (selectedEmployee, field) => {
    const employeeId = selectedEmployee?._id || '';
    field.onChange(employeeId);
    setValue('employee', employeeId, { shouldValidate: true, shouldDirty: true });
  };

  return {
    control,
    handleSubmit,
    setValue,
    getValues,
    errors,
    fields,
    watchItems,
    watchRoundOff,
    productsCloneData,
    productData,
    signOptions,
    paymentMethods,
    handleSignatureSelection,
    ...bankHandler,
    ...itemsHandler,
    ...dialogHandler,
    handleFormSubmit: submissionHandler.handleFormSubmit,
    handleDraftSubmit: submissionHandler.handleDraftSubmit,
    handleError: formErrors =>
      notifyNotistackFormValidationErrors({
        errors: formErrors,
        closeSnackbar,
        enqueueSnackbar,
        getValues,
      }),
  };
}

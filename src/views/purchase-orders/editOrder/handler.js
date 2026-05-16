'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { paymentMethods } from '@/data/dataSets';
import { calculatePurchaseItemValues } from '@/utils/purchaseItemCalculations';
import { formatNewBuyItem } from '@/utils/formatNewBuyItem';
import { purchaseOrderSchema } from '../addOrder/PurchaseOrderSchema';

function mapPurchaseOrderItems(items = []) {
  return items.map(item => ({
    productId: item.productId?._id || item.productId || '',
    name: item.name || '',
    quantity: item.quantity || 1,
    units: item.units || item.unit || '',
    unit_id: item.unit_id || item.unit || '',
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
    isRateFormUpadted: item.isRateFormUpadted || false,
  }));
}

function useFormHandler({ purchaseOrderData }) {
  const today = new Date().toISOString().split('T')[0];
  const purchaseOrderNumber = purchaseOrderData?.purchaseOrderId || purchaseOrderData?.purchaseOrderNumber || '';
  const paymentMethod = purchaseOrderData?.payment_method || purchaseOrderData?.paymentMode || '';

  const defaultValues = {
    id: purchaseOrderData?._id || '',
    purchaseOrderNumber,
    purchaseOrderId: purchaseOrderNumber,
    purchaseOrderDate: purchaseOrderData?.purchaseOrderDate
      ? new Date(purchaseOrderData.purchaseOrderDate).toISOString().split('T')[0]
      : today,
    dueDate: purchaseOrderData?.dueDate ? new Date(purchaseOrderData.dueDate).toISOString().split('T')[0] : today,
    vendorId: purchaseOrderData?.vendorId || '',
    bank: purchaseOrderData?.bank || '',
    payment_method: paymentMethod,
    paymentMode: paymentMethod,
    referenceNo: purchaseOrderData?.referenceNo || '',
    taxableAmount: purchaseOrderData?.taxableAmount || 0,
    TotalAmount: purchaseOrderData?.TotalAmount || 0,
    vat: purchaseOrderData?.vat || 0,
    totalDiscount: purchaseOrderData?.totalDiscount || 0,
    roundOff: purchaseOrderData?.roundOff || false,
    roundOffValue: purchaseOrderData?.roundOffValue || 0,
    sign_type: purchaseOrderData?.sign_type || 'manualSignature',
    signatureName: purchaseOrderData?.signatureName || '',
    signatureId: purchaseOrderData?.signatureId || '',
    signatureImage: purchaseOrderData?.signatureImage || '',
    notes: purchaseOrderData?.notes || '',
    termsAndCondition: purchaseOrderData?.termsAndCondition || '',
    items: mapPurchaseOrderItems(purchaseOrderData?.items),
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
    resolver: yupResolver(purchaseOrderSchema),
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
    setValue(`items.${index}.units`, product.units?.name || '');
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
    name: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    ifscCode: '',
  });

  const handleAddBank = async () => {
    try {
      if (!newBank.name || !newBank.bankName || !newBank.accountNumber) {
        throw new Error('Please fill in all required bank details');
      }

      if (addBank) {
        const savedBank = await addBank(newBank);
        setBanks([...banks, savedBank]);
      } else {
        setBanks([...banks, { ...newBank, _id: Date.now().toString() }]);
      }

      setNewBank({
        name: '',
        bankName: '',
        branch: '',
        accountNumber: '',
        ifscCode: '',
      });

      return true;
    } catch (error) {
      console.error('Error adding bank:', error);
      return false;
    }
  };

  return {
    banks,
    newBank,
    setNewBank,
    handleAddBank,
  };
}

function useSignatureHandler({ signatures, setValue }) {
  const [signOptions] = useState(signatures || []);

  const handleSignatureSelection = (selected, field) => {
    if (selected) {
      field.onChange(selected._id);
      setValue('signatureName', selected.signatureName);
      setValue('signatureImage', selected.signatureImage);
      setValue('sign_type', 'manualSignature');
      return;
    }

    field.onChange('');
    setValue('signatureName', '');
    setValue('signatureImage', '');
  };

  return {
    signOptions,
    handleSignatureSelection,
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

function useSubmissionHandler({ trigger, closeSnackbar, enqueueSnackbar, onSave }) {
  const router = useRouter();

  const handleFormSubmit = async data => {
    try {
      const isValid = await trigger();
      if (!isValid) {
        console.error('Form validation failed');
        return;
      }

      closeSnackbar?.();

      const purchaseOrderNumber = data.purchaseOrderNumber || data.purchaseOrderId || '';
      const paymentMethod = data.payment_method || data.paymentMode || '';

      const purchaseOrderPayload = {
        ...data,
        purchaseOrderNumber,
        purchaseOrderId: purchaseOrderNumber,
        payment_method: paymentMethod,
        paymentMode: paymentMethod,
        referenceNo: data.referenceNo || '',
        taxableAmount: Number(data.taxableAmount),
        TotalAmount: Number(data.TotalAmount),
        vat: Number(data.vat),
        totalDiscount: Number(data.totalDiscount),
        roundOff: data.roundOff || false,
        roundOffValue: Number(data.roundOffValue) || 0,
        sign_type: data.sign_type || 'eSignature',
        signatureName: data.signatureName || '',
        signatureId: data.signatureId || '',
        signatureImage: data.signatureImage || '',
        notes: data.notes || '',
        termsAndCondition: data.termsAndCondition || '',
        items: (data.items || []).map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: Number(item.quantity),
          units: item.units,
          unit_id: item.unit_id,
          rate: Number(item.rate),
          discount: Number(item.discount),
          discountType: Number(item.discountType),
          tax: Number(item.tax),
          taxInfo: item.taxInfo,
          amount: Number(item.amount),
          form_updated_rate: item.form_updated_rate,
          form_updated_discount: item.form_updated_discount,
          form_updated_discounttype: item.form_updated_discounttype,
          form_updated_tax: item.form_updated_tax,
          isRateFormUpadted: item.isRateFormUpadted,
        })),
      };

      const signatureURL = data.sign_type === 'eSignature' && data.signatureImage ? data.signatureImage : null;
      const result = await onSave(purchaseOrderPayload, signatureURL);

      if (result.success) {
        setTimeout(() => {
          router.push('/purchase-orders/order-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar?.(`Failed to update purchase order: ${error.message}`, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: false,
      });
    }
  };

  const handleError = errors => {
    console.error('Form validation errors:', errors);

    let firstError = 'Please check all required fields';

    if (errors.vendorId) {
      firstError = 'Please select a vendor';
    } else if (errors.items?.length > 0) {
      firstError = 'Please check product details';
    } else if (errors.bank) {
      firstError = 'Please select a bank';
    } else if (errors.payment_method || errors.paymentMode) {
      firstError = 'Please select a payment method';
    }

    enqueueSnackbar?.(firstError, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: false,
    });
  };

  return {
    handleFormSubmit,
    handleError,
  };
}

export default function useEditPurchaseOrderHandlers({
  purchaseOrderData,
  productData,
  initialBanks,
  signatures,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  addBank,
}) {
  const [productsCloneData, setProductsCloneData] = useState(productData || []);

  const { control, handleSubmit, setValue, getValues, trigger, errors, fields, append, remove, watchItems, watchRoundOff } =
    useFormHandler({ purchaseOrderData });

  const itemsHandler = useItemsHandler({
    setValue,
    getValues,
    append,
    remove,
    productData,
    productsCloneData,
    setProductsCloneData,
  });

  const bankHandler = useBankHandler({
    initialBanks,
    addBank,
  });

  const signatureHandler = useSignatureHandler({
    signatures,
    setValue,
  });

  const dialogHandler = useDialogHandler({
    setValue,
    getValues,
  });

  const submissionHandler = useSubmissionHandler({
    trigger,
    closeSnackbar,
    enqueueSnackbar,
    onSave,
  });

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
    banks: bankHandler.banks,
    newBank: bankHandler.newBank,
    setNewBank: bankHandler.setNewBank,
    handleAddBank: bankHandler.handleAddBank,
    signOptions: signatureHandler.signOptions,
    handleSignatureSelection: signatureHandler.handleSignatureSelection,
    paymentMethods,
    notesExpanded: dialogHandler.notesExpanded,
    termsDialogOpen: dialogHandler.termsDialogOpen,
    tempTerms: dialogHandler.tempTerms,
    setTempTerms: dialogHandler.setTempTerms,
    handleToggleNotes: dialogHandler.handleToggleNotes,
    handleOpenTermsDialog: dialogHandler.handleOpenTermsDialog,
    handleCloseTermsDialog: dialogHandler.handleCloseTermsDialog,
    handleSaveTerms: dialogHandler.handleSaveTerms,
    discountMenu: itemsHandler.discountMenu,
    setDiscountMenu: itemsHandler.setDiscountMenu,
    taxMenu: itemsHandler.taxMenu,
    setTaxMenu: itemsHandler.setTaxMenu,
    updateCalculatedFields: itemsHandler.updateCalculatedFields,
    handleUpdateItemProduct: itemsHandler.handleUpdateItemProduct,
    handleDeleteItem: itemsHandler.handleDeleteItem,
    handleAddEmptyRow: itemsHandler.handleAddEmptyRow,
    handleMenuItemClick: itemsHandler.handleMenuItemClick,
    handleTaxClick: itemsHandler.handleTaxClick,
    handleTaxClose: itemsHandler.handleTaxClose,
    handleTaxMenuItemClick: itemsHandler.handleTaxMenuItemClick,
    handleFormSubmit: submissionHandler.handleFormSubmit,
    handleError: submissionHandler.handleError,
  };
}

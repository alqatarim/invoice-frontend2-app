import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { salesReturnSchema, editSalesReturnSchema } from '@/views/salesReturn/SalesReturnSchema';
import { paymentMethods } from '@/data/dataSets';
import { calculateItemValues } from '@/utils/salesItemsCalc';
import { formatInvoiceItem } from '@/utils/formatNewSellItem';
import { formatDateForInput } from '@/utils/dateUtils';
import { notifyNotistackFormValidationErrors } from '@/utils/notifyNotistackFormValidationErrors';

const createEmptySalesReturnItem = () => ({
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
});

const parseJsonValue = value => {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const normalizeEditImages = item => {
  const images = parseJsonValue(item.images || item.productId?.images || null);

  if (!images) return null;
  if (Array.isArray(images)) return images.length > 0 ? images[0] : null;

  return images;
};

const normalizeEditTaxInfo = item => {
  const taxInfo = parseJsonValue(item.taxInfo);
  return taxInfo || { taxRate: 0 };
};

const normalizeEditItem = item => {
  const taxInfo = normalizeEditTaxInfo(item);
  const discountType = item.discountType || item.form_updated_discounttype || 3;

  return {
    productId: item.productId?._id || item.productId || '',
    name: item.name || '',
    quantity: item.quantity || 1,
    units: item.units || item.unit || '',
    unit: item.unit || item.units?._id || '',
    rate: item.rate || 0,
    form_updated_rate: item.form_updated_rate || item.rate || 0,
    discount: item.discount || 0,
    form_updated_discount: item.form_updated_discount || item.discount || 0,
    discountType,
    form_updated_discounttype: item.form_updated_discounttype || discountType,
    tax: item.tax || 0,
    taxInfo,
    form_updated_tax: item.form_updated_tax || taxInfo?.taxRate || 0,
    amount: item.amount || 0,
    isRateFormUpadted: item.isRateFormUpadted || false,
    images: normalizeEditImages(item),
  };
};

const buildAddDefaultValues = salesReturnNumber => ({
  salesReturnNumber: salesReturnNumber || '',
  salesReturnDate: new Date().toISOString().split('T')[0],
  dueDate: new Date().toISOString().split('T')[0],
  customerId: '',
  bank: '',
  payment_method: '',
  referenceNo: '',
  taxableAmount: 0,
  TotalAmount: 0,
  vat: 0,
  totalDiscount: 0,
  roundOff: false,
  roundOffValue: 0,
  sign_type: 'manualSignature',
  employeeName: '',
  employee: '',
  employeeImage: '',
  notes: '',
  termsAndCondition: '',
  items: [],
});

const buildEditDefaultValues = salesReturnData => ({
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
  employeeName: salesReturnData?.employeeName || '',
  employee: salesReturnData?.employee?._id || salesReturnData?.employee || '',
  employeeImage: salesReturnData?.employeeImage || '',
  notes: salesReturnData?.notes || '',
  termsAndCondition: salesReturnData?.termsAndCondition || '',
  items: salesReturnData?.items?.map(normalizeEditItem) || [],
});

const mapPayloadItems = items => (items || []).map(item => ({
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
}));

const buildAddPayload = data => ({
  ...data,
  salesReturnNumber: data.salesReturnNumber,
  salesReturnDate: data.salesReturnDate,
  dueDate: data.dueDate,
  customerId: data.customerId,
  bank: data.bank,
  payment_method: data.payment_method,
  referenceNo: data.referenceNo || '',
  taxableAmount: Number(data.taxableAmount),
  TotalAmount: Number(data.TotalAmount),
  vat: Number(data.vat),
  totalDiscount: Number(data.totalDiscount),
  roundOff: data.roundOff || false,
  roundOffValue: Number(data.roundOffValue) || 0,
  sign_type: data.sign_type || 'manualSignature',
  employeeName: data.employeeName || '',
  employee: data.employee || '',
  notes: data.notes || '',
  termsAndCondition: data.termsAndCondition || '',
  items: mapPayloadItems(data.items),
});

const buildEditPayload = data => ({
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
  items: mapPayloadItems(data.items),
  sign_type: data.sign_type || 'manualSignature',
  employee: data.employee || '',
  employeeImage: data.employeeImage || null,
});

const getUsedProductIds = salesReturnData => (
  salesReturnData?.items?.map(item => item.productId?._id || item.productId).filter(Boolean) || []
);

export default function useSalesReturnHandler({
  mode = 'add',
  salesReturnNumber,
  salesReturnData,
  productData = [],
  initialBanks,
  employees,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  addBank,
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const [productsCloneData, setProductsCloneData] = useState([]);
  const [banks, setBanks] = useState(initialBanks || []);
  const [signOptions, setSignOptions] = useState(employees || []);
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
    ifscCode: '',
  });

  const defaultValues = isEdit
    ? buildEditDefaultValues(salesReturnData)
    : buildAddDefaultValues(salesReturnNumber);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(isEdit ? editSalesReturnSchema : salesReturnSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });

  useEffect(() => {
    if (!isEdit) {
      setProductsCloneData(productData || []);
      return;
    }

    const usedProductIds = getUsedProductIds(salesReturnData);
    setProductsCloneData((productData || []).filter(product => !usedProductIds.includes(product._id)));
  }, [isEdit, productData, salesReturnData]);

  useEffect(() => {
    if (isEdit) {
      setSignOptions(employees || []);
      return;
    }

    const mappedEmployees = (employees || []).map(item => ({
      value: item?._id,
      label: item?.employeeName,
      ...item,
    }));
    setSignOptions(mappedEmployees);
  }, [employees, isEdit]);

  const updateCalculatedFields = (index, values) => {
    const computed = calculateItemValues(values);
    setValue(`items.${index}.discount`, computed.discount);
    setValue(`items.${index}.tax`, computed.tax);
    setValue(`items.${index}.amount`, computed.amount);
    setValue(`items.${index}.taxableAmount`, computed.taxableAmount);
  };

  const handleUpdateItemProduct = (index, productId, previousProductId) => {
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
  };

  const handleDeleteItem = index => {
    const currentItems = getValues('items') || [];
    const deletedItem = currentItems[index];
    remove(index);

    if (deletedItem?.productId) {
      const product = (productData || []).find(item => item._id === deletedItem.productId);
      if (product) {
        setProductsCloneData(prev => [...prev, product]);
      }
    }
  };

  const handleAddEmptyRow = () => {
    append(createEmptySalesReturnItem());
  };

  const handleMenuItemClick = (index, newValue) => {
    if (newValue === null) return;

    setValue(`items.${index}.discountType`, newValue);
    setValue(`items.${index}.form_updated_discounttype`, newValue);
    setValue(`items.${index}.isRateFormUpadted`, true);
    const item = getValues(`items.${index}`);
    updateCalculatedFields(index, item);
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

  const handleAddBank = async () => {
    try {
      if (!newBank.name || !newBank.bankName || !newBank.accountNumber) {
        throw new Error('Please fill in all required bank details');
      }

      if (addBank) {
        const savedBank = await addBank(newBank);
        setBanks([...banks, savedBank]);
      } else {
        const tempBank = { ...newBank, _id: Date.now().toString() };
        setBanks([...banks, tempBank]);
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

  const handleSignatureSelection = (selected, field) => {
    if (selected) {
      field.onChange(selected._id);
      setValue('employeeName', selected.employeeName || '');
      setValue('employeeImage', selected.employeeImage || '');
      setValue('sign_type', 'manualSignature');
      return;
    }

    field.onChange('');
    setValue('employeeName', '');
    setValue('employeeImage', '');
  };

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

  const handleFormSubmit = async data => {
    try {
      closeSnackbar?.();

      const payload = isEdit ? buildEditPayload(data) : buildAddPayload(data);
      const employeeURL = !isEdit && data.sign_type === 'eSignature' && data.employeeImage
        ? data.employeeImage
        : null;
      const result = isEdit ? await onSave(payload) : await onSave(payload, employeeURL);

      if (result.success) {
        setTimeout(() => {
          router.push('/sales-return/sales-return-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar?.(`Failed to ${isEdit ? 'update' : 'create'} sales return: ${error.message}`, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: false,
      });
    }
  };

  const handleError = formErrors => {
    notifyNotistackFormValidationErrors({
      errors: formErrors,
      closeSnackbar,
      enqueueSnackbar,
      getValues,
    });
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
    banks,
    newBank,
    setNewBank,
    handleAddBank,
    signOptions,
    handleSignatureSelection,
    paymentMethods,
    notesExpanded,
    termsDialogOpen,
    tempTerms,
    setTempTerms,
    handleToggleNotes,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
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
    handleFormSubmit,
    handleError,
  };
}

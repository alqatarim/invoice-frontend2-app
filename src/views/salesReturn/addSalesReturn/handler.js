import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { salesReturnSchema } from '@/views/salesReturn/SalesReturnSchema';
import { paymentMethods } from '@/data/dataSets';
import { calculateItemValues } from '@/utils/salesItemsCalc';
import { formatInvoiceItem } from '@/utils/formatNewSellItem';

function useFormHandler({ salesReturnNumber }) {
  const defaultValues = {
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
    sign_type: 'eSignature',
    signatureName: '',
    signatureId: '',
    notes: '',
    termsAndCondition: '',
    items: []
  };

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(salesReturnSchema),
    defaultValues
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
    const computed = calculateItemValues(values);
    setValue(`items.${index}.discount`, computed.discount);
    setValue(`items.${index}.tax`, computed.tax);
    setValue(`items.${index}.amount`, computed.amount);
    setValue(`items.${index}.taxableAmount`, computed.taxableAmount);
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

    const newData = formatInvoiceItem(product);
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
      unit: '',
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

  const handleMenuItemClick = (index, newValue) => {
    if (newValue === null) {
      return;
    }

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
    handleTaxMenuItemClick
  };
}

function useBankHandler({ initialBanks, addBank }) {
  const [banks, setBanks] = useState(initialBanks || []);
  const [newBank, setNewBank] = useState({
    name: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    ifscCode: ''
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
        const tempBank = { ...newBank, _id: Date.now().toString() };
        setBanks([...banks, tempBank]);
      }

      setNewBank({
        name: '',
        bankName: '',
        branch: '',
        accountNumber: '',
        ifscCode: ''
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
    handleSaveTerms
  };
}

function useSubmissionHandler({
  trigger,
  closeSnackbar,
  enqueueSnackbar,
  onSave
}) {
  const router = useRouter();

  const handleFormSubmit = async (data) => {
    try {
      const isValid = await trigger();
      if (!isValid) {
        console.error('Form validation failed');
        return;
      }

      closeSnackbar();

      const salesReturnData = {
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
        sign_type: data.sign_type || 'eSignature',
        signatureName: data.signatureName || '',
        signatureId: data.signatureId || '',
        notes: data.notes || '',
        termsAndCondition: data.termsAndCondition || '',
        items: data.items.map((item) => ({
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
          images: item.images || null
        }))
      };

      let signatureURL = null;
      if (data.sign_type === 'eSignature' && data.signatureImage) {
        signatureURL = data.signatureImage;
      }

      const result = await onSave(salesReturnData, signatureURL);

      if (result.success) {
        setTimeout(() => {
          router.push('/sales-return/sales-return-list');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      enqueueSnackbar(`Failed to create sales return: ${error.message}`, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: false
      });
    }
  };

  const handleError = (errors) => {
    console.error('Form validation errors:', errors);

    let firstError = 'Please check all required fields';

    if (errors.customerId) {
      firstError = 'Please select a customer';
    } else if (errors.items && errors.items.length > 0) {
      firstError = 'Please check product details';
    } else if (errors.bank) {
      firstError = 'Please select a bank';
    } else if (errors.payment_method) {
      firstError = 'Please select a payment method';
    }

    enqueueSnackbar(firstError, {
      variant: 'error',
      autoHideDuration: 5000,
      preventDuplicate: false
    });
  };

  return {
    handleFormSubmit,
    handleError
  };
}

export default function useAddSalesReturnHandlers({
  salesReturnNumber,
  productData,
  initialBanks,
  signatures,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  addBank
}) {
  const [productsCloneData, setProductsCloneData] = useState(productData || []);

  const formHandler = useFormHandler({ salesReturnNumber });
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
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

  const submissionHandler = useSubmissionHandler({
    trigger,
    closeSnackbar,
    enqueueSnackbar,
    onSave
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
    handleError: submissionHandler.handleError
  };
}

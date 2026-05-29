import { useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { deliveryChallanSchema } from '@/views/deliveryChallans/deliveryChallansSchema';
import { calculateItemValues } from '@/utils/salesItemsCalc';
import { formatInvoiceItem } from '@/utils/formatNewSellItem';
import { formatDateForInput } from '@/utils/dateUtils';

function useDeliveryChallanItemsHandlers({
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

  const handleMenuOpen = (event, index) => {
    setDiscountMenu({ anchorEl: event.currentTarget, rowIndex: index });
  };

  const handleMenuClose = () => {
    setDiscountMenu({ anchorEl: null, rowIndex: null });
  };

  const handleMenuItemClick = (index, newValue) => {
    if (newValue !== null) {
      setValue(`items.${index}.discountType`, newValue);
      setValue(`items.${index}.form_updated_discounttype`, newValue);
      setValue(`items.${index}.isRateFormUpadted`, true);
      const item = getValues(`items.${index}`);
      updateCalculatedFields(index, item);
    }
    handleMenuClose();
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

  return {
    discountMenu,
    setDiscountMenu,
    taxMenu,
    setTaxMenu,
    updateCalculatedFields,
    handleMenuOpen,
    handleMenuClose,
    handleMenuItemClick,
    handleTaxClick,
    handleTaxClose,
    handleTaxMenuItemClick,
    handleUpdateItemProduct,
    handleDeleteItem,
    handleAddEmptyRow
  };
}

function useBankHandlers({ initialBanks, enqueueSnackbar, closeSnackbar, setValue, trigger, addBank }) {
  const [banks, setBanks] = useState(initialBanks || []);
  const [newBank, setNewBank] = useState({
    name: '',
    bankName: '',
    branch: '',
    accountNumber: '',
    IFSCCode: '',
  });

  const handleAddBank = async (event) => {
    event.preventDefault();
    try {
      closeSnackbar();
      const loadingKey = enqueueSnackbar('Adding bank details...', {
        variant: 'info',
        persist: true
      });
      const response = await addBank(newBank);
      closeSnackbar(loadingKey);
      if (response) {
        const newBankWithDetails = {
          _id: response._id,
          name: newBank.name,
          bankName: newBank.bankName,
          branch: newBank.branch,
          accountNumber: newBank.accountNumber,
          IFSCCode: newBank.IFSCCode,
        };
        setBanks((prevBanks) => [...prevBanks, newBankWithDetails]);
        setValue('bank', newBankWithDetails._id);
        trigger('bank');
        setNewBank({ name: '', bankName: '', branch: '', accountNumber: '', IFSCCode: '' });
        enqueueSnackbar('Bank details added successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Failed to add bank:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'Failed to add bank details', { variant: 'error' });
    }
  };

  return {
    banks,
    setBanks,
    newBank,
    setNewBank,
    handleAddBank
  };
}

function useSignatureHandlers({ employees, deliveryChallanData, trigger }) {
  const [signOptions, setSignOptions] = useState(employees || []);
  const [selectedSignature, setSelectedSignature] = useState(
    deliveryChallanData?.sign_type === 'manualSignature' && deliveryChallanData?.employee?.employeeImage
      ? deliveryChallanData.employee.employeeImage
      : null
  );

  const handleSignatureSelection = (selectedOption, field) => {
    if (selectedOption) {
      field.onChange(selectedOption._id);
      setSelectedSignature(selectedOption.employeeImage);
      trigger('employee');
      return;
    }

    field.onChange('');
    setSelectedSignature(null);
    trigger('employee');
  };

  return {
    signOptions,
    setSignOptions,
    selectedSignature,
    setSelectedSignature,
    handleSignatureSelection
  };
}

function useDialogHandlers({ getValues, setValue }) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [tempTerms, setTempTerms] = useState('');
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  const handleToggleNotes = () => {
    setNotesExpanded((prev) => !prev);
  };

  const handleOpenTermsDialog = () => {
    setTempTerms(getValues('termsAndCondition') || '');
    setTermsDialogOpen(true);
  };

  const handleCloseTermsDialog = () => {
    setTermsDialogOpen(false);
  };

  const handleSaveTerms = () => {
    setValue('termsAndCondition', tempTerms);
    setTermsDialogOpen(false);
  };

  const handleOpenAddressDialog = () => {
    setTempAddress(getValues('address') || '');
    setAddressDialogOpen(true);
  };

  const handleCloseAddressDialog = () => {
    setAddressDialogOpen(false);
  };

  const handleSaveAddress = () => {
    setValue('address', tempAddress);
    setAddressDialogOpen(false);
  };

  return {
    notesExpanded,
    handleToggleNotes,
    termsDialogOpen,
    tempTerms,
    setTempTerms,
    handleOpenTermsDialog,
    handleCloseTermsDialog,
    handleSaveTerms,
    addressDialogOpen,
    tempAddress,
    setTempAddress,
    handleOpenAddressDialog,
    handleCloseAddressDialog,
    handleSaveAddress
  };
}

function useDeliveryChallanFormSubmission({ trigger, closeSnackbar, enqueueSnackbar, onSave, getValues }) {
  const handleFormSubmit = async (data, errors, handleError) => {
    try {
      closeSnackbar();
      const isValid = await trigger();
      if (!isValid) {
        handleError(errors);
        return;
      }

      const currentFormData = data;
      if (!currentFormData) {
        return;
      }

      const extractId = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value._id) return value._id;
        if (typeof value === 'object' && value.value) return value.value;
        return '';
      };

      const updatedFormData = {
        customerId: extractId(currentFormData.customerId),
        deliveryChallanNumber: currentFormData.deliveryChallanNumber,
        referenceNo: currentFormData.referenceNo,
        dueDate: currentFormData.dueDate,
        deliveryChallanDate: currentFormData.deliveryChallanDate,
        address: currentFormData.address,
        taxableAmount: currentFormData.taxableAmount,
        vat: currentFormData.vat,
        roundOff: currentFormData.roundOff,
        totalDiscount: currentFormData.totalDiscount,
        TotalAmount: currentFormData.TotalAmount,
        notes: currentFormData.notes,
        bank: currentFormData.bank,
        termsAndCondition: currentFormData.termsAndCondition,
        items: currentFormData.items.map((item) => ({
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
          taxInfo: JSON.stringify(item.taxInfo),
        })),
        sign_type: currentFormData.sign_type || 'manualSignature',
        employeeName: currentFormData.employeeName,
        employee: extractId(currentFormData.employee)
      };

      const loadingKey = enqueueSnackbar('Processing delivery challan...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true
      });

      const result = await onSave(updatedFormData);
      closeSnackbar(loadingKey);

      if (!result.success) {
        const errorMessage = result.error?.message || result.message || 'Failed to process delivery challan';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in form submission:', error);
      closeSnackbar();
      enqueueSnackbar(error.message || 'An error occurred during submission', {
        variant: 'error',
        autoHideDuration: 5000
      });
      return { success: false, message: error.message || 'An error occurred during submission' };
    }
  };

  const handleError = (errors) => {
    closeSnackbar();
    setTimeout(() => {
      const errorCount = Object.keys(errors).length;
      if (errorCount === 0) {
        return;
      }

      const formValues = getValues();
      Object.entries(errors).forEach(([key, error]) => {
        if (key === 'items') {
          if (error.message) {
            enqueueSnackbar(error.message, {
              variant: 'error',
              preventDuplicate: true,
              key: `error-items-${Date.now()}`,
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
              }
            });
          }

          if (Array.isArray(error)) {
            error.forEach((itemError, index) => {
              if (itemError) {
                const productName = formValues.items?.[index]?.name || `Item ${index + 1}`;
                Object.entries(itemError).forEach(([fieldKey, fieldError]) => {
                  if (fieldError && fieldError.message) {
                    enqueueSnackbar(`${productName}: ${fieldError.message}`, {
                      variant: 'error',
                      preventDuplicate: true,
                      key: `error-item-${index}-${fieldKey}-${Date.now()}`,
                      anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right'
                      }
                    });
                  }
                });
              }
            });
          }
        } else if (error && error.message) {
          enqueueSnackbar(error.message, {
            variant: 'error',
            preventDuplicate: true,
            key: `error-${key}-${Date.now()}`,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right'
            }
          });
        }
      });
    }, 200);
  };

  return {
    handleFormSubmit,
    handleError
  };
}

export default function useDeliveryChallanHandlers({
  deliveryChallanData,
  productData,
  initialBanks,
  employees,
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  addBank
}) {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(deliveryChallanSchema),
    defaultValues: {
      deliveryChallanNumber: deliveryChallanData?.deliveryChallanNumber || '',
      referenceNo: deliveryChallanData?.referenceNo || '',
      customerId: deliveryChallanData?.customerId?._id || deliveryChallanData?.customerId || '',
      deliveryChallanDate: formatDateForInput(deliveryChallanData?.deliveryChallanDate || new Date()),
      dueDate: formatDateForInput(deliveryChallanData?.dueDate || new Date()),
      address: deliveryChallanData?.deliveryAddress
        ? `${deliveryChallanData.deliveryAddress.addressLine1 || ''}, ${deliveryChallanData.deliveryAddress.city || ''}, ${deliveryChallanData.deliveryAddress.state || ''} ${deliveryChallanData.deliveryAddress.pincode || ''}`.trim()
        : '',
      taxableAmount: deliveryChallanData?.taxableAmount || 0,
      TotalAmount: Number(deliveryChallanData?.TotalAmount) || 0,
      notes: deliveryChallanData?.notes || '',
      vat: deliveryChallanData?.vat || 0,
      totalDiscount: deliveryChallanData?.totalDiscount || 0,
      roundOff: deliveryChallanData?.roundOff || false,
      termsAndCondition: deliveryChallanData?.termsAndCondition || '',
      bank: deliveryChallanData?.bank?._id || deliveryChallanData?.bank || '',
      roundOffValue: deliveryChallanData?.roundOffValue || 0,
      sign_type: deliveryChallanData?.sign_type || 'manualSignature',
      employeeName: deliveryChallanData?.employeeName || '',
      employee: deliveryChallanData?.employee?._id || deliveryChallanData?.employee || '',
      items: deliveryChallanData?.items?.map((item) => {
        const product = productData?.find((productItem) => productItem._id === item.productId);
        const unitId = product?.units?._id || item.unit || '';
        const unitName = product?.units?.name || '';

        return {
          ...item,
          units: unitName,
          unit: unitId,
          quantity: Number(item.quantity) || 1,
          rate: Number(item.rate) || 0,
          discount: Number(item.discount) || 0,
          discountType: Number(item.discountType) || 2,
          tax: Number(item.tax) || 0,
          amount: Number(item.amount) || 0,
          key: item.key || Date.now() + Math.random(),
          isRateFormUpadted: item.isRateFormUpadted || false,
          form_updated_rate: item.form_updated_rate || '',
          form_updated_discount: item.form_updated_discount || '',
          form_updated_discounttype: item.form_updated_discounttype || '',
          form_updated_tax: item.form_updated_tax || '',
          taxInfo: item.taxInfo ? (() => {
            const parsedTaxInfo = typeof item.taxInfo === 'string' ? JSON.parse(item.taxInfo) : item.taxInfo;
            return {
              ...parsedTaxInfo,
              taxRate: Number(parsedTaxInfo.taxRate) || 0
            };
          })() : {
            _id: '',
            name: '',
            taxRate: 0
          }
        };
      }) || []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });
  const watchCustomer = useWatch({ control, name: 'customerId' });

  const [productsCloneData, setProductsCloneData] = useState(() => {
    if (productData && deliveryChallanData) {
      const selectedProductIds = Array.isArray(deliveryChallanData.items)
        ? deliveryChallanData.items.map((item) => item.productId)
        : [];
      return productData.filter((product) => !selectedProductIds.includes(product._id));
    }
    return productData || [];
  });

  const itemsHandlers = useDeliveryChallanItemsHandlers({
    setValue,
    getValues,
    append,
    remove,
    productData,
    enqueueSnackbar,
    closeSnackbar,
    setProductsCloneData,
  });

  const bankHandlers = useBankHandlers({
    initialBanks,
    enqueueSnackbar,
    closeSnackbar,
    setValue,
    trigger,
    addBank,
  });

  const employeeHandlers = useSignatureHandlers({
    employees,
    deliveryChallanData,
    setValue,
    trigger,
  });

  const dialogHandlers = useDialogHandlers({
    getValues,
    setValue,
  });

  const formSubmissionHandlers = useDeliveryChallanFormSubmission({
    trigger,
    closeSnackbar,
    enqueueSnackbar,
    onSave,
    getValues,
  });

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
    watchRoundOff,
    watchCustomer,
    productsCloneData,
    setProductsCloneData,
    ...itemsHandlers,
    ...bankHandlers,
    ...employeeHandlers,
    ...dialogHandlers,
    ...formSubmissionHandlers,
  };
}

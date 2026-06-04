import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { notifyNotistackFormValidationErrors } from '@/utils/notifyNotistackFormValidationErrors';
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
      sku: '',
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
    setValue('deliveryAddress', {
      ...(getValues('deliveryAddress') || {}),
      addressLine1: tempAddress,
    });
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

const DELIVERY_CHALLAN_LIST_PATH = '/deliveryChallans/deliveryChallans-list';
const REDIRECT_AFTER_SAVE_MS = 1500;

function useDeliveryChallanFormSubmission({
  closeSnackbar,
  enqueueSnackbar,
  onSave,
  getValues,
  customersData = [],
  saveMode = 'add',
}) {
  const router = useRouter();

  const extractId = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value._id) return value._id;
    if (typeof value === 'object' && value.value) return value.value;
    return '';
  };

  const buildDeliveryAddressPayload = (formData) => {
    const customerId = extractId(formData.customerId);
    const customer = (customersData || []).find((item) => item._id === customerId);
    const savedDeliveryAddress = formData.deliveryAddress;
    const addressText = String(formData.address || '').trim();

    if (savedDeliveryAddress?.addressLine1) {
      return {
        name: savedDeliveryAddress.name || customer?.name || '',
        addressLine1: savedDeliveryAddress.addressLine1,
        addressLine2: savedDeliveryAddress.addressLine2 || '',
        city: savedDeliveryAddress.city || '',
        state: savedDeliveryAddress.state || '',
        pincode: savedDeliveryAddress.pincode || '',
        country: savedDeliveryAddress.country || '',
      };
    }

    const shipping = customer?.shippingAddress;
    if (shipping?.addressLine1) {
      return {
        name: customer?.name || shipping.name || '',
        addressLine1: addressText || shipping.addressLine1,
        addressLine2: shipping.addressLine2 || '',
        city: shipping.city || '',
        state: shipping.state || '',
        pincode: shipping.pincode || '',
        country: shipping.country || '',
      };
    }

    return {
      name: customer?.name || '',
      addressLine1: addressText,
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
    };
  };

  const handleFormSubmit = async (currentFormData) => {
    try {
      closeSnackbar();

      if (!currentFormData) {
        return { success: false, message: 'No form data to submit' };
      }

      const updatedFormData = {
        customerId: extractId(currentFormData.customerId),
        deliveryChallanNumber: currentFormData.deliveryChallanNumber,
        referenceNo: currentFormData.referenceNo,
        dueDate: currentFormData.dueDate,
        deliveryChallanDate: currentFormData.deliveryChallanDate,
        deliveryAddress: buildDeliveryAddressPayload(currentFormData),
        taxableAmount: currentFormData.taxableAmount,
        vat: currentFormData.vat,
        roundOff: currentFormData.roundOff,
        totalDiscount: currentFormData.totalDiscount,
        TotalAmount: currentFormData.TotalAmount,
        notes: currentFormData.notes,
        bank: currentFormData.bank,
        employee: currentFormData.employee || '',
        termsAndCondition: currentFormData.termsAndCondition,
        items: currentFormData.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          sku: item.sku,
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
      };

      const result = await onSave(updatedFormData);

      if (!result?.success) {
        const errorMessage = result?.error?.message || result?.message || 'Failed to process delivery challan';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: true,
        });
        return { success: false, message: errorMessage };
      }

      router.refresh();

      setTimeout(() => {
        router.push(`${DELIVERY_CHALLAN_LIST_PATH}?success=${saveMode}`);
      }, REDIRECT_AFTER_SAVE_MS);

      return { success: true };
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

  const handleError = (errors) => {
    notifyNotistackFormValidationErrors({
      errors,
      closeSnackbar,
      enqueueSnackbar,
      getValues,
    });
  };

  return {
    handleFormSubmit,
    handleError,
  };
}

export default function useDeliveryChallanHandlers({
  deliveryChallanData,
  customersData = [],
  productData,
  initialBanks,
  employees = [],
  onSave,
  enqueueSnackbar,
  closeSnackbar,
  addBank,
  saveMode = 'add',
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
      deliveryAddress: deliveryChallanData?.deliveryAddress || null,
      taxableAmount: deliveryChallanData?.taxableAmount || 0,
      TotalAmount: Number(deliveryChallanData?.TotalAmount) || 0,
      notes: deliveryChallanData?.notes || '',
      vat: deliveryChallanData?.vat || 0,
      totalDiscount: deliveryChallanData?.totalDiscount || 0,
      roundOff: deliveryChallanData?.roundOff || false,
      termsAndCondition: deliveryChallanData?.termsAndCondition || '',
      bank: deliveryChallanData?.bank?._id || deliveryChallanData?.bank || '',
      employee: deliveryChallanData?.employee?._id || deliveryChallanData?.employee || '',
      roundOffValue: deliveryChallanData?.roundOffValue || 0,
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
  const [signOptions] = useState(employees || []);

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

  const dialogHandlers = useDialogHandlers({
    getValues,
    setValue,
  });

  const formSubmissionHandlers = useDeliveryChallanFormSubmission({
    closeSnackbar,
    enqueueSnackbar,
    onSave,
    getValues,
    customersData,
    saveMode,
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
    productData,
    signOptions,
    setProductsCloneData,
    handleSignatureSelection,
    ...itemsHandlers,
    ...bankHandlers,
    ...dialogHandlers,
    ...formSubmissionHandlers,
  };
}

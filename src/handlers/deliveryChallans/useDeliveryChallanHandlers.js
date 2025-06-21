import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { deliveryChallanSchema } from '@/views/deliveryChallans/deliveryChallansSchema';
import { useDeliveryChallanItemsHandlers } from './deliveryChallan/useDeliveryChallanItemsHandlers';
import { useBankHandlers } from './deliveryChallan/useBankHandlers';
import { useSignatureHandlers } from './deliveryChallan/useSignatureHandlers';
import { useDialogHandlers } from './deliveryChallan/useDialogHandlers';
import { useDeliveryChallanFormSubmission } from './deliveryChallan/useDeliveryChallanFormSubmission';
import { useState } from 'react';
import { formatDateForInput } from '@/utils/dateUtils';

export default function useDeliveryChallanHandlers({
  deliveryChallanData,
  productData,
  initialBanks,
  signatures,
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
      signatureName: deliveryChallanData?.signatureName || '',
      signatureId: deliveryChallanData?.signatureId?._id || deliveryChallanData?.signatureId || '',
      items: deliveryChallanData?.items?.map((item) => {
        // Find the corresponding product to get the unit information
        const product = productData?.find(p => p._id === item.productId);
        const unitId = product?.units?._id || item.unit || '';
        const unitName = product?.units?.name || '';
        
        return {
          ...item,
          // Ensure required fields are present
          units: unitName,
          unit: unitId,
          quantity: Number(item.quantity) || 1,
          rate: Number(item.rate) || 0,
          discount: Number(item.discount) || 0,
          discountType: Number(item.discountType) || 2,
          tax: Number(item.tax) || 0,
          amount: Number(item.amount) || 0,
          // Ensure form update fields are present
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

  // Products clone state
  const [productsCloneData, setProductsCloneData] = useState(() => {
    if (productData && deliveryChallanData) {
      const selectedProductIds = Array.isArray(deliveryChallanData.items)
        ? deliveryChallanData.items.map((item) => item.productId)
        : [];
      return productData.filter((product) => !selectedProductIds.includes(product._id));
    }
    return productData || [];
  });

  // Items Table Handlers
  const itemsHandlers = useDeliveryChallanItemsHandlers({
    control,
    setValue,
    getValues,
    append,
    remove,
    productData,
    enqueueSnackbar,
    closeSnackbar,
    productsCloneData,
    setProductsCloneData,
  });

  // Bank Handlers
  const bankHandlers = useBankHandlers({
    initialBanks,
    enqueueSnackbar,
    closeSnackbar,
    setValue,
    trigger,
    addBank,
  });

  // Signature Handlers
  const signatureHandlers = useSignatureHandlers({
    signatures,
    deliveryChallanData,
    setValue,
    trigger,
  });

  // Dialog Handlers
  const dialogHandlers = useDialogHandlers({
    getValues,
    setValue,
  });

  // Form Submission Handlers
  const formSubmissionHandlers = useDeliveryChallanFormSubmission({
    trigger,
    closeSnackbar,
    enqueueSnackbar,
    onSave,
    getValues,
  });

  return {
    // Form
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
    // Product state
    productsCloneData,
    setProductsCloneData,
    // Items Table
    ...itemsHandlers,
    // Bank
    ...bankHandlers,
    // Signature
    ...signatureHandlers,
    // Dialogs
    ...dialogHandlers,
    // Form Submission
    ...formSubmissionHandlers,
  };
} 
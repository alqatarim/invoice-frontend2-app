import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { purchaseOrderSchema } from '@/views/purchase-orders/addOrder/PurchaseOrderSchema';

export function useFormHandler({ purchaseOrderData }) {
  const defaultValues = {
    id: purchaseOrderData?._id || '',
    purchaseOrderNumber: purchaseOrderData?.purchaseOrderId || '',
    purchaseOrderDate: purchaseOrderData?.purchaseOrderDate ? new Date(purchaseOrderData.purchaseOrderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: purchaseOrderData?.dueDate ? new Date(purchaseOrderData.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    vendorId: purchaseOrderData?.vendorId || '',
    bank: purchaseOrderData?.bank || '',
    payment_method: purchaseOrderData?.payment_method || '',
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
    notes: purchaseOrderData?.notes || '',
    termsAndCondition: purchaseOrderData?.termsAndCondition || '',
    items: purchaseOrderData?.items || []
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
    resolver: yupResolver(purchaseOrderSchema),
    defaultValues
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchRoundOff = watch('roundOff');

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
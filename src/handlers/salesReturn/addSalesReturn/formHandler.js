import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { salesReturnSchema } from '@/views/salesReturn/SalesReturnSchema';

export function useFormHandler({ salesReturnNumber }) {
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
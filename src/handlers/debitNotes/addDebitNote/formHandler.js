import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DebitNoteSchema } from '@/views/debitNotes/DebitNoteSchema';
import { formatDateForInput } from '@/utils/dateUtils';

export function useFormHandler({ debitNoteNumber }) {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(DebitNoteSchema),
    defaultValues: {
      debitNoteNumber: debitNoteNumber || '',
      referenceNo: '',
      vendorId: '',
      payment_method: '',
      purchaseOrderDate: formatDateForInput(new Date()),
      dueDate: formatDateForInput(new Date()),
      taxableAmount: 0,
      TotalAmount: 0,
      notes: '',
      vat: 0,
      totalDiscount: 0,
      roundOff: false,
      termsAndCondition: '',
      bankId: '',
      roundOffValue: 0,
      sign_type: 'manualSignature',
      signatureName: '',
      signatureId: '',
      signatureImage: null,
      items: []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
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
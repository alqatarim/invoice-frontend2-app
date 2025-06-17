import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DebitNoteSchema } from '@/views/debitNotes/DebitNoteSchema';
import { formatDateForInput } from '@/utils/dateUtils';

export function useFormHandler({ debitNoteData }) {
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
      debitNoteNumber: debitNoteData?.debit_note_id || '',
      referenceNo: debitNoteData?.referenceNo || '',
      vendorId: debitNoteData?.vendorId?._id || '',
      payment_method: debitNoteData?.payment_method || '',
      purchaseOrderDate: debitNoteData?.purchaseOrderDate ? formatDateForInput(new Date(debitNoteData.purchaseOrderDate)) : formatDateForInput(new Date()),
      dueDate: debitNoteData?.dueDate ? formatDateForInput(new Date(debitNoteData.dueDate)) : formatDateForInput(new Date()),
      taxableAmount: debitNoteData?.taxableAmount || 0,
      TotalAmount: debitNoteData?.TotalAmount || 0,
      notes: debitNoteData?.notes || '',
      vat: debitNoteData?.vat || 0,
      totalDiscount: debitNoteData?.totalDiscount || 0,
      roundOff: debitNoteData?.roundOff || false,
      termsAndCondition: debitNoteData?.termsAndCondition || '',
      bankId: debitNoteData?.bankId || '',
      roundOffValue: debitNoteData?.roundOffValue || 0,
      sign_type: debitNoteData?.sign_type || 'manualSignature',
      signatureName: debitNoteData?.signatureName || '',
      signatureId: debitNoteData?.signatureId || '',
      signatureImage: debitNoteData?.signatureImage || null,
      items: debitNoteData?.items || []
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
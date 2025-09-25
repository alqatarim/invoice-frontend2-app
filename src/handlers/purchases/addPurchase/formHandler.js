import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { purchaseSchema } from '@/views/purchases/addPurchase/PurchaseSchema';

export function useFormHandler({ purchaseId }) {
     const defaultValues = {
          purchaseId: purchaseId || '',
          purchaseDate: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
          vendorId: '',
          bank: '',
          paymentMode: '',
          referenceNo: '',
          supplierInvoiceSerialNumber: '',
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
          resolver: yupResolver(purchaseSchema),
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

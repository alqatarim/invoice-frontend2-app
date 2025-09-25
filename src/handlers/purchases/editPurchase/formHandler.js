import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { purchaseSchema } from '@/views/purchases/addPurchase/PurchaseSchema';

export function useFormHandler({ purchaseData }) {
     const defaultValues = {
          id: purchaseData?._id || '',
          purchaseNumber: purchaseData?.purchaseId || '',
          purchaseDate: purchaseData?.purchaseDate ? new Date(purchaseData.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          dueDate: purchaseData?.dueDate ? new Date(purchaseData.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          vendorId: purchaseData?.vendorId || '',
          bank: purchaseData?.bank || '',
          payment_method: purchaseData?.payment_method || '',
          referenceNo: purchaseData?.referenceNo || '',
          supplierInvoiceSerialNumber: purchaseData?.supplierInvoiceSerialNumber || '',
          taxableAmount: purchaseData?.taxableAmount || 0,
          TotalAmount: purchaseData?.TotalAmount || 0,
          vat: purchaseData?.vat || 0,
          totalDiscount: purchaseData?.totalDiscount || 0,
          roundOff: purchaseData?.roundOff || false,
          roundOffValue: purchaseData?.roundOffValue || 0,
          sign_type: purchaseData?.sign_type || 'manualSignature',
          signatureName: purchaseData?.signatureName || '',
          signatureId: purchaseData?.signatureId || '',
          signatureImage: purchaseData?.signatureImage || '',
          notes: purchaseData?.notes || '',
          termsAndCondition: purchaseData?.termsAndCondition || '',
          items: purchaseData?.items?.map(item => ({
               productId: item.productId?._id || item.productId || '',
               name: item.name || '',
               quantity: item.quantity || 1,
               units: item.units || item.unit || '',
               rate: item.rate || 0,
               form_updated_rate: item.form_updated_rate || item.rate || 0,
               discount: item.discount || 0,
               form_updated_discount: item.form_updated_discount || item.discount || 0,
               discountType: item.discountType || item.form_updated_discounttype || 3,
               form_updated_discounttype: item.form_updated_discounttype || item.discountType || 3,
               tax: item.tax || 0,
               form_updated_tax: item.form_updated_tax || 0,
               taxInfo: item.taxInfo || { taxRate: 0 },
               amount: item.amount || 0,
               isRateFormUpadted: item.isRateFormUpadted || false
          })) || []
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

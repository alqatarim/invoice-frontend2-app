import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { InvoiceSchema } from '@/views/invoices/InvoiceSchema';
import { useInvoiceItemsHandlers } from './invoice/useInvoiceItemsHandlers';
import { useBankHandlers } from './invoice/useBankHandlers';
import { useSignatureHandlers } from './invoice/useSignatureHandlers';
import { useDialogHandlers } from './invoice/useDialogHandlers';
import { useInvoiceFormSubmission } from './invoice/useInvoiceFormSubmission';
import { useState } from 'react';
import { formatDateForInput } from '@/utils/dateUtils';
import { paymentMethods } from '@/data/dataSets';
export default function useInvoiceHandlers({
  invoiceData,
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
    resolver: yupResolver(InvoiceSchema),
    defaultValues: {
      invoiceNumber: invoiceData?.invoiceNumber || '',
      referenceNo: invoiceData?.referenceNo || '',
      customerId: invoiceData?.customerId?._id || '',
      payment_method: invoiceData?.payment_method || '',
      posMode: Boolean(invoiceData?.posMode),
      isWalkIn: Boolean(invoiceData?.isWalkIn),
      invoiceDate: formatDateForInput(invoiceData?.invoiceDate || new Date()),
      dueDate: formatDateForInput(invoiceData?.dueDate || new Date()),
      taxableAmount: invoiceData?.taxableAmount || 0,
      TotalAmount: Number(invoiceData?.TotalAmount) || 0,
      notes: invoiceData?.notes || '',
      vat: invoiceData?.vat || 0,
      totalDiscount: invoiceData?.totalDiscount || 0,
      roundOff: invoiceData?.roundOff || false,
      termsAndCondition: invoiceData?.termsAndCondition || '',
      bank: invoiceData?.bank?._id || '',
      roundOffValue: invoiceData?.roundOffValue || 0,
      sign_type: 'manualSignature',
      signatureName: invoiceData?.signatureName || '',
      signatureId: invoiceData?.signatureId?._id || '',
      items: invoiceData?.items?.map((item) => ({
        ...item,
        taxInfo: item.taxInfo ? (() => {
          const parsedTaxInfo = JSON.parse(item.taxInfo);
          return {
            ...parsedTaxInfo,
            taxRate: Number(parsedTaxInfo.taxRate)
          };
        })() : null
      })) || []
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = useWatch({ control, name: 'items' });
  const watchRoundOff = useWatch({ control, name: 'roundOff' });

  // Products clone state
  const [productsCloneData, setProductsCloneData] = useState(() => {
    if (productData && invoiceData) {
      const selectedProductIds = Array.isArray(invoiceData.items)
        ? invoiceData.items.map((item) => item.productId)
        : [];
      return productData.filter((product) => !selectedProductIds.includes(product._id));
    }
    return productData || [];
  });

  // Items Table Handlers
  const itemsHandlers = useInvoiceItemsHandlers({
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
    invoiceData,
    setValue,
    trigger,
  });

  // Dialog Handlers
  const dialogHandlers = useDialogHandlers({
    getValues,
    setValue,
  });

  // Form Submission Handlers
  const formSubmissionHandlers = useInvoiceFormSubmission({
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
    // Product state
    productsCloneData,
    setProductsCloneData,
    // Payment
    paymentMethods,
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
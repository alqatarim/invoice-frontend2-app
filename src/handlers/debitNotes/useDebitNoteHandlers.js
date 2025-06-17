import { useState } from 'react';
import { useFormHandler } from './editDebitNote/formHandler';
import { useItemsHandler } from './editDebitNote/itemsHandler';
import { useBankHandler } from './editDebitNote/bankHandler';
import { useSignatureHandler } from './editDebitNote/signatureHandler';
import { useDialogHandler } from './editDebitNote/dialogHandler';
import { useSubmissionHandler } from './editDebitNote/submissionHandler';
import { paymentMethods } from '@/data/dataSets';

export default function useDebitNoteHandlers({
  debitNoteData,
  productData,
  initialBanks,
  signatures,
  onSave,
  enqueueSnackbar,
  closeSnackbar
}) {
  // Initialize products clone data (available products)
  const [productsCloneData, setProductsCloneData] = useState(productData || []);

  // Form Handler
  const formHandler = useFormHandler({ debitNoteData });
  const {
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
  } = formHandler;

  // Items Handler
  const itemsHandler = useItemsHandler({
    control,
    setValue,
    getValues,
    append,
    remove,
    productData,
    enqueueSnackbar,
    closeSnackbar,
    productsCloneData,
    setProductsCloneData
  });

  // Bank Handler
  const bankHandler = useBankHandler({
    initialBanks
  });

  // Signature Handler
  const signatureHandler = useSignatureHandler({
    signatures,
    setValue
  });

  // Dialog Handler
  const dialogHandler = useDialogHandler({
    setValue,
    getValues
  });

  // Submission Handler
  const submissionHandler = useSubmissionHandler({
    onSave,
    enqueueSnackbar
  });

  return {
    // Form controls
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

    // Data
    productsCloneData,
    paymentMethods,

    // Bank
    ...bankHandler,

    // Signature
    ...signatureHandler,

    // Items
    ...itemsHandler,

    // Dialogs
    ...dialogHandler,

    // Submission
    ...submissionHandler
  };
}
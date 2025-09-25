import { useState } from 'react';
import { useFormHandler } from './formHandler';
import { useItemsHandler } from './itemsHandler';
import { useBankHandler } from './bankHandler';
import { useSignatureHandler } from './signatureHandler';
import { useDialogHandler } from './dialogHandler';
import { useSubmissionHandler } from './submissionHandler';
import { paymentMethods } from '@/data/dataSets';

export default function useEditDebitNoteHandlers({
     debitNoteData,
     productData,
     initialBanks,
     signatures,
     onSave,
     enqueueSnackbar,
     closeSnackbar,
     addBank
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
          initialBanks,
          addBank
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

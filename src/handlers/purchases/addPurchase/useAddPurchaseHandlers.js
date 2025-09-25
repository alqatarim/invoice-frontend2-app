import { useState } from 'react';
import { useFormHandler } from './formHandler';
import { useItemsHandler } from './itemsHandler';
import { useBankHandler } from './bankHandler';
import { useSignatureHandler } from './signatureHandler';
import { useDialogHandler } from './dialogHandler';
import { useSubmissionHandler } from './submissionHandler';
import { paymentMethods } from '@/data/dataSets';

export default function useAddPurchaseHandlers({
     purchaseId,
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
     const formHandler = useFormHandler({ purchaseId });
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
          trigger,
          closeSnackbar,
          enqueueSnackbar,
          onSave,
          getValues
     });

     return {
          // Form state and methods
          control,
          handleSubmit,
          setValue,
          getValues,
          errors,
          fields,
          watchItems,
          watchRoundOff,
          productsCloneData,

          // Bank state and methods
          banks: bankHandler.banks,
          newBank: bankHandler.newBank,
          setNewBank: bankHandler.setNewBank,
          handleAddBank: bankHandler.handleAddBank,

          // Signature state and methods
          signOptions: signatureHandler.signOptions,
          handleSignatureSelection: signatureHandler.handleSignatureSelection,

          // Static data
          paymentMethods,

          // Dialog state and methods
          notesExpanded: dialogHandler.notesExpanded,
          termsDialogOpen: dialogHandler.termsDialogOpen,
          tempTerms: dialogHandler.tempTerms,
          setTempTerms: dialogHandler.setTempTerms,
          handleToggleNotes: dialogHandler.handleToggleNotes,
          handleOpenTermsDialog: dialogHandler.handleOpenTermsDialog,
          handleCloseTermsDialog: dialogHandler.handleCloseTermsDialog,
          handleSaveTerms: dialogHandler.handleSaveTerms,

          // Item table state and methods
          discountMenu: itemsHandler.discountMenu,
          setDiscountMenu: itemsHandler.setDiscountMenu,
          taxMenu: itemsHandler.taxMenu,
          setTaxMenu: itemsHandler.setTaxMenu,
          updateCalculatedFields: itemsHandler.updateCalculatedFields,
          handleUpdateItemProduct: itemsHandler.handleUpdateItemProduct,
          handleDeleteItem: itemsHandler.handleDeleteItem,
          handleAddEmptyRow: itemsHandler.handleAddEmptyRow,
          handleMenuItemClick: itemsHandler.handleMenuItemClick,
          handleTaxClick: itemsHandler.handleTaxClick,
          handleTaxClose: itemsHandler.handleTaxClose,
          handleTaxMenuItemClick: itemsHandler.handleTaxMenuItemClick,

          // Form submission methods
          handleFormSubmit: submissionHandler.handleFormSubmit,
          handleError: submissionHandler.handleError
     };
}

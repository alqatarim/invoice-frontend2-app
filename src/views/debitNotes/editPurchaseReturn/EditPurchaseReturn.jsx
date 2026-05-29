import React from 'react';
import DebitNote from '@/views/debitNotes/debitNote';
import { useEditDebitNoteHandlers } from '@/views/debitNotes/handler';
import { getEditDebitNoteColumns } from './EditDebitNoteColumns';

const EditPurchaseReturn = ({ vendorsData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, debitNoteData }) => {
  const handlers = useEditDebitNoteHandlers({
    debitNoteData,
    productData,
    initialBanks,
    employees,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank: null,
  });

  return (
    <DebitNote
      mode="edit"
      title="Edit Debit Note"
      documentNumber={debitNoteData?.debitNoteId}
      recordId={debitNoteData?._id}
      vendorsData={vendorsData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getEditDebitNoteColumns}
    />
  );
};

export default EditPurchaseReturn;

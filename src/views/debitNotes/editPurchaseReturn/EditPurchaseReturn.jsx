import React from 'react';
import DebitNote from '@/views/debitNotes/debitNote';
import useDebitNoteFormHandler from '@/views/debitNotes/useDebitNoteFormHandler';
import { getDebitNoteFormColumns } from '@/views/debitNotes/debitNoteFormColumns';

const EditPurchaseReturn = ({ vendorsData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, debitNoteData }) => {
  const handlers = useDebitNoteFormHandler({
    mode: 'edit',
    debitNoteData,
    productData,
    employees,
    initialBanks,
    onSave,
    enqueueSnackbar,
    closeSnackbar,
    addBank: null,
  });

  return (
    <DebitNote
      mode="edit"
      title="Edit Debit Note"
      documentNumber={debitNoteData?.debit_note_id}
      recordId={debitNoteData?._id}
      vendorsData={vendorsData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getDebitNoteFormColumns}
    />
  );
};

export default EditPurchaseReturn;

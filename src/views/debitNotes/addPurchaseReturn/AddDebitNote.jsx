import React from 'react';
import DebitNote from '@/views/debitNotes/debitNote';
import useDebitNoteFormHandler from '@/views/debitNotes/useDebitNoteFormHandler';
import { getDebitNoteFormColumns } from '@/views/debitNotes/debitNoteFormColumns';

const AddDebitNote = ({ vendorsData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, debitNoteNumber }) => {
  const handlers = useDebitNoteFormHandler({
    mode: 'add',
    debitNoteNumber,
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
      mode="add"
      title="Add Debit Note"
      documentNumber={debitNoteNumber}
      vendorsData={vendorsData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getDebitNoteFormColumns}
    />
  );
};

export default AddDebitNote;

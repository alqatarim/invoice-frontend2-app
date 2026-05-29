import React from 'react';
import DebitNote from '@/views/debitNotes/debitNote';
import { useAddDebitNoteHandlers } from '@/views/debitNotes/handler';
import { getAddDebitNoteColumns } from './AddDebitNoteColumns';

const AddDebitNote = ({ vendorsData, productData, taxRates, initialBanks, employees, onSave, enqueueSnackbar, closeSnackbar, debitNoteNumber }) => {
  const handlers = useAddDebitNoteHandlers({
    debitNoteNumber,
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
      mode="add"
      title="Add Debit Note"
      documentNumber={debitNoteNumber}
      vendorsData={vendorsData}
      taxRates={taxRates}
      handlers={handlers}
      columnsFactory={getAddDebitNoteColumns}
    />
  );
};

export default AddDebitNote;

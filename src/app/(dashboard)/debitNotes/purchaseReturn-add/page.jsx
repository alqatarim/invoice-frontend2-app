import React from 'react';
import AddDebitNoteIndex from '@/views/debitNotes/addPurchaseReturn/index';
import { getDropdownData } from '@/app/(dashboard)/debitNotes/actions';

const AddDebitNotePage = async () => {
  const initialDropdownData = await getDropdownData();

  return (
    <AddDebitNoteIndex initialDropdownData={initialDropdownData} />
  );
};

export default AddDebitNotePage;
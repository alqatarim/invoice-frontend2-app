import React from 'react';
import AddDebitNoteIndex from '@/views/debitNotes/addPurchaseReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const AddDebitNotePage = () => {
  return (
    <ProtectedComponent>
      <AddDebitNoteIndex />
    </ProtectedComponent>
  );
};

export default AddDebitNotePage;
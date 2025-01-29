import React from 'react';
import EditDebitNoteIndex from '@/views/debitNotes/editPurchaseReturn';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Debit Note | Invoicing System',
  description: 'Edit an existing debit note'
};

const EditDebitNotePage = ({ params }) => {
  return (
    <ProtectedComponent>
      <EditDebitNoteIndex debitNoteId={params.id} />
    </ProtectedComponent>
  );
};

export default EditDebitNotePage;
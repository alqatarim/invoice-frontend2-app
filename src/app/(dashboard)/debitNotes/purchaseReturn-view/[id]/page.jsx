import React from 'react';
import ViewDebitNoteIndex from '@/views/debitNotes/viewPurchaseReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'View Debit Note',
  description: 'View debit note details'
};

const ViewDebitNotePage = async ({ params }) => {
  return (
    <ProtectedComponent>
      <ViewDebitNoteIndex debitNoteId={params.id} />
    </ProtectedComponent>
  );
};

export default ViewDebitNotePage;
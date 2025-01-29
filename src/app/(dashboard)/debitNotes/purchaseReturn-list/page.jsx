import React from 'react';
import PurchaseReturnListIndex from '@/views/debitNotes/listPurchaseReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';

const DebitNoteListPage = () => {
  return (
    <ProtectedComponent>
      <PurchaseReturnListIndex />
    </ProtectedComponent>
  );
};

export default DebitNoteListPage;
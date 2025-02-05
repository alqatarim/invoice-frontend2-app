import React from 'react';
import EditPurchaseReturnIndex from '@/views/debitNotes/editPurchaseReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Debit Note | Invoicing System',
  description: 'Edit an existing debit note'
};

const EditDebitNotePage = ({ params }) => {
  return (
    <ProtectedComponent>
      <EditPurchaseReturnIndex id={params.id} />
    </ProtectedComponent>
  );
};

export default EditDebitNotePage;
import React from 'react';
import { getDebitNotesList } from '@/app/(dashboard)/debitNotes/actions';
import PurchaseReturnListIndex from '@/views/debitNotes/listPurchaseReturn/index';

export const metadata = {
  title: 'Debit Note List | Kanakku',
};

async function DebitNoteListPage() {
  let initialDebitNotes = [];
  let initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  let initialErrorMessage = '';

  try {
    const initialData = await getDebitNotesList();
    initialDebitNotes = initialData?.data || [];
    initialPagination = {
      current: 1,
      pageSize: 10,
      total: initialData?.totalRecords || 0,
    };
  } catch (error) {
    console.error('Error loading debit note list data:', error);
    initialErrorMessage = error?.message || 'Failed to load debit note list.';
  }

  return (
    <PurchaseReturnListIndex
      initialDebitNotes={initialDebitNotes}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
}

export default DebitNoteListPage;
import React from 'react';
import { getDebitNotesList } from '@/app/(dashboard)/debitNotes/actions';
import PurchaseReturnListIndex from '@/views/debitNotes/listPurchaseReturn/index';

export const metadata = {
  title: 'Debit Note List | Kanakku',
};

async function DebitNoteListPage() {
  try {
    const initialData = await getDebitNotesList();

    return (
      <PurchaseReturnListIndex
        initialDebitNotes={initialData?.data || []}
        initialPagination={{
          current: 1,
          pageSize: 10,
          total: initialData?.totalRecords || 0,
        }}
      />
    );
  } catch (error) {
    console.error('Error loading debit note list data:', error);
    return <div className="text-red-600 p-8">Failed to load debit note list.</div>;
  }
}

export default DebitNoteListPage;
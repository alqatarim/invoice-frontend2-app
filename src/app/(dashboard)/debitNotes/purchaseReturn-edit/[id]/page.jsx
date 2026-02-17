import React from 'react';
import EditPurchaseReturnIndex from '@/views/debitNotes/editPurchaseReturn/index';
import { getDropdownData, getDebitNoteDetails } from '@/app/(dashboard)/debitNotes/actions';

export const metadata = {
  title: 'Edit Debit Note | Invoicing System',
  description: 'Edit an existing debit note'
};

const EditDebitNotePage = async ({ params }) => {
  let initialDropdownData = {
    vendors: [],
    products: [],
    taxRates: [],
    banks: [],
    signatures: [],
  };
  let initialDebitNoteData = null;

  try {
    const [dropdownResponse, debitNoteResponse] = await Promise.all([
      getDropdownData(),
      getDebitNoteDetails(params.id),
    ]);

    initialDropdownData = dropdownResponse || initialDropdownData;
    if (debitNoteResponse?.success && debitNoteResponse?.data) {
      initialDebitNoteData = debitNoteResponse.data;
    }
  } catch (error) {
    console.error('Failed to fetch edit debit note data:', error);
  }

  return (
    <EditPurchaseReturnIndex
      id={params.id}
      initialDropdownData={initialDropdownData}
      initialDebitNoteData={initialDebitNoteData}
    />
  );
};

export default EditDebitNotePage;
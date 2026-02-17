import React from 'react';
import ViewDebitNoteIndex from '@/views/debitNotes/viewPurchaseReturn/index';
import { getDebitNoteDetails } from '@/app/(dashboard)/debitNotes/actions';

export const metadata = {
  title: 'View Debit Note',
  description: 'View debit note details'
};

const ViewDebitNotePage = async ({ params }) => {
  let initialDebitNoteData = null;

  try {
    const response = await getDebitNoteDetails(params.id);
    if (response?.success && response?.data) {
      initialDebitNoteData = response.data;
    }
  } catch (error) {
    console.error('Failed to fetch debit note details:', error);
  }

  return (
    <ViewDebitNoteIndex
      debitNoteId={params.id}
      initialDebitNoteData={initialDebitNoteData}
    />
  );
};

export default ViewDebitNotePage;
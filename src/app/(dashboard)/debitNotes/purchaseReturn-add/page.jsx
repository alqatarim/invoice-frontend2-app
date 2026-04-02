import React from 'react';
import AddDebitNoteIndex from '@/views/debitNotes/addPurchaseReturn/index';
import {
  getBanks,
  getDebitNoteNumber,
  getProducts,
  getSignatures,
  getTaxRates,
  getVendors,
} from '@/app/(dashboard)/debitNotes/actions';

export const metadata = {
  title: 'Add Debit Note | Kanakku',
};

const AddDebitNotePage = async () => {
  const [
    initialVendors,
    initialProducts,
    initialTaxRates,
    initialBanks,
    initialSignatures,
    initialDebitNoteNumberResponse,
  ] = await Promise.all([
    getVendors(),
    getProducts(),
    getTaxRates(),
    getBanks(),
    getSignatures(),
    getDebitNoteNumber(),
  ]);

  return (
    <AddDebitNoteIndex
      initialVendors={initialVendors}
      initialProducts={initialProducts}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialDebitNoteNumber={
        initialDebitNoteNumberResponse?.success ? initialDebitNoteNumberResponse.data || '' : ''
      }
    />
  );
};

export default AddDebitNotePage;
import React from 'react';
import EditPurchaseReturnIndex from '@/views/debitNotes/editPurchaseReturn/index';
import {
  getBanks,
  getDebitNoteDetails,
  getProducts,
  getSignatures,
  getTaxRates,
  getVendors,
} from '@/app/(dashboard)/debitNotes/actions';

export const metadata = {
  title: 'Edit Debit Note | Invoicing System',
  description: 'Edit an existing debit note'
};

const EditDebitNotePage = async ({ params }) => {
  let initialVendors = [];
  let initialProducts = [];
  let initialTaxRates = [];
  let initialBanks = [];
  let initialSignatures = [];
  let initialDebitNoteData = null;

  try {
    const [
      vendorsResponse,
      productsResponse,
      taxRatesResponse,
      banksResponse,
      signaturesResponse,
      debitNoteResponse,
    ] = await Promise.all([
      getVendors(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures(),
      getDebitNoteDetails(params.id),
    ]);

    initialVendors = vendorsResponse || [];
    initialProducts = productsResponse || [];
    initialTaxRates = taxRatesResponse || [];
    initialBanks = banksResponse || [];
    initialSignatures = signaturesResponse || [];
    if (debitNoteResponse?.success && debitNoteResponse?.data) {
      initialDebitNoteData = debitNoteResponse.data;
    }
  } catch (error) {
    console.error('Failed to fetch edit debit note data:', error);
  }

  return (
    <EditPurchaseReturnIndex
      id={params.id}
      initialVendors={initialVendors}
      initialProducts={initialProducts}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
      initialDebitNoteData={initialDebitNoteData}
    />
  );
};

export default EditDebitNotePage;
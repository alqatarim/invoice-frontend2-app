import React from 'react';
import AddDebitNoteIndex from '@/views/debitNotes/addPurchaseReturn/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getVendors, getProducts, getTaxRates, getBanks, getSignatures, getDebitNoteNumber } from '../actions';

const AddDebitNotePage = async () => {
  try {
    // Fetch all data separately
    const vendors = await getVendors();
    const products = await getProducts();
    const taxRates = await getTaxRates();
    const banks = await getBanks();
    const signatures = await getSignatures();
    const debitNoteNumber = await getDebitNoteNumber();

    return (
      <ProtectedComponent>
        <AddDebitNoteIndex
          vendors={vendors}
          products={products}
          taxRates={taxRates}
          banks={banks}
          signatures={signatures}
          debitNoteNumber={debitNoteNumber.data}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading form data:', error);
    return <div>Error loading form data</div>;
  }
};

export default AddDebitNotePage;
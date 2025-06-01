import React from 'react';
import AddPurchaseIndex from '@/views/purchases/addPurchase/index';
import { getDropdownData, getPurchaseNumber } from '@/app/(dashboard)/purchases/actions';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Add Purchase | Kanakku',
};

const PurchaseAddPage = async () => {
  try {
    const [dropdownData, purchaseNumber] = await Promise.all([
      getDropdownData(),
      getPurchaseNumber(),
    ]);

    return (
      <ProtectedComponent>
        <AddPurchaseIndex
          vendors={dropdownData.vendors}
          products={dropdownData.products}
          taxRates={dropdownData.taxRates}
          banks={dropdownData.banks}
          signatures={dropdownData.signatures}
          units={dropdownData.units}
          purchaseNumber={purchaseNumber.data}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading add purchase data:', error);
    return <div className="text-red-600 p-8">Failed to load data for Add Purchase.</div>;
  }
};

export default PurchaseAddPage;
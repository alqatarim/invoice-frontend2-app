import React from 'react';
import { notFound } from 'next/navigation';
import EditPurchaseIndex from '@/views/purchases/editPurchase/index';
import { getPurchaseDetails, getDropdownData } from '@/app/(dashboard)/purchases/actions';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Purchase | Kanakku',
};

const PurchaseEditPage = async ({ params }) => {
  const { id } = params;

  if (!id) {
    notFound();
  }

  try {
    const [purchaseResponse, dropdownData] = await Promise.all([
      getPurchaseDetails(id),
      getDropdownData(),
    ]);

    if (!purchaseResponse.success || !purchaseResponse.data) {
      notFound();
    }

    return (
      <ProtectedComponent>
        <EditPurchaseIndex
          purchaseData={purchaseResponse.data}
          vendors={dropdownData.vendors}
          products={dropdownData.products}
          taxRates={dropdownData.taxRates}
          banks={dropdownData.banks}
          signatures={dropdownData.signatures}
          units={dropdownData.units}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading edit purchase data:', error);
    return <div className="text-red-600 p-8">Failed to load purchase data for editing.</div>;
  }
};

export default PurchaseEditPage;


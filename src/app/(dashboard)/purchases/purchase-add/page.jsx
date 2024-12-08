import React from 'react';
import AddPurchase from '@/views/purchases/addPurchase';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getDropdownData } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchasePage = async () => {
  try {
    const dropdownData = await getDropdownData();

    return (
      <ProtectedComponent>
        <AddPurchase initialData={dropdownData.data} />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading form data:', error);
    return <div>Error loading form data</div>;
  }
};

export default AddPurchasePage;
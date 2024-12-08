import React from 'react';
import AddPurchaseOrder from '@/views/purchase-orders/addOrder';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getDropdownData } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderPage = async () => {
  try {
    const dropdownData = await getDropdownData();

    return (
      <ProtectedComponent>
        <AddPurchaseOrder initialData={dropdownData.data} />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading form data:', error);
    return <div>Error loading form data</div>;
  }
};

export default AddPurchaseOrderPage;
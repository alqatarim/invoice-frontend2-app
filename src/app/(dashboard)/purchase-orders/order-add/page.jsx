import React from 'react';
import AddPurchaseOrderIndex from '@/views/purchase-orders/addOrder/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getVendors, getProducts, getTaxRates, getBanks, getSignatures } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderPage = async () => {
  try {
    // Fetch all data separately
    const vendors = await getVendors();
    const products = await getProducts();
    const taxRates = await getTaxRates();
    const banks = await getBanks();
    const signatures = await getSignatures();

    return (
      <ProtectedComponent>
        <AddPurchaseOrderIndex 
          vendors={vendors}
          products={products}
          taxRates={taxRates}
          banks={banks}
          signatures={signatures}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading form data:', error);
    return <div>Error loading form data</div>;
  }
};

export default AddPurchaseOrderPage;
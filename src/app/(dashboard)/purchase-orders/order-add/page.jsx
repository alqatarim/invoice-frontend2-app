import React from 'react';
import AddPurchaseOrderIndex from '@/views/purchase-orders/addOrder/index';
import { getVendors, getProducts, getTaxRates, getBanks, getSignatures, getPurchaseOrderNumber } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderPage = async () => {
  try {
    // Fetch all data separately
    const vendors = await getVendors();
    const products = await getProducts();
    const taxRates = await getTaxRates();
    const banks = await getBanks();
    const signatures = await getSignatures();
    const purchaseOrderNumber = await getPurchaseOrderNumber();


    return (
      <AddPurchaseOrderIndex
        vendors={vendors}
        products={products}
        taxRates={taxRates}
        banks={banks}
        signatures={signatures}
        purchaseOrderNumber={purchaseOrderNumber.data}
      />
    );
  } catch (error) {
    console.error('Error loading form data:', error);
    return <div>Error loading form data</div>;
  }
};

export default AddPurchaseOrderPage;
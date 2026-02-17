import React from 'react';
import AddPurchaseOrderIndex from '@/views/purchase-orders/addOrder/index';
import { getVendors, getProducts, getTaxRates, getBanks, getSignatures, getPurchaseOrderNumber } from '@/app/(dashboard)/purchase-orders/actions';

const AddPurchaseOrderPage = async () => {
  try {
    const [vendors, products, taxRates, banks, signatures, purchaseOrderNumber] = await Promise.all([
      getVendors(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures(),
      getPurchaseOrderNumber()
    ]);


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
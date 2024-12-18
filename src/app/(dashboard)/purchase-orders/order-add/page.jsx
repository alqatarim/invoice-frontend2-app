import React from 'react';
import AddPurchaseOrderIndex from '@/views/purchase-orders/addOrder/index';
import ProtectedComponent from '@/components/ProtectedComponent';
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


    // console.log("signatures: ");
    // console.log(signatures);
    // console.log("banks: ");
    // console.log(banks);
    // console.log("taxRates: ");
    // console.log(taxRates);
    //  console.log("products:");
    //  console.log(products);
    // console.log("vendors");
    // console.log(vendors);
    // console.log("purchaseOrderNumber: ");
    // console.log(purchaseOrderNumber);

    return (
      <ProtectedComponent>
        <AddPurchaseOrderIndex
          vendors={vendors}
          products={products}
          taxRates={taxRates}
          banks={banks}
          signatures={signatures}
          purchaseOrderNumber={purchaseOrderNumber.data}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading form data:', error);
    return <div>Error loading form data</div>;
  }
};

export default AddPurchaseOrderPage;
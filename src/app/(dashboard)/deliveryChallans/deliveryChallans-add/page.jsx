import React from 'react';
import AddDeliveryChallanIndex from '@/views/deliveryChallans/addDeliveryChallans/index';
import { getCustomers, getProducts, getTaxRates, getBanks, getSignatures, getDeliveryChallanNumber } from '@/app/(dashboard)/deliveryChallans/actions';

export const metadata = {
  title: 'Add Delivery Challan | Kanakku',
};

const AddDeliveryChallanPage = async () => {
  try {
    const [customersData, productData, taxRates, initialBanks, signatures, deliveryChallanNumber] = await Promise.all([
      getCustomers(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures(),
      getDeliveryChallanNumber(),
    ]);

    return (
      <AddDeliveryChallanIndex
        customersData={customersData}
        productData={productData}
        taxRates={taxRates}
        initialBanks={initialBanks}
        signatures={signatures}
        deliveryChallanNumber={deliveryChallanNumber}
      />
    );
  } catch (error) {
    console.error('Error loading add delivery challan data:', error);
    return <div className="text-red-600 p-8">Failed to load data for Add Delivery Challan.</div>;
  }
};

export default AddDeliveryChallanPage;
import React from 'react';
import AddSalesReturnIndex from '@/views/salesReturn/addSalesReturn/index';
import {
  getCustomers,
  getProducts,
  getTaxRates,
  getBanks,
  getSignatures,
  getSalesReturnNumber
} from '@/app/(dashboard)/sales-return/actions';

const AddSalesReturnPage = async () => {
  const [customers, products, taxRates, banks, signatures, salesReturnNumber] = await Promise.all([
    getCustomers(),
    getProducts(),
    getTaxRates(),
    getBanks(),
    getSignatures(),
    getSalesReturnNumber()
  ]);

  return (
    <AddSalesReturnIndex
      initialCustomers={customers}
      initialProducts={products}
      initialTaxRates={taxRates}
      initialBanks={banks}
      initialSignatures={signatures}
      initialSalesReturnNumber={salesReturnNumber?.data || ''}
    />
  );
};

export default AddSalesReturnPage;
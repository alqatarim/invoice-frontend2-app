import { notFound } from 'next/navigation';
import EditSalesReturnIndex from '@/views/salesReturn/editSalesReturn/index';
import { getSalesReturnDetails, getCustomers, getProducts, getTaxRates, getBanks, getSignatures } from '@/app/(dashboard)/sales-return/actions';

export const metadata = {
  title: 'Edit Sales Return | Kanakku',
};

const EditSalesReturnPage = async ({ params }) => {
  const { id } = params;
  let initialSalesReturnData = null;
  let initialCustomers = [];
  let initialProducts = [];
  let initialTaxRates = [];
  let initialBanks = [];
  let initialSignatures = [];

  try {
    const [salesReturnData, customersData, productData, taxRates, banksData, signatures] = await Promise.all([
      getSalesReturnDetails(id),
      getCustomers(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures(),
    ]);

    if (!salesReturnData) {
      notFound();
    }

    initialSalesReturnData = salesReturnData;
    initialCustomers = customersData;
    initialProducts = productData;
    initialTaxRates = taxRates;
    initialBanks = banksData;
    initialSignatures = signatures;
  } catch (error) {
    console.error('Error loading sales return data:', error);
    notFound();
  }

  return (
    <EditSalesReturnIndex
      id={id}
      initialSalesReturnData={initialSalesReturnData}
      initialCustomers={initialCustomers}
      initialProducts={initialProducts}
      initialTaxRates={initialTaxRates}
      initialBanks={initialBanks}
      initialSignatures={initialSignatures}
    />
  );
};

export default EditSalesReturnPage;
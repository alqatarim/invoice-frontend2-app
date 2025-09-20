import { notFound } from 'next/navigation';
import EditSalesReturnIndex from '@/views/salesReturn/editSalesReturn/index';
import { getSalesReturnDetails, getCustomers, getProducts, getTaxRates, getBanks, getSignatures } from '@/app/(dashboard)/sales-return/actions';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Sales Return | Kanakku',
};

const EditSalesReturnPage = async ({ params }) => {
  const { id } = params;

  try {
    const [salesReturnData, customersData, productData, taxRates, initialBanks, signatures] = await Promise.all([
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

    return (
      <ProtectedComponent>
        <EditSalesReturnIndex
          id={id}
          salesReturnData={salesReturnData}
          customersData={customersData}
          productData={productData}
          taxRates={taxRates}
          initialBanks={initialBanks}
          signatures={signatures}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading sales return data:', error);
    notFound();
  }
};

export default EditSalesReturnPage;
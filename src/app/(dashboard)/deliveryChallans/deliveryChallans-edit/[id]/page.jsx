import { notFound } from 'next/navigation';
import EditDeliveryChallanIndex from '@/views/deliveryChallans/editDeliveryChallans/index';
import { getDeliveryChallanById, getCustomers, getProducts, getTaxRates, getBanks, getSignatures, addBank } from '@/app/(dashboard)/deliveryChallans/actions';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Edit Delivery Challan | Kanakku',
};

const EditDeliveryChallanPage = async ({ params }) => {
  const { id } = params;

  try {
    const [deliveryChallanData, customersData, productData, taxRates, initialBanks, signatures] = await Promise.all([
      getDeliveryChallanById(id),
      getCustomers(),
      getProducts(),
      getTaxRates(),
      getBanks(),
      getSignatures(),
    ]);

    if (!deliveryChallanData) {
      notFound();
    }

    return (
      <ProtectedComponent>
        <EditDeliveryChallanIndex
          id={id}
          deliveryChallanData={deliveryChallanData}
          customersData={customersData}
          productData={productData}
          taxRates={taxRates}
          initialBanks={initialBanks}
          signatures={signatures}
          addBank={addBank}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading delivery challan data:', error);
    notFound();
  }
};

export default EditDeliveryChallanPage;
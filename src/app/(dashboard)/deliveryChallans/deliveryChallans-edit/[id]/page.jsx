import { notFound } from 'next/navigation';
import EditDeliveryChallanIndex from '@/views/deliveryChallans/editDeliveryChallans/index';
import {
  getDeliveryChallanById,
  getCustomers,
  getProducts,
  getTaxRates,
  getBanks,
  getSignatures,
  addBank,
} from '../../actions';

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
      <EditDeliveryChallanIndex
        id={id}
        initialDeliveryChallanData={deliveryChallanData}
        initialCustomers={customersData}
        initialProducts={productData}
        initialTaxRates={taxRates}
        initialBanks={initialBanks}
        initialSignatures={signatures}
        addBank={addBank}
      />
    );
  } catch (error) {
    console.error('Error loading delivery challan data:', error);
    notFound();
  }
};

export default EditDeliveryChallanPage;
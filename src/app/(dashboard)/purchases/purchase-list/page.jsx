import { getPurchaseList } from '../actions';
import PurchaseListIndex from '@/views/purchases/listPurchase';
import ProtectedComponent from '@/components/ProtectedComponent';

async function PurchaseListPage() {
  const initialData = await getPurchaseList();

  return (
    <ProtectedComponent>
      <PurchaseListIndex initialData={initialData} />
    </ProtectedComponent>
  );
}

export default PurchaseListPage;
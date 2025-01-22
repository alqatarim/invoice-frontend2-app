import { getDropdownData, getPurchaseDetails } from '../../actions';
import PurchaseEdit from '@/views/purchases/editPurchase';

async function PurchaseEditPage({ params }) {
  const [dropdownData, purchaseData] = await Promise.all([
    getDropdownData(),
    getPurchaseDetails(params.id)
  ]);

  return <PurchaseEdit dropdownData={dropdownData} purchaseData={purchaseData} />;
}

export default PurchaseEditPage;
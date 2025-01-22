import { getDropdownData, getPurchaseNumber } from '../actions';
import PurchaseAdd from '@/views/purchases/addPurchase';

async function PurchaseAddPage() {
  const [dropdownData, purchaseNumber] = await Promise.all([
    getDropdownData(),
    getPurchaseNumber()
  ]);

  return <PurchaseAdd dropdownData={dropdownData} purchaseNumber={purchaseNumber} />;
}

export default PurchaseAddPage;
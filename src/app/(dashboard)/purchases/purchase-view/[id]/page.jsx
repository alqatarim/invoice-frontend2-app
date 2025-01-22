import PurchaseViewIndex from '@/views/purchases/viewPurchase/index';

async function PurchaseViewPage({ params }) {
  return <PurchaseViewIndex id={params.id} />;
}

export default PurchaseViewPage;
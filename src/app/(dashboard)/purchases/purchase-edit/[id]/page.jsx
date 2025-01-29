import EditPurchaseIndex from '@/views/purchases/editPurchase/index';

async function PurchaseEditPage({ params }) {
  return <EditPurchaseIndex id={params.id} />
}

export default PurchaseEditPage


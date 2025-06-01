import React from 'react';
import { notFound } from 'next/navigation';
import PurchaseViewIndex from '@/views/purchases/viewPurchase/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'View Purchase | Kanakku',
};

async function PurchaseViewPage({ params }) {
  const { id } = params;

  if (!id) {
    notFound();
  }

  return (
    <ProtectedComponent>
      <PurchaseViewIndex id={id} />
    </ProtectedComponent>
  );
}

export default PurchaseViewPage;
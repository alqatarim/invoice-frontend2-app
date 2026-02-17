import React from 'react';
import ViewPurchaseIndex from '@/views/purchases/viewPurchase/index';
import { getPurchaseDetails } from '@/app/(dashboard)/purchases/actions';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'View Purchase',
  description: 'View purchase details'
};

const ViewPurchasePage = async ({ params }) => {
  try {
    // Fetch purchase data on the server
    const response = await getPurchaseDetails(params.id);

    if (!response.success || !response.data) {
      notFound();
    }

    return (
      <ViewPurchaseIndex
        purchaseId={params.id}
        initialData={response.data}
      />
    );
  } catch (error) {
    console.error('Error fetching purchase:', error);
    notFound();
  }
};

export default ViewPurchasePage;
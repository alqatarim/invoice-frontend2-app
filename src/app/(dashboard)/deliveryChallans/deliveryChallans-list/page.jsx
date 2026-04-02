import React from 'react';
import { getFilteredDeliveryChallans } from '../actions';
import DeliveryChallanListIndex from '@/views/deliveryChallans/listDeliveryChallans/index';

export const metadata = {
  title: 'Delivery Challan List | Kanakku',
};

async function DeliveryChallanListPage() {
  let initialDeliveryChallans = [];
  let initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  let initialErrorMessage = '';

  try {
    const initialListData = await getFilteredDeliveryChallans(1, 10, {});
    initialDeliveryChallans = initialListData?.deliveryChallans || [];
    initialPagination = initialListData?.pagination || initialPagination;
  } catch (error) {
    console.error('Error loading delivery challan list data:', error);
    initialErrorMessage = error?.message || 'Failed to load delivery challan list.';
  }

  return (
    <DeliveryChallanListIndex
      initialDeliveryChallans={initialDeliveryChallans}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
}

export default DeliveryChallanListPage;
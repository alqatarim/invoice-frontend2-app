import React from 'react';
import DeliveryChallanListIndex from '@/views/deliveryChallans/listDeliveryChallans/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialDeliveryChallanData, searchCustomers, getDeliveryChallanStats } from '@/app/(dashboard)/deliveryChallans/actions';

/**
 * DeliveryChallansPage Component
 * Fetches initial delivery challan data on the server and passes it to the client component.
 *
 * @returns JSX.Element
 */
const DeliveryChallansPage = async () => {
  // Fetch initial delivery challan data and customers separately on the server
  const [initialData, customers, stats] = await Promise.all([
    getInitialDeliveryChallanData(),
    searchCustomers(''), // Get all customers by passing empty search term
    getDeliveryChallanStats().catch(() => ({ cardCounts: {} })) // Fallback for stats
  ]);

  return (
    <ProtectedComponent>
      <DeliveryChallanListIndex
        initialDeliveryChallans={initialData?.deliveryChallans || []}
        pagination={initialData?.pagination || { current: 1, pageSize: 10, total: 0 }}
        cardCounts={initialData?.cardCounts || stats?.cardCounts || {}}
        tab="ALL"
        filters={{}}
        sortBy=""
        sortDirection="asc"
        initialCustomers={customers}
      />
    </ProtectedComponent>
  );
};

export default DeliveryChallansPage;
import React from 'react';
import InventoryList from '@/views/inventory/inventoryList/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getInitialInventoryData } from './actions';

/**
 * InventoryPage Component
 * Server component that fetches initial data and passes to client component.
 *
 * @returns JSX.Element
 */
const InventoryPage = async () => {
  // Fetch initial data on the server
  let initialData = {
    inventory: [],
    pagination: { current: 1, pageSize: 10, total: 0 },
    cardCounts: {}
  };

  try {
    initialData = await getInitialInventoryData();
  } catch (error) {
    console.error('Failed to fetch initial inventory data:', error);
  }

  return (
    <ProtectedComponent>
      <InventoryList initialData={initialData} />
    </ProtectedComponent>
  );
};

export default InventoryPage;
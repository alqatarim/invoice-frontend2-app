import React from 'react';
import InventoryList from '@/views/inventory/inventoryList/index';
import ProtectedComponent from '@/components/ProtectedComponent';

/**
 * InventoryPage Component
 * Simply renders the InventoryList component with protection.
 *
 * @returns JSX.Element
 */
const InventoryPage = () => {
  return (
    <ProtectedComponent>
      <InventoryList />
    </ProtectedComponent>
  );
};

export default InventoryPage;
'use client';

import React from "react";
import InventoryList from "@/views/inventory/inventoryList/InventoryList";

const InventoryListIndex = ({ initialData }) => {
  // Only extract and pass initial data as props
  const initialInventory = initialData?.inventory || [];
  const pagination = initialData?.pagination || {
    current: 1,
    pageSize: 10,
    total: 0
  };
  const cardCounts = initialData?.cardCounts || {};

  return (
    <InventoryList
      initialInventory={initialInventory}
      pagination={pagination}
      cardCounts={cardCounts}
    />
  );
};

export default InventoryListIndex;
'use client'

import React from "react";
import PurchaseOrderList from "@/views/purchase-orders/listOrder/PurchaseOrderList";

const PurchaseOrderListIndex = ({ initialData }) => {
  return (
    <PurchaseOrderList
      initialPurchaseOrders={initialData?.purchaseOrders || []}
      initialPagination={initialData?.pagination || { current: 1, pageSize: 10, total: 0 }}
    />
  );
};

export default PurchaseOrderListIndex;
'use client'

import React from "react";
import PurchaseOrderList from "@/views/purchase-orders/listOrder/PurchaseOrderList";

const PurchaseOrderListIndex = ({
  initialPurchaseOrders = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) => {
  return (
    <PurchaseOrderList
      initialPurchaseOrders={initialPurchaseOrders}
      initialPagination={initialPagination}
      initialErrorMessage={initialErrorMessage}
    />
  );
};

export default PurchaseOrderListIndex;
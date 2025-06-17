'use client'

import React from "react";
import DeliveryChallanList from "@/views/deliveryChallans/listDeliveryChallans/DeliveryChallanList";

/**
 * DeliveryChallanListIndex Component
 * Entry point for the delivery challan list page
 */
const DeliveryChallanListIndex = ({
  initialDeliveryChallans = [],
  pagination: initialPagination = { current: 1, pageSize: 10, total: 0 },
  cardCounts: initialCardCounts = {},
  tab: initialTab = 'ALL',
  filters: initialFilters = {},
  sortBy: initialSortBy = '',
  sortDirection: initialSortDirection = 'asc',
  initialCustomers = [],
}) => {
  return (
    <DeliveryChallanList
      initialDeliveryChallans={initialDeliveryChallans}
      pagination={initialPagination}
      cardCounts={initialCardCounts}
      tab={initialTab}
      filters={initialFilters}
      sortBy={initialSortBy}
      sortDirection={initialSortDirection}
      initialCustomers={initialCustomers}
    />
  );
};

export default DeliveryChallanListIndex;
'use client';

import React from 'react';
import PurchaseList from './PurchaseList';

const PurchaseListIndex = ({
     initialPurchases = [],
     initialPagination = { current: 1, pageSize: 10, total: 0 },
     initialVendors = [],
     initialErrorMessage = '',
}) => {
     return (
          <PurchaseList
               initialPurchases={initialPurchases}
               initialPagination={initialPagination}
               vendors={initialVendors}
               initialErrorMessage={initialErrorMessage}
          />
     );
};

export default PurchaseListIndex;

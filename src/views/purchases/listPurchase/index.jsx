'use client';

import React from 'react';
import PurchaseList from './PurchaseList';

const PurchaseListIndex = ({ initialData, vendors = [] }) => {
     return (
          <PurchaseList
               initialPurchases={initialData.data || []}
               initialPagination={{ current: 1, pageSize: 10, total: initialData.totalRecords || 0 }}
               vendors={vendors}
          />
     );
};

export default PurchaseListIndex;

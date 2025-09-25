'use client';

import React from 'react';
import SimpleDebitNoteList from './SimpleDebitNoteList';

const PurchaseReturnListIndex = ({ initialData, vendors = [] }) => {
  return (
    <SimpleDebitNoteList
      initialDebitNotes={initialData.data || []}
      initialPagination={{ current: 1, pageSize: 10, total: initialData.totalRecords || 0 }}
      vendors={vendors}
    />
  );
};

export default PurchaseReturnListIndex;
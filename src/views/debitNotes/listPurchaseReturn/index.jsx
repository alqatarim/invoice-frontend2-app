'use client';

import React from 'react';
import SimpleDebitNoteList from './SimpleDebitNoteList';

const PurchaseReturnListIndex = ({
  initialDebitNotes = [],
  initialPagination,
}) => {
  return (
    <SimpleDebitNoteList
      initialDebitNotes={initialDebitNotes}
      initialPagination={initialPagination}
    />
  );
};

export default PurchaseReturnListIndex;
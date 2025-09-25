'use client';

import React from 'react';
import ExpenseList from './ExpenseList';

const ExpenseListIndex = ({ initialData }) => {
     return (
          <ExpenseList
               initialExpenses={initialData.data || []}
               initialPagination={{ current: 1, pageSize: 10, total: initialData.totalRecords || 0 }}
          />
     );
};

export default ExpenseListIndex;

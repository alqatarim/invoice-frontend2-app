import React from 'react';
import ExpenseListIndex from '@/views/expenses/listExpense/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Expenses List',
  description: 'View and manage expenses'
};

const ExpenseListPage = () => {
  return (
    <ProtectedComponent>
      <ExpenseListIndex />
    </ProtectedComponent>
  );
};

export default ExpenseListPage;

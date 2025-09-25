import React from 'react';
import { getExpensesList } from '../actions';
import ExpenseListIndex from '@/views/expenses/listExpense/index';
import ProtectedComponent from '@/components/ProtectedComponent';

export const metadata = {
  title: 'Expense List | Kanakku',
};

async function ExpenseListPage() {
  try {
    const initialData = await getExpensesList();

    return (
      <ProtectedComponent>
        <ExpenseListIndex
          initialData={initialData}
        />
      </ProtectedComponent>
    );
  } catch (error) {
    console.error('Error loading expense list data:', error);
    return <div className="text-red-600 p-8">Failed to load expense list.</div>;
  }
}

export default ExpenseListPage;

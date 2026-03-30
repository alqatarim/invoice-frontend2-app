import React from 'react';
import { getExpenseNumber, getExpensesList } from '../actions';
import ExpenseListIndex from '@/views/expenses/listExpense/index';

export const metadata = {
  title: 'Expense List | Kanakku',
};

async function ExpenseListPage() {
  try {
    const [initialListData, initialExpenseNumberData] = await Promise.all([
      getExpensesList(),
      getExpenseNumber(),
    ]);

    const initialExpenses = initialListData?.success ? initialListData.data || [] : [];
    const initialPagination = {
      current: 1,
      pageSize: 10,
      total: initialListData?.success ? initialListData.totalRecords || 0 : 0,
    };
    const initialExpenseNumber =
      initialExpenseNumberData?.success && typeof initialExpenseNumberData.data === 'string'
        ? initialExpenseNumberData.data
        : '';
    const initialErrorMessage = [
      initialListData?.success ? '' : initialListData?.message || 'Failed to load expenses.',
      initialExpenseNumberData?.success
        ? ''
        : initialExpenseNumberData?.message || 'Failed to load expense number.',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <ExpenseListIndex
        initialExpenses={initialExpenses}
        initialPagination={initialPagination}
        initialExpenseNumber={initialExpenseNumber}
        initialErrorMessage={initialErrorMessage}
      />
    );
  } catch (error) {
    console.error('Error loading expense list data:', error);
    return <div className="text-red-600 p-8">Failed to load expense list.</div>;
  }
}

export default ExpenseListPage;

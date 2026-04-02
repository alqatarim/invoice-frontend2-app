import React from 'react';
import { getExpenseNumber, getExpensesList } from '../actions';
import ExpenseListIndex from '@/views/expenses/listExpense/index';

export const metadata = {
  title: 'Expense List | Kanakku',
};

async function ExpenseListPage() {
  let initialExpenses = [];
  let initialPagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };
  let initialExpenseNumber = '';
  let initialErrorMessage = '';

  try {
    const [initialListData, initialExpenseNumberData] = await Promise.all([
      getExpensesList(),
      getExpenseNumber(),
    ]);

    initialExpenses = initialListData?.success ? initialListData.data || [] : [];
    initialPagination = {
      current: 1,
      pageSize: 10,
      total: initialListData?.success ? initialListData.totalRecords || 0 : 0,
    };
    initialExpenseNumber =
      initialExpenseNumberData?.success && typeof initialExpenseNumberData.data === 'string'
        ? initialExpenseNumberData.data
        : '';
    initialErrorMessage = [
      initialListData?.success ? '' : initialListData?.message || 'Failed to load expenses.',
      initialExpenseNumberData?.success
        ? ''
        : initialExpenseNumberData?.message || 'Failed to load expense number.',
    ]
      .filter(Boolean)
      .join(' ');

  } catch (error) {
    console.error('Error loading expense list data:', error);
    initialErrorMessage = error?.message || 'Failed to load expense list.';
  }

  return (
    <ExpenseListIndex
      initialExpenses={initialExpenses}
      initialPagination={initialPagination}
      initialExpenseNumber={initialExpenseNumber}
      initialErrorMessage={initialErrorMessage}
    />
  );
}

export default ExpenseListPage;

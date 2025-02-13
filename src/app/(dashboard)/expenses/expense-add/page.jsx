import React from 'react';
import AddExpenseIndex from '@/views/expenses/addExpense/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getExpenseNumber } from '@/app/(dashboard)/expenses/actions';
export const metadata = {
  title: 'Add Expense',
  description: 'Add a new expense'
};

const AddExpensePage = async () => {


    try {

        const expenseNumber = await getExpenseNumber();

        return (
            <ProtectedComponent>
                <AddExpenseIndex expenseNumber={expenseNumber.data} />
            </ProtectedComponent>
        );
    } catch (error) {
        console.error('Error fetching expense number:', error);
    }
};

export default AddExpensePage;

import React from 'react';
import ViewExpenseIndex from '@/views/expenses/viewExpense/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getExpenseDetails } from '@/app/(dashboard)/expenses/actions';

export const metadata = {
  title: 'View Expense',
  description: 'View expense details'
};

const ViewExpensePage = async ({ params }) => {

    try {

        const initialExpenseData = await getExpenseDetails(params.id);

        return (
            <ProtectedComponent>
                <ViewExpenseIndex expenseId={params.id} initialExpenseData={initialExpenseData} />
            </ProtectedComponent>
        );
    } catch (error) {
        console.error('Error fetching expense details:', error);
        return (
            <div>Error: {error.message}</div>
        );
    }

};

export default ViewExpensePage;

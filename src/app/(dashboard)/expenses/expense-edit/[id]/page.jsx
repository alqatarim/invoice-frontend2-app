import React from 'react';
import EditExpenseIndex from '@/views/expenses/editExpense/index';
import ProtectedComponent from '@/components/ProtectedComponent';
import { getExpenseDetails } from '@/app/(dashboard)/expenses/actions';

// Add this to prevent caching
export const dynamic = 'force-dynamic';
// Or alternatively, use the revalidate option
// export const revalidate = 0;

export const metadata = {
  title: 'Edit Expense',
  description: 'Edit expense details'
};

const EditExpensePage = async ({ params }) => {
  // Fetch expense details on the server side

  try {
    const initialExpenseData = await getExpenseDetails(params.id);
    return (
      <ProtectedComponent>
        <EditExpenseIndex
          expenseId={params.id}
        initialExpenseData={initialExpenseData}
      />
    </ProtectedComponent>
  );
  } catch (error) {
    console.error('Error fetching expense details:', error);
    return (
      <div>Error: {error.message}</div>
    );
  }
};

export default EditExpensePage;

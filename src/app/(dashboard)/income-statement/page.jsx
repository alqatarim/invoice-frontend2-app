import React from 'react';

import IncomeStatementView from '@/views/accounting/IncomeStatementView';
import { getIncomeStatement } from '@/app/(dashboard)/accounting/actions';

const IncomeStatementPage = async ({ searchParams }) => {
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';
  const branchId = searchParams?.branchId || '';
  const report = await getIncomeStatement({ startDate, endDate, branchId });

  return (
    <IncomeStatementView
      initialReport={report}
      initialFilters={{ startDate, endDate, branchId }}
    />
  );
};

export default IncomeStatementPage;

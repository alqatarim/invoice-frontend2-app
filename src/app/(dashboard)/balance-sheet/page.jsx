import React from 'react';

import BalanceSheetView from '@/views/accounting/BalanceSheetView';
import { getBalanceSheet } from '@/app/(dashboard)/accounting/actions';

const BalanceSheetPage = async ({ searchParams }) => {
  const asOfDate = searchParams?.asOfDate || searchParams?.endDate || '';
  const branchId = searchParams?.branchId || '';
  const report = await getBalanceSheet({ asOfDate, branchId });

  return (
    <BalanceSheetView
      initialReport={report}
      initialFilters={{ asOfDate, branchId }}
    />
  );
};

export default BalanceSheetPage;

import React from 'react';

import ChartOfAccountsView from '@/views/accounting/ChartOfAccountsView';
import {
  getAccountingSettings,
  getChartOfAccounts,
  getInventoryCostingSummary,
} from '@/app/(dashboard)/accounting/actions';

const ChartOfAccountsPage = async () => {
  const [coaData, settingsData, inventorySummary] = await Promise.all([
    getChartOfAccounts(),
    getAccountingSettings(),
    getInventoryCostingSummary(),
  ]);

  return (
    <ChartOfAccountsView
      initialAccounts={coaData?.accounts || []}
      initialSettings={settingsData}
      initialInventorySummary={inventorySummary || []}
    />
  );
};

export default ChartOfAccountsPage;

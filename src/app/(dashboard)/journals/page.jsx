import React from 'react';

import ManualEntriesView from '@/views/accounting/ManualEntriesView';
import { getAccountDropdown, getManualJournals } from '@/app/(dashboard)/accounting/actions';

const JournalsPage = async () => {
  const [journalData, accountOptions] = await Promise.all([
    getManualJournals(),
    getAccountDropdown(),
  ]);

  return (
    <ManualEntriesView
      type='journal'
      initialEntries={journalData?.entries || []}
      initialPagination={journalData?.pagination || { current: 1, pageSize: 10, total: 0 }}
      accountOptions={accountOptions || []}
    />
  );
};

export default JournalsPage;

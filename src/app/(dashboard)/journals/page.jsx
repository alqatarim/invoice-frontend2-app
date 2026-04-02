import React from 'react';

import ManualEntriesIndex from '@/views/accounting/manualEntries';
import { getAccountDropdown, getManualJournals } from '@/app/(dashboard)/accounting/actions';

const JournalsPage = async () => {
  const [journalData, accountOptions] = await Promise.all([
    getManualJournals(),
    getAccountDropdown(),
  ]);

  return (
    <ManualEntriesIndex
      type='journal'
      initialEntries={journalData?.entries || []}
      initialPagination={journalData?.pagination || { current: 1, pageSize: 10, total: 0 }}
      initialAccountOptions={accountOptions || []}
    />
  );
};

export default JournalsPage;

import React from 'react';

import ManualEntriesView from '@/views/accounting/ManualEntriesView';
import { getAccountDropdown, getManualVouchers } from '@/app/(dashboard)/accounting/actions';

const VouchersPage = async () => {
  const [voucherData, accountOptions] = await Promise.all([
    getManualVouchers(),
    getAccountDropdown(),
  ]);

  return (
    <ManualEntriesView
      type='voucher'
      initialEntries={voucherData?.entries || []}
      initialPagination={voucherData?.pagination || { current: 1, pageSize: 10, total: 0 }}
      accountOptions={accountOptions || []}
    />
  );
};

export default VouchersPage;

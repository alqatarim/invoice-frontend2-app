import React from 'react';

import ManualEntriesIndex from '@/views/accounting/manualEntries';
import { getAccountDropdown, getManualVouchers } from '@/app/(dashboard)/accounting/actions';

const VouchersPage = async () => {
  const [voucherData, accountOptions] = await Promise.all([
    getManualVouchers(),
    getAccountDropdown(),
  ]);

  return (
    <ManualEntriesIndex
      type='voucher'
      initialEntries={voucherData?.entries || []}
      initialPagination={voucherData?.pagination || { current: 1, pageSize: 10, total: 0 }}
      initialAccountOptions={accountOptions || []}
    />
  );
};

export default VouchersPage;

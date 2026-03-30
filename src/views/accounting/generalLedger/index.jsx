'use client';

import React from 'react';
import { Paper } from '@mui/material';
import AppSnackbar from '@/components/shared/AppSnackbar';
import AccountingEntryDetailsDialog from '../components/AccountingEntryDetailsDialog';
import GeneralLedger from './GeneralLedger';
import { useGeneralLedgerHandler } from './handler';

const GeneralLedgerIndex = ({
  initialReport = null,
  initialAccountOptions = [],
  initialAccountId = '',
  initialStartDate = '',
  initialEndDate = '',
  initialBranchId = '',
  initialErrorMessage = '',
}) => {
  const handler = useGeneralLedgerHandler({
    initialReport,
    initialAccountId,
    initialStartDate,
    initialEndDate,
    initialBranchId,
    initialErrorMessage,
  });

  if (!handler.canView) {
    return (
      <Paper className='p-6 text-center text-error'>
        You do not have permission to view the general ledger.
      </Paper>
    );
  }

  return (
    <>
      <GeneralLedger
        accountOptions={initialAccountOptions}
        accountId={handler.accountId}
        startDate={handler.startDate}
        endDate={handler.endDate}
        branchId={handler.branchId}
        report={handler.report}
        loading={handler.loading}
        storeBranches={handler.storeBranches}
        hasStoreScope={handler.hasStoreScope}
        isRestrictedToAssignedStores={handler.isRestrictedToAssignedStores}
        selectedStore={handler.selectedStore}
        storeScopeHelperText={handler.storeScopeHelperText}
        onAccountChange={handler.setAccountId}
        onStartDateChange={handler.setStartDate}
        onEndDateChange={handler.setEndDate}
        onBranchChange={handler.setBranchId}
        onRefresh={handler.handleLoadLedger}
        onOpenEntry={handler.handleOpenEntry}
      />

      <AccountingEntryDetailsDialog
        open={Boolean(handler.selectedEntry)}
        onClose={handler.closeEntryDialog}
        entry={handler.selectedEntry}
      />

      <AppSnackbar
        open={handler.snackbar.open}
        message={handler.snackbar.message}
        severity={handler.snackbar.severity}
        onClose={handler.closeSnackbar}
      />
    </>
  );
};

export default GeneralLedgerIndex;

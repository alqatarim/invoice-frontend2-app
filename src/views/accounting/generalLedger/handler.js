'use client';

import { useMemo, useState } from 'react';
import { usePermission } from '@/Auth/usePermission';
import useAccessibleStoreScope from '@/hooks/useAccessibleStoreScope';
import { findBranchByIdentifier } from '@/utils/branchAccess';
import {
  getGeneralLedger,
  getJournalEntryById,
} from '@/app/(dashboard)/accounting/actions';

export function useGeneralLedgerHandler({
  initialReport = null,
  initialAccountId = '',
  initialStartDate = '',
  initialEndDate = '',
  initialBranchId = '',
  initialErrorMessage = '',
}) {
  const canView = usePermission('generalLedgerReport', 'view');
  const {
    storeBranches,
    primaryStore,
    hasStoreScope,
    isRestrictedToAssignedStores,
  } = useAccessibleStoreScope();

  const [accountId, setAccountId] = useState(initialAccountId || '');
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');
  const [branchId, setBranchId] = useState(initialBranchId || '');
  const [report, setReport] = useState(initialReport);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: 'error',
  });

  const selectedStore = useMemo(
    () => findBranchByIdentifier(storeBranches, branchId),
    [branchId, storeBranches]
  );



  const handleLoadLedger = async () => {
    if (!accountId) {
      setSnackbar({
        open: true,
        message: 'Please choose an account first.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const nextReport = await getGeneralLedger({
        accountId,
        startDate,
        endDate,
        branchId,
      });

      setReport(nextReport);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.message || 'Failed to load general ledger.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAccountId('');
    setStartDate('');
    setEndDate('');
    setBranchId('');
    setReport(null);
  };

  const handleOpenEntry = async (row) => {
    if (!row?.entryId) return;

    try {
      const entry = await getJournalEntryById(row.entryId);
      setSelectedEntry(entry);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.message || 'Failed to load entry details.',
        severity: 'error',
      });
    }
  };

  const closeEntryDialog = () => {
    setSelectedEntry(null);
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return {
    canView,
    accountId,
    startDate,
    endDate,
    branchId,
    report,
    selectedEntry,
    loading,
    snackbar,
    storeBranches,
    hasStoreScope,
    isRestrictedToAssignedStores,
    selectedStore,
    setAccountId,
    setStartDate,
    setEndDate,
    setBranchId,
    handleLoadLedger,
    handleReset,
    handleOpenEntry,
    closeEntryDialog,
    closeSnackbar,
  };
}

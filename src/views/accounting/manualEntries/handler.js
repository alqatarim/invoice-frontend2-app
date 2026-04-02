'use client';

import { useState } from 'react';
import { usePermission } from '@/Auth/usePermission';
import {
  createManualJournal,
  createManualVoucher,
  getManualJournals,
  getManualVouchers,
  reverseJournalEntry,
} from '@/app/(dashboard)/accounting/actions';

export function useManualEntriesHandler({
  type = 'journal',
  initialEntries = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialErrorMessage = '',
}) {
  const permissionModule = type === 'voucher' ? 'voucher' : 'journalEntry';
  const canView = usePermission(permissionModule, 'view');
  const canCreate = usePermission(permissionModule, 'create');
  const canUpdate = usePermission(permissionModule, 'update');

  const [entries, setEntries] = useState(initialEntries);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsEntry, setDetailsEntry] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: Boolean(initialErrorMessage),
    message: initialErrorMessage || '',
    severity: initialErrorMessage ? 'error' : 'success',
  });

  const fetchEntries = async ({
    page = pagination.current,
    pageSize = pagination.pageSize,
    search = '',
  } = {}) => {
    setLoading(true);
    try {
      const response =
        type === 'voucher'
          ? await getManualVouchers({ page, pageSize, search })
          : await getManualJournals({ page, pageSize, search });

      setEntries(response?.entries || []);
      setPagination(
        response?.pagination || {
          current: page,
          pageSize,
          total: response?.entries?.length || 0,
        }
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load entries.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (payload) => {
    setLoading(true);
    try {
      if (type === 'voucher') {
        await createManualVoucher(payload);
      } else {
        await createManualJournal(payload);
      }

      setSnackbar({
        open: true,
        message:
          type === 'voucher'
            ? 'Voucher created successfully.'
            : 'Journal entry created successfully.',
        severity: 'success',
      });
      setDialogOpen(false);
      await fetchEntries({ page: 1 });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save entry.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReverse = async (entry) => {
    setLoading(true);
    try {
      await reverseJournalEntry(entry._id);
      setSnackbar({
        open: true,
        message: 'Entry reversed successfully.',
        severity: 'success',
      });
      await fetchEntries();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to reverse entry.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return {
    type,
    canView,
    canCreate,
    canUpdate,
    entries,
    pagination,
    loading,
    dialogOpen,
    detailsEntry,
    snackbar,
    fetchEntries,
    handleCreate,
    handleReverse,
    setDialogOpen,
    setDetailsEntry,
    closeSnackbar,
  };
}

'use client';

import React, { useMemo, useState } from 'react';
import { Button, Chip, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

import { usePermission } from '@/Auth/usePermission';
import CustomListTable from '@/components/custom-components/CustomListTable';
import AppSnackbar from '@/components/shared/AppSnackbar';
import {
  createManualJournal,
  createManualVoucher,
  getManualJournals,
  getManualVouchers,
  reverseJournalEntry,
} from '@/app/(dashboard)/accounting/actions';
import AccountingPageHeader from './components/AccountingPageHeader';
import AccountingEntryDetailsDialog from './components/AccountingEntryDetailsDialog';
import JournalEntryFormDialog from './components/JournalEntryFormDialog';
import { formatCurrency, formatDate } from './utils';

const ManualEntriesView = ({
  type = 'journal',
  initialEntries = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  accountOptions = [],
}) => {
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
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchEntries = async ({ page = pagination.current, pageSize = pagination.pageSize, search = '' } = {}) => {
    setLoading(true);
    try {
      const response = type === 'voucher'
        ? await getManualVouchers({ page, pageSize, search })
        : await getManualJournals({ page, pageSize, search });

      setEntries(response?.entries || []);
      setPagination(response?.pagination || {
        current: page,
        pageSize,
        total: response?.entries?.length || 0,
      });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to load entries.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async payload => {
    setLoading(true);
    try {
      if (type === 'voucher') {
        await createManualVoucher(payload);
      } else {
        await createManualJournal(payload);
      }

      setSnackbar({
        open: true,
        message: type === 'voucher' ? 'Voucher created successfully.' : 'Journal entry created successfully.',
        severity: 'success',
      });
      setDialogOpen(false);
      await fetchEntries({ page: 1 });
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to save entry.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReverse = async entry => {
    setLoading(true);
    try {
      await reverseJournalEntry(entry._id);
      setSnackbar({ open: true, message: 'Entry reversed successfully.', severity: 'success' });
      await fetchEntries();
    } catch (error) {
      setSnackbar({ open: true, message: error.message || 'Failed to reverse entry.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'entryNumber',
      label: 'Entry No',
    },
    {
      key: 'entryDate',
      label: 'Date',
      renderCell: row => formatDate(row.entryDate),
    },
    {
      key: 'narration',
      label: 'Narration',
    },
    {
      key: 'totalDebit',
      label: 'Debit',
      align: 'right',
      renderCell: row => formatCurrency(row.totalDebit),
    },
    {
      key: 'totalCredit',
      label: 'Credit',
      align: 'right',
      renderCell: row => formatCurrency(row.totalCredit),
    },
    {
      key: 'status',
      label: 'Status',
      renderCell: row => (
        <Chip
          size='small'
          color={row.status === 'POSTED' ? 'success' : row.status === 'REVERSED' ? 'default' : 'warning'}
          label={row.status}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      renderCell: row => (
        canUpdate && row.status === 'POSTED' ? (
          <IconButton
            onClick={event => {
              event.stopPropagation();
              handleReverse(row);
            }}
          >
            <Icon icon='tabler:rotate-clockwise-2' />
          </IconButton>
        ) : null
      ),
    },
  ], [canUpdate]);

  if (!canView) {
    return <div>You do not have permission to view this module.</div>;
  }

  return (
    <div className='flex flex-col gap-5'>
      <AccountingPageHeader
        icon={type === 'voucher' ? 'tabler:file-dollar' : 'tabler:book-2'}
        title={type === 'voucher' ? 'Vouchers' : 'Journals'}
        description={type === 'voucher'
          ? 'Create manual vouchers and review posted voucher history.'
          : 'Create manual journals and review posted journal history.'}
      />

      <CustomListTable
        title={type === 'voucher' ? 'Voucher List' : 'Journal List'}
        columns={columns}
        rows={entries}
        rowKey={row => row._id}
        showSearch
        onSearchChange={value => fetchEntries({ search: value, page: 1 })}
        searchPlaceholder={type === 'voucher' ? 'Search vouchers...' : 'Search journals...'}
        addRowButton={canCreate ? (
          <Button
            variant='contained'
            startIcon={<Icon icon='tabler:plus' />}
            onClick={() => setDialogOpen(true)}
          >
            {type === 'voucher' ? 'New Voucher' : 'New Journal'}
          </Button>
        ) : null}
        loading={loading}
        noDataText={type === 'voucher' ? 'No vouchers found.' : 'No journals found.'}
        pagination={{
          page: Math.max(0, (pagination.current || 1) - 1),
          pageSize: pagination.pageSize || 10,
          total: pagination.total || 0,
        }}
        onPageChange={nextPage => fetchEntries({ page: nextPage + 1, pageSize: pagination.pageSize || 10 })}
        onRowsPerPageChange={nextPageSize => fetchEntries({ page: 1, pageSize: nextPageSize })}
        onRowClick={row => setDetailsEntry(row)}
      />

      <JournalEntryFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreate}
        accounts={accountOptions}
        type={type}
        loading={loading}
      />

      <AccountingEntryDetailsDialog
        open={Boolean(detailsEntry)}
        onClose={() => setDetailsEntry(null)}
        entry={detailsEntry}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ManualEntriesView;

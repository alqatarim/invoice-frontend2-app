'use client';

import React, { useMemo, useState } from 'react';
import { Button, Chip, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

import { usePermission } from '@/Auth/usePermission';
import CustomListTable from '@/components/custom-components/CustomListTable';
import AppSnackbar from '@/components/shared/AppSnackbar';
import {
  createAccount,
  getChartOfAccounts,
  getInventoryCostingSummary,
  runAccountingBackfill,
  updateAccount,
} from '@/app/(dashboard)/accounting/actions';
import AccountingPageHeader from './components/AccountingPageHeader';
import AccountFormDialog from './components/AccountFormDialog';
import { formatDate } from './utils';

const ChartOfAccountsView = ({
  initialAccounts = [],
  initialSettings = null,
  initialInventorySummary = [],
}) => {
  const canView = usePermission('chartOfAccounts', 'view');
  const canCreate = usePermission('chartOfAccounts', 'create');
  const canUpdate = usePermission('chartOfAccounts', 'update');
  const canRunBackfill = usePermission('accountingSettings', 'update');

  const [accounts, setAccounts] = useState(initialAccounts);
  const [inventorySummary, setInventorySummary] = useState(initialInventorySummary);
  const [settings, setSettings] = useState(initialSettings);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const pushSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const refreshData = async search => {
    const [coaResponse, costingResponse] = await Promise.all([
      getChartOfAccounts(search),
      getInventoryCostingSummary(),
    ]);

    setAccounts(coaResponse?.accounts || []);
    setInventorySummary(costingResponse || []);
  };

  const handleAccountSubmit = async payload => {
    setLoading(true);
    try {
      if (editingAccount?._id) {
        await updateAccount(editingAccount._id, payload);
        pushSnackbar('Account updated successfully.');
      } else {
        await createAccount(payload);
        pushSnackbar('Account created successfully.');
      }

      await refreshData();
      setDialogOpen(false);
      setEditingAccount(null);
    } catch (error) {
      pushSnackbar(error.message || 'Failed to save account.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunBackfill = async () => {
    setLoading(true);
    try {
      const result = await runAccountingBackfill();
      pushSnackbar(result?.message || 'Backfill completed successfully.');
      setSettings(prev => ({
        ...(prev || {}),
        settings: {
          ...(prev?.settings || {}),
          lastBackfillAt: new Date().toISOString(),
        },
      }));
      await refreshData();
    } catch (error) {
      pushSnackbar(error.message || 'Backfill failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
    return [
      {
        key: 'code',
        label: 'Code',
        renderCell: row => row.code,
      },
      {
        key: 'name',
        label: 'Account',
        renderCell: row => (
          <div style={{ paddingLeft: `${(row.level || 0) * 16}px` }}>
            {row.name}
          </div>
        ),
      },
      {
        key: 'accountType',
        label: 'Type',
      },
      {
        key: 'normalBalance',
        label: 'Normal',
      },
      {
        key: 'allowPosting',
        label: 'Posting',
        renderCell: row => (
          <Chip
            size='small'
            color={row.allowPosting ? 'success' : 'default'}
            label={row.allowPosting ? 'Allowed' : 'Header'}
          />
        ),
      },
      {
        key: 'isSystem',
        label: 'Scope',
        renderCell: row => (
          <Chip
            size='small'
            color={row.isSystem ? 'info' : 'primary'}
            label={row.isSystem ? 'System' : 'Custom'}
          />
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'right',
        renderCell: row => (
          canUpdate ? (
            <IconButton
              onClick={event => {
                event.stopPropagation();
                setEditingAccount(row);
                setDialogOpen(true);
              }}
            >
              <Icon icon='tabler:edit' />
            </IconButton>
          ) : null
        ),
      },
    ];
  }, [canUpdate]);

  if (!canView) {
    return <div>You do not have permission to view the chart of accounts.</div>;
  }

  return (
    <div className='flex flex-col gap-5'>
      <AccountingPageHeader
        icon='tabler:hierarchy-2'
        title='Chart Of Accounts'
        description='Manage the account tree, default ledger structure, and historical accounting backfill.'
      />

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='rounded border p-4'>
          <div className='text-sm text-textSecondary'>Total Accounts</div>
          <div className='text-2xl font-semibold'>{accounts.length}</div>
        </div>
        <div className='rounded border p-4'>
          <div className='text-sm text-textSecondary'>Inventory Costing Rows</div>
          <div className='text-2xl font-semibold'>{inventorySummary.length}</div>
        </div>
        <div className='rounded border p-4'>
          <div className='text-sm text-textSecondary'>Last Historical Backfill</div>
          <div className='text-base font-medium'>
            {formatDate(settings?.settings?.lastBackfillAt || settings?.lastBackfillAt)}
          </div>
        </div>
      </div>

      <CustomListTable
        title='Accounts'
        columns={columns}
        rows={accounts}
        rowKey={row => row._id}
        showSearch
        onSearchChange={value => {
          refreshData(value).catch(error => pushSnackbar(error.message || 'Failed to search accounts.', 'error'));
        }}
        searchPlaceholder='Search accounts...'
        addRowButton={canCreate ? (
          <Button
            variant='contained'
            startIcon={<Icon icon='tabler:plus' />}
            onClick={() => {
              setEditingAccount(null);
              setDialogOpen(true);
            }}
          >
            New Account
          </Button>
        ) : null}
        headerActions={canRunBackfill ? (
          <Button
            variant='outlined'
            startIcon={<Icon icon='tabler:history' />}
            onClick={handleRunBackfill}
            disabled={loading}
          >
            Replay Historical Data
          </Button>
        ) : null}
        noDataText='No accounts found.'
        pagination={{ page: 0, pageSize: accounts.length || 10, total: accounts.length }}
      />

      <AccountFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingAccount(null);
        }}
        onSubmit={handleAccountSubmit}
        account={editingAccount}
        parentOptions={accounts}
        loading={loading}
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

export default ChartOfAccountsView;

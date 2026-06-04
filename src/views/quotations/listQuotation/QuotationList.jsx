'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import CustomListTable from '@/components/custom-components/CustomListTable';
import QuotationHead from './QuotationHead';
import { useQuotationListHandler } from './handler';

const QuotationList = ({
  initialQuotations = [],
  initialPagination = { current: 1, pageSize: 10, total: 0 },
  initialSummary = {},
  initialErrorMessage = '',
}) => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (initialErrorMessage) {
      enqueueSnackbar(initialErrorMessage, { variant: 'error' });
    }
  }, [enqueueSnackbar, initialErrorMessage]);

  const onError = React.useCallback(
    msg => {
      enqueueSnackbar(msg, { variant: 'error' });
    },
    [enqueueSnackbar]
  );

  const onSuccess = React.useCallback(
    msg => {
      enqueueSnackbar(msg, { variant: 'success' });
    },
    [enqueueSnackbar]
  );

  const handlers = useQuotationListHandler({
    initialQuotations,
    initialPagination,
    initialSummary,
    onError,
    onSuccess,
  });

  return (
    <div className="flex flex-col gap-5">
      <QuotationHead summary={handlers.summary} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              handlers.permissions.canCreate && (
                <Button
                  component={Link}
                  href="/quotations/quotation-add"
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Quotation
                </Button>
              )
            }
            columns={handlers.tableColumns}
            rows={handlers.quotations}
            loading={handlers.loading}
            pagination={handlers.tablePagination}
            onPageChange={handlers.handlePageChange}
            onRowsPerPageChange={handlers.handlePageSizeChange}
            noDataText="No quotations found"
            rowKey={row => row._id || row.id}
            showSearch
            searchValue={handlers.searchTerm}
            onSearchChange={handlers.handleSearchInputChange}
            searchPlaceholder="Search quotations..."
            onRowClick={
              handlers.permissions.canView
                ? row => handlers.handleView(row._id)
                : undefined
            }
            enableHover
          />
        </Grid>
      </Grid>

      <Dialog open={handlers.deleteDialogOpen} onClose={handlers.handleDeleteCancel}>
        <DialogTitle>Delete Quotation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete quotation{' '}
            {handlers.selectedQuotation?.quotation_id || ''}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.handleDeleteCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handlers.handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={handlers.convertDialogOpen} onClose={handlers.closeConvertDialog}>
        <DialogTitle>Convert to Invoice</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Create an invoice from quotation{' '}
            {handlers.selectedQuotation?.quotation_id || ''}?
          </DialogContentText>

          {(() => {
            const dueDate = handlers.selectedQuotation?.due_date;
            if (!dueDate) return null;

            const daysUntilExpiry = Math.ceil(
              (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            if (daysUntilExpiry > 3 || daysUntilExpiry < 0) return null;

            return (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </Alert>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.closeConvertDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handlers.confirmConvertToInvoice} color="primary" variant="contained">
            Convert
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QuotationList;

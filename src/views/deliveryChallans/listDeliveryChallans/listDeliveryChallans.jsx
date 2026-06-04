'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@mui/material';
import { Icon } from '@iconify/react';
import CustomListTable from '@/components/custom-components/CustomListTable';
import DeliveryChallanHead from './DeliveryChallanHead';

const ListDeliveryChallans = ({
  deliveryChallans = [],
  pagination = { current: 1, pageSize: 10, total: 0 },
  loading = false,
  loadingAction = false,
  permissions,
  searchTerm = '',
  summary = {},
  tableColumns = [],
  deleteDialogOpen = false,
  convertDialogOpen = false,
  selectedDeliveryChallan = null,
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onDeleteCancel,
  onDeleteConfirm,
  onConvertDialogClose,
  onConvertConfirm,
}) => {
  const tablePagination = useMemo(
    () => ({
      page: Math.max(0, pagination.current - 1),
      pageSize: pagination.pageSize,
      total: pagination.total,
    }),
    [pagination.current, pagination.pageSize, pagination.total]
  );

  return (
    <div className="flex flex-col gap-5">
      <DeliveryChallanHead summary={summary} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              permissions?.canCreate && (
                <Button
                  component={Link}
                  href="/deliveryChallans/deliveryChallans-add"
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Delivery Challan
                </Button>
              )
            }
            columns={tableColumns}
            rows={deliveryChallans}
            loading={loading}
            pagination={tablePagination}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            noDataText="No delivery challans found"
            rowKey={(row) => row._id || row.id}
            showSearch
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search delivery challans..."
            onRowClick={permissions?.canView ? (row) => onView(row._id) : undefined}
            enableHover
          />
        </Grid>
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={onDeleteCancel}>
        <DialogTitle>Delete Delivery Challan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            <strong>
              {selectedDeliveryChallan?.deliveryChallanNumber || 'this delivery challan'}
            </strong>
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDeleteCancel} color="secondary" disabled={loadingAction}>
            Cancel
          </Button>
          <Button
            onClick={onDeleteConfirm}
            color="error"
            variant="contained"
            disabled={loadingAction}
            startIcon={<Icon icon="tabler:trash" />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={convertDialogOpen} onClose={onConvertDialogClose}>
        <DialogTitle>Convert to Invoice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to convert{' '}
            <strong>{selectedDeliveryChallan?.deliveryChallanNumber || 'this delivery challan'}</strong>{' '}
            to an invoice? This will create a new invoice with the same details.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onConvertDialogClose} color="secondary" disabled={loadingAction}>
            Cancel
          </Button>
          <Button
            onClick={onConvertConfirm}
            variant="contained"
            disabled={loadingAction}
            startIcon={<Icon icon="tabler:arrow-right" />}
          >
            Convert
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListDeliveryChallans;

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Card,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Grid,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';

import PurchaseHead from '@/views/purchases/listPurchase/purchaseHead';
import PurchaseFilter from '@/views/purchases/listPurchase/PurchaseFilter';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { formatCurrency } from '@/utils/currencyUtils';
import { usePurchaseListHandlers } from '@/handlers/purchases/list/usePurchaseListHandlers';

/**
 * PurchaseList Component - matches invoice list UI/UX
 */
const PurchaseListNew = ({
  purchaseList = [],
  totalCount = 0,
  page = 1,
  setPage,
  pageSize = 10,
  setPageSize,
  loading = false,
  setFilterCriteria,
  vendors = [],
  resetAllFilters,
  onListUpdate
}) => {
  const theme = useTheme();
  const router = useRouter();

  // Permissions - get from handlers now
  const canCreate = usePermission('purchase', 'create');

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    purchase: null,
  });

  // Initialize handlers
  const handlers = usePurchaseListHandlers({ 
    setPage, 
    onListUpdate 
  });

  // Enhanced delete handler with dialog
  const handleDeleteClick = useCallback((purchaseId) => {
    const purchase = purchaseList.find(item => item._id === purchaseId);
    setDeleteDialog({ open: true, purchase });
  }, [purchaseList]);

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (deleteDialog.purchase) {
      await handlers.handleDelete(deleteDialog.purchase._id);
      setDeleteDialog({ open: false, purchase: null });
    }
  };

  // Table columns with enhanced handlers
  const tableColumns = useMemo(() =>
    handlers.columnsState
      .filter(col => col.visible)
      .map(col => ({
        ...col,
        renderCell: col.renderCell ?
          (row) => col.renderCell(row, {
            ...handlers,
            handleDelete: handleDeleteClick,
            permissions: handlers.permissions,
          }) : undefined
      })),
    [handlers.columnsState, handlers.permissions.canView, handlers.permissions.canCreate, handlers.permissions.canUpdate, handlers.permissions.canDelete, handleDeleteClick]
  );

  // Table pagination handlers
  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div className='flex flex-col gap-5'>
      {/* Header with statistics */}
      <PurchaseHead purchaseListData={purchaseList} />

      <Grid container spacing={3}>
        {/* Add Purchase button */}
        {canCreate && (
          <Grid item xs={12}>
            <div className="flex justify-end">
              <Button
                component={Link}
                href="/purchases/purchase-add"
                variant="contained"
                startIcon={<Icon icon="tabler:plus" />}
              >
                New Purchase
              </Button>
            </div>
          </Grid>
        )}

        {/* Filter Component */}
        <Grid item xs={12}>
          <PurchaseFilter
            setFilterCriteria={setFilterCriteria}
            vendors={vendors}
            resetAllFilters={resetAllFilters}
            values={{}}
            onManageColumns={handlers.handleManageColumnsOpen}
          />
        </Grid>

        {/* Purchase Table */}
        <Grid item xs={12}>
          <Card>
            <CustomListTable
              columns={tableColumns}
              rows={purchaseList}
              loading={loading}
              pagination={{
                page: page - 1,
                pageSize,
                total: totalCount,
              }}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handlePageSizeChange}
              noDataText="No purchases found"
              rowKey={(row) => row._id || row.id}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Manage Columns Dialog */}
      <Dialog open={handlers.manageColumnsOpen} onClose={handlers.handleManageColumnsClose}>
        <DialogTitle>Select Columns</DialogTitle>
        <DialogContent>
          <FormGroup>
            {handlers.availableColumns.map((column) => (
              <FormControlLabel
                key={column.key}
                control={
                  <Checkbox
                    checked={column.visible}
                    onChange={(e) => handlers.handleColumnCheckboxChange(column.key, e.target.checked)}
                  />
                }
                label={column.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.handleManageColumnsClose}>Cancel</Button>
          <Button 
            onClick={() => handlers.handleManageColumnsSave(handlers.setColumnsState)} 
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, purchase: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete purchase "{deleteDialog.purchase?.purchaseId}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, purchase: null })}
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PurchaseListNew;
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePermission } from '@/Auth/usePermission';
import CustomListTable from '@/components/custom-components/CustomListTable';
import { useSalesReturnListHandlers } from '@/handlers/salesReturn/list/useSalesReturnListHandlers';
import SalesReturnFilter from './SalesReturnFilter';
import { toast } from 'react-toastify';

/**
 * Enhanced Sales Return List Component with column management
 */
const SalesReturnListNew = ({
  salesReturnList,
  totalCount,
  page,
  setPage,
  pageSize,
  setPageSize,
  loading,
  setFilterCriteria,
  customers,
  resetAllFilters,
  onListUpdate
}) => {
  const theme = useTheme();

  // Permissions
  const canUpdate = usePermission('creditNote', 'update');
  const canDelete = usePermission('creditNote', 'delete');
  const isAdmin = usePermission('creditNote', 'isAdmin');

  // Filter dialog state
  const [openFilter, setOpenFilter] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

  // Initialize handlers
  const handlers = useSalesReturnListHandlers({
    setPage,
    onListUpdate
  });

  // Enhanced delete handler with dialog
  const handleDeleteClick = (salesReturnId) => {
    const salesReturn = salesReturnList.find(item => item._id === salesReturnId);
    setDeleteDialog({ open: true, item: salesReturn });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.item) {
      await handlers.handleDelete(deleteDialog.item._id);
      setDeleteDialog({ open: false, item: null });
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
    [handlers.columnsState, handlers, salesReturnList]
  );

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(1);
  };

  // Filter handlers
  const handleReset = () => {
    resetAllFilters();
    setOpenFilter(false);
  };

  const handleFilterApply = (criteria) => {
    setFilterCriteria(criteria);
    setOpenFilter(false);
  };

  return (
    <div className='flex flex-col gap-5'>
      {/* Header */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box className="flex justify-between items-center">
            <Typography variant="h5" color="primary">
              Sales Returns
            </Typography>
            <Box className="flex gap-2">
              <Button
                variant="text"
                color="secondary"
                startIcon={<Icon icon="tabler:refresh" />}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                startIcon={<Icon icon="tabler:filter" />}
                onClick={() => setOpenFilter(true)}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<Icon icon="tabler:columns" />}
                onClick={handlers.handleManageColumnsOpen}
              >
                Columns
              </Button>
              {(canUpdate || isAdmin) && (
                <Button
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                  component={Link}
                  href="/sales-return/sales-return-add"
                >
                  Add Sales Return
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Sales Return Table */}
        <Grid item xs={12}>
          <Card>
            <CustomListTable
              columns={tableColumns}
              rows={salesReturnList}
              loading={loading}
              pagination={{
                page: Math.max(0, (page || 1) - 1),
                pageSize: pageSize || 10,
                total: totalCount || 0
              }}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handlePageSizeChange}
              noDataText="No sales returns found."
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete sales return "{deleteDialog.item?.credit_note_id}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, item: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <SalesReturnFilter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onFilter={handleFilterApply}
        customers={customers}
      />
    </div>
  );
};

export default SalesReturnListNew;
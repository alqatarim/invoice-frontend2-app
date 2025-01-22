'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Snackbar,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { deletePurchase } from '@/app/(dashboard)/purchases/actions';
import { usePermission } from '@/hooks/usePermission';
import PurchaseFilter from './PurchaseFilter';
import dayjs from 'dayjs';

const PurchaseList = ({
  purchaseList,
  totalCount,
  page,
  setPage,
  pageSize,
  setPageSize,
  loading,
  setFilterCriteria,
  vendors,
  resetAllFilters
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const canUpdate = usePermission('purchase', 'update');
  const canDelete = usePermission('purchase', 'delete');
  const isAdmin = usePermission('purchase', 'isAdmin');

  // Define default columns
  const defaultColumns = [
    { key: 'index', label: '#', visible: true },
    { key: 'purchaseId', label: 'Purchase ID', visible: true },
    { key: 'vendor', label: 'Vendor', visible: true },
    { key: 'amount', label: 'Amount', visible: true },
    { key: 'paymentMode', label: 'Payment Mode', visible: true },
    { key: 'date', label: 'Date', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'action', label: 'Actions', visible: true }
  ];

  const [columns, setColumns] = useState(defaultColumns);

  const handleMenuOpen = (event, purchase) => {
    setAnchorEl(event.currentTarget);
    setSelectedPurchase(purchase);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPurchase(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleDelete = async () => {
    try {
      const response = await deletePurchase(selectedPurchase._id);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Purchase deleted successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Error deleting purchase',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error deleting purchase',
        severity: 'error'
      });
    }
    setOpenDeleteDialog(false);
    handleMenuClose();
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box className="flex flex-col gap-4 p-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h5" color="primary">
          Purchases
        </Typography>
        <Box className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setOpenFilter(true)}
          >
            Filter
          </Button>
          {(canUpdate || isAdmin) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={Link}
              href="/purchases/purchase-add"
            >
              Add Purchase
            </Button>
          )}
        </Box>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(column =>
                  column.visible && (
                    <TableCell
                      key={column.key}
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',

                      }}
                    >
                      {column.label}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Show loading skeleton
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map(column =>
                      column.visible && (
                        <TableCell key={column.key}>
                          <Skeleton variant={column.key === 'vendor' ? 'rectangular' : 'text'} />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : purchaseList.length > 0 ? (
                purchaseList.map((purchase, index) => (
                  <TableRow key={purchase._id} hover>
                    {columns.map(column =>
                      column.visible && (
                        <TableCell key={column.key}>
                          {column.key === 'index' && (
                            <Typography variant="body2">
                              {(page - 1) * pageSize + (index + 1)}
                            </Typography>
                          )}

                          {column.key === 'purchaseId' && (
                            <Link
                              href={`/purchases/purchase-view/${purchase._id}`}
                              className="text-decoration-none"
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                {purchase.purchaseId}
                              </Typography>
                            </Link>
                          )}

                          {column.key === 'vendor' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Link
                                href={`/vendors/vendor-view/${purchase.vendorId?._id}`}
                                className="text-decoration-none"
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': { textDecoration: 'underline' }
                                  }}
                                >
                                  {purchase.vendorId?.vendor_name}
                                </Typography>
                              </Link>
                              <Typography variant="caption" color="textSecondary">
                                {purchase.vendorId?.vendor_phone}
                              </Typography>
                            </Box>
                          )}

                          {column.key === 'amount' && (
                            <Typography variant="body1">
                              {'$'}
                              {purchase.roundOff
                                ? Number(purchase.TotalAmount).toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })
                                : Number(purchase.taxableAmount).toLocaleString('en-IN', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                            </Typography>
                          )}

                          {column.key === 'paymentMode' && (
                            <Chip variant="outlined" color="secondary" label={purchase.paymentMode} />
                          )}

                          {column.key === 'date' && (
                            <Typography variant="body1">
                              {dayjs(purchase.purchaseDate).format('DD MMM YYYY')}
                            </Typography>
                          )}

                          {column.key === 'status' && (
                            <Chip
                              label={purchase.status}
                              variant="tonal"
                              color={
                                purchase.status === 'PAID'
                                  ? 'success'
                                  : purchase.status === 'Pending'
                                  ? 'warning'
                                  : 'error'
                              }


                            />
                          )}

                          {column.key === 'action' && (canUpdate || isAdmin) && (
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, purchase)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    <Typography variant="body2">No purchases found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        />
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {(canUpdate || isAdmin) && (
          <MenuItem
            component={Link}
            href={`/purchases/purchase-edit/${selectedPurchase?._id}`}
            onClick={handleMenuClose}
          >
            <EditIcon className="mr-2" fontSize="small" />
            Edit
          </MenuItem>
        )}
        {(canDelete || isAdmin) && (
          <MenuItem onClick={() => setOpenDeleteDialog(true)}>
            <DeleteIcon className="mr-2" fontSize="small" />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this purchase?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Drawer */}
      <PurchaseFilter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        setFilterCriteria={setFilterCriteria}
        vendors={vendors}
        resetAllFilters={resetAllFilters}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseList;
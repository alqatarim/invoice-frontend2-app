'use client';

import React, { useState, useMemo } from 'react';
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
  Skeleton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { deletePurchase } from '@/app/(dashboard)/purchases/actions';
import { usePermission } from '@/Auth/usePermission';
import PurchaseFilter from './PurchaseFilter';
import dayjs from 'dayjs';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';

// Define default columns outside component to prevent re-creation
const DEFAULT_COLUMNS = [
  { key: 'purchaseId', label: 'Purchase ID', visible: true },
  { key: 'vendor', label: 'Vendor', visible: true },
  { key: 'amount', label: 'Total Amount', visible: true },
  { key: 'paymentMode', label: 'Payment Mode', visible: true },
  { key: 'date', label: 'Date', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'action', label: 'Actions', visible: true }
];

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
  const theme = useTheme();

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

  // Memoize columns to prevent re-creation on every render
  const [columns, setColumns] = useState(() => DEFAULT_COLUMNS);

  const handleMenuOpen = (event, purchase) => {
    event.preventDefault();
    event.stopPropagation();

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
    if (!selectedPurchase || !selectedPurchase._id) {
      console.error('No selected purchase to delete.');
      return;
    }
    try {
      const response = await deletePurchase(selectedPurchase._id);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Purchase deleted successfully',
          severity: 'success'
        });
        // Optionally refresh the purchase list here
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
      </Box>

      <Box className="flex justify-end items-center">
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

      <Box className="flex justify-end items-center">
        <Box className="flex gap-2">
          <Button
            variant="text"
            color="secondary"
            onClick={resetAllFilters}
            startIcon={<Icon icon='mdi:refresh' fontSize={20} />}
            sx={{ minWidth: 100 }}
          >
            Clear Filter
          </Button>
          <Button
            variant="text"
            startIcon={<FilterIcon />}
            onClick={() => setOpenFilter(true)}
          >
            Filter
          </Button>
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
                purchaseList.map((purchase, index) => {
                  return (
                    <TableRow key={purchase._id} hover>
                      {columns.map(column =>
                        column.visible && (
                          <TableCell key={column.key}>
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
                                { Number(purchase.TotalAmount).toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })} SAR
                              </Typography>
                            )}
                            {column.key === 'paymentMode' && (
                              <Chip
                                size='medium'
                                variant="outlined"
                                color="secondary"
                                label={purchase.paymentMode}
                              />
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
                                aria-controls={Boolean(anchorEl) ? 'purchase-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  );
                })
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
        id="purchase-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {(canUpdate || isAdmin) && selectedPurchase && (
          <>
            <MenuItem
              component={Link}
              href={`/purchases/purchase-edit/${selectedPurchase._id}`}
              onClick={handleMenuClose}
              sx={{ display: 'flex', alignItems: 'center', width: '100%' }}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Edit" />
            </MenuItem>
          </>
        )}
        {(canDelete || isAdmin) && selectedPurchase && (
          <MenuItem onClick={() => setOpenDeleteDialog(true)}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
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
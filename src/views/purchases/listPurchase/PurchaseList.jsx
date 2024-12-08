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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
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
  fetchPurchaseList
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const canUpdate = usePermission('purchase', 'update');
  const canDelete = usePermission('purchase', 'delete');
  const isAdmin = usePermission('purchase', 'isAdmin');

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
        toast.success('Purchase deleted successfully');
        fetchPurchaseList();
      } else {
        toast.error(response.message || 'Error deleting purchase');
      }
    } catch (error) {
      toast.error('Error deleting purchase');
    }
    setOpenDeleteDialog(false);
    handleMenuClose();
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
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Purchase ID</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseList.map((purchase) => (
                  <TableRow key={purchase._id}>
                    <TableCell>
                      <Link
                        href={`/purchases/purchase-view/${purchase._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {purchase.purchaseId}
                      </Link>
                    </TableCell>
                    <TableCell>{purchase.vendorInfo?.vendor_name}</TableCell>
                    <TableCell>${purchase.TotalAmount}</TableCell>
                    <TableCell>{dayjs(purchase.purchaseDate).format('DD-MM-YYYY')}</TableCell>
                    <TableCell>
                      <Chip
                        label={purchase.status}
                        color={purchase.status === 'PAID' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, purchase)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
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
        onFilter={fetchPurchaseList}
      />
    </Box>
  );
};

export default PurchaseList;
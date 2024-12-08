'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  FileCopy as CloneIcon,
  Transform as ConvertIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { deletePurchaseOrder, convertToPurchase, clonePurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';
import { usePermission } from '@/hooks/usePermission';
import PurchaseOrderFilter from './PurchaseOrderFilter';
import dayjs from 'dayjs';

const PurchaseOrderList = ({
  orderList,
  totalCount,
  page,
  setPage,
  pageSize,
  setPageSize,
  loading,
  fetchOrderList
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openConvertDialog, setOpenConvertDialog] = useState(false);
  const [openCloneDialog, setOpenCloneDialog] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const canUpdate = usePermission('purchaseOrder', 'update');
  const canDelete = usePermission('purchaseOrder', 'delete');
  const isAdmin = usePermission('purchaseOrder', 'isAdmin');

  const handleMenuOpen = (event, order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
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
      const response = await deletePurchaseOrder(selectedOrder._id);
      if (response.success) {
        toast.success('Purchase order deleted successfully');
        fetchOrderList();
      } else {
        toast.error(response.message || 'Error deleting purchase order');
      }
    } catch (error) {
      toast.error('Error deleting purchase order');
    }
    setOpenDeleteDialog(false);
    handleMenuClose();
  };

  const handleConvert = async () => {
    try {
      const response = await convertToPurchase(selectedOrder._id);
      if (response.success) {
        toast.success('Purchase order converted successfully');
        router.push('/purchases/purchase-list');
      } else {
        toast.error(response.message || 'Error converting purchase order');
      }
    } catch (error) {
      toast.error('Error converting purchase order');
    }
    setOpenConvertDialog(false);
    handleMenuClose();
  };

  const handleClone = async () => {
    try {
      const response = await clonePurchaseOrder(selectedOrder._id);
      if (response.success) {
        toast.success('Purchase order cloned successfully');
        fetchOrderList();
      } else {
        toast.error(response.message || 'Error cloning purchase order');
      }
    } catch (error) {
      toast.error('Error cloning purchase order');
    }
    setOpenCloneDialog(false);
    handleMenuClose();
  };

  return (
    <Box className="flex flex-col gap-4 p-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h5" color="primary">
          Purchase Orders
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
              href="/purchase-orders/order-add"
            >
              Add Purchase Order
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
                  <TableCell>Order ID</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderList.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Link
                        href={`/purchase-orders/order-view/${order._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {order.purchaseOrderId}
                      </Link>
                    </TableCell>
                    <TableCell>{order.vendorInfo?.vendor_name}</TableCell>
                    <TableCell>${order.TotalAmount}</TableCell>
                    <TableCell>{dayjs(order.purchaseOrderDate).format('DD-MM-YYYY')}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={order.status === 'PAID' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleMenuOpen(e, order)}>
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
            onClick={() => {
              router.push(`/purchase-orders/order-edit/${selectedOrder?._id}`);
              handleMenuClose();
            }}
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
        <MenuItem onClick={() => setOpenConvertDialog(true)}>
          <ConvertIcon className="mr-2" fontSize="small" />
          Convert to Purchase
        </MenuItem>
        <MenuItem onClick={() => setOpenCloneDialog(true)}>
          <CloneIcon className="mr-2" fontSize="small" />
          Clone
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this purchase order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openConvertDialog} onClose={() => setOpenConvertDialog(false)}>
        <DialogTitle>Convert to Purchase</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to convert this to a purchase?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConvertDialog(false)}>Cancel</Button>
          <Button onClick={handleConvert} color="primary" autoFocus>
            Convert
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCloneDialog} onClose={() => setOpenCloneDialog(false)}>
        <DialogTitle>Clone Purchase Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clone this purchase order?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCloneDialog(false)}>Cancel</Button>
          <Button onClick={handleClone} color="primary" autoFocus>
            Clone
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Drawer */}
      <PurchaseOrderFilter
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onFilter={fetchOrderList}
      />
    </Box>
  );
};

export default PurchaseOrderList;
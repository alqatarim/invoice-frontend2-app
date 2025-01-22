'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Grid,
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
  TableSortLabel,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CloneIcon,
  Transform as ConvertIcon,
  FilterList as FilterIcon,
  RestartAlt as RestartAltIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { deletePurchaseOrder, convertToPurchase, clonePurchaseOrder, getPurchaseOrderDetails } from '@/app/(dashboard)/purchase-orders/actions';
import { usePermission } from '@/hooks/usePermission';
import PurchaseOrderFilter from './PurchaseOrderFilter';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import debounce from 'lodash/debounce';

const PurchaseOrderList = ({
  orderList,
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

  // Debounced filter handler
  const debouncedSetFilterCriteria = useCallback(
    debounce((criteria) => {
      setFilterCriteria(criteria);
    }, 300),
    []
  );

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
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleReset = () => {
    resetAllFilters();
    setOpenFilter(false);
  };

  const handleDelete = async () => {
    if (!selectedOrder?._id) {
      toast.error('Invalid order selected');
      setOpenDeleteDialog(false);
      handleMenuClose();
      return;
    }

    try {
      const response = await deletePurchaseOrder(selectedOrder._id);

      if (response.success) {
        setOpenDeleteDialog(false);
        handleMenuClose();
        toast.success('Purchase order deleted successfully');
        setPage(1);
      } else {
        throw new Error(response.message || 'Failed to delete purchase order');
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast.error(error.message || 'Error deleting purchase order');
      setOpenDeleteDialog(false);
      handleMenuClose();
    }
  };

  const handleConvert = async () => {
    try {
      // Get the purchase order details first
      const orderDetails = await getPurchaseOrderDetails(selectedOrder._id);

      if (!orderDetails.success) {
        throw new Error(orderDetails.message || 'Failed to fetch purchase order details');
      }

      const orderData = orderDetails.data;

      // Prepare the data for conversion
      const conversionData = {
        items: orderData.items.map(item => ({
          name: item.name,
          key: item.key,
          productId: item.productId,
          quantity: item.quantity,
          units: item.name,
          unit: item.unit_id,
          rate: item.rate,
          discount: item.discount,
          tax: item.tax,
          amount: item.amount
        })),
        purchaseId: orderData.purchaseId,
        taxableAmount: orderData.taxableAmount,
        totalDiscount: orderData.totalDiscount,
        roundOff: orderData.roundOff,
        TotalAmount: orderData.TotalAmount,
        bank: orderData.bank,
        notes: orderData.notes,
        termsAndCondition: orderData.termsAndCondition,
        signatureName: orderData.signatureName,
        vendorId: orderData.vendorId,
        purchaseOrderDate: orderData.purchaseOrderDate,
        dueDate: orderData.dueDate,
        referenceNo: orderData.referenceNo,
        _id: selectedOrder._id
      };

      const response = await convertToPurchase(selectedOrder._id, conversionData);

      if (response.success) {
        toast.success('Purchase order converted successfully');
        router.push('/purchases/purchase-list');
      } else {
        throw new Error(response.message || 'Error converting purchase order');
      }
    } catch (error) {
      console.error('Error converting purchase order:', error);
      toast.error(error.message || 'Error converting purchase order');
    }
    setOpenConvertDialog(false);
    handleMenuClose();
  };

  const handleClone = async () => {
    try {
      const response = await clonePurchaseOrder(selectedOrder._id);
      if (response.success) {
        toast.success('Purchase order cloned successfully');
        setPage(1);
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="flex flex-col gap-4 p-4">
        <Box className="flex justify-between items-center">
          <Typography variant="h5" color="primary">
            Purchase Orders
          </Typography>
          <Box className="flex gap-2">
            <Button
              variant="text"
              color="secondary"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
            >
              Reset
            </Button>
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

        <Card className="card-table">
          <CardContent className="card-body purchase">
            <div className="table-responsive table-hover">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className="text-[15px] font-medium">
                      Order ID
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Vendor
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Amount
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      P.O. Date
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Due Date
                    </TableCell>
                    <TableCell className="text-[15px] font-medium" align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array(pageSize).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        {Array(6).fill(0).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton animation="wave" height={24} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : orderList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No records found</TableCell>
                    </TableRow>
                  ) : (
                    orderList.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <Link
                            href={`/purchase-orders/order-view/${order._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {order.purchaseOrderId}
                          </Link>
                        </TableCell>
                        <TableCell className='text-[14px]'>{order.vendorInfo?.vendor_name}</TableCell>
                        <TableCell className='text-[14px]'>${order.TotalAmount}</TableCell>
                        <TableCell className='text-[14px]'>{dayjs(order.purchaseOrderDate).format('DD MMM YYYY')}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              flexDirection: 'row',
                              gap: 2,
                            }}
                          >
                            <Typography
                              className='text-[14px]'
                              color={() => {
                                const today = dayjs();
                                const dueDate = dayjs(order.dueDate);
                                const daysUntilDue = String(dueDate.diff(today, 'day')).padStart(2, '0');

                                if (daysUntilDue < 0) {
                                  return 'error.main'; // Past due date
                                } else if (daysUntilDue <= 10) {
                                  return 'warning.main'; // Due within 10 days
                                }
                                return 'inherit'; // Normal color
                              }}
                            >
                              {dayjs(order.dueDate).format('DD MMM YYYY')}
                            </Typography>

                            {(() => {
                              const today = dayjs();
                              const dueDate = dayjs(order.dueDate);
                              const daysUntilDue = dueDate.diff(today, 'day');

                              if (daysUntilDue < 0) {
                                return (
                                  <Chip
                                    size="small"
                                    className="p-0 m-0"
                                    variant="tonal"
                                    color="error"
                                    label={`${String(Math.abs(daysUntilDue)).padStart(2, '0')} days late`}
                                  />
                                );
                              } else if (daysUntilDue <= 10) {
                                return (
                                  <Chip
                                    size="small"
                                    className="p-0 m-0"
                                    variant="tonal"
                                    color="warning"
                                    label={`${String(Math.abs(daysUntilDue)).padStart(2, '0')} days left`}
                                  />
                                );
                              }
                              return null;
                            })()}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(e) => handleMenuOpen(e, order)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <TablePagination
              component="div"
              count={totalCount}
              page={page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelDisplayedRows={({ from, to, count }) =>
                `Showing ${from} to ${to} of ${count} entries`
              }
            />
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          className="dropdown-menu dropdown-menu-right credit-note-dropdown purchase-order-dropdown-menu"
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
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          className="modal custom-modal fade"
        >
          <DialogTitle>Delete Purchase Order</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete purchase order {selectedOrder?.purchaseOrderId}?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="modal-btn delete-action">
            <Button onClick={() => setOpenDeleteDialog(false)} className="btn-primary paid-cancel-btn">
              Cancel
            </Button>
            <Button onClick={handleDelete} color="error" className="btn-primary paid-continue-btn" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openConvertDialog}
          onClose={() => setOpenConvertDialog(false)}
          className="modal custom-modal fade"
        >
          <DialogTitle>Convert to Purchase</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to convert purchase order {selectedOrder?.purchaseOrderId} to a purchase?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="modal-btn delete-action">
            <Button onClick={() => setOpenConvertDialog(false)} className="btn-primary paid-cancel-btn">
              Cancel
            </Button>
            <Button onClick={handleConvert} color="primary" className="btn-primary paid-continue-btn" autoFocus>
              Convert
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openCloneDialog}
          onClose={() => setOpenCloneDialog(false)}
          className="modal custom-modal fade"
        >
          <DialogTitle>Clone Purchase Order</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clone purchase order {selectedOrder?.purchaseOrderId}?
            </DialogContentText>
          </DialogContent>
          <DialogActions className="modal-btn delete-action">
            <Button onClick={() => setOpenCloneDialog(false)} className="btn-primary paid-cancel-btn">
              Cancel
            </Button>
            <Button onClick={handleClone} color="primary" className="btn-primary paid-continue-btn" autoFocus>
              Clone
            </Button>
          </DialogActions>
        </Dialog>

        {/* Filter Drawer */}
        <PurchaseOrderFilter
          open={openFilter}
          onClose={() => setOpenFilter(false)}
          onFilter={debouncedSetFilterCriteria}
          vendors={vendors}
          onReset={handleReset}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default PurchaseOrderList;
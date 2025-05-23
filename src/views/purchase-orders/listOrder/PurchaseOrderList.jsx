'use client';

import React, { useState } from 'react';
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
  TableSortLabel
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
import { deletePurchaseOrder, convertToPurchase, clonePurchaseOrder } from '@/app/(dashboard)/purchase-orders/actions';
import { usePermission } from '@/Auth/usePermission';
import PurchaseOrderFilter from './PurchaseOrderFilter';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const PurchaseOrderList = ({
  orderList,
  totalCount,
  page,
  setPage,
  pageSize,
  setPageSize,
  loading,
  setFilterCriteria,
  setSortConfig,
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
  const [filters, setFilters] = useState({
    vendorId: '',
    startDate: null,
    endDate: null,
    minAmount: '',
    maxAmount: '',
    // Add other filter states if necessary
  });

  const [orderBy, setOrderBy] = useState('');
  const [orderDirection, setOrderDirection] = useState('asc');

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

  const handleRequestSort = (property) => {
    setSortConfig(prev => ({
      sortBy: property,
      sortDirection: prev.sortBy === property && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
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

  const sortedOrderList = React.useMemo(() => {
    const comparator = (a, b) => {
      if (orderBy === 'amount') {
        return orderDirection === 'asc'
          ? a.TotalAmount - b.TotalAmount
          : b.TotalAmount - a.TotalAmount;
      } else {
        const aValue = a[orderBy] || '';
        const bValue = b[orderBy] || '';
        return orderDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    };

    return [...orderList].sort(comparator);
  }, [orderList, orderBy, orderDirection]);

  const paginatedOrderList = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedOrderList.slice(startIndex, endIndex);
  }, [sortedOrderList, page, pageSize]);

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

        <Card>
          <CardContent>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell className='text-[15px]'>
                      Order ID
                    </TableCell>
                    <TableCell className='text-[15px]'>
                      Vendor
                    </TableCell>
                    <TableCell className='text-[15px]'>
                      Amount
                    </TableCell>
                    <TableCell className='text-[15px]'>
                      P.O. Date
                    </TableCell>
                    <TableCell className='text-[15px]'>
                      Due Date
                    </TableCell>
                    <TableCell className='text-[15px]' align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : orderList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No records found</TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrderList.map((order) => (
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
                                    className="p-0 m-0 "
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
          onFilter={setFilterCriteria}
          vendors={vendors}
          onReset={handleReset}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default PurchaseOrderList;
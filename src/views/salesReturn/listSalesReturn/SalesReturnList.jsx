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
  FilterList as FilterIcon,
  RestartAlt as RestartAltIcon
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { deleteSalesReturn } from '@/app/(dashboard)/sales-return/actions';
import { usePermission } from '@/Auth/usePermission';
import SalesReturnFilter from './SalesReturnFilter';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import debounce from 'lodash/debounce';

const SalesReturnList = ({
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
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSalesReturn, setSelectedSalesReturn] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const canUpdate = usePermission('creditNote', 'update');
  const canDelete = usePermission('creditNote', 'delete');
  const isAdmin = usePermission('creditNote', 'isAdmin');

  // Debounced filter handler
  const debouncedSetFilterCriteria = useCallback(
    debounce((criteria) => {
      setFilterCriteria(criteria);
    }, 300),
    []
  );

  const handleMenuOpen = (event, salesReturn) => {
    setAnchorEl(event.currentTarget);
    setSelectedSalesReturn(salesReturn);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSalesReturn(null);
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
    if (!selectedSalesReturn?._id) {
      toast.error('Invalid sales return selected');
      setOpenDeleteDialog(false);
      handleMenuClose();
      return;
    }

    try {
      const response = await deleteSalesReturn(selectedSalesReturn._id);

      if (response.success) {
        setOpenDeleteDialog(false);
        handleMenuClose();
        toast.success('Sales return deleted successfully');
        setPage(1);
      } else {
        throw new Error(response.message || 'Failed to delete sales return');
      }
    } catch (error) {
      console.error('Error deleting sales return:', error);
      toast.error(error.message || 'Error deleting sales return');
      setOpenDeleteDialog(false);
      handleMenuClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="flex flex-col gap-4 p-4">
        <Box className="flex justify-between items-center">
          <Typography variant="h5" color="primary">
            Sales Returns
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
                href="/sales-return/sales-return-add"
              >
                Add Sales Return
              </Button>
            )}
          </Box>
        </Box>

        <Card className="card-table">
          <CardContent className="card-body sales">
            <div className="table-responsive table-hover">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className="text-[15px] font-medium">
                      Sales Return ID
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Customer
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Amount
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Payment Mode
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Created On
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Status
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
                        {Array(7).fill(0).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton animation="wave" height={24} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : salesReturnList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No records found</TableCell>
                    </TableRow>
                  ) : (
                    salesReturnList.map((salesReturn) => (
                      <TableRow key={salesReturn._id}>
                        <TableCell>
                          <Link
                            href={`/sales-return/sales-return-view/${salesReturn._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                color: 'primary.main',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {salesReturn.credit_note_id}
                            </Typography>
                          </Link>
                        </TableCell>
                        <TableCell className='text-[14px]'>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Link
                              href={`/customers/customer-view/${salesReturn.customerId?._id}`}
                              className="text-decoration-none"
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                {salesReturn.customerId?.name}
                              </Typography>
                            </Link>
                            <Typography variant="caption" color="textSecondary">
                              {salesReturn.customerId?.phone}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell className="text-[14px]">
                          ${Number(salesReturn.TotalAmount || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </TableCell>
                        <TableCell className="text-[14px]">
                          {salesReturn.paymentMode || '-'}
                        </TableCell>
                        <TableCell className="text-[14px]">
                          {dayjs(salesReturn.createdAt).format('DD MMM YYYY')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={salesReturn.status || 'Pending'}
                            size="small"
                            color={
                              salesReturn.status === 'Paid' ? 'success' :
                              salesReturn.status === 'Cancelled' ? 'error' :
                              'warning'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, salesReturn)}
                          >
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
              count={totalCount || 0}
              page={Math.max(0, (page || 1) - 1)}
              onPageChange={handlePageChange}
              rowsPerPage={pageSize || 10}
              onRowsPerPageChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              maxHeight: 48 * 4.5,
              width: '20ch',
            },
          }}
        >
          <MenuItem
            component={Link}
            href={`/sales-return/sales-return-view/${selectedSalesReturn?._id}`}
            onClick={handleMenuClose}
          >
            <Icon icon="mdi:eye" className="mr-2" />
            View
          </MenuItem>
          {(canUpdate || isAdmin) && (
            <MenuItem
              component={Link}
              href={`/sales-return/sales-return-edit/${selectedSalesReturn?._id}`}
              onClick={handleMenuClose}
            >
              <EditIcon fontSize="small" className="mr-2" />
              Edit
            </MenuItem>
          )}
          {(canDelete || isAdmin) && (
            <MenuItem
              onClick={() => {
                setOpenDeleteDialog(true);
                handleMenuClose();
              }}
            >
              <DeleteIcon fontSize="small" className="mr-2" />
              Delete
            </MenuItem>
          )}
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this sales return?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Filter Dialog */}
        <SalesReturnFilter
          open={openFilter}
          onClose={() => setOpenFilter(false)}
          onFilter={debouncedSetFilterCriteria}
          customers={customers}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default SalesReturnList;
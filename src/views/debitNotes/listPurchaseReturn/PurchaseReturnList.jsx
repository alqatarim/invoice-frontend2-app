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
import { deleteDebitNote, cloneDebitNote } from '@/app/(dashboard)/debitNotes/actions';
import { usePermission } from '@/hooks/usePermission';
import PurchaseReturnFilter from './PurchaseReturnFilter';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import debounce from 'lodash/debounce';

const PurchaseReturnList = ({
  debitNoteList,
  totalCount,
  page,
  setPage,
  pageSize,
  setPageSize,
  loading,
  setFilterCriteria,
  vendors,
  resetAllFilters,
  onListUpdate
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDebitNote, setSelectedDebitNote] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [openCloneDialog, setOpenCloneDialog] = useState(false);

  const canUpdate = usePermission('debitNote', 'update');
  const canDelete = usePermission('debitNote', 'delete');
  const isAdmin = usePermission('debitNote', 'isAdmin');

  // Debounced filter handler
  const debouncedSetFilterCriteria = useCallback(
    debounce((criteria) => {
      setFilterCriteria(criteria);
    }, 300),
    []
  );

  const handleMenuOpen = (event, debitNote) => {
    setAnchorEl(event.currentTarget);
    setSelectedDebitNote(debitNote);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDebitNote(null);
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
    if (!selectedDebitNote?._id) {
      toast.error('Invalid debit note selected');
      setOpenDeleteDialog(false);
      handleMenuClose();
      return;
    }

    try {
      const response = await deleteDebitNote(selectedDebitNote._id);

      if (response.success) {
        setOpenDeleteDialog(false);
        handleMenuClose();
        toast.success('Debit note deleted successfully');
        setPage(1);
      } else {
        throw new Error(response.message || 'Failed to delete debit note');
      }
    } catch (error) {
      console.error('Error deleting debit note:', error);
      toast.error(error.message || 'Error deleting debit note');
      setOpenDeleteDialog(false);
      handleMenuClose();
    }
  };

  const handleClone = async () => {
    if (!selectedDebitNote?._id) {
      toast.error('Invalid debit note selected');
      setOpenCloneDialog(false);
      handleMenuClose();
      return;
    }

    try {
      const response = await cloneDebitNote(selectedDebitNote._id);

      if (response.success && response.data) {
        setOpenCloneDialog(false);
        handleMenuClose();
        toast.success('Debit note cloned successfully');

        // Add the new cloned debit note to the list
        const newDebitNote = response.data;
        const updatedList = [newDebitNote, ...debitNoteList];

        // Update the total count
        const newTotalCount = totalCount + 1;

        // Reset to first page to show the cloned item
        setPage(1);

        // Update the list through props if available
        if (typeof onListUpdate === 'function') {
          onListUpdate(updatedList, newTotalCount);
        }
      } else {
        // Extract the specific error message
        throw new Error(response.message || 'Failed to clone debit note');
      }
    } catch (error) {
      console.error('Error cloning debit note:', error);
      toast.error(error.message);
    } finally {
      setOpenCloneDialog(false);
      handleMenuClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="flex flex-col gap-4 p-4">
        <Box className="flex justify-between items-center">
          <Typography variant="h5" color="primary">
            Purchase Returns
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
                href="/debitNotes/purchaseReturn-add"
              >
                Add Purchase Return
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
                      Debit Note ID
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Vendor
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Amount
                    </TableCell>
                    <TableCell className="text-[15px] font-medium">
                      Creation Date
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
                  ) : debitNoteList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No records found</TableCell>
                    </TableRow>
                  ) : (
                    debitNoteList.map((debitNote) => (
                      <TableRow key={debitNote._id}>
                        <TableCell>
                          <Link
                            href={`/debitNotes/purchaseReturn-view/${debitNote._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >

                            <Typography
                                  variant="h6"
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': { textDecoration: 'underline' }
                                  }}
                                >
                                {debitNote.debit_note_id}
                                </Typography>

                          </Link>
                        </TableCell>
                        <TableCell className='text-[14px]'>

                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Link
                                  href={`/vendors/vendor-view/${debitNote.vendorId?._id}`}
                                  className="text-decoration-none"
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: 'primary.main',
                                      '&:hover': { textDecoration: 'underline' }
                                    }}
                                  >
                                    {debitNote.vendorId?.vendor_name}
                                  </Typography>
                                </Link>
                                <Typography variant="caption" color="textSecondary">
                                  {debitNote.vendorId?.vendor_phone}
                                </Typography>
                              </Box>


                        </TableCell>
                        <TableCell className='text-[14px]'>${debitNote.TotalAmount}</TableCell>
                        <TableCell className='text-[14px]'>{dayjs(debitNote.purchaseOrderDate).format('DD MMM YYYY')}</TableCell>
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
                                const dueDate = dayjs(debitNote.dueDate);
                                const daysUntilDue = String(dueDate.diff(today, 'day')).padStart(2, '0');

                                if (daysUntilDue < 0) {
                                  return 'error.main'; // Past due date
                                } else if (daysUntilDue <= 10) {
                                  return 'warning.main'; // Due within 10 days
                                }
                                return 'inherit'; // Normal color
                              }}
                            >
                              {dayjs(debitNote.dueDate).format('DD MMM YYYY')}
                            </Typography>

                            {(() => {
                              const today = dayjs();
                              const dueDate = dayjs(debitNote.dueDate);
                              const daysUntilDue = dueDate.diff(today, 'day');

                              if (daysUntilDue < 0) {
                                return (
                                  <Chip
                                    size="small"
                                    className="p-0 m-0 text-[12px]"
                                    variant="tonal"
                                    color="error"
                                    label={`-${String(Math.abs(daysUntilDue)).padStart(2, '0')} day(s)`}
                                    icon={<Icon icon="mdi:clock-alert-outline" />}

                                  />
                                );
                              } else if (daysUntilDue <= 10) {
                                return (
                                  <Chip
                                    size="small"
                                    className="p-0 m-0 text-[12px]"
                                    variant="outlined"
                                    color="warning"
                                    label={`${String(Math.abs(daysUntilDue)).padStart(2, '0')} day(s)`}
                                     icon={<Icon icon="mdi:clock-time-five-outline" />}
                                  />
                                );
                              }
                              return null;
                            })()}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(e) => handleMenuOpen(e, debitNote)}>
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
          className="dropdown-menu dropdown-menu-right"
        >
          {(canUpdate || isAdmin) && (
            <MenuItem
              onClick={() => {
                router.push(`/debitNotes/purchaseReturn-edit/${selectedDebitNote?._id}`);
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
          {(canUpdate || isAdmin) && (
            <MenuItem onClick={() => setOpenCloneDialog(true)}>
              <Icon icon="mdi:content-copy" className="mr-2" fontSize="small" />
              Clone
            </MenuItem>
          )}
        </Menu>

        {/* Delete Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          className="modal custom-modal fade"
        >
          <DialogTitle>Delete Purchase Return</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete purchase return {selectedDebitNote?.debit_note_id}?
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

        {/* Add Clone Dialog */}
        <Dialog
          open={openCloneDialog}
          onClose={() => setOpenCloneDialog(false)}
          className="modal custom-modal fade"
        >
          <DialogTitle>Clone Purchase Return</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clone purchase return {selectedDebitNote?.debit_note_id}?
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
        <PurchaseReturnFilter
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

export default PurchaseReturnList;
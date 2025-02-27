'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSnackbar } from 'notistack';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Avatar,
  Popover,
  Paper,
  Chip,
  Menu,
  MenuItem
} from '@mui/material';
import { Icon } from '@iconify/react';
import { getPaymentsList, deletePayment } from '@/app/(dashboard)/payments/actions';
import { formatDate } from '@/utils/helpers';

const PaymentList = ({
  payments,
  setPayments,
  totalRecords,
  page,
  setPage,
  pageSize,
  setPageSize,
  onFilterClick,
  onStatusUpdate,
  getPaymentsList,
  isFiltered,
  selectedCustomers
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [isDeleting, setIsDeleting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const handleChangePage = async (event, newPage) => {
    setPage(newPage + 1);
    const response = await getPaymentsList(
      newPage + 1,
      pageSize,
      isFiltered ? { customer: selectedCustomers } : {}
    );
    if (response && response.success) {
      setPayments(response.data);
    }
  };

  const handleChangeRowsPerPage = async (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setPageSize(newPageSize);
    setPage(1);
    const response = await getPaymentsList(
      1,
      newPageSize,
      isFiltered ? { customer: selectedCustomers } : {}
    );
    if (response && response.success) {
      setPayments(response.data);
    }
  };

  const handleDeleteClick = (event, id) => {
    setSelectedPaymentId(id);
    setAnchorEl(event.currentTarget);
  };

  const handleConfirmClose = () => {
    setAnchorEl(null);
    setSelectedPaymentId(null);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await deletePayment(selectedPaymentId);
      if (response.success) {
        enqueueSnackbar('Payment deleted successfully', { variant: 'success' });
        const updatedResponse = await getPaymentsList(page, pageSize);
        if (updatedResponse && updatedResponse.success) {
          setPayments(updatedResponse.data);
        }
      } else {
        enqueueSnackbar('Error deleting payment', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      enqueueSnackbar('Error deleting payment', { variant: 'error' });
    }
    setIsDeleting(false);
    handleConfirmClose();
  };

  const handleStatusClick = (event, payment) => {
    if (payment.status === 'Processing' || payment.status === 'Pending') {
      setSelectedPayment(payment);
      setStatusAnchorEl(event.currentTarget);
    }
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
    setSelectedPayment(null);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (selectedPayment) {
      await onStatusUpdate(selectedPayment._id, newStatus);
      handleStatusClose();
    }
  };

  return (
    <Box className="flex flex-col gap-4 p-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h5" color="primary">
          Payments
        </Typography>
      </Box>

      <Box className='flex justify-end items-center gap-2'>
        <Button
          variant="text"
          startIcon={<Icon icon="mdi:filter-variant" />}
          onClick={onFilterClick}
        >
          Filter
        </Button>
        <Button
          variant="contained"
          startIcon={<Icon icon="mdi:plus" />}
          component={Link}
          href='/payments/payment-add'
        >
          Add Payment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="payments table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Payment No</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Customer</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Amount</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Payment Date</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Payment Method</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Status</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Actions</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment, index) => (
              <TableRow key={payment._id} hover>
                <TableCell>
                  <Typography
                    component={Link}
                    href={`/payments/payment-view/${payment._id}`}
                    variant='h6' color='primary'>{payment.payment_number}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      src={payment.customerDetail?.image}
                      alt={payment.customerDetail?.name}
                      sx={{ mr: 2, width: 34, height: 34 }}
                    >
                      {!payment.customerDetail?.image && <Icon icon="mdi:image-off-outline" />}
                    </Avatar>
                    <Box>
                      <Typography
                        color='primary.main'
                        variant="h6"
                        component={Link}
                        href={`/customers/view/${payment.customerDetail?._id}`}
                      >
                        {payment.customerDetail?.name || 'Deleted Customer'}
                      </Typography>
                      <Typography variant='caption' display='block'>
                        {payment.customerDetail?.phone || 'Deleted Customer'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant='body1'>{payment.amount}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body1'>{formatDate(payment.createdAt)}</Typography>
                </TableCell>
                <TableCell>
                  <Chip color='secondary' variant='outlined' size='medium' label={payment.payment_method} />
                </TableCell>
                <TableCell>
                  <Chip
                    color={
                      payment.status === 'Success'
                        ? 'success'
                        : payment.status === 'Processing'
                          ? 'primary'
                          : payment.status === 'Pending'
                            ? 'warning'
                            : payment.status === 'Failed'
                              ? 'error'
                              : payment.status === 'Cancelled'
                                ? 'secondary'
                                : 'secondary'
                    }
                    variant='tonal'
                    size='medium'
                    label={payment.status.split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ')}
                  />
                </TableCell>
                <TableCell>

 {(payment.status === 'Processing' || payment.status === 'Pending') ? (
                    <IconButton
                     size='medium'
                      sx={{ mr: 1 }}
                      onClick={(e) => handleStatusClick(e, payment)}
                    >
                      <Icon icon='line-md:rotate-270' />
                    </IconButton>
                  ) : (
                    <Box component="span" sx={{ width: 40, display: 'inline-block', mr: 1 }} />
                  )}
                       <IconButton
                       variant
                      size='medium'
                      sx={{ mr: 1 }}
                      component={Link}
                      href={`/payments/payment-view/${payment._id}`}
                    >
                      <Icon icon='line-md:watch' />
                    </IconButton>



                  {payment.status !== 'Cancelled' ? (
                    <IconButton
                    size='medium'
                      onClick={(e) => handleDeleteClick(e, payment._id)}
                    >
                      <Icon icon='line-md:close-circle' />
                    </IconButton>
                  ) : (
                    <Box component="span" sx={{ width: 40, display: 'inline-block' }} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component='div'
          count={totalRecords}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleConfirmClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            sx: {
              p: 2,
              backgroundColor: alpha(theme.palette.error.main, 0.07),
              backdropFilter: 'blur(6px)',
              color: theme.palette.success.main,
              boxShadow: `0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
              width: 'auto',
              border: `1px solid ${alpha(theme.palette.common.black, 0.01)}`
            }
          }
        }}
      >
        <Box className="p-2">
          <Typography variant="h6" className="mb-3">
            Are you sure you want to cancel this payment?
          </Typography>
          <Box className="flex gap-2 justify-end">
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              onClick={handleConfirmClose}
            >
              No
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes'}
            </Button>
          </Box>
        </Box>
      </Popover>

      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={handleStatusClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleStatusUpdate('Success')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon width='22px' icon="line-md:circle-twotone-to-confirm-circle-transition" style={{ color: theme.palette.success.dark }} />
            Set status to Success
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('Failed')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon width='22px' icon="line-md:close-circle" style={{ color: theme.palette.error.dark }} />
            Set status to Failed
          </Box>

        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PaymentList;

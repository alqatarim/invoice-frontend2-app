'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Tooltip,
  Typography,
  Popover
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { getExpensesList, deleteExpense } from '@/app/(dashboard)/expenses/actions';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/Auth/usePermission';
import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';


const ExpenseList = ({
  expenses,
  setExpenses,
  page,
  pageSize,
  totalCount,
  setTotalCount,
  handlePagination,
  setShowFilter,
  enqueueSnackbar,
  closeSnackbar
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const canCreate = usePermission('expense', 'create');
  const canUpdate = usePermission('expense', 'update');
  const canView = usePermission('expense', 'view');
  const canDelete = usePermission('expense', 'delete');

  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

    const theme = useTheme();

  useEffect(() => {
    fetchExpenses();
  }, [page, pageSize]);

  const fetchExpenses = async () => {
    const response = await getExpensesList(page, pageSize);
    if (response.success) {
      setExpenses(response.data);
      setTotalCount(response.totalRecords);
    } else {
      enqueueSnackbar(response.message || 'Error fetching expenses', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    const response = await deleteExpense(id);
    if (response.success) {
      enqueueSnackbar('Expense deleted successfully', { variant: 'success' });
      fetchExpenses();
    } else {
      enqueueSnackbar(response.message || 'Error deleting expense', { variant: 'error' });
    }
  };

  const handleChangePage = (event, newPage) => {
    handlePagination(newPage + 1, pageSize);
  };

  const handleChangeRowsPerPage = (event) => {
    handlePagination(1, parseInt(event.target.value, 10));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDeleteClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setDeleteId(id);
  };

  const handleDeleteClose = () => {
    setAnchorEl(null);
    setDeleteId(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      await handleDelete(deleteId);
      handleDeleteClose();
    }
  };

  return (
   <Box className="flex flex-col gap-4 p-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h5" color="primary">
          Expenses
        </Typography>
      </Box>
      <Box className='flex justify-end items-center'>

          {canCreate && (
          <Link href="/expenses/expense-add" passHref>
            <Button variant="contained" startIcon={<Icon icon="mdi:plus" />}>
              Add Expense
            </Button>
          </Link>
        )}
      </Box>
        <Box className='flex justify-end items-center'>
        <Button
          variant="text"
          startIcon={<Icon icon="mdi:filter-variant" />}
          onClick={() => setShowFilter(true)}
        >
          Filter
        </Button>

      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="expenses table">
          <TableHead>
            <TableRow>
              <TableCell >
                <Typography className='text-[14px]' fontWeight={600}>Expense ID</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Reference</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Amount</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Payment Mode</Typography>
              </TableCell>
              <TableCell>
                <Typography className='text-[14px]' fontWeight={600}>Status</Typography>
              </TableCell>
              {(canUpdate || canDelete) && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id}>
                <TableCell>
                  {canView ? (
                    <Link
                      href={`/expenses/expense-view/${expense._id}`}
                      className="text-primary hover:underline cursor-pointer"
                    >
                        <Typography color='primary.main' variant="h6">{expense.expenseId}</Typography>

                    </Link>
                  ) : (
                    expense.expenseId
                  )}
                </TableCell>
                <TableCell >
                    <Typography color='primary.main' variant='body1'>{expense.reference}</Typography>
                </TableCell>
                <TableCell>
                    <Typography variant='body1'> {expense.currency}
                  {Number(expense.amount).toLocaleString('en-IN', {

                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                  </Typography>
                </TableCell>
                <TableCell>
                    <Chip  color='secondary' variant='outlined' size='medium' label={expense.paymentMode} />
                </TableCell>
                <TableCell className='text-[14px]'>
                  <Chip
                    variant="tonal"
                    label={expense.status}
                    color={getStatusColor(expense.status)}
                    size="medium"
                  />
                </TableCell>
                {(canUpdate || canDelete) && (
                  <TableCell align="right">
                    {canView && (
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/expenses/expense-view/${expense._id}`)}
                        >
                          <Icon icon="mdi:eye" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canUpdate && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/expenses/expense-edit/${expense._id}`)}
                        >
                          <Icon icon="mdi:pencil" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteClick(e, expense._id)}
                        >
                          <Icon icon="mdi:delete" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

          <TablePagination
        component="div"
        count={totalCount}
        page={page - 1}
        onPageChange={handleChangePage}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />


      </TableContainer>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleDeleteClose}
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



              border: `1px solid ${alpha(theme.palette.common.black, 0.01)}`,

            //   '& .MuiStack-root': {
            //     width: 'auto',
            //   },
            },
          },
        }}
      >
        <Box className="p-2">
          <Typography variant="body2" className="mb-3">
            Are you sure you want to delete this expense?
          </Typography>
          <Box className="flex gap-2 justify-end">
            <Button
              size="small"
              variant="outlined"
              color= 'secondary'
              onClick={handleDeleteClose}
            >
              No
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={handleDeleteConfirm}
            >
              Yes
            </Button>
          </Box>
        </Box>
      </Popover>

    </Box>
  );
};

export default ExpenseList;

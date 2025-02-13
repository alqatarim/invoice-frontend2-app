'use client';

import React, { useState, useEffect } from 'react';
import ExpenseList from './ExpenseList';
import ExpenseFilter from './ExpenseFilter';
import { Card, CardContent, Grid, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar, SnackbarProvider, closeSnackbar } from 'notistack';
import { Icon } from '@iconify/react';
import { styled } from '@mui/material/styles';
import { MaterialDesignContent } from 'notistack';
import { alpha } from '@mui/material/styles';
import { useSearchParams, useRouter } from 'next/navigation';
import { deleteExpense, getExpensesList } from '@/app/(dashboard)/expenses/actions';

// Styled Material Design Content for Snackbar
const StyledMaterialDesignContent = styled(MaterialDesignContent)(({ theme }) => ({
  '&.notistack-MuiContent, &.notistack-MuiContent-success, &.notistack-MuiContent-error, &.notistack-MuiContent-warning, &.notistack-MuiContent-info': {
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'start',
    alignItems: 'center',
    padding: '4px 4px 4px 0px',
    minWidth: '350px',
    maxWidth: '500px',
    fontWeight: 600,
    gap: '8px',

    '& .go703367398': {
      margin: '0px',
      padding: '0px'
    },

    '& .notistack-MuiContent-message': {
      padding: 0,
      margin: 0,
    },
  },

  '&.notistack-MuiContent-success': {
    backgroundColor: alpha(theme.palette.success.main, 0.05),
    backdropFilter: 'blur(10px)',
    color: theme.palette.success.main,
    boxShadow: `0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  },

  '&.notistack-MuiContent-error': {
    backgroundColor: alpha(theme.palette.error.main, 0.05),
    backdropFilter: 'blur(10px)',
    color: theme.palette.error.main,
    boxShadow: `0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  },

  '&.notistack-MuiContent-info': {
    backgroundColor: alpha(theme.palette.info.main, 0.05),
    backdropFilter: 'blur(10px)',
    color: theme.palette.info.main,
    boxShadow: `0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  },
}));

const ExpenseListContent = () => {
  const theme = useTheme();
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [showFilter, setShowFilter] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success messages in URL
    const success = searchParams.get('success');
    if (success === 'add') {
      enqueueSnackbar('Expense added successfully!', {
        variant: 'success',
        autoHideDuration: 5000
      });
      // Remove success parameter from URL
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    } else if (success === 'edit') {
      enqueueSnackbar('Expense updated successfully!', {
        variant: 'success',
        autoHideDuration: 5000
      });
      // Remove success parameter from URL
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, enqueueSnackbar, router]);

  const handlePagination = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleDelete = async (id) => {
    const response = await deleteExpense(id);
    if (response.success) {
      enqueueSnackbar('Expense deleted successfully', { variant: 'success' });
      // Fetch updated list
      const expensesResponse = await getExpensesList(page, pageSize);
      if (expensesResponse.success) {
        setExpenses(expensesResponse.data);
        setTotalCount(expensesResponse.totalRecords);
      }
    } else {
      enqueueSnackbar(response.message || 'Error deleting expense', { variant: 'error' });
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <ExpenseList
          expenses={expenses}
          setExpenses={setExpenses}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          setTotalCount={setTotalCount}
          handlePagination={handlePagination}
          setShowFilter={setShowFilter}
          handleDelete={handleDelete}
          enqueueSnackbar={enqueueSnackbar}
          closeSnackbar={closeSnackbar}
        />
      </Grid>
      <ExpenseFilter
        show={showFilter}
        setShow={setShowFilter}
        setExpenses={setExpenses}
        page={page}
        pageSize={pageSize}
        setTotalCount={setTotalCount}
        setPage={setPage}
        handlePagination={handlePagination}
        enqueueSnackbar={enqueueSnackbar}
        closeSnackbar={closeSnackbar}
      />
    </>
  );
};

const ExpenseListIndex = () => {
  const snackbarAction = (snackbarId) => (
    <IconButton
      padding='14px'
      aria-label="close"
      color="inherit"
      onClick={() => closeSnackbar(snackbarId)}
    >
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={50000}
      preventDuplicate
      action={snackbarAction}
      hideIconVariant
      Components={{
        default: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        success: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <ExpenseListContent />
    </SnackbarProvider>
  );
};

export default ExpenseListIndex;

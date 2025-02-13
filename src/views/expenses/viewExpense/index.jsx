'use client';

import React from 'react';
import ViewExpense from '@/views/expenses/viewExpense/ViewExpense';
import {  Grid} from '@mui/material';
import { useSnackbar } from 'notistack';

const ViewExpenseIndex = ({ expenseId, initialExpenseData }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>



            <ViewExpense
              expenseId={expenseId}
              initialExpenseData={initialExpenseData}
              enqueueSnackbar={enqueueSnackbar}
              closeSnackbar={closeSnackbar}
            />


      </Grid>
    </Grid>
  );
};

export default ViewExpenseIndex;

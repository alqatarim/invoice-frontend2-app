'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import { useRouter } from 'next/navigation';

import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePermission } from '@/hooks/usePermission';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const ViewExpense = ({ expenseId, initialExpenseData, enqueueSnackbar, closeSnackbar }) => {
  const router = useRouter();

  const [expense, setExpense] = useState(initialExpenseData);
  const canUpdate = usePermission('expense', 'update');


  const theme = useTheme();




  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>


        <Grid container spacing={8}>

            <Grid item xs={12} md={4}>
                <Typography color="primary" variant="h5">View Expense</Typography>
            </Grid>

                <Grid item xs={12}>
  <Card>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Expense ID"
                value={expense?.expenseDetails?.expenseId || ''}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Reference"
                value={expense?.expenseDetails?.reference || ''}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Amount"
                value={`${Number(expense?.expenseDetails?.amount).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Payment Mode"
                value={expense?.expenseDetails?.paymentMode || ''}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Expense Date"
                value={dayjs(expense?.expenseDetails?.expenseDate).format('DD/MM/YYYY') || ''}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Payment Status"
                value={expense?.expenseDetails?.status || ''}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2
                }}
              >
                {(expense?.expenseDetails?.attachment &&
                  typeof expense.expenseDetails.attachment === 'string' &&
                  expense.expenseDetails.attachment.trim() !== '') ? (
                  <img
                    src={expense.expenseDetails.attachment}
                    alt="Expense Attachment"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Icon
                    color={alpha(theme.palette.secondary.light, 0.4)}
                    width={90} icon="mdi:file-document-remove-outline" />
                    <Typography
                      variant="subtitle1"
                      color="text.secondary.light"
                    >
                      No attachment available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Link href="/expenses/expense-list" passHref>
              <Button variant="outlined" color="secondary">
                Back to List
              </Button>
            </Link>

          </Box>
        </CardContent>
      </Card>

                </Grid>
        </Grid>

    </LocalizationProvider>
  );
};

export default ViewExpense;

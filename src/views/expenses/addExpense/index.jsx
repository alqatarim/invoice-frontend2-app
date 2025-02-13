'use client';

import React from 'react';
import AddExpense from '@/views/expenses/addExpense/AddExpense';
import { IconButton } from '@mui/material';
import { useSnackbar, SnackbarProvider, closeSnackbar } from 'notistack';
import { Icon } from '@iconify/react';
import { styled } from '@mui/material/styles';
import { MaterialDesignContent } from 'notistack';
import { alpha } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { addExpense } from '@/app/(dashboard)/expenses/actions';

// Add the StyledMaterialDesignContent component
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

const AddExpenseContent = ({ expenseNumber }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();

  const handleSubmit = async (data) => {
    try {
      closeSnackbar();

      let loadingKey = enqueueSnackbar('Adding expense...', {
        variant: 'info',
        persist: true,
        preventDuplicate: true
      });

      // Format the attachment data if present
      if (data.attachment) {
        data.attachment = {
          base64: data.filePreview,
          name: data.attachment.name,
          type: data.attachment.type
        };
      }

      const response = await addExpense(data);
      closeSnackbar(loadingKey);

      if (response.success) {
        // Just redirect on success, don't show notification here
        router.push('/expenses/expense-list?success=add');
      } else {
        const errorMessage = response.error?.message || response.message || 'Failed to add expense';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: false
        });
      }
    } catch (error) {
      closeSnackbar();
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'An unexpected error occurred while adding the expense';

      console.error('Form submission error:', error);

      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: false
      });
    }
  };

  return (
    <AddExpense
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
      expenseNumber={expenseNumber}
      onSubmit={handleSubmit}
    />
  );
};

const AddExpenseIndex = ({ expenseNumber }) => {
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
      autoHideDuration={10000}
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
      <AddExpenseContent expenseNumber={expenseNumber} />
    </SnackbarProvider>
  );
};

export default AddExpenseIndex;

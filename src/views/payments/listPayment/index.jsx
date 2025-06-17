'use client';

import { useEffect } from 'react';
import PaymentList from './PaymentList';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar, SnackbarProvider, closeSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';
import { MaterialDesignContent } from 'notistack';
import { alpha } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';

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

const PaymentListContent = ({ initialData, initialCustomerOptions }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'add') {
      enqueueSnackbar('Payment added successfully!', {
        variant: 'success',
        autoHideDuration: 5000
      });
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    } else if (success === 'edit') {
      enqueueSnackbar('Payment updated successfully!', {
        variant: 'success',
        autoHideDuration: 5000
      });
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, enqueueSnackbar, router]);

  return (
    <PaymentList
      initialPayments={initialData?.payments || []}
      initialPagination={initialData?.pagination || { current: 1, pageSize: 10, total: 0 }}
      initialCustomerOptions={initialCustomerOptions || []}
      onSuccess={(message) => enqueueSnackbar(message, { variant: 'success' })}
      onError={(message) => enqueueSnackbar(message, { variant: 'error' })}
    />
  );
};

const ListPaymentIndex = ({ initialData, initialCustomerOptions }) => {
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
      <PaymentListContent 
        initialData={initialData} 
        initialCustomerOptions={initialCustomerOptions}
      />
    </SnackbarProvider>
  );
};

export default ListPaymentIndex;
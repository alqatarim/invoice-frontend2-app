'use client';

import { useState, useEffect } from 'react';
import PaymentList from './PaymentList';
import PaymentFilter from './PaymentFilter';
import { useTheme } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar, SnackbarProvider, closeSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';
import { MaterialDesignContent } from 'notistack';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { getPaymentsList, updatePaymentStatus } from '@/app/(dashboard)/payments/actions';

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

const PaymentListContent = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [showFilter, setShowFilter] = useState(false);
  const [payments, setPayments] = useState(initialData?.data || []);
  const [totalRecords, setTotalRecords] = useState(initialData?.totalRecords || 0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

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

  const handleFilterToggle = () => {
    setShowFilter(!showFilter);
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      const response = await updatePaymentStatus(paymentId, newStatus);
      if (response.success) {
        enqueueSnackbar('Payment status updated successfully', {
          variant: 'success',
          autoHideDuration: 5000
        });

        // Refresh the payments list
        const updatedResponse = await getPaymentsList(page, pageSize);
        if (updatedResponse.success) {
          setPayments(updatedResponse.data);
          setTotalRecords(updatedResponse.totalRecords);
        }
      } else {
        enqueueSnackbar(response.message || 'Error updating payment status', {
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      enqueueSnackbar('Error updating payment status', { variant: 'error' });
    }
  };

  const handleFilter = (filtered) => {
    setIsFiltered(filtered);
  };

  const handleGetPayments = async (currentPage, currentPageSize, filters = {}) => {
    try {
      const response = await getPaymentsList(
        currentPage,
        currentPageSize,
        isFiltered ? { customer: selectedCustomers } : filters
      );

      if (response.success) {
        setPayments(response.data);
        setTotalRecords(response.totalRecords);
        return response;
      } else {
        enqueueSnackbar('Error fetching payments', { variant: 'error' });
        return null;
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      enqueueSnackbar('Error fetching payments', { variant: 'error' });
      return null;
    }
  };

  useEffect(() => {
    if (isFiltered) {
      handleGetPayments(page, pageSize, { customer: selectedCustomers });
    }
  }, [isFiltered, selectedCustomers]);

  return (
    <>
      <PaymentList
        payments={payments}
        setPayments={setPayments}
        totalRecords={totalRecords}
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        onFilterClick={handleFilterToggle}
        onStatusUpdate={handleStatusUpdate}
        isFiltered={isFiltered}
        getPaymentsList={handleGetPayments}
        selectedCustomers={selectedCustomers}
      />
      <PaymentFilter
        show={showFilter}
        setShow={setShowFilter}
        setPayments={setPayments}
        page={page}
        pageSize={pageSize}
        setTotalRecords={setTotalRecords}
        setPage={setPage}
        onFilter={handleFilter}
        getPaymentsList={handleGetPayments}
        selectedCustomers={selectedCustomers}
        setSelectedCustomers={setSelectedCustomers}
      />
    </>
  );
};

const ListPaymentIndex = ({ initialData }) => {
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
      <PaymentListContent initialData={initialData} />
    </SnackbarProvider>
  );
};

export default ListPaymentIndex;




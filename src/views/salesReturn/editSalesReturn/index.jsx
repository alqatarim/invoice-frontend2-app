'use client';

import React, { useState, useEffect } from 'react';
import { SnackbarProvider, useSnackbar, closeSnackbar } from 'notistack';
import EditSalesReturn from '@/views/salesReturn/editSalesReturn/EditSalesReturn';
import { getSalesReturnDetails, getCustomers, getProducts, getTaxRates, getBanks, getSignatures, updateSalesReturn } from '@/app/(dashboard)/sales-return/actions';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { styled } from '@mui/material/styles';
import { MaterialDesignContent } from 'notistack';
import { alpha } from '@mui/material/styles';

// Custom Styled MaterialDesignContent for Notistack
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
      margin:'0px',
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

const EditSalesReturnContent = ({ salesReturnId, salesReturnData, customers, products, taxRates, banks, signatures }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleSave = async (data) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));

      let loadingKey = enqueueSnackbar('Updating sales return...', {
        variant: 'info',
        persist: true,
        preventDuplicate: false,
      });

      const response = await updateSalesReturn({
        ...data,
        id: salesReturnId,
        credit_note_id: salesReturnData._id
      });

      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update sales return';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: false,
        });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Sales return updated successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
        preventDuplicate: false,
      });

      return response;
    } catch (error) {
      console.error('Error updating sales return:', error);
      enqueueSnackbar('An unexpected error occurred', {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: false,
      });
      return { success: false, message: error.message };
    }
  };

  return (
    <EditSalesReturn
      salesReturnData={salesReturnData}
      customers={customers}
      products={products}
      taxRates={taxRates}
      banks={banks}
      signatures={signatures}
      onSave={handleSave}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

const EditSalesReturnIndex = ({ id }) => {
  const [salesReturnData, setSalesReturnData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [banks, setBanks] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesReturn, customersData, productsData, taxRatesData, banksData, signaturesData] = await Promise.all([
          getSalesReturnDetails(id),
          getCustomers(),
          getProducts(),
          getTaxRates(),
          getBanks(),
          getSignatures()
        ]);

        setSalesReturnData(salesReturn);
        setCustomers(customersData);
        setProducts(productsData);
        setTaxRates(taxRatesData);
        setBanks(banksData);
        setSignatures(signaturesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!salesReturnData) {
    return <div>Sales return not found</div>;
  }

  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      iconVariant={{
        success: <Icon icon="mdi:check-circle" fontSize={24} />,
        error: <Icon icon="mdi:alert-circle" fontSize={24} />,
        warning: <Icon icon="mdi:alert" fontSize={24} />,
        info: <Icon icon="mdi:information" fontSize={24} />,
      }}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
        info: StyledMaterialDesignContent,
      }}
      action={(key) => (
        <IconButton size="small" onClick={() => closeSnackbar(key)} sx={{ ml: 1, color: 'inherit' }}>
          <Icon icon="mdi:close" fontSize={18} />
        </IconButton>
      )}
    >
      <EditSalesReturnContent
        salesReturnId={id}
        salesReturnData={salesReturnData}
        customers={customers}
        products={products}
        taxRates={taxRates}
        banks={banks}
        signatures={signatures}
      />
    </SnackbarProvider>
  );
};

export default EditSalesReturnIndex;
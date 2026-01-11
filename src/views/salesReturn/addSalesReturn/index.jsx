'use client';

import React, { useState } from 'react';
import { SnackbarProvider, useSnackbar, closeSnackbar } from 'notistack';
import AddSalesReturn from '@/views/salesReturn/addSalesReturn/AddSalesReturn';
import { getCustomers, getProducts, getTaxRates, getBanks, getSignatures, getSalesReturnNumber, addSalesReturn} from '@/app/(dashboard)/sales-return/actions';
import { IconButton} from '@mui/material';
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

const AddSalesReturnContent = ({ customers, products, taxRates, banks, signatures, salesReturnNumber }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleSave = async (salesReturnData, signatureURL) => {
    try {
      // Add a small delay to ensure snackbars are cleared before showing new ones
      await new Promise(resolve => setTimeout(resolve, 50));

      let loadingKey = enqueueSnackbar('Creating sales return...', {
        variant: 'info',
        persist: true, // Keep it visible until we get response
        preventDuplicate: false,
        SnackbarProps: {
          onExited: () => console.log('Loading snackbar closed'),
        }
      });

      const response = await addSalesReturn(salesReturnData, signatureURL);

      // Close the loading snackbar
      closeSnackbar(loadingKey);

      if (!response.success) {



        const errorMessage = response.error?.message || response.message || 'Failed to create sales return';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
          preventDuplicate: false,
          SnackbarProps: {
            onExited: () => console.log('Error snackbar closed'),
            onClose: (event, reason) => {
              if (reason === 'clickaway') return;
              closeSnackbar();
            }
          }
        });

        return { success: false, message: errorMessage };
      }

      // Show success message
      enqueueSnackbar('Sales return created successfully!', {
        variant: 'success',
        autoHideDuration: 3000,
        preventDuplicate: false,
        SnackbarProps: {
          onClose: (event, reason) => {
            if (reason === 'clickaway') return;
            closeSnackbar();
          }
        }
      });

      return response;
    } catch (error) {
      console.error('Error creating sales return:', error);
      enqueueSnackbar('An unexpected error occurred', {
        variant: 'error',
        autoHideDuration: 5000,
        preventDuplicate: false,
      });
      return { success: false, message: error.message };
    }
  };

  return <AddSalesReturn 
    customersData={customers}
    productData={products}
    taxRates={taxRates}
    initialBanks={banks}
    signatures={signatures}
    salesReturnNumber={salesReturnNumber}
    onSave={handleSave}
  />;
};

const AddSalesReturnIndex = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [banks, setBanks] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [salesReturnNumber, setSalesReturnNumber] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, productsData, taxRatesData, banksData, signaturesData, salesReturnNumberData] = await Promise.all([
          getCustomers(),
          getProducts(),
          getTaxRates(),
          getBanks(),
          getSignatures(),
          getSalesReturnNumber()
        ]);

        setCustomers(customersData);
        setProducts(productsData);
        setTaxRates(taxRatesData);
        setBanks(banksData);
        setSignatures(signaturesData);
        setSalesReturnNumber(salesReturnNumberData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
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
      <AddSalesReturnContent
        customers={customers}
        products={products}
        taxRates={taxRates}
        banks={banks}
        signatures={signatures}
        salesReturnNumber={salesReturnNumber}
      />
    </SnackbarProvider>
  );
};

export default AddSalesReturnIndex;
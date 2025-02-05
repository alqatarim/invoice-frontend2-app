'use client';

import React, { useState } from 'react';
import { SnackbarProvider, useSnackbar, closeSnackbar } from 'notistack';
import AddPurchaseReturn from '@/views/debitNotes/addPurchaseReturn/AddPurchaseReturn';
import { getVendors, getProducts, getTaxRates, getBanks, getSignatures, getDebitNoteNumber, addDebitNote} from '@/app/(dashboard)/debitNotes/actions';
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

const AddPurchaseReturnContent = ({ vendors, products, taxRates, banks, signatures, debitNoteNumber }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleSave = async (debitNoteData, signatureURL) => {
    try {
      // Add a small delay to ensure snackbars are cleared before showing new ones
      await new Promise(resolve => setTimeout(resolve, 50));

      let loadingKey = enqueueSnackbar('Creating purchase return...', {
        variant: 'info',
        persist: true, // Keep it visible until we get response
        preventDuplicate: false,
        SnackbarProps: {
          onExited: () => console.log('Loading snackbar closed'),
        }
      });

      const response = await addDebitNote(debitNoteData, signatureURL);

      // Close the loading snackbar
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to create purchase return';
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

      enqueueSnackbar('Purchase return created successfully!', {
        variant: 'success',
        autoHideDuration: 10000,
        preventDuplicate: false,
        SnackbarProps: {
          onExited: () => console.log('Success snackbar closed'),
          onClose: (event, reason) => {
            if (reason === 'clickaway') return;
            closeSnackbar();
          }
        }
      });

      return response;

    } catch (error) {
      // Close the loading snackbar if it exists
      closeSnackbar();

      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          'An unexpected error occurred while creating the purchase return';

      console.error('Error creating purchase return:', error);

      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 10000,
        preventDuplicate: false,
        SnackbarProps: {
          onExited: () => console.log('Error snackbar closed'),
          onClose: (event, reason) => {
            if (reason === 'clickaway') return;
            closeSnackbar();
          }
        }
      });

      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  };

  return (
    <AddPurchaseReturn
      onSave={handleSave}
      vendors={vendors}
      products={products}
      taxRates={taxRates}
      banks={banks}
      signatures={signatures}
      debitNoteNumber={debitNoteNumber}
      enqueueSnackbar={enqueueSnackbar}
      closeSnackbar={closeSnackbar}
    />
  );
};

function AddPurchaseReturnIndex() {
  const [formData, setFormData] = useState({
    vendors: [],
    products: [],
    taxRates: [],
    banks: [],
    signatures: [],
    debitNoteNumber: null,
    isLoading: true,
    error: null
  });

  // Fetch data on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          vendorsData,
          productsData,
          taxRatesData,
          banksData,
          signaturesData,
          debitNoteNumberData
        ] = await Promise.all([
          getVendors(),
          getProducts(),
          getTaxRates(),
          getBanks(),
          getSignatures(),
          getDebitNoteNumber()
        ]);

        setFormData({
          vendors: vendorsData,
          products: productsData,
          taxRates: taxRatesData,
          banks: banksData,
          signatures: signaturesData,
          debitNoteNumber: debitNoteNumberData.data,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error loading form data:', error);
        setFormData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load form data'
        }));
      }
    };

    fetchData();
  }, []);

  const handleIconClick = (variant) => {
    console.log(`Icon clicked for ${variant} notification`);
    // Add any additional logic you want to execute on icon click
  };

  // Add action to close snackbar
  const action = (snackbarId) => (
    <IconButton

      // padding='2px 8px 2px 20px'
      padding='14px'
      aria-label="close"
      color="inherit"
      onClick={() => closeSnackbar(snackbarId)}
    >
      <Icon icon="mdi:close" width={25} />
    </IconButton>
  );

  if (formData.isLoading) {
    return <div>Loading...</div>;
  }

  if (formData.error) {
    return <div>{formData.error}</div>;
  }

  return (
    <SnackbarProvider
      maxSnack={7}
      autoHideDuration={50000}
      preventDuplicate
      action={action}
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
      <AddPurchaseReturnContent
        vendors={formData.vendors}
        products={formData.products}
        taxRates={formData.taxRates}
        banks={formData.banks}
        signatures={formData.signatures}
        debitNoteNumber={formData.debitNoteNumber}
      />
    </SnackbarProvider>
  );
}

export default AddPurchaseReturnIndex;

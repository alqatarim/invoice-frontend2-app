'use client';

import React, { useState, useEffect } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import EditPurchaseReturn from '@/views/debitNotes/editPurchaseReturn/EditPurchaseReturn';
import {
  getVendors,
  getProducts,
  getTaxRates,
  getBanks,
  getSignatures,
  getDebitNoteDetails,
  updateDebitNote
} from '@/app/(dashboard)/debitNotes/actions';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { styled } from '@mui/material/styles';
import { MaterialDesignContent } from 'notistack';
import { alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

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

const EditPurchaseReturnIndex = ({ id }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [debitNoteData, setDebitNoteData] = useState(null);
  const [formData, setFormData] = useState({
    vendors: [],
    products: [],
    taxRates: [],
    banks: [],
    signatures: [],
    isLoading: true,
    error: null
  });

  // Fetch all required data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          vendorsData,
          productsData,
          taxRatesData,
          banksData,
          signaturesData,
          debitNoteDetails
        ] = await Promise.all([
          getVendors(),
          getProducts(),
          getTaxRates(),
          getBanks(),
          getSignatures(),
          getDebitNoteDetails(id)
        ]);


        setFormData({
          vendors: vendorsData,
          products: productsData,
          taxRates: taxRatesData,
          banks: banksData,
          signatures: signaturesData,
          isLoading: false,
          error: null
        });

        setDebitNoteData(debitNoteDetails);
      } catch (error) {
        console.error('Error loading data:', error);
        setFormData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to load form data'
        }));
        enqueueSnackbar(error.message || 'Error loading data', { variant: 'error' });
      }
    };

    fetchAllData();
  }, [id]);

  const handleUpdate = async (finalDebitNoteData, signatureURL) => {

    const data = finalDebitNoteData;
    try {
      const loadingKey = enqueueSnackbar('Updating purchase return...', {
        variant: 'info',
        persist: true,
      });

      const response = await updateDebitNote(data, signatureURL);
      closeSnackbar(loadingKey);

      if (!response.success) {
        const errorMessage = response.error?.message || response.message || 'Failed to update purchase return';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        return { success: false, message: errorMessage };
      }

      enqueueSnackbar('Purchase return updated successfully!', { variant: 'success' });
      return response;
    } catch (error) {
      closeSnackbar();
      const errorMessage = error.message || 'An unexpected error occurred';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return { success: false, message: errorMessage };
    }
  };

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

  // Show loading state while data is being fetched
  if (formData.isLoading) {
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
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </SnackbarProvider>
    );
  }

  // Show error state if data fetching fails
  if (formData.error) {
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
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="h6" color="error">{formData.error}</Typography>
        </Box>
      </SnackbarProvider>
    );
  }

  // Only render EditPurchaseReturn when data is available
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
      <EditPurchaseReturn
        debitNoteData={debitNoteData}
        onSave={handleUpdate}
        vendors={formData.vendors}
        products={formData.products}
        taxRates={formData.taxRates}
        banks={formData.banks}
        signatures={formData.signatures}
        enqueueSnackbar={enqueueSnackbar}
        closeSnackbar={closeSnackbar}
      />
    </SnackbarProvider>
  );
};

export default EditPurchaseReturnIndex;

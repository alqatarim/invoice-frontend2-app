'use client';

import React from 'react';
import { SnackbarProvider, closeSnackbar, MaterialDesignContent } from 'notistack';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { styled, alpha } from '@mui/material/styles';

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
  '&.notistack-MuiContent-warning': {
    backgroundColor: alpha(theme.palette.warning.main, 0.05),
    backdropFilter: 'blur(10px)',
    color: theme.palette.warning.main,
    boxShadow: `0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  },
  '&.notistack-MuiContent-info': {
    backgroundColor: alpha(theme.palette.info.main, 0.05),
    backdropFilter: 'blur(10px)',
    color: theme.palette.info.main,
    boxShadow: `0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  },
}));

const AppSnackbarProvider = ({ children, maxSnack = 3 }) => (
  <SnackbarProvider
    maxSnack={maxSnack}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
    {children}
  </SnackbarProvider>
);

export default AppSnackbarProvider;

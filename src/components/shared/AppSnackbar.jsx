'use client';

import React from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';

const StyledAlert = styled(Alert)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row-reverse',
  justifyContent: 'start',
  alignItems: 'center',
  padding: '4px 4px 4px 0px',
  minWidth: '350px',
  maxWidth: '500px',
  fontWeight: 600,
  gap: '8px',
  backdropFilter: 'blur(10px)',
  boxShadow: `0 4px 12px 0 ${alpha(theme.palette.common.black, 0.1)}`,
  '& .MuiAlert-icon': {
    margin: 0,
    padding: 0,
  },
  '& .MuiAlert-message': {
    padding: 0,
    margin: 0,
  },
  '&.MuiAlert-filledSuccess': {
    backgroundColor: alpha(theme.palette.success.main, 0.05),
    color: theme.palette.success.main,
  },
  '&.MuiAlert-filledError': {
    backgroundColor: alpha(theme.palette.error.main, 0.05),
    color: theme.palette.error.main,
  },
  '&.MuiAlert-filledWarning': {
    backgroundColor: alpha(theme.palette.warning.main, 0.05),
    color: theme.palette.warning.main,
  },
  '&.MuiAlert-filledInfo': {
    backgroundColor: alpha(theme.palette.info.main, 0.05),
    color: theme.palette.info.main,
  },
}));

const AppSnackbar = ({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 6000,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
}) => (
  <Snackbar
    open={open}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={anchorOrigin}
  >
    <StyledAlert
      onClose={onClose}
      severity={severity}
      variant="filled"
      iconMapping={{
        success: <Icon icon="mdi:check-circle" fontSize={24} />,
        error: <Icon icon="mdi:alert-circle" fontSize={24} />,
        warning: <Icon icon="mdi:alert" fontSize={24} />,
        info: <Icon icon="mdi:information" fontSize={24} />,
      }}
      action={
        <IconButton size="small" onClick={onClose} sx={{ ml: 1, color: 'inherit' }}>
          <Icon icon="mdi:close" fontSize={18} />
        </IconButton>
      }
    >
      {message}
    </StyledAlert>
  </Snackbar>
);

export default AppSnackbar;

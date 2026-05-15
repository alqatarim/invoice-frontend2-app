'use client'

import React from 'react'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import { SnackbarProvider, closeSnackbar } from 'notistack'

// Materio-styled Alert used as the snackbar surface.
// Inherits the global MuiAlert overrides from `@core/theme/overrides/alerts.jsx`
// (spacing(4) padding/gap, body1 typography, 30x30 white icon container, etc.).
// Only snackbar-specific tweaks (width, radius, shadow, action alignment) live here.
export const StyledAlert = styled(Alert)(({ theme }) => ({
  minWidth: 320,
  maxWidth: 480,
  alignItems: 'center',
  borderRadius: 'var(--mui-shape-borderRadius)',
  boxShadow: 'var(--mui-customShadows-md)',
  color: 'var(--mui-palette-common-white)',
  '& .MuiAlert-message': {
    flex: 1,
    fontWeight: 500,
    lineHeight: 1.5,
    paddingBlock: 0
  },
  '& .MuiAlert-action': {
    alignItems: 'center',
    alignSelf: 'center',
    marginInlineEnd: 0,
    paddingTop: 0,
    paddingLeft: theme.spacing(2)
  }
}))

export const snackbarIconMapping = {
  success: <i className='ri-checkbox-circle-line' />,
  error: <i className='ri-error-warning-line' />,
  warning: <i className='ri-alert-line' />,
  info: <i className='ri-information-line' />
}

const getAlertSeverity = variant => {
  if (['success', 'error', 'warning', 'info'].includes(variant)) {
    return variant
  }

  return 'info'
}

const AppSnackbarContent = React.forwardRef(function AppSnackbarContent(props, ref) {
  const { id, message, variant, style } = props

  const handleClose = () => closeSnackbar(id)

  return (
    <StyledAlert
      ref={ref}
      variant='filled'
      severity={getAlertSeverity(variant)}
      onClose={handleClose}
      style={style}
      iconMapping={snackbarIconMapping}
      action={
        <IconButton
          size='small'
          onClick={handleClose}
          aria-label='close'
          sx={{
            color: 'inherit',
            opacity: 0.85,
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.16)'
            }
          }}
        >
          <i className='ri-close-line' style={{ fontSize: '1.25rem' }} />
        </IconButton>
      }
    >
      {message}
    </StyledAlert>
  )
})

const AppSnackbarProvider = ({ children, maxSnack = 3 }) => (
  <SnackbarProvider
    maxSnack={maxSnack}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    autoHideDuration={5000}
    preventDuplicate
    Components={{
      default: AppSnackbarContent,
      success: AppSnackbarContent,
      error: AppSnackbarContent,
      warning: AppSnackbarContent,
      info: AppSnackbarContent
    }}
  >
    {children}
  </SnackbarProvider>
)

export default AppSnackbarProvider

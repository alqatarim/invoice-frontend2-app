'use client'

import React from 'react'
import { Snackbar, IconButton } from '@mui/material'

import { StyledAlert, snackbarIconMapping } from './AppSnackbarProvider'

const AppSnackbar = ({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 6000,
  anchorOrigin = { vertical: 'top', horizontal: 'right' }
}) => (
  <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose} anchorOrigin={anchorOrigin}>
    <StyledAlert
      onClose={onClose}
      severity={severity}
      variant='filled'
      iconMapping={snackbarIconMapping}
      action={
        <IconButton
          size='small'
          onClick={onClose}
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
  </Snackbar>
)

export default AppSnackbar

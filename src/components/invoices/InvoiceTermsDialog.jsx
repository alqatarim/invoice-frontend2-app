'use client';

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Clear } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const InvoiceTermsDialog = ({ controller, theme }) => (
  <Dialog
    open={controller.termsDialogOpen}
    onClose={controller.handleCloseTermsDialog}
    maxWidth='sm'
    fullWidth
  >
    <Box sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04), py: 3, px: 5 }}>
      <Typography variant='h5' sx={{ fontWeight: 600, color: 'primary.main' }}>
        Terms and Conditions
      </Typography>
    </Box>

    <DialogContent sx={{ py: 5, px: 5 }}>
      <TextField
        value={controller.tempTerms}
        onChange={(event) => controller.setTempTerms(event.target.value)}
        fullWidth
        multiline
        rows={5}
        variant='filled'
        placeholder='Enter your standard terms and conditions (payment terms, delivery terms, warranty information, etc.)'
        InputProps={{
          endAdornment: controller.tempTerms.trim() !== '' && (
            <InputAdornment position='end'>
              <IconButton
                onClick={controller.handleCloseTermsDialog}
                edge='end'
                className='transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95'
                title='Clear terms and conditions'
                size='small'
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </DialogContent>

    <Box className='flex flex-row justify-end gap-2 px-5 pb-4 pt-1'>
      <Button onClick={controller.handleCloseTermsDialog} variant='outlined' color='secondary'>
        Cancel
      </Button>
      <Button onClick={controller.handleSaveTerms} color='primary' variant='contained'>
        Save Changes
      </Button>
    </Box>
  </Dialog>
);

export default InvoiceTermsDialog;

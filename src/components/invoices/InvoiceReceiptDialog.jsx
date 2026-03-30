'use client';

import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Paper,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ContentCopy, Download, QrCode2 } from '@mui/icons-material';

const InvoiceReceiptDialog = ({
  open,
  loading,
  receiptText,
  onClose,
  onCopy,
  onDownload,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      PaperProps={{
        sx: {
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          maxHeight: '90vh',
        },
      }}
    >
      <DialogContent sx={{ p: 2 }}>
        {loading ? (
          <Box className='flex items-center justify-center py-8'>
            <CircularProgress size={32} color='primary' />
          </Box>
        ) : (
          <Paper
            sx={{
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              p: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box className='mb-3 flex items-center justify-center'>
              <QrCode2 sx={{ fontSize: 48, color: 'text.secondary' }} />
            </Box>
            <Typography
              component='pre'
              sx={{
                m: 0,
                fontSize: '0.75rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
              }}
            >
              {receiptText}
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          pt: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          gap: 1,
        }}
      >
        <Button variant='outlined' color='secondary' onClick={onClose}>
          Close
        </Button>
        <Button variant='outlined' color='primary' startIcon={<ContentCopy />} onClick={onCopy}>
          Copy
        </Button>
        <Button variant='contained' color='primary' startIcon={<Download />} onClick={onDownload}>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceReceiptDialog;

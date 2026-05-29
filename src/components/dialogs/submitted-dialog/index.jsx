'use client';

import React, { useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

const DEFAULT_PAGE_STYLE = '@page { size: A4; margin: 10mm; }';

const SubmittedDialog = ({
  open,
  onClose,
  onPrimaryAction,
  children,
  maxWidth = 'md',
  fullWidth = true,
  paperSx,
  contentSx,
  previewSx,
  actionsSx,
  closeLabel = 'Close',
  printLabel = 'Print',
  primaryLabel = 'New',
  primaryIcon = 'mdi:file-plus-outline',
  printIcon = 'mdi:printer-outline',
  printTitle = 'Document',
  printWindowFeatures = 'width=900,height=900',
  printPageStyle = DEFAULT_PAGE_STYLE,
}) => {
  const theme = useTheme();
  const previewRef = useRef(null);

  const handleClose = useCallback(
    (...args) => {
      if (onPrimaryAction) {
        onPrimaryAction(...args);
        return;
      }

      onClose?.(...args);
    },
    [onClose, onPrimaryAction]
  );

  const handlePrint = () => {
    if (typeof window === 'undefined' || !previewRef.current) return;

    const printWindow = window.open('', '_blank', printWindowFeatures);
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${printTitle}</title>
          <style>
            ${printPageStyle}
            html, body { margin: 0; padding: 0; background: #fff; }
            body { font-family: Arial, sans-serif; padding: 12px; color: #111; }
            * { box-sizing: border-box; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>${previewRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();

    const finalizePrint = () => {
      try {
        printWindow.focus();
        printWindow.print();
      } catch (error) {
        printWindow.close();
      }
    };

    printWindow.onafterprint = () => {
      printWindow.close();
    };
    printWindow.onload = finalizePrint;
    window.setTimeout(finalizePrint, 250);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          maxHeight: '92vh',
          borderRadius: 3,
          ...paperSx,
        },
      }}
    >
      <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center', ...contentSx }}>
        <Box ref={previewRef} sx={previewSx}>
          {typeof children === 'function' ? children() : children}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1.5,
          backgroundColor: alpha(theme.palette.primary.main, 0.02),
          gap: 1,
          ...actionsSx,
        }}
      >
        <Button variant="outlined" color="secondary" onClick={handleClose}>
          {closeLabel}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Icon icon={printIcon} width={18} />}
          onClick={handlePrint}
        >
          {printLabel}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={primaryIcon ? <Icon icon={primaryIcon} width={18} /> : null}
          onClick={handleClose}
        >
          {primaryLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmittedDialog;

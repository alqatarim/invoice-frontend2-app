'use client';

import React from 'react';
import { Box, Button } from '@mui/material';
import { Download, Print, QrCode2 } from '@mui/icons-material';

const InvoiceActionBar = ({ onPrint, onDownload, onViewReceipt }) => (
  <Box className='mb-4 flex flex-row justify-end gap-2 print:hidden'>
    <Button variant='outlined' color='secondary' startIcon={<Print />} onClick={onPrint}>
      Print
    </Button>
    <Button variant='outlined' color='primary' startIcon={<Download />} onClick={onDownload}>
      Download
    </Button>
    <Button variant='contained' color='primary' startIcon={<QrCode2 />} onClick={onViewReceipt}>
      View Receipt
    </Button>
  </Box>
);

export default InvoiceActionBar;

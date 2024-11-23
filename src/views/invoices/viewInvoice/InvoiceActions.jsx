'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  Button,
  Box,
} from '@mui/material';
import { Add as AddIcon, Send as SendIcon, Download as DownloadIcon, Print as PrintIcon, Edit as EditIcon } from '@mui/icons-material';
import AddPaymentDrawer from './AddPaymentDrawer'; // Ensure this path is correct
import SendInvoiceDrawer from './SendInvoiceDrawer'; // Ensure this path is correct
import { getLocalizedUrl } from '@/utils/i18n';

const InvoiceActions = ({ id, onButtonClick }) => {
  const router = useRouter();
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false);

  const handleOpenPaymentDrawer = () => {
    setPaymentDrawerOpen(true);
  };

  const handleClosePaymentDrawer = () => {
    setPaymentDrawerOpen(false);
  };

  const handleOpenSendDrawer = () => {
    setSendDrawerOpen(true);
  };

  const handleCloseSendDrawer = () => {
    setSendDrawerOpen(false);
  };

  return (
    <>
      <Card elevation={2}>
        <CardContent className="flex flex-col gap-4">
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleOpenSendDrawer}
          >
            Send Invoice
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
          <Box className="flex items-center gap-4">
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<PrintIcon />}
              onClick={onButtonClick}
            >
              Print
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<EditIcon />}
              component={Link}
              href={getLocalizedUrl(`/apps/invoice/edit/${id}`, 'en')} // Replace 'en' with dynamic locale if available
            >
              Edit
            </Button>
          </Box>
          <Button
            fullWidth
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleOpenPaymentDrawer}
          >
            Add Payment
          </Button>
        </CardContent>
      </Card>

      {/* Drawers */}
      <AddPaymentDrawer
        open={paymentDrawerOpen}
        handleClose={handleClosePaymentDrawer}
        invoiceId={id}
      />
      <SendInvoiceDrawer
        open={sendDrawerOpen}
        handleClose={handleCloseSendDrawer}
        invoiceId={id}
      />
    </>
  );
};

export default InvoiceActions;

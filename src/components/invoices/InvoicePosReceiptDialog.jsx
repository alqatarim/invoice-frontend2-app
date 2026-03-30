'use client';

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Typography,
} from '@mui/material';

const InvoicePosReceiptDialog = ({ controller }) => (
  <Dialog
    open={controller.posReceiptOpen}
    onClose={() => controller.setPosReceiptOpen(false)}
    maxWidth='sm'
    fullWidth
  >
    <DialogContent sx={{ py: 4 }}>
      <Box className='flex flex-col gap-2'>
        <Typography variant='h6'>Receipt Preview (Mock)</Typography>
        <Typography variant='body2' color='text.secondary'>
          Invoice: {controller.posReceiptData?.invoiceNumber || controller.displayInvoiceNumber}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Payment: {controller.posReceiptData?.payment_method || controller.watch('payment_method')}
        </Typography>
        <Divider />
        <Box className='flex flex-col gap-1'>
          {(controller.posReceiptData?.items || []).map((item, index) => (
            <Box key={`${item.productId}-${index}`} className='flex justify-between'>
              <Typography variant='body2'>
                {item.name || 'Item'} x {item.quantity || 1}
              </Typography>
              <Typography variant='body2'>
                {Number(item.amount || 0).toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Box>
        <Divider />
        <Box className='flex justify-between'>
          <Typography variant='body2'>Total</Typography>
          <Typography variant='body2' fontWeight={600}>
            {Number(controller.posReceiptData?.total || controller.totalAmount).toFixed(2)}
          </Typography>
        </Box>
        <Box className='flex justify-between'>
          <Typography variant='body2'>Tendered</Typography>
          <Typography variant='body2'>{Number(controller.posReceiptData?.tenderedAmount || 0).toFixed(2)}</Typography>
        </Box>
        <Box className='flex justify-between'>
          <Typography variant='body2'>Change</Typography>
          <Typography variant='body2'>{Number(controller.posReceiptData?.changeAmount || 0).toFixed(2)}</Typography>
        </Box>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button variant='outlined' onClick={() => controller.setPosReceiptOpen(false)}>
        Close
      </Button>
      <Button variant='outlined' color='secondary' onClick={controller.handlePrintReceipt}>
        Print Receipt
      </Button>
      <Button variant='contained' onClick={controller.handleNewSale}>
        New Sale
      </Button>
    </DialogActions>
  </Dialog>
);

export default InvoicePosReceiptDialog;

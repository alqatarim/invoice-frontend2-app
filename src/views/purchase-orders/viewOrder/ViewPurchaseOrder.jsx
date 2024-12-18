'use client';

import React, { useRef } from 'react';
import {
  Divider,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Print, Download } from '@mui/icons-material';
import Image from 'next/image';
import dayjs from 'dayjs';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatCurrency';
import { alpha } from '@mui/material/styles';

const ViewPurchaseOrder = ({ data }) => {
  const contentRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <Typography variant="h6">No purchase order data available</Typography>
      </Box>
    );
  }

  return (
    <div ref={contentRef}>
      <Card
        className="previewCard purchase-order-page"
        sx={{
          width: '210mm',
          minHeight: '297mm',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent sx={{
          display: 'box',
          margin: '30px',
          padding: '0px',
          border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)}`,
          borderRadius: 1,
          height: 'calc(100% - 70px)',
          flex: 1,
        }}>
          <Grid
            container
            sx={{
              alignItems: 'start',
              display: 'flex',
              flexDirection: 'column',
              '& > *': { width: '100%' }
            }}
          >
            {/* Header Section */}
            <Grid item sx={{
              borderRadius: '4px 4px 0 0',
              backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.075),
            }}>
              <Grid container className='flex justify-between p-4' mb={2}>
                <Grid item xs={2}>
                  <Grid container className='flex ' spacing={1}>
                    <Grid item xs={12} className='flex justify-center' >
                      <Image
                        src='/images/illustrations/objects/store-2.png'
                        alt="Company Logo"
                        width='80'
                        height='80'
                        priority
                      />
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Typography variant='h6' color='text.secondary'>
                        Store details
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={5}>
                  <Grid className='flex flex-row justify-center' container spacing={5}>
                    <Grid item xs={'auto'} sx={{ textAlign: 'right' }}>
                      <Typography variant='h6' color='text.secondary'>
                        Purchase Order No
                      </Typography>
                      <Typography variant='h6' color='text.secondary'>
                        Order date
                      </Typography>
                      <Typography variant='h6' color='text.secondary'>
                        Due date
                      </Typography>
                    </Grid>
                    <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                      <Typography variant='h6' fontWeight={700}>
                        {data.purchaseOrderId}
                      </Typography>
                      <Typography variant='h6' fontWeight={500}>
                        {dayjs(data.purchaseOrderDate).format('DD MMM YYYY')}
                      </Typography>
                      <Typography variant='h6' fontWeight={500}>
                        {dayjs(data.dueDate).format('DD MMM YYYY')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Vendor Details Section */}
            <Grid item>
              <Grid container
                borderBottom={(theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)}`}
                padding={4} mb={4} className='flex justify-between'>
                <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>
                    Vendor Details:
                  </Typography>
                  <Typography className='text-[14px]'>{data.vendorId?.vendor_name}</Typography>
                  <Typography className='text-[14px]'>{data.vendorId?.vendor_email}</Typography>
                  <Typography className='text-[14px]'>{data.vendorId?.vendor_phone}</Typography>
                </Grid>

                <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                  <Grid container className='flex'>
                    <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                      <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>
                        Bank Details:
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Grid container className='flex flex-row justify-center gap-3'>
                        <Grid item xs={5} sx={{ textAlign: 'right' }} className='flex flex-col gap-0.5'>
                          <Typography variant='body2'>Bank Name:</Typography>
                          <Typography variant='body2'>Account No:</Typography>
                          <Typography variant='body2'>Branch:</Typography>
                        </Grid>
                        <Grid item xs='auto' sx={{ textAlign: 'left' }} className='flex flex-col gap-0.5'>
                          <Typography className='text-[14px]' fontWeight={500}>{data.bank?.bankName}</Typography>
                          <Typography className='text-[14px]' fontWeight={500}>{data.bank?.accountNumber}</Typography>
                          <Typography className='text-[14px]' fontWeight={500}>{data.bank?.branch}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Items Table */}
            <Grid item padding={5}>
              <Box
                borderColor={(theme) => alpha(theme.palette.secondary.main, 0.15)}
                className='overflow-x-auto border rounded'
              >
                <Table
                  size='small'
                  sx={{
                    '& .MuiTableCell-root': {
                      borderColor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                    }
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell className='!bg-transparent'>#</TableCell>
                      <TableCell className='!bg-transparent'>Product</TableCell>
                      <TableCell className='!bg-transparent'>Qty</TableCell>
                      <TableCell className='!bg-transparent'>Rate</TableCell>
                      <TableCell className='!bg-transparent'>VAT</TableCell>
                      <TableCell className='!bg-transparent'>Discount</TableCell>
                      <TableCell className='!bg-transparent'>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.items?.map((item, index) => {
                      const quantity = Number(item.quantity) || 0;
                      const rate = Number(item.rate) || 0;
                      const tax = Number(item.tax) || 0;
                      const discount = Number(item.discount) || 0;
                      const amount = quantity * rate;
                      const discountAmount = (amount * discount) / 100;
                      const taxAmount = ((amount - discountAmount) * tax) / 100;
                      const totalAmount = amount - discountAmount + taxAmount;

                      return (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{quantity}</TableCell>
                          <TableCell>{formatCurrency(rate.toFixed(2))}</TableCell>
                          <TableCell>{tax.toFixed(2)}</TableCell>
                          <TableCell>{discount.toFixed(2)}</TableCell>
                          <TableCell>{formatCurrency(totalAmount.toFixed(2))}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Grid>

            {/* Totals Section */}
            <Grid item padding={5}>
              <Grid container spacing={4} className='justify-between'>
                <Grid item xs={7}>
                  <Typography variant="subtitle2" gutterBottom>
                    Terms & Conditions:
                  </Typography>
                  <Typography variant="body2">{data.termsAndCondition}</Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes:
                  </Typography>
                  <Typography variant="body2">{data.notes}</Typography>
                </Grid>

                <Grid item xs={3.25}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} className='flex flex-col gap-0'>
                      <Grid container spacing={1} alignItems="center" justifyContent='space-between'>
                        <Grid item xs={6} className='flex flex-col gap-1' sx={{ textAlign: 'right' }}>
                          <Typography className='text-[14px]' color="text.secondary">Subtotal:</Typography>
                          <Typography className='text-[14px]' color="text.secondary">Discount:</Typography>
                          <Typography className='text-[14px]' color="text.secondary">Tax:</Typography>
                        </Grid>
                        <Grid item xs={'auto'} className='flex flex-col gap-1' sx={{ textAlign: 'right' }}>
                          <Typography className='text-[14px]'>{formatCurrency(data.taxableAmount)}</Typography>
                          <Typography className='text-[14px]'>{`(${formatCurrency(data.totalDiscount)})`}</Typography>
                          <Typography className='text-[14px]'>{formatCurrency(data.vat)}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12} className='flex flex-col' sx={{ textAlign: 'center' }}>
                      <Divider sx={{ my: 1, borderColor: 'primary.info' }} />
                    </Grid>

                    <Grid item xs={12} className='flex flex-col gap-1.5' sx={{ textAlign: 'right' }}>
                      <Grid container spacing={1} justifyContent='space-between'>
                        <Grid item xs={6} className='flex flex-col gap-1.5' sx={{ textAlign: 'Right' }}>
                          <Typography className='text-[16px]' fontWeight={600} color="text.secondary">Total:</Typography>
                        </Grid>
                        <Grid item xs={'auto'} className='flex flex-col gap-1.5' sx={{ textAlign: 'right' }}>
                          <Typography className='text-[16px]' fontWeight={600}>{formatCurrency(data.TotalAmount)}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Signature Section */}
            {(data.signatureId?.signatureImage || data.signatureImage || data.signatureName) && (
              <Grid item padding={5}
                borderTop={(theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)}`}
                sx={{ mt: 'auto' }}
              >
                <Box className="flex justify-end">
                  <Box className="flex flex-col items-end gap-2">
                    {(data.signatureId?.signatureImage || data.signatureImage) && (
                      <img
                        src={data.signatureId?.signatureImage || data.signatureImage}
                        alt="Signature"
                        style={{ maxWidth: '150px' }}
                      />
                    )}
                    {data.signatureName && (
                      <Typography variant="caption" color="textSecondary">
                        {data.signatureName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewPurchaseOrder;
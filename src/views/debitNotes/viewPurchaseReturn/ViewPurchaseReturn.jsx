'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import Image from 'next/image';
import dayjs from 'dayjs';
import { formatCurrency } from '@/utils/formatCurrency';

// MUI Components
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Paper
} from '@mui/material';

const ViewPurchaseReturn = ({ debitNoteData }) => {
  const router = useRouter();
  const theme = useTheme();
  const contentRef = useRef(null);

  return (
    <div ref={contentRef}>
      <Card
        className="previewCard purchase-return-page"
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
                        Debit Note No
                      </Typography>
                      <Typography variant='h6' color='text.secondary'>
                        Return date
                      </Typography>
                      <Typography variant='h6' color='text.secondary'>
                        Due date
                      </Typography>
                    </Grid>
                    <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                      <Typography variant='h6' fontWeight={700}>
                        {debitNoteData.debit_note_id}
                      </Typography>
                      <Typography variant='h6' fontWeight={500}>
                        {dayjs(debitNoteData.debitNoteDate).format('DD MMM YYYY')}
                      </Typography>
                      <Typography variant='h6' fontWeight={500}>
                        {dayjs(debitNoteData.dueDate).format('DD MMM YYYY')}
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
                    Debit Note To:
                  </Typography>
                  <Typography className='text-[14px]'>{debitNoteData.vendorId?.vendor_name}</Typography>
                  <Typography className='text-[14px]'>{debitNoteData.vendorId?.vendor_email}</Typography>
                  <Typography className='text-[14px]'>{debitNoteData.vendorId?.vendor_phone}</Typography>
                </Grid>

                {debitNoteData.bank && (
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
                            <Typography className='text-[14px]' fontWeight={500}>{debitNoteData.bank?.bankName}</Typography>
                            <Typography className='text-[14px]' fontWeight={500}>{debitNoteData.bank?.accountNumber}</Typography>
                            <Typography className='text-[14px]' fontWeight={500}>{debitNoteData.bank?.branch || '-'}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
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
                      <TableCell className='!bg-transparent'>Product/Service</TableCell>
                      <TableCell className='!bg-transparent'>Qty</TableCell>
                      <TableCell className='!bg-transparent' align="right">Rate</TableCell>
                      <TableCell className='!bg-transparent' align="right">Discount</TableCell>
                      <TableCell className='!bg-transparent' align="right">Tax</TableCell>
                      <TableCell className='!bg-transparent' align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {debitNoteData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.rate)}</TableCell>
                        <TableCell align="right">
                          {item.discountType === 2
                            ? `${item.discount}% (${formatCurrency((item.rate * item.discount) / 100)})`
                            : formatCurrency(item.discount)}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(item.tax)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
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
                  <Typography variant="body2">{debitNoteData.termsAndCondition || '-'}</Typography>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Notes:
                  </Typography>
                  <Typography variant="body2">{debitNoteData.notes || '-'}</Typography>
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
                          <Typography className='text-[14px]'>{formatCurrency(debitNoteData.taxableAmount)}</Typography>
                          <Typography className='text-[14px]'>{`(${formatCurrency(debitNoteData.totalDiscount)})`}</Typography>
                          <Typography className='text-[14px]'>{formatCurrency(debitNoteData.vat)}</Typography>
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
                          <Typography className='text-[16px]' fontWeight={600}>{formatCurrency(debitNoteData.TotalAmount)}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Signature Section */}
            {(debitNoteData.signatureData || debitNoteData.signatureId?.signatureImage) && (
              <Grid item padding={5}
                borderTop={(theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)}`}
                sx={{ mt: 'auto' }}
              >
                <Box className="flex justify-end">
                  <Box className="flex flex-col items-end gap-2">
                    {debitNoteData.sign_type === 'eSignature' ? (
                      <>
                        {debitNoteData.signatureData && (
                          <img
                            src={debitNoteData.signatureData}
                            alt="E-Signature"
                            style={{ maxWidth: '150px' }}
                          />
                        )}
                        {debitNoteData.signatureName && (
                          <Typography variant="caption" color="textSecondary">
                            {debitNoteData.signatureName}
                          </Typography>
                        )}
                      </>
                    ) : (
                      <>
                        {debitNoteData.signatureId?.signatureImage && (
                          <img
                            src={debitNoteData.signatureId.signatureImage}
                            alt="Manual Signature"
                            style={{ maxWidth: '150px' }}
                          />
                        )}
                      </>
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

export default ViewPurchaseReturn;
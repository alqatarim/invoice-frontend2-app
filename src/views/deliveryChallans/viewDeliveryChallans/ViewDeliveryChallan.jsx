'use client';

import React, { useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import { Print, Download, Edit } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dayjs from 'dayjs';
import { formatCurrency } from '@/utils/currencyUtils';
import { alpha } from '@mui/material/styles';
import tableStyles from '@core/styles/table.module.css';
import { usePermission } from '@/Auth/usePermission';

const ViewDeliveryChallan = ({ deliveryChallanData, isLoading }) => {
  const contentRef = useRef(null);
  const router = useRouter();
  const canEdit = usePermission('deliveryChallan', 'update');

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!deliveryChallanData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <Typography variant="h6">No delivery challan data found</Typography>
      </Box>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    router.push(`/deliveryChallans/deliveryChallans-edit/${deliveryChallanData._id}`);
  };

  return (
    <div>
      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {canEdit && (
          <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>
            Edit
          </Button>
        )}
        <Button variant="outlined" startIcon={<Print />} onClick={handlePrint}>
          Print
        </Button>
      </Box>

      <div ref={contentRef}>
        <Card
          className="previewCard"
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
            border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)} `,
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
              <Grid item
                sx={{
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.075),
                }}
              >
                <Grid container className='flex justify-between p-4' mb={2} sx={{
                  alignItems: 'center',
                }}>
                  <Grid item xs={2}>
                    <Grid container className='flex justify-between' spacing={1}>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Image
                          src={ '/images/illustrations/objects/store-2.png'}
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

                  <Grid item xs={4}>
                    <Grid container spacing={5} >
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography variant='h6' color='text.secondary'>
                          DELIVERY CHALLAN
                        </Typography>
                        <Typography variant='h6' color='text.secondary'>
                          Challan Date
                        </Typography>
                        <Typography variant='h6' color='text.secondary'>
                          Due Date
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sx={{ textAlign: 'left' }}>
                        <Typography variant='h6' fontWeight={500}>
                          #{deliveryChallanData?.deliveryChallanNumber}
                        </Typography>
                        <Typography variant='h6' fontWeight={500}>
                          {dayjs(deliveryChallanData?.deliveryChallanDate).format('DD MMM YYYY')}
                        </Typography>
                        <Typography variant='h6' fontWeight={500}>
                          {deliveryChallanData?.dueDate ? dayjs(deliveryChallanData?.dueDate).format('DD MMM YYYY') : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              {/* Billing Details Section */}
              <Grid item>
                <Grid container
                  borderBottom={(theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)} `}
                  padding={4} mb={4} className='flex justify-between'>
                  <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                    <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>
                      Delivery To:
                    </Typography>
                    <Typography className='text-[14px]'>{deliveryChallanData?.customerId?.name}</Typography>
                    <Typography className='text-[14px]'>{deliveryChallanData?.deliveryAddress?.addressLine1}</Typography>
                    {deliveryChallanData?.deliveryAddress?.addressLine2 && (
                      <Typography className='text-[14px]'>{deliveryChallanData?.deliveryAddress?.addressLine2}</Typography>
                    )}
                    <Typography className='text-[14px]'>
                      {deliveryChallanData?.deliveryAddress?.city}, {deliveryChallanData?.deliveryAddress?.state} {deliveryChallanData?.deliveryAddress?.pincode}
                    </Typography>
                    <Typography className='text-[14px]'>{deliveryChallanData?.deliveryAddress?.country}</Typography>
                  </Grid>

                  {deliveryChallanData?.referenceNo && (
                    <Grid item xs={'auto'} sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>
                        Reference No:
                      </Typography>
                      <Typography className='text-[14px]'>{deliveryChallanData?.referenceNo}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              {/* Items Table */}
              <Grid item sx={{ flex: 1 }}>
                <Box sx={{ px: 4 }}>
                  <Table className={tableStyles.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Item & Description</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="center">Rate</TableCell>
                        <TableCell align="center">Discount</TableCell>
                        <TableCell align="center">Tax</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deliveryChallanData?.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
                            {item.description && (
                              <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">{item.quantity} {item.unit}</TableCell>
                          <TableCell align="center">{formatCurrency(item.rate)}</TableCell>
                          <TableCell align="center">
                            {item.discount > 0 ? `${item.discount}%` : '-'}
                          </TableCell>
                          <TableCell align="center">{item.tax}%</TableCell>
                          <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid>

              {/* Footer Section */}
              <Grid item>
                <Grid container spacing={2} sx={{ px: 4, py: 3 }}>
                  <Grid item xs={6}>
                    {deliveryChallanData?.notes && (
                      <>
                        <Typography variant="h6" gutterBottom>Notes</Typography>
                        <Typography variant="body2" color="text.secondary">{deliveryChallanData.notes}</Typography>
                      </>
                    )}
                    {deliveryChallanData?.termsAndCondition && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>Terms & Conditions</Typography>
                        <Typography variant="body2" color="text.secondary">{deliveryChallanData.termsAndCondition}</Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Grid container spacing={1} sx={{ maxWidth: 300 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2">Subtotal:</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">{formatCurrency(deliveryChallanData?.taxableAmount || 0)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">Discount:</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">-{formatCurrency(deliveryChallanData?.totalDiscount || 0)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2">Tax:</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">{formatCurrency(deliveryChallanData?.vat || 0)}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="h6">Total:</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" color="primary">
                            {formatCurrency(deliveryChallanData?.TotalAmount || 0)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Signature Section */}
                    {deliveryChallanData?.signatureImage && (
                      <Box sx={{ mt: 4, textAlign: 'right' }}>
                        <Typography variant="body2" gutterBottom>Authorized Signature</Typography>
                        <Box sx={{ border: '1px solid #e0e0e0', p: 1, display: 'inline-block' }}>
                          <img 
                            src={deliveryChallanData.signatureImage} 
                            alt="Signature" 
                            style={{ maxWidth: 150, height: 'auto' }}
                          />
                        </Box>
                        {deliveryChallanData?.signatureName && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {deliveryChallanData.signatureName}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewDeliveryChallan;
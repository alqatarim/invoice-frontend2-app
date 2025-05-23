'use client';

import React, { useRef, useEffect } from 'react';
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
} from '@mui/material';
import { Print, Download } from '@mui/icons-material';
import Image from 'next/image';
import dayjs from 'dayjs';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currencyUtils'; // Assuming you have this utility function
import { alpha } from '@mui/material/styles';
import tableStyles from '@core/styles/table.module.css'

// Styles for print
// import './print.css'; // Include necessary styles for print media

const ViewInvoice = ({ invoiceData, loading }) => {
  const contentRef = useRef(null);

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = dayjs();
    const due = dayjs(dueDate);
    return due.diff(today, 'day');
  };

  useEffect(() => {
    // Handle page breaks after component mounts
    const contentElement = contentRef.current;
    if (contentElement) {
      const pages = contentElement.querySelectorAll('.invoice-page');
      pages.forEach((page) => {
        const pageHeight = page.offsetHeight;
        if (pageHeight > 1123) {
          // Handle content overflow if needed
        }
      });
    }
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download functionality, e.g., PDF generation
  };

  return (
    <div ref={contentRef}>
      <Card
        className="previewCard invoice-page"
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
                          // src={invoiceData?.invoiceLogo || '/images/illustrations/objects/store-1.png'}
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
                                INVOICE
                            </Typography>

                            <Typography variant='h6' color='text.secondary'>
                                Issued Date
                            </Typography>

                            <Typography variant='h6' color='text.secondary'>
                                Due Date
                            </Typography>
                        </Grid>


                      <Grid item xs={6} sx={{ textAlign: 'left' }}>
                     <Typography variant='h6' fontWeight={500}>
                  #{invoiceData?.invoiceNumber}
                  </Typography>

                      <Typography variant='h6'  fontWeight={500}>
              {dayjs(invoiceData?.invoiceDate).format('DD MMM YYYY')}
                  </Typography>

                    <Typography variant='h6'  fontWeight={500}>
                  {dayjs(invoiceData?.dueDate).format('DD MMM YYYY')}
                  </Typography>
</Grid>

                   </Grid>


                </Grid>
              </Grid>
            </Grid>

            {/* Billing Details Section */}
            <Grid item>
              <Grid container
              borderBottom={ (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)} `}
              padding={4} mb={4} className='flex justify-between'>
                <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" color="primary" fontWeight={600}  gutterBottom>
                    Invoice To:
                  </Typography>
                  <Typography  className='text-[14px]'>{invoiceData?.customerId?.name}</Typography>
                  <Typography  className='text-[14px]'>{invoiceData?.customerId?.billingAddress?.addressLine1}</Typography>
                  <Typography  className='text-[14px]'>{invoiceData?.customerId?.billingAddress?.city}</Typography>
                  <Typography  className='text-[14px]'>{invoiceData?.customerId?.email}</Typography>
                  <Typography  className='text-[14px]'>{invoiceData?.customerId?.phone}</Typography>
                </Grid>

                <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                  <Grid container className='flex'>

                      <Grid item xs={'auto'} sx={{ textAlign: 'left' }}>
                          <Typography variant="h6" color="primary" fontWeight={600} gutterBottom >
                              Pay To:
                          </Typography>
                      </Grid>

                       <Grid item xs={12}>
                          <Grid container className='flex flex-row justify-center gap-3'>
                              <Grid item xs={5} sx={{ textAlign: 'right' }}  className='flex flex-col gap-0.5'>
                                  <Typography  variant='body2' >Name:</Typography>
                                  <Typography variant='body2' >Bank Name:</Typography>
                                  <Typography variant='body2' >Account No:</Typography>
                                  <Typography variant='body2' >Branch:</Typography>
                              </Grid>


                              <Grid item xs='auto' sx={{ textAlign: 'left' }} className='flex flex-col gap-0.5'>
                                  <Typography className='text-[14px]' fontWeight={500}>{invoiceData?.bank?.name}</Typography>
                                  <Typography className='text-[14px]' fontWeight={500}>{invoiceData?.bank?.bankName}</Typography>
                                  <Typography className='text-[14px]' fontWeight={500}>{invoiceData?.bank?.accountNumber}</Typography>
                                  <Typography className='text-[14px]' fontWeight={500}>{invoiceData?.bank?.branch}</Typography>
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
              borderColor= {(theme) => alpha(theme.palette.secondary.main, 0.15)}

              className='overflow-x-auto border  rounded'>
                <Table
                  size='small'
                  sx={{

                    '& .MuiTableCell-root': {
                     borderColor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                    }
                  }}
                >
                  <TableHead>
                    <TableRow className=''>
                      <TableCell className='!bg-transparent'>#</TableCell>
                      <TableCell className='!bg-transparent'>Item</TableCell>
                      <TableCell className='!bg-transparent'>Qty</TableCell>
                      <TableCell className='!bg-transparent'>Price</TableCell>
                      <TableCell className='!bg-transparent'>Discount</TableCell>
                      <TableCell className='!bg-transparent'>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceData?.items?.map((item, index) => (

                      <TableRow  key={index}>
                        <TableCell >{index + 1}</TableCell>
                        <TableCell >{item.name}</TableCell>
                        <TableCell >{item.quantity}</TableCell>
                        <TableCell >{formatCurrency(item.rate)}</TableCell>
                        <TableCell >{formatCurrency(item.discount)}</TableCell>
                        <TableCell >{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
   ))}
                  </TableBody>
                </Table>
              </Box>
            </Grid>
            {/* Totals and Bank Details Section */}
            <Grid item padding={5}>
              <Grid container spacing={4}  className='justify-between'>
                 {/* Terms and Signature */}
                <Grid item xs={7}>


                <Typography variant="subtitle2" gutterBottom>
                  Terms & Conditions:
                </Typography>
                <Typography variant="body2">{invoiceData?.termsAndCondition}</Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Notes:
                </Typography>
                <Typography variant="body2">{invoiceData?.notes}</Typography>


                </Grid>

                {/* Totals Section */}
                <Grid item xs={3.25}>
                   <Grid container  spacing={1} alignItems="center">

                     <Grid item xs={12} className='flex flex-col gap-0' >

                    <Grid container  spacing={1} alignItems="center" justifyContent='space-between'>

                     <Grid item xs={6} className='flex flex-col gap-1' sx={{ textAlign: 'right'}}>

                            <Typography className='text-[14px]'  color="text.secondary">Subtotal:</Typography>
                            <Typography className='text-[14px]'  color="text.secondary">Discount:</Typography>
                            <Typography className='text-[14px]'  color="text.secondary">VAT ({invoiceData?.items?.[0]?.form_updated_tax}%):</Typography>


                    </Grid>



                        <Grid item xs={'auto'} className='flex flex-col gap-1' sx={{ textAlign: 'right'}}>

                            <Typography className='text-[14px]'  >{formatCurrency(invoiceData?.taxableAmount)}</Typography>
                            <Typography className='text-[14px]'  >{`(${formatCurrency(invoiceData?.totalDiscount)})`}</Typography>
                            <Typography className='text-[14px]'  >{formatCurrency(invoiceData?.vat)}</Typography>


                        </Grid>
                    </Grid>



                    </Grid>

                    <Grid item xs={12} className='flex flex-col' sx={{ textAlign: 'center'}}>
                    <Divider sx={{ my: 1, borderColor: 'primary.info' }} />
                    </Grid>


                    <Grid item xs={12} className='flex flex-col gap-1.5' sx={{ textAlign: 'right'}}>

                    <Grid container  spacing={1} justifyContent='space-between'>

                     <Grid item xs={6} className='flex flex-col gap-1.5' sx={{ textAlign: 'Right'}}>

                            <Typography className='text-[16px]' fontWeight={600} color="text.secondary">Total:</Typography>

                     </Grid>

                         <Grid item xs={'auto'} className='flex flex-col gap-1.5' sx={{ textAlign: 'right'}}>

                             <Typography className='text-[16px]' fontWeight={600} >{formatCurrency(invoiceData?.TotalAmount)}</Typography>

                         </Grid>

                     </Grid>


                    </Grid>
                   </Grid>







                </Grid>







              </Grid>
            </Grid>

{/* Terms & Conditions and Signature */}
             <Grid item padding={5}
              borderTop={ (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)} `}
              borderBottom={ (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)} `}
              sx={{ mt: 'auto' }}
             >
               <Grid container spacing={4}  className='flex flex-row justify-between'>
                 {/* Terms and Signature */}
                <Grid item xs={'auto'}>

                <Typography variant="subtitle2" gutterBottom>
                  Terms & Conditions:
                </Typography>
                <Typography variant="body2">{invoiceData?.termsAndCondition}</Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Notes:
                </Typography>
                <Typography variant="body2">{invoiceData?.notes}</Typography>

                  </Grid>
                 <Grid item xs={'auto'}
                  border={(theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.075)}`}
                  borderRadius={2}
                  sx={{ mt: 4, textAlign: 'left' }}
                 >

                  <Typography variant="body2">{invoiceData?.signatureName}</Typography>
                  {invoiceData?.signatureImage && (
                    <img

                      src={invoiceData.signatureImage}
                      alt="Signature"
                      style={{ maxWidth: '150px', marginTop: '10px' }}
                    />
                  )}

                 </Grid>




                </Grid>
             </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewInvoice;
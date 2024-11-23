'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  Avatar,
  useTheme,
} from '@mui/material';
import moment from 'moment';
import Logo from '@components/layout/shared/Logo'
// Styled Components
import { styled } from '@mui/material/styles';
import tableStyles from '@core/styles/table.module.css'



const InvoiceView = ({ invoiceData, id }) => {

  return (
    <Card className='previewCard'>
      <CardContent className='sm:!p-6'>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <div className='p-5 bg-actionHover rounded'>
              <div className='flex justify-between gap-y-4 flex-col sm:flex-row'>
                <div className='flex flex-col gap-6'>
                  <div className='flex items-center'>
                    <Logo />
                  </div>
                  <div>
                    <Typography color='text.primary'>Office 149, 450 South Brand Brooklyn</Typography>
                    <Typography color='text.primary'>San Diego County, CA 91905, USA</Typography>
                    <Typography color='text.primary'>+1 (123) 456 7891, +44 (876) 543 2198</Typography>
                  </div>
                </div>
                <div className='flex flex-col gap-4'>
                  <Typography variant='h5'>{`Invoice #${id}`}</Typography>
                  <div className='flex flex-col gap-1'>
                    <Typography color='text.primary'>{`Date Issued:  ${moment(invoiceData?.invoiceDate).format('DD MMM YYYY')}`}</Typography>
                    <Typography color='text.primary'>{`Date Due: ${moment(invoiceData?.dueDate).format('DD MMM YYYY')}`}</Typography>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <div className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Invoice To:
                  </Typography>
                  <div>
                  <Typography>{invoiceData.companyName}</Typography>
                    <Typography>{invoiceData.customerId.email}</Typography>
                    <Typography>{invoiceData.customerId.phone}</Typography>
                    <Typography> {invoiceData.customerId.billingAddress.addressLine1}</Typography>
                    <Typography>{`${invoiceData.customerId.billingAddress.city}, ${invoiceData.customerId.billingAddress.state}, ${invoiceData.customerId.billingAddress.country}`}</Typography>

                  </div>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <div className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Bill To:
                  </Typography>
                  <div>


                  <div className='flex items-center gap-4'>
                  <Typography>{invoiceData.companyName}</Typography>
                  </div>

                  <div className='flex items-center gap-4'>
                  <Typography>{invoiceData.companyAddress}</Typography>
                  </div>

                  <div className='flex items-center gap-4'>
                  <Typography>{`${invoiceData.state}, ${invoiceData.pincode}`}</Typography>
                  </div>

                  <div className='flex items-center gap-4'>
                  <Typography>{invoiceData.country}</Typography>
                  </div>
                  </div>






                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <div className='overflow-x-auto border rounded'>
              <table  className={tableStyles.table + ' bs-20  gap-0'} >
                <thead className='' >
                  <tr  className=' border-be '>
                    <th    className='bs-0 !bg-transparent text-[13px]   '>Item / Service</th>
                    <th    className='bs-0 !bg-transparent text-[13px]  '>Unit</th>
                    <th    className='bs-0 !bg-transparent text-[13px]  '>Qty</th>
                    <th    className='bs-0 !bg-transparent text-[13px]  '>Rate/Price</th>
                    <th    className='bs-0 !bg-transparent text-[13px]  '>Discount</th>
                    <th    className='bs-0 !bg-transparent text-[13px]  '>Total</th>
                  </tr>
                </thead>
                <tbody>
                {invoiceData.items && invoiceData.items.length > 0 ? (
                  invoiceData.items.map((item, index) => (
                    <tr key={index}>
                      <td className='bs-0'>
                        <Typography fontSize='14px' color='text.primary'>{item.name || 'N/A'}</Typography>
                      </td>
                      <td className='bs-0'>
                        <Typography fontSize='14px' color='text.primary'>{item.units || 'N/A'}</Typography>
                      </td>
                      <td className='bs-0'>
                        <Typography fontSize='14px' color='text.primary'>{item.quantity || '0'}</Typography>
                      </td>
                      <td className='bs-0'>
                        <Typography fontSize='14px' color='text.primary'>${parseFloat(item.rate).toFixed(2)}</Typography>
                      </td>
                      <td className='bs-0'>
                        <Typography fontSize='14px' color='text.primary'>${parseFloat(item.discount || 0).toFixed(2)}</Typography>
                      </td>
                      <td className='bs-0'>
                        <Typography fontSize='14px' color='text.primary'>${parseFloat(item.amount).toFixed(2)}</Typography>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} align="center">
                      No items found.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </Grid>
          <Grid item xs={12}>
            <div className='flex justify-between flex-col gap-y-4 sm:flex-row'>
              <div className='flex flex-col gap-1 order-2 sm:order-[unset]'>
                <div className='flex items-center gap-2'>
                  <Typography className='font-medium' color='text.primary'>
                  Terms and Conditions:
                  </Typography>
                  <Typography>{invoiceData.termsAndCondition || 'N/A'}</Typography>
                </div>


                <div className='flex items-center gap-2'>
                <Typography className='font-medium' color='text.primary'>
                Notes:
                </Typography>
                <Typography>{invoiceData.notes || 'N/A'}</Typography>
              </div>
              </div>

              <div className='min-is-[200px]'>
                <div className='flex items-center justify-between'>
                  <Typography>Subtotal:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                      ${parseFloat(invoiceData.taxableAmount || 0).toFixed(2)}
                  </Typography>
                </div>
                <div className='flex items-center justify-between'>
                  <Typography>Discount:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                  ${parseFloat(invoiceData.totalDiscount || 0).toFixed(2)}
                  </Typography>
                </div>
                <div className='flex items-center justify-between'>
                  <Typography>Tax:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                  ${parseFloat(invoiceData.vat || 0).toFixed(2)}
                  </Typography>
                </div>
                <Divider className='mlb-2' />
                <div className='flex items-center justify-between'>
                  <Typography>Total:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                  ${parseFloat(invoiceData.TotalAmount || 0).toFixed(2)}
                  </Typography>
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12}>
            <Divider className='border-dashed' />
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <Typography component='span' className='font-medium' color='text.primary'>
                Note:
              </Typography>{' '}
              It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance
              projects. Thank You!
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default InvoiceView;

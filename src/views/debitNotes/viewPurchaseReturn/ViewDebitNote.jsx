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
  Chip,
} from '@mui/material';
import { Print, Download, Edit, ArrowBack } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import dayjs from 'dayjs';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currencyUtils';
import { alpha } from '@mui/material/styles';
import tableStyles from '@core/styles/table.module.css';

const ViewDebitNote = ({ debitNoteData, loading }) => {
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
      const pages = contentElement.querySelectorAll('.debit-note-page');
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
    <div className='flex flex-col gap-6'>
      {/* Header and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Icon icon="tabler:file-minus" className="text-white text-2xl" />
          </div>
          <div>
            <Typography variant="h5" className="font-semibold text-primary">
              Debit Note Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Debit Note: {debitNoteData?.debit_note_id}
            </Typography>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            component={Link}
            href="/debitNotes/purchaseReturn-list"
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Back to List
          </Button>
          <Button
            component={Link}
            href={`/debitNotes/purchaseReturn-edit/${debitNoteData?._id}`}
            variant="outlined"
            startIcon={<Edit />}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      </div>

      <div ref={contentRef}>
        <Card
          className="previewCard debit-note-page"
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
              <Grid item>
                <Box className="p-6 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <Icon icon="tabler:file-minus" className="text-white text-3xl" />
                      </div>
                      <div>
                        <Typography variant="h4" className="font-bold text-primary">
                          DEBIT NOTE
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          #{debitNoteData?.debit_note_id}
                        </Typography>
                      </div>
                    </div>

                    <div className="text-right">
                      <Typography variant="h6" className="font-semibold">
                        Company Name
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your Company Address
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: +1234567890
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Email: info@company.com
                      </Typography>
                    </div>
                  </div>
                </Box>
              </Grid>

              {/* Vendor and Debit Note Info */}
              <Grid item>
                <Box className="p-6 border-b">
                  <Grid container spacing={6}>
                    <Grid item xs={6}>
                      <Typography variant="h6" className="font-semibold mb-3">
                        Vendor Details
                      </Typography>
                      <Typography variant="body1" className="font-medium">
                        {debitNoteData?.vendorId?.vendor_name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {debitNoteData?.vendorId?.vendor_email || ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {debitNoteData?.vendorId?.vendor_phone || ''}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {debitNoteData?.vendorId?.billingAddress?.street}, {debitNoteData?.vendorId?.billingAddress?.city}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="h6" className="font-semibold mb-3">
                        Debit Note Information
                      </Typography>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Typography variant="body2" color="text.secondary">Date:</Typography>
                          <Typography variant="body2">
                            {debitNoteData?.purchaseOrderDate ? dayjs(debitNoteData.purchaseOrderDate).format('DD MMM YYYY') : 'N/A'}
                          </Typography>
                        </div>
                        <div className="flex justify-between">
                          <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                          <Typography variant="body2">
                            {debitNoteData?.dueDate ? dayjs(debitNoteData.dueDate).format('DD MMM YYYY') : 'N/A'}
                          </Typography>
                        </div>
                        <div className="flex justify-between">
                          <Typography variant="body2" color="text.secondary">Status:</Typography>
                          <Chip
                            size="small"
                            label={debitNoteData?.status || 'Draft'}
                            color="primary"
                            variant="outlined"
                          />
                        </div>
                        {debitNoteData?.dueDate && (
                          <div className="flex justify-between">
                            <Typography variant="body2" color="text.secondary">Days Remaining:</Typography>
                            <Typography variant="body2" color={getDaysRemaining(debitNoteData.dueDate) < 0 ? 'error.main' : 'text.primary'}>
                              {getDaysRemaining(debitNoteData.dueDate)} days
                            </Typography>
                          </div>
                        )}
                      </div>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Items Table */}
              <Grid item>
                <Box className="p-6 border-b">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Items
                  </Typography>
                  <Table className={tableStyles.table}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product/Service</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="center">Rate</TableCell>
                        <TableCell align="center">Discount</TableCell>
                        <TableCell align="center">Tax</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {debitNoteData?.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <Typography variant="body2" className="font-medium">
                                {item.name || item.productId?.name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Unit: {item.units || item.productId?.units || 'N/A'}
                              </Typography>
                            </div>
                          </TableCell>
                          <TableCell align="center">
                            {item.quantity || 0}
                          </TableCell>
                          <TableCell align="center">
                            {formatCurrency(item.rate || 0)}
                          </TableCell>
                          <TableCell align="center">
                            {item.discountValue || 0}{item.discountType === 1 ? '%' : ' SAR'}
                          </TableCell>
                          <TableCell align="center">
                            {item.taxInfo?.name || 'No Tax'} ({item.taxInfo?.taxRate || 0}%)
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.amount || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Grid>

              {/* Totals Section */}
              <Grid item>
                <Box className="p-6 border-b">
                  <Grid container spacing={6}>
                    <Grid item xs={6}>
                      {/* Notes */}
                      {debitNoteData?.notes && (
                        <div>
                          <Typography variant="h6" className="font-semibold mb-2">
                            Notes
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {debitNoteData.notes}
                          </Typography>
                        </div>
                      )}
                    </Grid>

                    <Grid item xs={6}>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Typography variant="body2">Subtotal:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(debitNoteData?.taxableAmount || 0)}
                          </Typography>
                        </div>
                        <div className="flex justify-between">
                          <Typography variant="body2">Discount:</Typography>
                          <Typography variant="body2">
                            -{formatCurrency(debitNoteData?.totalDiscount || 0)}
                          </Typography>
                        </div>
                        <div className="flex justify-between">
                          <Typography variant="body2">Tax (VAT):</Typography>
                          <Typography variant="body2">
                            {formatCurrency(debitNoteData?.vat || 0)}
                          </Typography>
                        </div>
                        <div className="flex justify-between">
                          <Typography variant="body2">Round Off:</Typography>
                          <Typography variant="body2">
                            {formatCurrency(debitNoteData?.roundOffValue || 0)}
                          </Typography>
                        </div>
                        <Divider />
                        <div className="flex justify-between">
                          <Typography variant="h6" className="font-semibold">Total:</Typography>
                          <Typography variant="h6" className="font-semibold">
                            {formatCurrency(debitNoteData?.TotalAmount || 0)}
                          </Typography>
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Terms and Signature */}
              <Grid item>
                <Box className="p-6">
                  <Grid container spacing={6}>
                    <Grid item xs={6}>
                      {debitNoteData?.termsAndCondition && (
                        <div>
                          <Typography variant="h6" className="font-semibold mb-2">
                            Terms & Conditions
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {debitNoteData.termsAndCondition}
                          </Typography>
                        </div>
                      )}
                    </Grid>

                    <Grid item xs={6}>
                      {debitNoteData?.signatureId && (
                        <div className="text-center">
                          <Typography variant="body2" color="text.secondary" className="mb-4">
                            Authorized Signature
                          </Typography>
                          <div className="border-t-2 border-gray-300 pt-2 mt-16">
                            <Typography variant="body2">
                              Signature
                            </Typography>
                          </div>
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewDebitNote;
'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import moment from 'moment';
import { formatCurrency } from '@/utils/formatCurrency';
import { Print, Download } from '@mui/icons-material';

const ViewInvoice = ({ invoiceData, loading }) => {
  const theme = useTheme();

  const [showHeader, setShowHeader] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [showProductsTable, setShowProductsTable] = useState(false);
  const [showTotals, setShowTotals] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    setShowHeader(true);
    setTimeout(() => setShowInvoiceDetails(true), 200);
    setTimeout(() => setShowProductsTable(true), 400);
    setTimeout(() => setShowTotals(true), 600);
    setTimeout(() => setShowSignature(true), 800);
  }, []);

  if (loading) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Loading...</Typography>
        </Grid>
      </Grid>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download functionality
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <div className={`transition-opacity duration-500 ${showHeader ? 'opacity-100' : 'opacity-0'}`}>
          <Typography variant="h5" gutterBottom>
            View Invoice
          </Typography>
        </div>
      </Grid>

      {/* Invoice Details */}
      <Grid item xs={12}>
        <div className={`transition-opacity duration-500 ${showInvoiceDetails ? 'opacity-100' : 'opacity-0'}`}>
          <Card>
            <CardContent>
              <Grid container spacing={6}>
                {/* Invoice Number */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Invoice Number
                  </Typography>
                  <Typography variant="body1">
                    {invoiceData?.invoiceNumber || '-'}
                  </Typography>
                </Grid>

                {/* Customer */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Customer
                  </Typography>
                  <Typography variant="body1">
                    {invoiceData?.customer?.name || '-'}
                  </Typography>
                </Grid>

                {/* Invoice Date */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Invoice Date
                  </Typography>
                  <Typography variant="body1">
                    {invoiceData?.invoiceDate ? moment(invoiceData.invoiceDate).format('DD MMM YYYY') : '-'}
                  </Typography>
                </Grid>

                {/* Due Date */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {invoiceData?.dueDate ? moment(invoiceData.dueDate).format('DD MMM YYYY') : '-'}
                  </Typography>
                </Grid>

                {/* Payment Method */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1">
                    {invoiceData?.payment_method || '-'}
                  </Typography>
                </Grid>

                {/* Reference No */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Reference No
                  </Typography>
                  <Typography variant="body1">
                    {invoiceData?.referenceNo || '-'}
                  </Typography>
                </Grid>
              </Grid>

              {/* Products Table */}
              <Box sx={{ my: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Products
                </Typography>

                {/* Products Table */}
                <Box sx={{ mb: 6 }}>
                  <Table size="small">
                    <TableHead
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.16),
                      }}
                    >
                      <TableRow>
                        <TableCell>Product / Service</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Rate</TableCell>
                        <TableCell>Discount</TableCell>
                        <TableCell>VAT</TableCell>
                        <TableCell>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoiceData?.items?.length > 0 ? (
                        invoiceData.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.units}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.rate)}</TableCell>
                            <TableCell>{formatCurrency(item.discount)}</TableCell>
                            <TableCell>{formatCurrency(item.tax)}</TableCell>
                            <TableCell>{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            No items added yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </div>
      </Grid>

      {/* Totals and Signature */}
      <Grid container spacing={2} sx={{ mt: 2, mb: 14 }}>
        <Grid item xs={6}>
          <div className={`transition-opacity duration-500 ${showTotals ? 'opacity-100' : 'opacity-0'}`}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bank Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" color="textSecondary">
                  Bank Name
                </Typography>
                <Typography variant="body1">
                  {invoiceData?.bank?.bankName || '-'}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                  Account Number
                </Typography>
                <Typography variant="body1">
                  {invoiceData?.bank?.accountNumber || '-'}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                  Account Holder Name
                </Typography>
                <Typography variant="body1">
                  {invoiceData?.bank?.name || '-'}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                  Branch Name
                </Typography>
                <Typography variant="body1">
                  {invoiceData?.bank?.branch || '-'}
                </Typography>

                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>
                  IFSC Code
                </Typography>
                <Typography variant="body1">
                  {invoiceData?.bank?.IFSCCode || '-'}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Notes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">{invoiceData?.notes || '-'}</Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                  Terms and Conditions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">{invoiceData?.termsAndCondition || '-'}</Typography>
              </CardContent>
            </Card>
          </div>
        </Grid>

        <Grid item xs={6}>
          <div className={`transition-opacity duration-500 ${showTotals ? 'opacity-100' : 'opacity-0'}`}>
            <Card>
              <CardContent>
                <Grid container spacing={0} sx={{ mt: 2 }}>
                  <Grid item xs={6} gap={2} className="flex flex-col items-start">
                    <Typography variant="subtitle1" sx={{ textAlign: 'left' }}>
                      Amount:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ textAlign: 'left' }}>
                      Discount:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ textAlign: 'left' }}>
                      VAT:
                    </Typography>
                    {invoiceData?.roundOff && (
                      <Typography variant="subtitle1" sx={{ textAlign: 'left' }}>
                        Round Off
                      </Typography>
                    )}
                    <Divider sx={{ width: '100%', my: 1 }} />
                    <Typography variant="h6" sx={{ textAlign: 'left' }}>
                      Total Amount:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} gap={2} className="flex flex-col items-end">
                    <Typography variant="h6" sx={{ textAlign: 'right' }}>
                      {formatCurrency(invoiceData?.taxableAmount || 0)}
                    </Typography>
                    <Typography variant="h6" sx={{ textAlign: 'right' }}>
                      {formatCurrency(invoiceData?.totalDiscount || 0)}
                    </Typography>
                    <Typography variant="h6" sx={{ textAlign: 'right' }}>
                      {formatCurrency(invoiceData?.vat || 0)}
                    </Typography>
                    {invoiceData?.roundOff && (
                      <Typography variant="h6" sx={{ textAlign: 'right' }}>
                        ({formatCurrency(invoiceData?.roundOffValue || 0)})
                      </Typography>
                    )}
                    <Divider sx={{ width: '100%', my: 1 }} />
                    <Typography variant="h6" sx={{ textAlign: 'right' }}>
                      {formatCurrency(invoiceData?.TotalAmount || 0)}
                    </Typography>
                  </Grid>
                </Grid>
                <Box className="flex flex-col mt-12" gap={1}>
                  <Typography variant="h6" gutterBottom>
                    Signature
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {invoiceData?.sign_type === 'eSignature' && invoiceData?.signatureData ? (
                    <>
                      <Typography variant="subtitle1">{invoiceData?.signatureName}</Typography>
                      <img
                        src={invoiceData.signatureData}
                        alt="Signature"
                        style={{
                          maxWidth: '60%',
                          marginBottom: '1rem',
                          border: '3px solid #eee',
                          borderRadius: '8px',
                          padding: '5px',
                        }}
                      />
                    </>
                  ) : invoiceData?.sign_type === 'manualSignature' && invoiceData?.signatureId ? (
                    <>
                      <Typography variant="subtitle1">{invoiceData?.signatureId.signatureName}</Typography>
                      <img
                        src={invoiceData.signatureId.signatureImage}
                        alt="Signature"
                        style={{
                          maxWidth: '60%',
                          marginBottom: '1rem',
                          border: '3px solid #eee',
                          borderRadius: '8px',
                          padding: '5px',
                        }}
                      />
                    </>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No signature provided.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box
        className="flex flex-row justify-center gap-8 p-3 shadow-md border-round"
        sx={{
          position: 'fixed',
          bottom: 50,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: (theme) => theme.palette.background.paper,
          borderRadius: '8px',
        }}
      >
        <Button variant="contained" color="primary" startIcon={<Print />} onClick={handlePrint}>
          Print
        </Button>
        <Button variant="outlined" color="primary" startIcon={<Download />} onClick={handleDownload}>
          Download
        </Button>
        <Link href="/invoices/invoice-list" passHref>
          <Button variant="contained" color="secondary">
            Back to List
          </Button>
        </Link>
      </Box>
    </Grid>
  );
};

export default ViewInvoice;
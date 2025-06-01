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
import { Print, Download } from '@mui/icons-material';
import Image from 'next/image';
import dayjs from 'dayjs';
import Link from 'next/link';
import { formatCurrency } from '@/utils/currencyUtils';
import { alpha } from '@mui/material/styles';
import tableStyles from '@core/styles/table.module.css'

const ViewPurchaseNew = ({ purchaseData, loading }) => {
  const contentRef = useRef(null);
  const purchase = purchaseData?.data || {};

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
      const pages = contentElement.querySelectorAll('.purchase-page');
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

  const getStatusChip = (status) => {
    const statusMap = {
      PAID: { color: 'success', label: 'Paid' },
      Pending: { color: 'warning', label: 'Pending' },
      Overdue: { color: 'error', label: 'Overdue' },
      Cancelled: { color: 'secondary', label: 'Cancelled' }
    };

    const statusConfig = statusMap[status] || { color: 'default', label: status };

    return (
      <Chip
        variant='tonal'
        size='small'
        color={statusConfig.color}
        label={statusConfig.label}
      />
    );
  };

  return (
    <div ref={contentRef}>
      <Card
        className="previewCard purchase-page"
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
            <Grid
              item
              sx={{
                width: '100%',
                padding: '20px 20px 10px 20px',
                backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.075),
              }}
            >
              <Grid container justifyContent="space-between" alignItems="flex-start">
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Image
                      src="/images/logo.png"
                      alt="Company Logo"
                      width={120}
                      height={40}
                      style={{ objectFit: 'contain' }}
                    />
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      Purchase Order
                    </Typography>
                  </Box>
                  
                  {/* Company Details */}
                  <Box>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      From:
                    </Typography>
                    <Typography variant="body1">Your Company Name</Typography>
                    <Typography variant="body2" color="text.secondary">
                      123 Business Street<br />
                      City, State 12345<br />
                      Email: info@company.com<br />
                      Phone: +1 234 567 8900
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={5}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Purchase Details
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Purchase ID:</Typography>
                        <Typography variant="body2" fontWeight="600">{purchase.purchaseId}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Purchase Date:</Typography>
                        <Typography variant="body2">{dayjs(purchase.purchaseDate).format('DD MMM YYYY')}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Due Date:</Typography>
                        <Typography variant="body2">{dayjs(purchase.dueDate).format('DD MMM YYYY')}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Status:</Typography>
                        {getStatusChip(purchase.status)}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Vendor Information */}
            <Grid item sx={{ width: '100%', padding: '20px' }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Vendor Information:
              </Typography>
              <Box sx={{ 
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                padding: 2,
                borderRadius: 1,
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <Typography variant="body1" fontWeight="600">
                  {purchase.vendorId?.vendor_name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {purchase.vendorId?.vendor_email || ''}<br />
                  {purchase.vendorId?.vendor_phone || ''}<br />
                  {purchase.vendorId?.vendor_address || ''}
                </Typography>
              </Box>
            </Grid>

            {/* Items Table */}
            <Grid item sx={{ width: '100%', padding: '0 20px' }}>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ padding: '0 0 10px 0' }}>
                Items:
              </Typography>
              
              <Table className={tableStyles.table} sx={{ border: `1px solid ${alpha('#000', 0.1)}` }}>
                <TableHead sx={{ backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.075) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${alpha('#000', 0.1)}` }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: `1px solid ${alpha('#000', 0.1)}` }}>Item</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, borderRight: `1px solid ${alpha('#000', 0.1)}` }}>Qty</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, borderRight: `1px solid ${alpha('#000', 0.1)}` }}>Rate</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, borderRight: `1px solid ${alpha('#000', 0.1)}` }}>Discount</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, borderRight: `1px solid ${alpha('#000', 0.1)}` }}>Tax</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchase.items?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ borderRight: `1px solid ${alpha('#000', 0.1)}` }}>{index + 1}</TableCell>
                      <TableCell sx={{ borderRight: `1px solid ${alpha('#000', 0.1)}` }}>
                        <Typography variant="body2" fontWeight="600">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.units}</Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ borderRight: `1px solid ${alpha('#000', 0.1)}` }}>{item.quantity}</TableCell>
                      <TableCell align="center" sx={{ borderRight: `1px solid ${alpha('#000', 0.1)}` }}>SAR {Number(item.rate || 0).toFixed(2)}</TableCell>
                      <TableCell align="center" sx={{ borderRight: `1px solid ${alpha('#000', 0.1)}` }}>SAR {Number(item.discount || 0).toFixed(2)}</TableCell>
                      <TableCell align="center" sx={{ borderRight: `1px solid ${alpha('#000', 0.1)}` }}>SAR {Number(item.tax || 0).toFixed(2)}</TableCell>
                      <TableCell align="right">SAR {Number(item.amount || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>

            {/* Totals Section */}
            <Grid item sx={{ width: '100%', padding: '20px' }}>
              <Grid container>
                <Grid item xs={7}></Grid>
                <Grid item xs={5}>
                  <Box sx={{ 
                    backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.05),
                    padding: 2,
                    borderRadius: 1,
                    border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">SAR {Number(purchase.subTotal || 0).toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Total Discount:</Typography>
                      <Typography variant="body2">SAR {Number(purchase.totalDiscount || 0).toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">VAT:</Typography>
                      <Typography variant="body2">SAR {Number(purchase.vat || 0).toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" fontWeight="600">Total:</Typography>
                      <Typography variant="h6" fontWeight="600" color="primary">
                        SAR {Number(purchase.TotalAmount || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Notes and Terms */}
            {(purchase.notes || purchase.termsAndCondition) && (
              <Grid item sx={{ width: '100%', padding: '20px' }}>
                <Grid container spacing={3}>
                  {purchase.notes && (
                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        Notes:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchase.notes}
                      </Typography>
                    </Grid>
                  )}
                  {purchase.termsAndCondition && (
                    <Grid item xs={6}>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        Terms & Conditions:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchase.termsAndCondition}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}

            {/* Signature */}
            {purchase.signatureUrl && (
              <Grid item sx={{ width: '100%', padding: '20px', textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Authorized Signature:
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Image
                    src={purchase.signatureUrl}
                    alt="Signature"
                    width={200}
                    height={100}
                    style={{ objectFit: 'contain' }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          padding: 2,
          '@media print': { display: 'none' }
        }}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
          >
            Download
          </Button>
          <Button
            variant="contained"
            component={Link}
            href={`/purchases/purchase-edit/${purchase._id}`}
          >
            Edit Purchase
          </Button>
        </Box>
      </Card>
    </div>
  );
};

export default ViewPurchaseNew;
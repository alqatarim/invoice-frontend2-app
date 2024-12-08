'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { usePermission } from '@/hooks/usePermission';
import dayjs from 'dayjs';

const ViewPurchaseOrder = ({ data }) => {
  const canUpdate = usePermission('purchaseOrder', 'update');
  const isAdmin = usePermission('purchaseOrder', 'isAdmin');

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    data.items.forEach(item => {
      const amount = item.quantity * item.rate;
      subtotal += amount;
      totalTax += (amount * (item.tax || 0)) / 100;
      totalDiscount += (amount * (item.discount || 0)) / 100;
    });

    return {
      subtotal,
      totalTax,
      totalDiscount,
      total: subtotal + totalTax - totalDiscount
    };
  };

  return (
    <Box className="flex flex-col gap-4 p-4">
      <Box className="flex justify-between items-center">
        <Typography variant="h5" color="primary">
          Purchase Order Details
        </Typography>
        <Box className="flex gap-2">
          {(canUpdate || isAdmin) && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              component={Link}
              href={`/purchase-orders/order-edit/${data._id}`}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/purchase-orders/order-list"
          >
            Back to List
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box className="flex flex-col gap-2">
                <Typography variant="subtitle2" color="textSecondary">
                  Purchase Order Number
                </Typography>
                <Typography variant="body1">
                  {data.purchaseOrderId}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="flex flex-col gap-2">
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={data.status}
                  color={data.status === 'PAID' ? 'success' : 'warning'}
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="flex flex-col gap-2">
                <Typography variant="subtitle2" color="textSecondary">
                  Vendor
                </Typography>
                <Typography variant="body1">
                  {data.vendorInfo?.vendor_name}
                  <br />
                  {data.vendorInfo?.vendor_email}
                  <br />
                  {data.vendorInfo?.vendor_phone}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box className="flex flex-col gap-2">
                <Typography variant="subtitle2" color="textSecondary">
                  Dates
                </Typography>
                <Typography variant="body1">
                  Order Date: {dayjs(data.purchaseOrderDate).format('DD/MM/YYYY')}
                  <br />
                  Due Date: {dayjs(data.dueDate).format('DD/MM/YYYY')}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider className="my-4" />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Tax (%)</TableCell>
                  <TableCell>Discount (%)</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.rate}</TableCell>
                    <TableCell>{item.tax || 0}%</TableCell>
                    <TableCell>{item.discount || 0}%</TableCell>
                    <TableCell align="right">
                      ${(item.quantity * item.rate * (1 - (item.discount || 0) / 100) * (1 + (item.tax || 0) / 100)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box className="mt-4 flex justify-end">
            <Grid container spacing={2} maxWidth="sm">
              <Grid item xs={6}>
                <Typography>Subtotal:</Typography>
              </Grid>
              <Grid item xs={6} className="text-right">
                <Typography>${calculateTotals().subtotal.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Tax:</Typography>
              </Grid>
              <Grid item xs={6} className="text-right">
                <Typography>${calculateTotals().totalTax.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Discount:</Typography>
              </Grid>
              <Grid item xs={6} className="text-right">
                <Typography>${calculateTotals().totalDiscount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">Total:</Typography>
              </Grid>
              <Grid item xs={6} className="text-right">
                <Typography variant="h6">${calculateTotals().total.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider className="my-4" />

          <Grid container spacing={3}>
            {data.bank && (
              <Grid item xs={12} md={6}>
                <Box className="flex flex-col gap-2">
                  <Typography variant="subtitle2" color="textSecondary">
                    Bank Details
                  </Typography>
                  <Typography variant="body1">
                    Bank: {data.bank.bankName}
                    <br />
                    Account: {data.bank.accountNumber}
                    <br />
                    Branch: {data.bank.branch}
                  </Typography>
                </Box>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <Box className="flex flex-col gap-2">
                <Typography variant="subtitle2" color="textSecondary">
                  Notes
                </Typography>
                <Typography variant="body1">
                  {data.notes || 'No notes'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box className="flex flex-col gap-2">
                <Typography variant="subtitle2" color="textSecondary">
                  Terms and Conditions
                </Typography>
                <Typography variant="body1">
                  {data.termsAndCondition || 'No terms and conditions'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {data.signatureData && (
            <Box className="mt-4">
              <Typography variant="subtitle2" color="textSecondary">
                Signature
              </Typography>
              <Box className="mt-2">
                <img
                  src={data.signatureData}
                  alt="Signature"
                  style={{ maxWidth: 200 }}
                />
                {data.signatureName && (
                  <Typography variant="caption" display="block">
                    {data.signatureName}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewPurchaseOrder;
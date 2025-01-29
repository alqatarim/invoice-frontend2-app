'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import CustomIconButton from '@core/components/mui/CustomIconButton';

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

// Other Dependencies
import dayjs from 'dayjs';

const ViewPurchaseReturn = ({ debitNoteData }) => {
  const router = useRouter();
  const theme = useTheme();

  // Calculate totals
  const totals = {
    subtotal: debitNoteData.items.reduce((sum, item) => sum + Number(item.rate || 0), 0),
    totalDiscount: debitNoteData.items.reduce((sum, item) => sum + Number(item.discount || 0), 0),
    vat: debitNoteData.items.reduce((sum, item) => sum + Number(item.tax || 0), 0),
    total: debitNoteData.totalAmount || 0
  };

  return (
    <Box className="p-4">
      {/* Header */}
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5" color="primary">
          View Purchase Return
        </Typography>
        <Box className="flex gap-2">
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push('/debitNotes/purchaseReturn-list')}
            startIcon={<Icon icon="mdi:arrow-left" />}
          >
            Back to List
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            href={`/debitNotes/purchaseReturn-edit/${debitNoteData._id}`}
            startIcon={<Icon icon="mdi:pencil" />}
          >
            Edit
          </Button>
        </Box>
      </Box>

      {/* Details Card */}
      <Card className="mb-4">
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Box className="flex flex-col gap-1">
                <Typography variant="subtitle2" color="text.secondary">
                  Debit Note ID
                </Typography>
                <Typography>{debitNoteData.debit_note_id}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Box className="flex flex-col gap-1">
                <Typography variant="subtitle2" color="text.secondary">
                  Vendor
                </Typography>
                <Typography>{debitNoteData.vendorInfo?.vendor_name}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Box className="flex flex-col gap-1">
                <Typography variant="subtitle2" color="text.secondary">
                  Return Date
                </Typography>
                <Typography>
                  {dayjs(debitNoteData.debitNoteDate).format('DD MMM YYYY')}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Box className="flex flex-col gap-1">
                <Typography variant="subtitle2" color="text.secondary">
                  Due Date
                </Typography>
                <Typography>
                  {dayjs(debitNoteData.dueDate).format('DD MMM YYYY')}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Box className="flex flex-col gap-1">
                <Typography variant="subtitle2" color="text.secondary">
                  Reference No
                </Typography>
                <Typography>{debitNoteData.referenceNo || '-'}</Typography>
              </Box>
            </Grid>

            {debitNoteData.bank && (
              <Grid item xs={12} md={6} lg={4}>
                <Box className="flex flex-col gap-1">
                  <Typography variant="subtitle2" color="text.secondary">
                    Bank Account
                  </Typography>
                  <Typography>
                    {debitNoteData.bank.bankName} - {debitNoteData.bank.accountNumber}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Items Card */}
      <Card className="mb-4">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Items
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead
                sx={{
                  backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <TableRow>
                  <TableCell>Product/Service</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Rate</TableCell>
                  <TableCell align="right">Discount</TableCell>
                  <TableCell align="right">Tax</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {debitNoteData.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.units?.symbol}</TableCell>
                    <TableCell align="right">${Number(item.rate).toFixed(2)}</TableCell>
                    <TableCell align="right">
                      {item.discountType === 2
                        ? `${item.discount}% (${((item.rate * item.discount) / 100).toFixed(2)})`
                        : `$${Number(item.discount).toFixed(2)}`}
                    </TableCell>
                    <TableCell align="right">${Number(item.tax).toFixed(2)}</TableCell>
                    <TableCell align="right">${Number(item.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals */}
          <Box className="flex justify-end mt-4">
            <Grid container spacing={2} sx={{ maxWidth: '300px' }}>
              <Grid item xs={6}>
                <Typography>Subtotal:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" align="right">
                  ${totals.subtotal.toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>Discount:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" align="right">
                  ${totals.totalDiscount.toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography>VAT:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" align="right">
                  ${totals.vat.toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="h6">Total:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6" align="right">
                  ${totals.total.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Notes & Terms Card */}
      <Card className="mb-4">
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography>{debitNoteData.notes || '-'}</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Terms and Conditions
              </Typography>
              <Typography>{debitNoteData.termsAndCondition || '-'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Signature Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Signature
          </Typography>

          {debitNoteData.sign_type === 'eSignature' ? (
            <Box className="flex flex-col items-center gap-2">
              <Typography variant="subtitle2" color="text.secondary">
                E-Signature
              </Typography>
              {debitNoteData.signatureData ? (
                <img
                  src={debitNoteData.signatureData}
                  alt="E-Signature"
                  style={{ maxWidth: '300px', maxHeight: '100px' }}
                />
              ) : (
                <Typography color="text.secondary">No signature available</Typography>
              )}
            </Box>
          ) : (
            <Box className="flex flex-col items-center gap-2">
              <Typography variant="subtitle2" color="text.secondary">
                Manual Signature
              </Typography>
              {debitNoteData.signatureId?.signatureImage ? (
                <img
                  src={debitNoteData.signatureId.signatureImage}
                  alt="Manual Signature"
                  style={{ maxWidth: '300px', maxHeight: '100px' }}
                />
              ) : (
                <Typography color="text.secondary">No signature available</Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewPurchaseReturn;
'use client';

import React from 'react';
import { Icon } from '@iconify/react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Divider,
  Paper,
  Chip,
  Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import dayjs from 'dayjs';

const ViewPurchaseReturn = ({ handlers }) => {
  const theme = useTheme();

  // Safety check for handlers
  if (!handlers || !handlers.debitNoteData) {
    return (
      <div className="p-6">
        <Typography>Loading purchase return data...</Typography>
      </div>
    );
  }

  const { debitNoteData, calculations } = handlers;

  // Format date helper
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return dayjs(date).format('DD MMM YYYY');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processed':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
      case 'cancelled':
        return 'error';
      case 'draft':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className={handlers.printMode ? 'print-mode' : ''}>
      {/* Header - Hidden in print mode */}
      {!handlers.printMode && (
        <Card className="mb-6 shadow-lg">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Icon icon="tabler:eye" className="text-white text-2xl" />
                </div>
                <div>
                  <Typography variant="h5" className="font-semibold text-gray-800">
                    Purchase Return Details
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    View purchase return / debit note information
                  </Typography>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  startIcon={<Icon icon="tabler:edit" />}
                  onClick={handlers.handleEdit}
                  size="small"
                >
                  Edit
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Icon icon="tabler:copy" />}
                  onClick={handlers.handleCloneDialogOpen}
                  size="small"
                >
                  Clone
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Icon icon="tabler:printer" />}
                  onClick={handlers.handlePrint}
                  size="small"
                >
                  Print
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Icon icon="tabler:trash" />}
                  onClick={handlers.handleDeleteDialogOpen}
                  size="small"
                >
                  Delete
                </Button>
                
                <Button
                  component={Link}
                  href="/debitNotes/purchaseReturn-list"
                  variant="outlined"
                  startIcon={<Icon icon="tabler:arrow-left" />}
                  size="small"
                >
                  Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print-ready Document */}
      <Card className="shadow-lg print:shadow-none print:border-none">
        <CardContent className="p-8 print:p-6">
          {/* Document Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Typography variant="h4" className="font-bold text-gray-800 mb-2">
                  PURCHASE RETURN
                </Typography>
                <Typography variant="h6" className="text-gray-600">
                  Debit Note
                </Typography>
              </div>
              
              <div className="text-right">
                <Typography variant="h6" className="font-semibold text-primary mb-1">
                  #{debitNoteData.debit_note_id}
                </Typography>
                <Chip 
                  label={debitNoteData.status || 'Pending'}
                  color={getStatusColor(debitNoteData.status)}
                  size="small"
                  className="print:hidden"
                />
              </div>
            </div>

            {/* Document Info */}
            <Grid container spacing={4} className="mb-6">
              <Grid item xs={12} sm={6}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">Issue Date:</Typography>
                    <Typography variant="body2" className="font-medium">
                      {formatDate(debitNoteData.purchaseOrderDate)}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600">Due Date:</Typography>
                    <Typography variant="body2" className="font-medium">
                      {formatDate(debitNoteData.dueDate)}
                    </Typography>
                  </div>
                  {debitNoteData.referenceNo && (
                    <div className="flex justify-between">
                      <Typography variant="body2" className="text-gray-600">Reference:</Typography>
                      <Typography variant="body2" className="font-medium">
                        {debitNoteData.referenceNo}
                      </Typography>
                    </div>
                  )}
                </div>
              </Grid>
            </Grid>
          </div>

          {/* Vendor Information */}
          <div className="mb-8">
            <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
              Vendor Information
            </Typography>
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="bg-blue-100 text-blue-600 w-12 h-12">
                    <Icon icon="tabler:building-store" />
                  </Avatar>
                  <div className="flex-1">
                    <Typography variant="h6" className="font-semibold mb-1">
                      {debitNoteData.vendorId?.vendor_name || 'N/A'}
                    </Typography>
                    {debitNoteData.vendorId?.vendor_email && (
                      <Typography variant="body2" className="text-gray-600 mb-1">
                        <Icon icon="tabler:mail" className="inline mr-1" />
                        {debitNoteData.vendorId.vendor_email}
                      </Typography>
                    )}
                    {debitNoteData.vendorId?.vendor_phone && (
                      <Typography variant="body2" className="text-gray-600">
                        <Icon icon="tabler:phone" className="inline mr-1" />
                        {debitNoteData.vendorId.vendor_phone}
                      </Typography>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
              Returned Items
            </Typography>
            <Paper className="overflow-hidden border border-gray-200">
              <TableContainer>
                <Table size="small">
                  <TableHead className="bg-gray-50">
                    <TableRow>
                      <TableCell className="font-semibold">#</TableCell>
                      <TableCell className="font-semibold">Product</TableCell>
                      <TableCell align="center" className="font-semibold">Qty</TableCell>
                      <TableCell align="center" className="font-semibold">Unit</TableCell>
                      <TableCell align="right" className="font-semibold">Rate</TableCell>
                      <TableCell align="right" className="font-semibold">Discount</TableCell>
                      <TableCell align="right" className="font-semibold">Tax</TableCell>
                      <TableCell align="right" className="font-semibold">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(debitNoteData.items || []).map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                              <Icon icon="tabler:box" className="text-blue-600 text-sm" />
                            </div>
                            <Typography variant="body2" className="font-medium">
                              {item.name}
                            </Typography>
                          </div>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" className="text-gray-600">
                            {item.unit}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {(Number(item.rate) || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" className="text-orange-600">
                            {(Number(item.discount) || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" className="text-blue-600">
                            {(Number(item.tax) || 0).toFixed(2)}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" className="font-medium text-green-600">
                            {(Number(item.amount) || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </div>

          {/* Totals Section */}
          <div className="mb-8">
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                {/* Notes */}
                {(debitNoteData.notes || debitNoteData.termsAndCondition) && (
                  <div>
                    <Typography variant="h6" className="font-semibold mb-3 text-gray-800">
                      Additional Information
                    </Typography>
                    {debitNoteData.notes && (
                      <div className="mb-3">
                        <Typography variant="body2" className="font-medium text-gray-700 mb-1">
                          Notes:
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 bg-gray-50 p-3 rounded">
                          {debitNoteData.notes}
                        </Typography>
                      </div>
                    )}
                    {debitNoteData.termsAndCondition && (
                      <div>
                        <Typography variant="body2" className="font-medium text-gray-700 mb-1">
                          Terms & Conditions:
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 bg-gray-50 p-3 rounded">
                          {debitNoteData.termsAndCondition}
                        </Typography>
                      </div>
                    )}
                  </div>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <CardContent className="p-4">
                    <Typography variant="h6" className="font-semibold mb-4 text-blue-800">
                      Return Summary
                    </Typography>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Typography variant="body2" className="text-gray-700">Subtotal:</Typography>
                        <Typography variant="body2" className="font-medium">
                          {calculations?.subtotal?.toFixed(2) || (Number(debitNoteData.taxableAmount || 0) + Number(debitNoteData.totalDiscount || 0)).toFixed(2)}
                        </Typography>
                      </div>
                      
                      <div className="flex justify-between">
                        <Typography variant="body2" className="text-gray-700">Discount:</Typography>
                        <Typography variant="body2" className="font-medium text-orange-600">
                          -{calculations?.totalDiscount?.toFixed(2) || (Number(debitNoteData.totalDiscount) || 0).toFixed(2)}
                        </Typography>
                      </div>
                      
                      <div className="flex justify-between">
                        <Typography variant="body2" className="text-gray-700">Taxable Amount:</Typography>
                        <Typography variant="body2" className="font-medium">
                          {calculations?.taxableAmount?.toFixed(2) || (Number(debitNoteData.taxableAmount) || 0).toFixed(2)}
                        </Typography>
                      </div>
                      
                      <div className="flex justify-between">
                        <Typography variant="body2" className="text-gray-700">Tax (VAT):</Typography>
                        <Typography variant="body2" className="font-medium text-blue-600">
                          {calculations?.totalTax?.toFixed(2) || (Number(debitNoteData.vat) || 0).toFixed(2)}
                        </Typography>
                      </div>
                      
                      <Divider className="my-2" />
                      
                      <div className="flex justify-between">
                        <Typography variant="h6" className="font-bold text-gray-800">Total Amount:</Typography>
                        <Typography variant="h6" className="font-bold text-green-600">
                          {calculations?.totalAmount?.toFixed(2) || (Number(debitNoteData.TotalAmount) || 0).toFixed(2)}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>

          {/* Signature Section */}
          {(debitNoteData.signatureImage || debitNoteData.signatureName) && (
            <div className="mb-8">
              <Typography variant="h6" className="font-semibold mb-4 text-gray-800">
                Authorized Signature
              </Typography>
              <div className="flex items-end justify-between">
                <div>
                  {debitNoteData.signatureImage && (
                    <div className="mb-2">
                      <img 
                        src={debitNoteData.signatureImage} 
                        alt="Signature" 
                        className="max-h-16 border border-gray-300 rounded p-1"
                      />
                    </div>
                  )}
                  {debitNoteData.signatureName && (
                    <Typography variant="body2" className="font-medium text-gray-700">
                      {debitNoteData.signatureName}
                    </Typography>
                  )}
                  <div className="mt-2 border-t border-gray-300 w-48 pt-1">
                    <Typography variant="caption" className="text-gray-500">
                      Authorized Signatory
                    </Typography>
                  </div>
                </div>
                
                <div className="text-right">
                  <Typography variant="body2" className="text-gray-600">
                    Date: {formatDate(debitNoteData.purchaseOrderDate)}
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {/* Bank Details */}
          {debitNoteData.bank && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Typography variant="h6" className="font-semibold mb-3 text-gray-800">
                Bank Details
              </Typography>
              <div className="flex items-center gap-3">
                <Icon icon="tabler:building-bank" className="text-blue-500 text-xl" />
                <div>
                  <Typography variant="body2" className="font-medium">
                    {debitNoteData.bank.bankName}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    Account: {debitNoteData.bank.accountNumber}
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={handlers.deleteDialogOpen}
        onClose={handlers.handleDeleteDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2 text-error">
          <Icon icon="tabler:alert-triangle" />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete purchase return <strong>"{debitNoteData.debit_note_id}"</strong>?
            This action cannot be undone and will permanently remove this purchase return from the system.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.handleDeleteDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handlers.handleDelete} 
            color="error" 
            variant="contained"
            disabled={handlers.isDeleting}
            startIcon={handlers.isDeleting ? <Icon icon="tabler:loader" className="animate-spin" /> : <Icon icon="tabler:trash" />}
          >
            {handlers.isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clone Confirmation Dialog */}
      <Dialog
        open={handlers.cloneDialogOpen}
        onClose={handlers.handleCloneDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2 text-info">
          <Icon icon="tabler:copy" />
          Clone Purchase Return
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clone purchase return <strong>"{debitNoteData.debit_note_id}"</strong>?
            This will create an exact copy that you can modify as needed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlers.handleCloneDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handlers.handleClone} 
            color="info" 
            variant="contained"
            disabled={handlers.isCloning}
            startIcon={handlers.isCloning ? <Icon icon="tabler:loader" className="animate-spin" /> : <Icon icon="tabler:copy" />}
          >
            {handlers.isCloning ? 'Cloning...' : 'Clone'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print-mode {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border-none {
            border: none !important;
          }
          
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
          
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewPurchaseReturn;
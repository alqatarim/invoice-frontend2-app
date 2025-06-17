'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Switch,
  Snackbar,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SignaturePad from 'react-signature-canvas';
import { usePurchaseReturnAddHandlers } from '@/handlers/purchaseReturn/add/usePurchaseReturnAddHandlers';
import Link from 'next/link';

const AddPurchaseReturn = ({
  vendors = [],
  products = [],
  taxRates = [],
  banks = [],
  signatures = []
}) => {
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handlers = usePurchaseReturnAddHandlers({
    vendors,
    products,
    taxRates,
    banks,
    signatures
  });

  // Initialize debit note number on mount
  useEffect(() => {
    handlers.generateDebitNoteNumber();
  }, []);

  // Update calculations when items change
  useEffect(() => {
    handlers.updateCalculations();
  }, [handlers.formData.items]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div>
      {/* Header */}
      <Card className="mb-6 shadow-lg">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Icon icon="tabler:plus" className="text-white text-2xl" />
              </div>
              <div>
                <Typography variant="h5" className="font-semibold text-gray-800">
                  Add Purchase Return
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Create a new purchase return / debit note
                </Typography>
              </div>
            </div>
            <Button
              component={Link}
              href="/debitNotes/purchaseReturn-list"
              variant="outlined"
              startIcon={<Icon icon="tabler:arrow-left" />}
            >
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} lg={8}>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              {/* Document Header */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <Typography variant="h6" className="mb-4 text-blue-800">
                  Purchase Return Details
                </Typography>

                <Grid container spacing={3}>
                  {/* Debit Note ID */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Purchase Return ID"
                      value={handlers.formData.debit_note_id}
                      disabled
                      variant="outlined"
                      className="bg-gray-50"
                    />
                  </Grid>

                  {/* Vendor Selection */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Vendor</InputLabel>
                      <Select
                        value={handlers.formData.vendorId}
                        onChange={(e) => handlers.handleFieldChange('vendorId', e.target.value)}
                        label="Select Vendor"
                      >
                        {vendors.map((vendor) => (
                          <MenuItem key={vendor._id} value={vendor._id}>
                            <div className="flex items-center gap-2">
                              <Icon icon="tabler:building-store" className="text-blue-500" />
                              {vendor.vendor_name}
                            </div>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Purchase Order Date */}
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Purchase Order Date"
                        value={handlers.formData.purchaseOrderDate}
                        onChange={(date) => handlers.handleFieldChange('purchaseOrderDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small'
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  {/* Due Date */}
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Due Date"
                        value={handlers.formData.dueDate}
                        onChange={(date) => handlers.handleFieldChange('dueDate', date)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small'
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>

                  {/* Reference Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Reference Number"
                      value={handlers.formData.referenceNo}
                      onChange={(e) => handlers.handleFieldChange('referenceNo', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </div>

              <Divider className="my-6" />

              {/* Items Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="tabler:package" className="text-green-600 text-xl" />
                    <Typography variant="h6" className="text-gray-800">
                      Items ({(handlers.formData.items || []).length})
                    </Typography>
                  </div>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Icon icon="tabler:plus" />}
                    onClick={handlers.handleProductDialogOpen}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    Add Product
                  </Button>
                </div>

                {/* Items Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {(handlers.formData.items || []).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Icon icon="tabler:package-off" className="text-4xl mb-2" />
                      <Typography color="textSecondary">
                        No items added yet. Click "Add Product" to get started.
                      </Typography>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Qty</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Unit</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Rate</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Discount</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Tax %</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Amount</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(handlers.formData.items || []).map((item, index) => (
                            <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                                    <Icon icon="tabler:box" className="text-blue-600 text-sm" />
                                  </div>
                                  <Typography variant="body2" className="font-medium">
                                    {item.name}
                                  </Typography>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handlers.handleItemChange(index, 'quantity', Number(e.target.value))}
                                  inputProps={{ min: 1 }}
                                  sx={{ width: 70 }}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Typography variant="body2" className="text-gray-600">
                                  {item.unit}
                                </Typography>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handlers.handleItemChange(index, 'rate', Number(e.target.value))}
                                  inputProps={{ min: 0, step: 0.01 }}
                                  sx={{ width: 90 }}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.discount}
                                  onChange={(e) => handlers.handleItemChange(index, 'discount', Number(e.target.value))}
                                  inputProps={{ min: 0 }}
                                  sx={{ width: 70 }}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <TextField
                                  size="small"
                                  type="number"
                                  value={item.tax}
                                  onChange={(e) => handlers.handleItemChange(index, 'tax', Number(e.target.value))}
                                  inputProps={{ min: 0, max: 100 }}
                                  sx={{ width: 70 }}
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Typography variant="body2" className="font-medium text-green-600">
                                  {Number(item.amount || 0).toFixed(2)}
                                </Typography>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handlers.handleRemoveItem(index)}
                                  className="hover:bg-red-50"
                                >
                                  <Icon icon="tabler:trash" />
                                </IconButton>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <Divider className="my-6" />

              {/* Notes and Terms */}
              <div className="mb-6">
                <Typography variant="h6" className="mb-4 text-gray-800">
                  Additional Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      size="small"
                      label="Notes"
                      value={handlers.formData.notes}
                      onChange={(e) => handlers.handleFieldChange('notes', e.target.value)}
                      placeholder="Add any internal notes..."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      size="small"
                      label="Terms and Conditions"
                      value={handlers.formData.termsAndCondition}
                      onChange={(e) => handlers.handleFieldChange('termsAndCondition', e.target.value)}
                      placeholder="Enter terms and conditions..."
                    />
                  </Grid>
                </Grid>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Sidebar */}
        <Grid item xs={12} lg={4}>
          <div className="sticky top-4 space-y-4">
            {/* Calculations Card */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" className="mb-4 text-gray-800">
                  Summary
                </Typography>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Typography className="text-gray-600">Subtotal:</Typography>
                    <Typography className="font-medium">
                      {Number(handlers.calculations?.subtotal || 0).toFixed(2)}
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography className="text-gray-600">Discount:</Typography>
                    <Typography className="font-medium text-orange-600">
                      -{Number(handlers.calculations?.totalDiscount || 0).toFixed(2)}
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography className="text-gray-600">Taxable Amount:</Typography>
                    <Typography className="font-medium">
                      {Number(handlers.calculations?.taxableAmount || 0).toFixed(2)}
                    </Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography className="text-gray-600">Tax:</Typography>
                    <Typography className="font-medium text-blue-600">
                      {Number(handlers.calculations?.totalTax || 0).toFixed(2)}
                    </Typography>
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <Typography variant="h6" className="text-gray-800">Total:</Typography>
                    <Typography variant="h6" className="font-bold text-green-600">
                      {Number(handlers.calculations?.totalAmount || 0).toFixed(2)}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <Typography variant="h6" className="mb-4 text-gray-800">
                  Settings
                </Typography>

                {/* Bank Selection */}
                <FormControl fullWidth className="mb-4" size="small">
                  <InputLabel>Bank Account</InputLabel>
                  <Select
                    value={handlers.formData.bank?._id || ''}
                    onChange={(e) => {
                      const bank = banks.find(b => b._id === e.target.value);
                      handlers.handleFieldChange('bank', bank);
                    }}
                    label="Bank Account"
                  >
                    {banks.map((bank) => (
                      <MenuItem key={bank._id} value={bank._id}>
                        <div className="flex items-center gap-2">
                          <Icon icon="tabler:building-bank" className="text-blue-500" />
                          {bank.accountNumber} - {bank.bankName}
                        </div>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Round Off */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={handlers.formData.roundOff}
                      onChange={(e) => handlers.handleFieldChange('roundOff', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Round Off"
                  className="mb-4"
                />

                <Divider className="my-4" />

                {/* Signature Section */}
                <Typography variant="h6" className="mb-3 text-gray-800">
                  Signature
                </Typography>

                <RadioGroup
                  value={handlers.formData.sign_type}
                  onChange={(e) => handlers.handleFieldChange('sign_type', e.target.value)}
                  className="mb-3"
                >
                  <FormControlLabel
                    value="eSignature"
                    control={<Radio size="small" />}
                    label="Electronic Signature"
                  />
                  <FormControlLabel
                    value="manualSignature"
                    control={<Radio size="small" />}
                    label="Manual Signature"
                  />
                </RadioGroup>

                {handlers.formData.sign_type === 'eSignature' && (
                  <div className="mt-3">
                    <TextField
                      fullWidth
                      size="small"
                      label="Signature Name"
                      value={handlers.formData.signatureName}
                      onChange={(e) => handlers.handleFieldChange('signatureName', e.target.value)}
                      className="mb-3"
                    />

                    <div className="border border-gray-300 rounded p-2 bg-gray-50">
                      <SignaturePad
                        ref={handlers.signatureRef}
                        canvasProps={{
                          width: 280,
                          height: 120,
                          className: 'signature-canvas w-full'
                        }}
                      />
                    </div>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handlers.handleSignatureClear}
                      className="mt-2"
                      startIcon={<Icon icon="tabler:refresh" />}
                    >
                      Clear
                    </Button>
                  </div>
                )}

                {handlers.formData.sign_type === 'manualSignature' && (
                  <FormControl fullWidth size="small" className="mt-3">
                    <InputLabel>Select Signature</InputLabel>
                    <Select
                      value={handlers.formData.signatureId}
                      onChange={(e) => handlers.handleFieldChange('signatureId', e.target.value)}
                      label="Select Signature"
                    >
                      {signatures.map((sig) => (
                        <MenuItem key={sig._id} value={sig._id}>
                          <div className="flex items-center gap-2">
                            <Icon icon="tabler:signature" className="text-purple-500" />
                            {sig.signatureName}
                          </div>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={handlers.isSubmitting || (handlers.formData.items || []).length === 0}
                    startIcon={
                      handlers.isSubmitting ?
                      <Icon icon="tabler:loader" className="animate-spin" /> :
                      <Icon icon="tabler:check" />
                    }
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    onClick={() => handlers.handleSubmit(handlers.formData)}
                  >
                    {handlers.isSubmitting ? 'Creating...' : 'Create Purchase Return'}
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    href="/debitNotes/purchaseReturn-list"
                    startIcon={<Icon icon="tabler:x" />}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>

      {/* Product Selection Dialog */}
      <Dialog
        open={handlers.productDialogOpen}
        onClose={handlers.handleProductDialogClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle className="flex items-center gap-2">
          <Icon icon="tabler:package" className="text-blue-500" />
          Select Product
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} className="pt-2">
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                  <CardContent
                    className="p-4"
                    onClick={() => handlers.handleAddItem(product)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <Icon icon="tabler:box" className="text-white" />
                      </div>
                      <Typography variant="h6" className="text-gray-800">
                        {product.name}
                      </Typography>
                    </div>
                    <Typography variant="body2" color="textSecondary" className="mb-1">
                      SKU: {product.sku || 'N/A'}
                    </Typography>
                    <Typography variant="body2" className="font-medium text-green-600">
                      Price: {Number(product.purchasePrice || 0).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handlers.handleProductDialogClose}
            startIcon={<Icon icon="tabler:x" />}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} className="w-full">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AddPurchaseReturn;
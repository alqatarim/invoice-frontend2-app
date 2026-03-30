'use client';

import React, { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomOriginalIconButton from '@core/components/mui/CustomOriginalIconButton';
import CustomerAutocomplete from '@/components/custom-components/CustomerAutocomplete';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';
import InvoiceTotals from '@/components/custom-components/InvoiceTotals';
import { getInvoiceFormColumns } from '@/views/invoices/invoiceColumns';

const EditInvoice = ({
  controller,
  customersData = [],
  productData = [],
}) => {
  const theme = useTheme();

  const columns = useMemo(
    () =>
      getInvoiceFormColumns({
        control: controller.control,
        errors: controller.errors,
        setValue: controller.setValue,
        getValues: controller.getValues,
        watchItems: controller.watchItems,
        productData,
        productsCloneData: controller.productsCloneData,
        discountMenu: controller.discountMenu,
        setDiscountMenu: controller.setDiscountMenu,
        taxMenu: controller.taxMenu,
        taxRates: controller.taxRates,
        theme,
        updateCalculatedFields: controller.updateCalculatedFields,
        handleUpdateItemProduct: controller.handleUpdateItemProduct,
        handleClearAppliedPromotion: controller.handleClearAppliedPromotion,
        handleClearScaleBarcode: controller.handleClearScaleBarcode,
        handleDeleteItem: controller.handleDeleteItem,
        handleAddEmptyRow: controller.handleAddEmptyRow,
        handleMenuItemClick: controller.handleMenuItemClick,
        handleTaxClick: controller.handleTaxClick,
        handleTaxClose: controller.handleTaxClose,
        handleTaxMenuItemClick: controller.handleTaxMenuItemClick,
        fields: controller.fields,
        autoFocusFirstProductCell: controller.autoFocusFirstProductCell,
      }),
    [
      controller.autoFocusFirstProductCell,
      controller.control,
      controller.discountMenu,
      controller.errors,
      controller.fields,
      controller.getValues,
      controller.handleAddEmptyRow,
      controller.handleClearAppliedPromotion,
      controller.handleClearScaleBarcode,
      controller.handleDeleteItem,
      controller.handleMenuItemClick,
      controller.handleTaxClick,
      controller.handleTaxClose,
      controller.handleTaxMenuItemClick,
      controller.handleUpdateItemProduct,
      controller.productsCloneData,
      controller.setDiscountMenu,
      controller.setValue,
      controller.taxMenu,
      controller.taxRates,
      controller.updateCalculatedFields,
      controller.watchItems,
      productData,
      theme,
    ]
  );

  const addRowButton = (
    <CustomIconButton
      className='flex flex-row items-center justify-center gap-3 w-[13rem]'
      variant='tonal'
      skin='lighter'
      color='primary'
      size='medium'
      onClick={controller.handleAddEmptyRow}
    >
      <Icon icon='mingcute:add-fill' color={theme.palette.primary.main} width={16} />
      <Typography variant='button' color='primary.main' fontSize={14}>
        Add Row
      </Typography>
    </CustomIconButton>
  );

  const emptyContent = (
    <Box className='flex flex-col items-center justify-center py-6 gap-2 text-center'>
      <Icon icon='mdi:cart-outline' width={36} color={theme.palette.primary.main} />
      <Typography variant='h6' color='text.primary'>
        No Items Added Yet
      </Typography>
      <Typography variant='body2' color='text.secondary' className='max-w-[300px]'>
        Click the `Add Item` button to add items to your invoice
      </Typography>
      <Button
        variant='outlined'
        color='primary'
        startIcon={<Icon icon='mingcute:add-fill' width={16} />}
        size='small'
        className='mt-1'
        onClick={controller.handleAddEmptyRow}
      >
        Add Item
      </Button>
    </Box>
  );

  return (
    <Grid container rowSpacing={4} columnSpacing={3}>
      <Grid size={{ xs: 12 }}>
        <div className='mb-5 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primaryLight text-primary'>
              <Icon icon='tabler:file-invoice' fontSize={26} />
            </div>
            <Typography variant='h5' className='font-semibold text-primary'>
              {controller.title}
            </Typography>
          </div>
        </div>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='py-3.5'>
            <Grid container columnSpacing={3} rowSpacing={4}>
              <Grid size={{ xs: 12 }} className='flex flex-col gap-2'>
                <Box className='flex flex-row items-center gap-1.5'>
                  <Box className='h-8 w-2 rounded-md bg-secondaryLight' />
                  <Typography variant='caption' fontWeight={500} fontSize='1rem'>
                    Invoice Details
                  </Typography>
                </Box>
                <Divider light textAlign='left' width='400px' />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Box className='flex h-full w-full items-center justify-between rounded-md bg-tableHeader px-3'>
                  <Typography variant='caption' className='text-[0.9rem]' color='text.secondary'>
                    Invoice Number
                  </Typography>
                  <Typography variant='h6' className='text-[1.1rem] font-medium'>
                    {controller.displayInvoiceNumber}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3, lg: 3 }}>
                <Controller
                  name='invoiceDate'
                  control={controller.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Invoice Date'
                      type='date'
                      variant='outlined'
                      fullWidth
                      size='small'
                      error={!!controller.errors.invoiceDate}
                      inputProps={{
                        max: new Date().toISOString().split('T')[0],
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  name='dueDate'
                  control={controller.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Due Date'
                      type='date'
                      variant='outlined'
                      fullWidth
                      size='small'
                      error={!!controller.errors.dueDate}
                      inputProps={{
                        min: controller.getValues('invoiceDate'),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  name='payment_method'
                  control={controller.control}
                  render={({ field }) => (
                    <FormControl fullWidth variant='outlined' error={!!controller.errors.payment_method}>
                      <InputLabel>Payment Method</InputLabel>
                      <Select {...field} label='Payment Method' size='small'>
                        {controller.paymentMethods.map((method) => (
                          <MenuItem key={method.value} value={method.value}>
                            {method.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {controller.errors.payment_method && (
                        <FormHelperText error>{controller.errors.payment_method.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  name='branchId'
                  control={controller.control}
                  render={({ field }) => (
                    <FormControl fullWidth variant='outlined' error={!!controller.errors.branchId}>
                      <InputLabel>Store</InputLabel>
                      <Select {...field} label='Store' size='small'>
                        {controller.storeBranches.map((branch) => (
                          <MenuItem key={branch._id || branch.branchId} value={branch.branchId}>
                            {branch.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {controller.errors.branchId && (
                        <FormHelperText error>{controller.errors.branchId.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid
                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                className='flex flex-row justify-between gap-1'
              >
                <Controller
                  name='bank'
                  control={controller.control}
                  render={({ field }) => (
                    <FormControl size='small' fullWidth variant='outlined' error={!!controller.errors.bank}>
                      <InputLabel size='small'>Select Bank</InputLabel>
                      <Select {...field} label='Select Bank' size='small'>
                        {controller.banks.map((bank) => (
                          <MenuItem key={bank._id} value={bank._id}>
                            {bank.bankName}
                          </MenuItem>
                        ))}
                      </Select>
                      {controller.errors.bank && (
                        <FormHelperText error>{controller.errors.bank.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
                <CustomIconButton
                  color='primary'
                  size='small'
                  variant='tonal'
                  skin='lighter'
                  onClick={() => controller.setOpenBankModal(true)}
                >
                  <Icon icon='mdi:bank-plus' width={26} />
                </CustomIconButton>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  name='referenceNo'
                  control={controller.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Reference No'
                      variant='outlined'
                      fullWidth
                      size='small'
                      error={!!controller.errors.referenceNo}
                      helperText={controller.errors.referenceNo?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Controller
                    name='signatureId'
                    control={controller.control}
                    render={({ field }) => (
                      <FormControl
                        fullWidth
                        error={!!controller.errors.signatureId}
                        variant='outlined'
                        size='small'
                      >
                        <InputLabel>Cashier Name</InputLabel>
                        <Select
                          className='h-[39px]'
                          label='Cashier Name'
                          value={field.value || ''}
                          onChange={(event) => {
                            const selected = controller.signOptions.find(
                              (signature) => signature._id === event.target.value
                            );
                            controller.handleSignatureSelection(selected, field);
                          }}
                        >
                          {controller.signOptions.map((option) => (
                            <MenuItem key={option._id} value={option._id}>
                              {option.signatureName}
                            </MenuItem>
                          ))}
                        </Select>
                        {controller.errors.signatureId && (
                          <FormHelperText error>{controller.errors.signatureId.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  name='notes'
                  control={controller.control}
                  render={({ field }) => (
                    <TextField
                      className='overflow-auto scrollbar-thin scrollbar-thumb-primary scrollbar-thumb-opacity-20 scrollbar-thumb-rounded'
                      {...field}
                      multiline
                      rows={controller.notesExpanded ? 4 : 1}
                      variant='outlined'
                      size='small'
                      placeholder='Add notes...'
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <CustomOriginalIconButton
                              onClick={controller.handleToggleNotes}
                              color='primary'
                              skin='light'
                            >
                              {controller.notesExpanded ? (
                                <Icon
                                  icon='mdi:keyboard-arrow-up'
                                  width={24}
                                  color={theme.palette.primary.main}
                                />
                              ) : (
                                <Icon
                                  icon='mdi:keyboard-arrow-down'
                                  width={24}
                                  color={theme.palette.primary.main}
                                />
                              )}
                            </CustomOriginalIconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 8, lg: 6 }}>
                <CustomerAutocomplete
                  control={controller.control}
                  errors={controller.errors}
                  customersData={customersData}
                  includeWalkInOption
                  onCustomerChange={controller.handleCustomerChange}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Button
                  fullWidth
                  className='flex flex-row items-center justify-center gap-0'
                  variant='text'
                  color='primary'
                  size='small'
                  startIcon={
                    <Icon icon='mdi:file-document-outline' width={24} color={theme.palette.primary.main} />
                  }
                  onClick={controller.handleOpenTermsDialog}
                >
                  Terms & Conditions
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, lg: 9.5 }}>
        <form onSubmit={controller.handleSubmit(controller.handleFormSubmit, controller.handleError)}>
          <Card>
            <CardContent className='flex flex-col gap-2 px-0 pt-0'>
              <Box
                sx={{
                  overflowX: 'auto',
                  '@media (max-width: 1024px)': {
                    marginBottom: 2,
                  },
                }}
              >
                <InvoiceItemsTable
                  columns={columns}
                  rows={controller.fields}
                  rowKey={(row, index) => row.id || index}
                  addRowButton={addRowButton}
                  emptyContent={emptyContent}
                />
              </Box>
            </CardContent>
          </Card>
        </form>
      </Grid>

      <Grid size={{ xs: 12, lg: 2.5 }}>
        <InvoiceTotals
          control={controller.control}
          handleSubmit={controller.handleSubmit}
          handleFormSubmit={controller.handleFormSubmit}
          handleError={controller.handleError}
        />
      </Grid>
    </Grid>
  );
};

export default EditInvoice;

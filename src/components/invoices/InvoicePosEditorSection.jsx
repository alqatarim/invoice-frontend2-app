'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import CustomIconButton from '@core/components/mui/CustomIconButton';
import CustomerAutocomplete from '@/components/custom-components/CustomerAutocomplete';
import InvoiceItemsTable from '@/components/custom-components/InvoiceItemsTable';

const InvoicePosEditorSection = ({
  controller,
  customersData = [],
  columns,
  addRowButton,
  emptyContent,
  theme,
}) => (
  <>
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent className='py-4'>
          <Grid container spacing={3} alignItems='center'>
            <Grid size={{ xs: 12, md: 1.5 }}>
              <TextField
                label='Invoice No'
                value={controller.displayInvoiceNumber}
                variant='outlined'
                fullWidth
                size='medium'
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 1.5 }}>
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
                    size='medium'
                    error={!!controller.errors.invoiceDate}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0],
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2.5 }}>
              <Controller
                name='branchId'
                control={controller.control}
                render={({ field }) => (
                  <FormControl fullWidth variant='outlined' error={!!controller.errors.branchId}>
                    <InputLabel size='medium'>Store</InputLabel>
                    <Select {...field} label='Store' size='medium'>
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

            <Grid size={{ xs: 12, md: 1.5 }}>
              <Controller
                name='payment_method'
                control={controller.control}
                render={({ field }) => (
                  <FormControl fullWidth variant='outlined' error={!!controller.errors.payment_method}>
                    <InputLabel size='medium'>Payment Method</InputLabel>
                    <Select {...field} label='Payment Method' size='medium'>
                      {controller.posPaymentMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <Controller
                name='signatureId'
                control={controller.control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!controller.errors.signatureId} variant='outlined'>
                    <InputLabel size='medium'>Cashier</InputLabel>
                    <Select
                      label='Cashier'
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
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <CustomerAutocomplete
                size='medium'
                control={controller.control}
                errors={controller.errors}
                customersData={customersData}
                includeWalkInOption
                onCustomerChange={controller.handleCustomerChange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>

    <Grid size={{ xs: 12 }}>
      <Box ref={controller.itemsSectionRef} sx={{ position: 'relative', mb: controller.checkoutSummarySpacer }}>
        <Card>
          <CardContent className='flex flex-col px-0 pt-0'>
            <InvoiceItemsTable
              tableHeadClassName='bg-errorLightest'
              columns={columns}
              rows={controller.fields}
              rowKey={(row, index) => row.id || index}
              addRowButton={addRowButton}
              emptyContent={emptyContent}
            />
          </CardContent>
        </Card>

        <Box
          ref={controller.checkoutSummaryRef}
          sx={{
            position: 'fixed',
            bottom: 16,
            zIndex: theme.zIndex.appBar + 1,
            ...controller.checkoutSummaryPosition,
          }}
        >
          <Card
            sx={{
              borderRadius: 2,
              width: '100%',
              maxWidth: 520,
              ml: 'auto',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
              <Grid container spacing={2} alignItems='stretch' direction={{ xs: 'row-reverse', md: 'row-reverse' }}>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    <Box className='flex flex-col gap-1.5'>
                      <TextField
                        label='Tendered Amount'
                        size='small'
                        value={controller.tenderedAmount}
                        onChange={(event) => controller.setTenderedAmount(event.target.value)}
                        placeholder='Enter tendered amount'
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start' sx={{ color: theme.palette.secondary.main }}>
                              <Icon icon='lucide:saudi-riyal' width={15} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label='Change'
                        size='small'
                        value={controller.changeAmount.toFixed(2)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start' sx={{ color: theme.palette.secondary.main }}>
                              <Icon icon='lucide:saudi-riyal' width={15} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
                      <Button
                        fullWidth
                        variant='contained'
                        color='success'
                        startIcon={<Icon icon='mdi:check-circle-outline' width={18} />}
                        onClick={controller.handleSubmit(controller.handleCompleteSale, controller.handleError)}
                      >
                        Complete Sale
                      </Button>

                      <Box className='flex flex-row items-center gap-1.5'>
                        <Button
                          variant='outlined'
                          color='warning'
                          size='small'
                          startIcon={<Icon icon='mdi:pause-circle-outline' width={16} />}
                          onClick={controller.handleHoldSale}
                          sx={{ flex: 1 }}
                        >
                          Hold
                        </Button>
                        <Button
                          variant='text'
                          size='small'
                          startIcon={<Icon icon='mdi:history' width={16} />}
                          onClick={() => controller.setShowHeldSales((prev) => !prev)}
                          sx={{ flex: 1, whiteSpace: 'nowrap' }}
                        >
                          Held ({controller.heldSales.length})
                        </Button>
                      </Box>

                      <Collapse in={controller.showHeldSales}>
                        <Box className='flex flex-col gap-1' sx={{ maxHeight: 150, overflowY: 'auto', pr: 0.5 }}>
                          {controller.heldSales.length === 0 && (
                            <Typography variant='caption' color='text.secondary'>
                              No held sales yet.
                            </Typography>
                          )}

                          {controller.heldSales.map((sale, index) => {
                            const holdLabel = sale.holdNumber || index + 1;

                            return (
                              <Box
                                key={sale.id}
                                className='flex items-center justify-between gap-2 rounded-md border px-2 py-1'
                                sx={{
                                  borderColor: 'divider',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.15s',
                                  '&:hover': { backgroundColor: 'action.hover' },
                                }}
                                onClick={() => controller.handleLoadHeldSale(sale)}
                              >
                                <Box className='flex flex-col'>
                                  <Typography variant='caption' color='text.secondary'>
                                    Hold {String(holdLabel).padStart(2, '0')}
                                  </Typography>
                                  <Typography variant='body2' fontWeight={600}>
                                    {Number(sale.total || 0).toFixed(2)} · {sale.items?.length || 0} items
                                  </Typography>
                                </Box>

                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    controller.handleDeleteHeldSale(sale.id);
                                  }}
                                >
                                  <Icon icon='mdi:trash-can-outline' width={16} />
                                </IconButton>
                              </Box>
                            );
                          })}
                        </Box>
                      </Collapse>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6, md: 6 }} sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <Box className='mt-0.5 flex flex-col gap-1.5'>
                      <Box className='flex items-center justify-between'>
                        <Typography variant='body2' color='text.secondary'>Subtotal</Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {Number(controller.watch('taxableAmount') || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box className='flex items-center justify-between'>
                        <Typography variant='body2' color='text.secondary'>Discount</Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {Number(controller.watch('totalDiscount') || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box className='flex items-center justify-between'>
                        <Typography variant='body2' color='text.secondary'>VAT</Typography>
                        <Typography variant='body2' fontWeight={600}>
                          {Number(controller.watch('vat') || 0).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1.25 }} />
                    <Box
                      className='flex items-center justify-between'
                      sx={{
                        py: 0.75,
                        px: 1,
                        mx: -0.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                      }}
                    >
                      <Typography variant='subtitle2' fontWeight={600}>Total</Typography>
                      <Typography variant='subtitle1' fontWeight={700} color='primary'>
                        {controller.totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Grid>
  </>
);

export default InvoicePosEditorSection;

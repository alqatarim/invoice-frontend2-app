// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import { styled } from '@mui/material/styles'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import { alpha } from '@mui/material/styles'
import Link from 'next/link';

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { format } from 'date-fns'

// ** Icon Imports
import { Icon } from '@iconify/react';

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Local Schema Import
import { quotationSchema } from './QuotationSchema'

// Styled Components
const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: 8
  }
}))

const CustomDatePicker = ({ label, error, value, onChange, helperText, ...props }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={value}
        onChange={onChange}
        slotProps={{
          textField: {
            fullWidth: true,
            error: error,
            helperText: helperText,
            sx: { '& .MuiInputBase-root': { borderRadius: 8 } }
          }
        }}
        label={label}
        {...props}
      />
    </LocalizationProvider>
  )
}

const CustomAutocomplete = ({ options, value, onChange, renderInput, getOptionLabel, ...props }) => {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={getOptionLabel}
      renderInput={renderInput}
      {...props}
    />
  )
}

// ** Main Component
const EditQuotation = ({
  quotation = {},
  customers = [],
  isSubmitting = false,
  onSubmit = () => {},
  resetData = () => {}
}) => {
  // ** State for calculations
  const [subTotal, setSubTotal] = useState(0)
  const [totalTax, setTotalTax] = useState(0)
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  // ** React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      quotation_id: '',
      customerId: '',
      quotation_date: new Date(),
      due_date: new Date(),
      reference_no: '',
      items: [
        {
          productId: '',
          name: '',
          quantity: 1,
          unit: '',
          rate: 0,
          tax: 0,
          discount: 0,
          discountValue: '0.00',
          amount: 0
        }
      ],
      subject: '',
      notes: '',
      termsAndCondition: '',
      status: 'Open',
      taxableAmount: 0,
      totalDiscount: 0,
      vat: 0,
      TotalAmount: 0,
      bank: '',
      sign_type: 'manualSignature',
      signatureId: null
    },
    resolver: yupResolver(quotationSchema)
  })

  // ** Field array for items
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  })

  // ** Watch items for calculations
  const watchItems = watch('items')

  // ** Calculate subtotal, tax, discount and total
  useEffect(() => {
    let subTotal = 0
    let totalTax = 0
    let totalDiscount = 0

    watchItems.forEach(item => {
      // Calculate line amount before discount and tax
      const lineAmount = Number(item.quantity) * Number(item.rate) || 0

      // Calculate discount
      let discountAmount = 0
      if (item.discountType === 'flat') {
        discountAmount = Number(item.discount) || 0
      } else {
        // Percentage discount
        discountAmount = lineAmount * (Number(item.discount) / 100) || 0
      }

      // Calculate tax amount
      const taxAmount = (lineAmount - discountAmount) * (Number(item.tax) / 100) || 0

      // Update subtotals
      subTotal += lineAmount
      totalDiscount += discountAmount
      totalTax += taxAmount

      // Update line item amount
      const itemAmount = lineAmount - discountAmount + taxAmount
      if (item.amount !== itemAmount) {
        item.amount = itemAmount
      }
    })

    // Calculate total amount
    const calculatedTotalAmount = subTotal - totalDiscount + totalTax

    // Update state and form values
    setSubTotal(subTotal)
    setTotalDiscount(totalDiscount)
    setTotalTax(totalTax)
    setTotalAmount(calculatedTotalAmount)

    setValue('subTotal', subTotal)
    setValue('totalDiscount', totalDiscount)
    setValue('totalTax', totalTax)
    setValue('totalAmount', calculatedTotalAmount)
  }, [watchItems, setValue])

  // ** Set form data when quotation data is available
  useEffect(() => {
    if (quotation && Object.keys(quotation).length > 0) {
      reset({
        quotation_id: quotation.quotation_id || '',
        customerId: quotation.customerId?._id || quotation.customerId || '',
        quotation_date: quotation.quotation_date ? new Date(quotation.quotation_date) : new Date(),
        due_date: quotation.due_date ? new Date(quotation.due_date) : new Date(),
        reference_no: quotation.reference_no || '',
        items: quotation.items?.length
          ? quotation.items.map(item => ({
              productId: item.productId || '',
              name: item.name || '',
              quantity: item.quantity || 1,
              unit: item.unit || '',
              rate: item.rate || 0,
              tax: item.tax || 0,
              discount: item.discount || 0,
              discountValue: item.discountValue || '0.00',
              amount: item.amount || 0
            }))
          : [
              {
                productId: '',
                name: '',
                quantity: 1,
                unit: '',
                rate: 0,
                tax: 0,
                discount: 0,
                discountValue: '0.00',
                amount: 0
              }
            ],
        subject: quotation.subject || '',
        notes: quotation.notes || '',
        termsAndCondition: quotation.termsAndCondition || '',
        status: quotation.status || 'Open',
        taxableAmount: quotation.taxableAmount || 0,
        totalDiscount: quotation.totalDiscount || 0,
        vat: quotation.vat || 0,
        TotalAmount: quotation.TotalAmount || 0,
        bank: quotation.bank || '',
        sign_type: quotation.sign_type || 'manualSignature',
        signatureId: quotation.signatureId?._id || quotation.signatureId || null
      })
    }
  }, [quotation, reset])

  // ** Handle form submit
  const onFormSubmit = data => {
    // Format the data to match the expected server structure
    const formattedData = {
      ...data,
      // Ensure we're sending the right field names
      TotalAmount: data.TotalAmount || totalAmount,
      vat: data.vat || totalTax,
      taxableAmount: data.taxableAmount || subTotal,
      // If customerId is an object (from the Autocomplete), extract the ID
      customerId: typeof data.customerId === 'object' ? data.customerId._id : data.customerId
    }

    onSubmit(formattedData)
  }

  // ** Handle adding a new item
  const handleAddItem = () => {
    append({
      productId: '',
      name: '',
      quantity: 1,
      unit: '',
      rate: 0,
      tax: 0,
      discount: 0,
      discountValue: '0.00',
      amount: 0
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {/* Enhanced Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 6,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 3, sm: 0 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.15),
              color: 'primary.main',
              boxShadow: theme => `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`
            }}
          >
            <Icon icon="tabler:file-analytics" fontSize={28} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Edit Quotation
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={resetData}
          startIcon={<Icon icon="tabler:refresh" />}
          sx={{ boxShadow: theme => `0 2px 8px ${alpha(theme.palette.secondary.main, 0.15)}` }}
        >
          Reset
        </Button>
      </Box>

      <Card sx={{ borderRadius: '14px', boxShadow: theme => `0 3px 6px ${alpha(theme.palette.common.black, 0.06)}` }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container spacing={5}>
            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Customer Information
                </Typography>
                <Controller
                  name='customerId'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <CustomAutocomplete
                      options={customers || []}
                      getOptionLabel={option => option.name || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label='Customer'
                          error={Boolean(errors.customerId)}
                          helperText={errors.customerId?.message}
                        />
                      )}
                      onChange={(_, data) => onChange(data?._id || '')}
                      value={(customers || []).find(customer => customer._id === value) || null}
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Quotation Details */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Quotation Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='quotation_id'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Quotation Number'
                          placeholder='QUO-000001'
                          error={Boolean(errors.quotation_id)}
                          helperText={errors.quotation_id?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='status'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          select
                          fullWidth
                          label='Status'
                          error={Boolean(errors.status)}
                          helperText={errors.status?.message}
                        >
                          <MenuItem value='Open'>Open</MenuItem>
                          <MenuItem value='Sent'>Sent</MenuItem>
                          <MenuItem value='Accepted'>Accepted</MenuItem>
                          <MenuItem value='Declined'>Declined</MenuItem>
                          <MenuItem value='Expired'>Expired</MenuItem>
                        </CustomTextField>
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Dates Section */}
            <Grid item xs={12}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Dates
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='quotation_date'
                      control={control}
                      render={({ field }) => (
                        <CustomDatePicker
                          {...field}
                          label='Quotation Date'
                          error={Boolean(errors.quotation_date)}
                          helperText={errors.quotation_date?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='due_date'
                      control={control}
                      render={({ field }) => (
                        <CustomDatePicker
                          {...field}
                          label='Due Date'
                          error={Boolean(errors.due_date)}
                          helperText={errors.due_date?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Additional Details */}
            <Grid item xs={12}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Additional Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='reference_no'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Reference Number (optional)'
                          placeholder='REF-0000'
                          error={Boolean(errors.reference_no)}
                          helperText={errors.reference_no?.message}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name='subject'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          label='Subject (optional)'
                          placeholder='Quotation Subject'
                          error={Boolean(errors.subject)}
                          helperText={errors.subject?.message}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Item List */}
            <Grid item xs={12}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Item List
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: '14px',
                    border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    mb: 3,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: theme => `0 3px 6px ${alpha(theme.palette.common.black, 0.06)}`
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme => alpha(theme.palette.background.default, 0.7) }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Item</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Unit</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Rate</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Tax</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Discount</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '15px', py: 2.2 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((item, index) => (
                        <TableRow
                          key={item.id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { backgroundColor: theme => alpha(theme.palette.primary.main, 0.04) }
                          }}
                        >
                          {/* Item Name */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.name`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  fullWidth
                                  size='small'
                                  placeholder='Item Name'
                                  error={Boolean(errors.items?.[index]?.name)}
                                  helperText={errors.items?.[index]?.name?.message}
                                />
                              )}
                            />
                            <Controller
                              name={`items.${index}.productId`}
                              control={control}
                              render={({ field }) => <input type="hidden" {...field} />}
                            />
                          </TableCell>

                          {/* Quantity */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.quantity`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  type='number'
                                  size='small'
                                  inputProps={{ min: 1 }}
                                  error={Boolean(errors.items?.[index]?.quantity)}
                                  helperText={errors.items?.[index]?.quantity?.message}
                                  onChange={e => {
                                    field.onChange(e.target.valueAsNumber || 0)
                                  }}
                                />
                              )}
                            />
                          </TableCell>

                          {/* Unit */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.unit`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  size='small'
                                  placeholder='Unit'
                                  error={Boolean(errors.items?.[index]?.unit)}
                                  helperText={errors.items?.[index]?.unit?.message}
                                />
                              )}
                            />
                          </TableCell>

                          {/* Rate */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.rate`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  type='number'
                                  size='small'
                                  inputProps={{ min: 0 }}
                                  error={Boolean(errors.items?.[index]?.rate)}
                                  helperText={errors.items?.[index]?.rate?.message}
                                  onChange={e => {
                                    field.onChange(e.target.valueAsNumber || 0)
                                  }}
                                />
                              )}
                            />
                          </TableCell>

                          {/* Tax */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.tax`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  type='number'
                                  size='small'
                                  inputProps={{ min: 0 }}
                                  error={Boolean(errors.items?.[index]?.tax)}
                                  helperText={errors.items?.[index]?.tax?.message}
                                  onChange={e => {
                                    field.onChange(e.target.valueAsNumber || 0)
                                  }}
                                />
                              )}
                            />
                          </TableCell>

                          {/* Discount */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.discount`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  type='number'
                                  size='small'
                                  inputProps={{ min: 0 }}
                                  error={Boolean(errors.items?.[index]?.discount)}
                                  helperText={errors.items?.[index]?.discount?.message}
                                  onChange={e => {
                                    field.onChange(e.target.valueAsNumber || 0)
                                  }}
                                />
                              )}
                            />
                            <Controller
                              name={`items.${index}.discountValue`}
                              control={control}
                              render={({ field }) => <input type="hidden" {...field} />}
                            />
                          </TableCell>

                          {/* Line Amount */}
                          <TableCell>
                            <Controller
                              name={`items.${index}.amount`}
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  disabled
                                  type='text'
                                  size='small'
                                  value={typeof field.value === 'number' ? Number(field.value).toFixed(2) : field.value}
                                />
                              )}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell>
                            <IconButton
                              size='small'
                              onClick={() => {
                                if (fields.length > 1) {
                                  remove(index)
                                }
                              }}
                              disabled={fields.length <= 1}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: theme => alpha(theme.palette.error.main, 0.1)
                                }
                              }}
                            >
                              <Icon icon='mdi:delete-outline' fontSize={20} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Button
                  variant='contained'
                  onClick={handleAddItem}
                  startIcon={<Icon icon='mdi:plus' />}
                  sx={{
                    mt: 2,
                    boxShadow: theme => `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderRadius: '8px'
                  }}
                >
                  Add Item
                </Button>
              </Box>
            </Grid>

            {/* Notes & Terms */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Notes
                </Typography>
                <Controller
                  name='notes'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      rows={5}
                      multiline
                      label='Notes (optional)'
                      placeholder='Notes for the customer'
                      error={Boolean(errors.notes)}
                      helperText={errors.notes?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: theme => alpha(theme.palette.background.paper, 0.6)
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Terms & Conditions
                </Typography>
                <Controller
                  name='termsAndCondition'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      rows={5}
                      multiline
                      label='Terms & Conditions (optional)'
                      placeholder='Terms and conditions for the quotation'
                      error={Boolean(errors.termsAndCondition)}
                      helperText={errors.termsAndCondition?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: theme => alpha(theme.palette.background.paper, 0.6)
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Signature & Bank */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Signature
                </Typography>
                <Controller
                  name='sign_type'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      select
                      fullWidth
                      label='Signature Type'
                      error={Boolean(errors.sign_type)}
                      helperText={errors.sign_type?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px'
                        }
                      }}
                    >
                      <MenuItem value='manualSignature'>Manual Signature</MenuItem>
                      <MenuItem value='digitalSignature'>Digital Signature</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 3 }}>
                  Bank Details
                </Typography>
                <Controller
                  name='bank'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Bank (optional)'
                      placeholder='Bank Details'
                      error={Boolean(errors.bank)}
                      helperText={errors.bank?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px'
                        }
                      }}
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Totals Section */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 4 }}>
                <Box
                  sx={{
                    width: { xs: '100%', sm: '60%', md: '40%' },
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    ml: 'auto',
                    background: theme => `
                      linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box,
                      linear-gradient(to right, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)}) border-box
                    `,
                    border: '1px solid transparent',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      backgroundImage: theme => `linear-gradient(to bottom, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                      opacity: 0.2,
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px'
                    }
                  }}
                >
                  <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container>
                      <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px', color: 'text.secondary' }}>
                          Subtotal:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {themeConfig.currency}{Number(subTotal).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px', color: 'text.secondary' }}>
                          Discount:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {themeConfig.currency}{Number(totalDiscount).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Grid container>
                      <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px', color: 'text.secondary' }}>
                          Tax:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 500, fontSize: '14px' }}>
                          {themeConfig.currency}{Number(totalTax).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Divider />

                    <Grid container>
                      <Grid item xs={6}>
                        <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
                          Total:
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '15px', color: 'primary.main' }}>
                          {themeConfig.currency}{Number(totalAmount).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        <Divider sx={{ my: '0 !important' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 5 }}>
          <Button
            variant='outlined'
            component={Link}
            href="/quotations/quotation-list"
            startIcon={<Icon icon="tabler:arrow-left" />}
          >
            Back to List
          </Button>
          <Button
            variant='contained'
            type='submit'
            disabled={isSubmitting}
            endIcon={isSubmitting ? <CircularProgress size={20} /> : <Icon icon="tabler:device-floppy" />}
            sx={{ boxShadow: theme => `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}` }}
          >
            {isSubmitting ? 'Updating...' : 'Update Quotation'}
          </Button>
        </Box>
      </Card>
    </form>
  )
}

export default EditQuotation

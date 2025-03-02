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
import { styled } from '@mui/material/styles'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Autocomplete from '@mui/material/Autocomplete'

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
      quotationNumber: '',
      customerId: '',
      date: new Date(),
      expiryDate: new Date(),
      items: [
        {
          name: '',
          quantity: 1,
          rate: 0,
          tax: 0,
          discount: 0,
          discountType: 'flat',
          amount: 0
        }
      ],
      subject: '',
      notes: '',
      termsAndConditions: '',
      subTotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalAmount: 0
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
    if (quotation) {
      reset({
        quotationNumber: quotation.quotationNumber || '',
        customerId: quotation.customerId || '',
        date: quotation.date ? new Date(quotation.date) : new Date(),
        expiryDate: quotation.expiryDate ? new Date(quotation.expiryDate) : new Date(),
        items: quotation.items?.length
          ? quotation.items.map(item => ({
              name: item.name || '',
              quantity: item.quantity || 1,
              rate: item.rate || 0,
              tax: item.tax || 0,
              discount: item.discount || 0,
              discountType: item.discountType || 'flat',
              amount: item.amount || 0
            }))
          : [
              {
                name: '',
                quantity: 1,
                rate: 0,
                tax: 0,
                discount: 0,
                discountType: 'flat',
                amount: 0
              }
            ],
        subject: quotation.subject || '',
        notes: quotation.notes || '',
        termsAndConditions: quotation.termsAndConditions || '',
        subTotal: quotation.subTotal || 0,
        totalDiscount: quotation.totalDiscount || 0,
        totalTax: quotation.totalTax || 0,
        totalAmount: quotation.totalAmount || 0
      })
    }
  }, [quotation, reset])

  // ** Handle form submit
  const onFormSubmit = data => {
    onSubmit(data)
  }

  // ** Handle adding a new item
  const handleAddItem = () => {
    append({
      name: '',
      quantity: 1,
      rate: 0,
      tax: 0,
      discount: 0,
      discountType: 'flat',
      amount: 0
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card>
        <CardHeader 
          title='Edit Quotation' 
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <Button 
              variant='contained' 
              color='secondary'
              onClick={resetData}
            >
              Reset
            </Button>
          }
        />
        <CardContent>
          <Grid container spacing={5}>
            {/* Quotation Number */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='quotationNumber'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Quotation Number'
                    placeholder='QT-0000'
                    error={Boolean(errors.quotationNumber)}
                    helperText={errors.quotationNumber?.message}
                  />
                )}
              />
            </Grid>

            {/* Customer Selection */}
            <Grid item xs={12} sm={6}>
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
            </Grid>

            {/* Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='date'
                control={control}
                render={({ field }) => (
                  <CustomDatePicker
                    {...field}
                    label='Date'
                    error={Boolean(errors.date)}
                    helperText={errors.date?.message}
                  />
                )}
              />
            </Grid>

            {/* Expiry Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name='expiryDate'
                control={control}
                render={({ field }) => (
                  <CustomDatePicker
                    {...field}
                    label='Expiry Date'
                    error={Boolean(errors.expiryDate)}
                    helperText={errors.expiryDate?.message}
                  />
                )}
              />
            </Grid>

            {/* Subject */}
            <Grid item xs={12}>
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

            {/* Item List */}
            <Grid item xs={12}>
              <Typography variant='subtitle2' sx={{ mb: 3 }}>
                Item List
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Tax %</TableCell>
                      <TableCell>Discount</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((item, index) => (
                      <TableRow key={item.id}>
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

                        {/* Tax % */}
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

                        {/* Discount Amount */}
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
                        </TableCell>

                        {/* Discount Type */}
                        <TableCell>
                          <Controller
                            name={`items.${index}.discountType`}
                            control={control}
                            render={({ field }) => (
                              <CustomTextField
                                {...field}
                                select
                                size='small'
                                error={Boolean(errors.items?.[index]?.discountType)}
                                helperText={errors.items?.[index]?.discountType?.message}
                              >
                                <MenuItem value='flat'>Flat</MenuItem>
                                <MenuItem value='percentage'>Percent</MenuItem>
                              </CustomTextField>
                            )}
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
                                type='number'
                                size='small'
                                value={field.value.toFixed(2)}
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
                sx={{ mt: 4 }}
              >
                Add Item
              </Button>
            </Grid>

            {/* Notes */}
            <Grid item xs={12} md={6}>
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
                  />
                )}
              />
            </Grid>

            {/* Terms and Conditions */}
            <Grid item xs={12} md={6}>
              <Controller
                name='termsAndConditions'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    rows={5}
                    multiline
                    label='Terms & Conditions (optional)'
                    placeholder='Terms and conditions for the quotation'
                    error={Boolean(errors.termsAndConditions)}
                    helperText={errors.termsAndConditions?.message}
                  />
                )}
              />
            </Grid>

            {/* Totals Section */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 4 }}>
                <Box sx={{ display: 'flex', width: { xs: '100%', sm: '50%', md: '50%', lg: '40%' } }}>
                  <Typography sx={{ mr: 2, fontWeight: 700, color: 'text.secondary' }}>Subtotal:</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {themeConfig.currency}{subTotal.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', width: { xs: '100%', sm: '50%', md: '50%', lg: '40%' } }}>
                  <Typography sx={{ mr: 2, fontWeight: 700, color: 'text.secondary' }}>Discount:</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {themeConfig.currency}{totalDiscount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', width: { xs: '100%', sm: '50%', md: '50%', lg: '40%' } }}>
                  <Typography sx={{ mr: 2, fontWeight: 700, color: 'text.secondary' }}>Tax:</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {themeConfig.currency}{totalTax.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', width: { xs: '100%', sm: '50%', md: '50%', lg: '40%' } }}>
                  <Typography sx={{ mr: 2, fontWeight: 700, color: 'text.primary' }}>Total:</Typography>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {themeConfig.currency}{totalAmount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        <Divider sx={{ my: '0 !important' }} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 5 }}>
          <Button 
            variant='contained' 
            type='submit' 
            disabled={isSubmitting}
            endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Updating...' : 'Update Quotation'}
          </Button>
        </Box>
      </Card>
    </form>
  )
}

export default EditQuotation

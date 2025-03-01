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
import Icon from 'src/@core/components/icon'

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

const AddQuotation = ({
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
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
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
    if (watchItems && watchItems.length > 0) {
      let subTotalAmount = 0
      let taxAmount = 0
      let discountAmount = 0

      watchItems.forEach(item => {
        // Calculate item amount
        const quantity = parseFloat(item.quantity) || 0
        const rate = parseFloat(item.rate) || 0
        const tax = parseFloat(item.tax) || 0
        const discount = parseFloat(item.discount) || 0
        
        // Calculate amount before discount and tax
        const itemAmount = quantity * rate
        
        // Calculate discount amount
        let itemDiscountAmount = 0
        if (item.discountType === 'flat') {
          itemDiscountAmount = discount
        } else {
          itemDiscountAmount = (itemAmount * discount) / 100
        }
        
        // Calculate tax amount
        const itemTaxAmount = ((itemAmount - itemDiscountAmount) * tax) / 100
        
        // Update running totals
        subTotalAmount += itemAmount
        taxAmount += itemTaxAmount
        discountAmount += itemDiscountAmount
      })

      // Update state with calculated values
      setSubTotal(subTotalAmount)
      setTotalTax(taxAmount)
      setTotalDiscount(discountAmount)
      setTotalAmount(subTotalAmount - discountAmount + taxAmount)

      // Update form values
      setValue('subTotal', subTotalAmount)
      setValue('totalDiscount', discountAmount)
      setValue('totalTax', taxAmount)
      setValue('totalAmount', subTotalAmount - discountAmount + taxAmount)
    }
  }, [watchItems, setValue])

  // ** Reset form
  const handleReset = () => {
    reset({
      quotationNumber: '',
      customerId: '',
      date: new Date(),
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
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
    })
    resetData()
  }

  // ** Add new item row
  const handleAddNewItem = () => {
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

  // ** Render item rows
  const renderItemRows = () => {
    return fields.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell>
          <Controller
            name={`items.${index}.name`}
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Item Name'
                error={Boolean(errors.items?.[index]?.name)}
                helperText={errors.items?.[index]?.name?.message}
              />
            )}
          />
        </TableCell>
        <TableCell>
          <Controller
            name={`items.${index}.quantity`}
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                type='number'
                fullWidth
                label='Quantity'
                error={Boolean(errors.items?.[index]?.quantity)}
                helperText={errors.items?.[index]?.quantity?.message}
              />
            )}
          />
        </TableCell>
        <TableCell>
          <Controller
            name={`items.${index}.rate`}
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                type='number'
                fullWidth
                label='Rate'
                error={Boolean(errors.items?.[index]?.rate)}
                helperText={errors.items?.[index]?.rate?.message}
              />
            )}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Controller
              name={`items.${index}.discount`}
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  type='number'
                  fullWidth
                  label='Discount'
                  error={Boolean(errors.items?.[index]?.discount)}
                  helperText={errors.items?.[index]?.discount?.message}
                />
              )}
            />
            <Controller
              name={`items.${index}.discountType`}
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  sx={{ width: '80px', ml: 2 }}
                  error={Boolean(errors.items?.[index]?.discountType)}
                >
                  <MenuItem value='flat'>$</MenuItem>
                  <MenuItem value='percent'>%</MenuItem>
                </CustomTextField>
              )}
            />
          </Box>
        </TableCell>
        <TableCell>
          <Controller
            name={`items.${index}.tax`}
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                type='number'
                fullWidth
                label='Tax %'
                error={Boolean(errors.items?.[index]?.tax)}
                helperText={errors.items?.[index]?.tax?.message}
              />
            )}
          />
        </TableCell>
        <TableCell>
          <Typography>
            ${watchItems[index]?.quantity * watchItems[index]?.rate || 0}
          </Typography>
        </TableCell>
        <TableCell>
          {index > 0 && (
            <IconButton color='error' onClick={() => remove(index)}>
              <Icon icon='mdi:close-circle-outline' />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
    ))
  }

  // ** Form submission
  const onFormSubmit = data => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card>
        <CardHeader title='Add New Quotation' />
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <Controller
                name='quotationNumber'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Quotation Number'
                    placeholder='QT-00001'
                    error={Boolean(errors.quotationNumber)}
                    helperText={errors.quotationNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='customerId'
                control={control}
                render={({ field }) => (
                  <CustomAutocomplete
                    {...field}
                    options={customers}
                    id='autocomplete-customer'
                    getOptionLabel={option => option.name || ''}
                    onChange={(e, value) => field.onChange(value?._id || '')}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        label='Customer'
                        error={Boolean(errors.customerId)}
                        helperText={errors.customerId?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
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
            <Grid item xs={12}>
              <Controller
                name='subject'
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Subject'
                    placeholder='Subject or Project Name'
                    error={Boolean(errors.subject)}
                    helperText={errors.subject?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 4 }}>
        <CardHeader title='Item Details' />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Tax</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderItemRows()}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant='contained'
              color='primary'
              startIcon={<Icon icon='mdi:plus' />}
              onClick={handleAddNewItem}
            >
              Add Item
            </Button>
          </Box>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title='Additional Information' />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid item xs={12}>
                      <Controller
                        name='notes'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            multiline
                            rows={3}
                            label='Notes'
                            placeholder='Additional notes to the customer'
                            error={Boolean(errors.notes)}
                            helperText={errors.notes?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='termsAndConditions'
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            fullWidth
                            multiline
                            rows={3}
                            label='Terms and Conditions'
                            placeholder='Terms and conditions for this quotation'
                            error={Boolean(errors.termsAndConditions)}
                            helperText={errors.termsAndConditions?.message}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title='Summary' />
                <CardContent>
                  <Grid container spacing={4}>
                    <Grid item xs={6}>
                      <Typography>Subtotal:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align='right'>${subTotal.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>Discount:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align='right'>${totalDiscount.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>Tax:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align='right'>${totalTax.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='h6'>Total:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant='h6' align='right'>${totalAmount.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant='outlined'
          color='secondary'
          onClick={handleReset}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          color='primary'
          type='submit'
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Saving...' : 'Save Quotation'}
        </Button>
      </Box>
    </form>
  )
}

export default AddQuotation

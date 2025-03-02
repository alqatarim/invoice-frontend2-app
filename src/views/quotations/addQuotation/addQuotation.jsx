'use client'

// ** React Imports
import { useState, useEffect, Fragment } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import Box from '@mui/material/Box'
import Autocomplete from '@mui/material/Autocomplete'
import { useTheme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Modal from '@mui/material/Modal'
import { styled } from '@mui/material/styles'
import RadioGroup from '@mui/material/RadioGroup'

// ** Icon Imports
import Icon from '@iconify/react'

// ** Third Party Imports
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { quotationSchema } from './QuotationSchema'

// ** Custom Components
import Spinner from '@/components/Spinner'

// ** Actions Imports
import { 
  getQuotationNumber, 
  getProducts, 
  getTaxes, 
  getUnits,
  searchCustomers
} from 'src/app/(dashboard)/quotations/actions'


const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.paper, 0.9)
    }
  }
}))

// Remove or fix the unused CustomAutocomplete component
// This component is defined but not used, which might be causing issues
// const CustomAutocomplete = ({ options, value, onChange, renderInput, getOptionLabel, ...props }) => {
//   return (
//     <Autocomplete
//       options={options}
//       value={value}
//       onChange={onChange}
//       getOptionLabel={getOptionLabel}
//       renderInput={renderInput}
//       {...props}
//     />
//   )
// }


const AddQuotation = ({ customers = [], isSubmitting = false, onSubmit, resetData }) => {
  // ** Hooks
  const theme = useTheme()

  // ** States
  const [quotationNumber, setQuotationNumber] = useState('')
  const [products, setProducts] = useState([])
  const [taxes, setTaxes] = useState([])
  const [units, setUnits] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productOptions, setProductOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editItemOpen, setEditItemOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [deleteItemOpen, setDeleteItemOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [applyRounding, setApplyRounding] = useState(false)
  const [roundingAmount, setRoundingAmount] = useState(0)
  const [signature, setSignature] = useState(null)
  const [signatureType, setSignatureType] = useState('manualSignature')
  const [signaturePreview, setSignaturePreview] = useState(null)
  const [searchedCustomers, setSearchedCustomers] = useState([])
  const [signatureName, setSignatureName] = useState('')

  // ** Form
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(quotationSchema),
    defaultValues: {
      quotationNumber: '',
      customerId: '',
      customerName: '',
      date: dayjs(),
      expiryDate: dayjs().add(30, 'day'),
      subject: '',
      status: 'DRAFTED',
      items: [],
      subTotal: 0,
      totalAmount: 0,
      totalDiscount: 0,
      totalTax: 0,
      notes: '',
      termsAndConditions: ''
    }
  })

  // Watch form values for calculations
  const watchedItems = watch('items')

  // Setup field array for items
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items'
  })

  // ** Effects
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch quotation number
        const qNumber = await getQuotationNumber()
        setQuotationNumber(qNumber)
        setValue('quotationNumber', qNumber)

        // Fetch product list
        const productsList = await getProducts()
        setProducts(productsList)
        setProductOptions(productsList)

        // Fetch tax list
        const taxesList = await getTaxes()
        setTaxes(taxesList)

        // Fetch unit list
        const unitsList = await getUnits()
        setUnits(unitsList)
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [setValue])

  // Calculate totals whenever items change
  useEffect(() => {
    if (watchedItems?.length > 0) {
      calculateTotals()
    }
  }, [watchedItems, applyRounding, roundingAmount])

  // ** Handlers
  const handleProductSelect = (product) => {
    if (!product) return

    // Find the product in the products list
    const selectedProd = products.find(p => p._id === product._id)
    
    if (selectedProd) {
      append({
        productId: selectedProd._id,
        name: selectedProd.name,
        description: selectedProd.description || '',
        quantity: 1,
        unit: selectedProd.units?._id || '',
        unitName: selectedProd.units?.name || '',
        rate: selectedProd.sellingPrice || 0,
        discount: selectedProd.discountValue || 0,
        discountType: selectedProd.discountType || 'flat',
        tax: selectedProd.tax?.taxRate || 0,
        amount: selectedProd.sellingPrice || 0
      })

      // Remove this product from options
      const updatedOptions = productOptions.filter(p => p._id !== product._id)
      setProductOptions(updatedOptions)
      setSelectedProduct(null)
    }
  }

  const handleEditItem = (index) => {
    setCurrentItem({ ...watchedItems[index], index })
    setEditItemOpen(true)
  }

  const handleUpdateItem = () => {
    if (!currentItem) return

    update(currentItem.index, {
      ...currentItem
    })

    calculateItemAmount(currentItem)
    setEditItemOpen(false)
    setCurrentItem(null)
  }

  const handleDeleteItem = (index) => {
    setItemToDelete(index)
    setDeleteItemOpen(true)
  }

  const confirmDeleteItem = () => {
    if (itemToDelete !== null) {
      // Get the item to be removed
      const removedItem = watchedItems[itemToDelete]
      
      // Add it back to product options if it exists
      if (removedItem?.productId) {
        const productToAdd = products.find(p => p._id === removedItem.productId)
        if (productToAdd) {
          setProductOptions(prev => [...prev, productToAdd])
        }
      }
      
      // Remove the item
      remove(itemToDelete)
      
      setItemToDelete(null)
      setDeleteItemOpen(false)
    }
  }

  const handleQuantityChange = (index, value) => {
    // Update the quantity
    const currentItems = getValues('items')
    const currentItem = { ...currentItems[index], quantity: parseFloat(value) || 0 }
    
    // Recalculate amount
    calculateItemAmount(currentItem)
    
    // Update the item
    update(index, currentItem)
  }

  const calculateItemAmount = (item) => {
    const quantity = parseFloat(item.quantity) || 0
    const rate = parseFloat(item.rate) || 0
    const discountValue = parseFloat(item.discount) || 0
    const taxRate = parseFloat(item.tax) || 0
    
    let discountAmount = 0
    if (item.discountType === 'percent') {
      discountAmount = (quantity * rate * discountValue) / 100
    } else {
      discountAmount = discountValue
    }
    
    const taxableAmount = (quantity * rate) - discountAmount
    const taxAmount = (taxableAmount * taxRate) / 100
    
    item.amount = taxableAmount + taxAmount
    
    return item
  }

  const calculateTotals = () => {
    const items = getValues('items') || []
    
    let subTotal = 0
    let totalDiscount = 0
    let totalTax = 0
    
    items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0
      const rate = parseFloat(item.rate) || 0
      const discount = parseFloat(item.discount) || 0
      const taxRate = parseFloat(item.tax) || 0
      
      // Calculate discount amount
      let discountAmount = 0
      if (item.discountType === 'percent') {
        discountAmount = (quantity * rate * discount) / 100
      } else {
        discountAmount = discount
      }
      
      // Calculate taxable amount
      const taxableAmount = (quantity * rate) - discountAmount
      
      // Calculate tax amount
      const taxAmount = (taxableAmount * taxRate) / 100
      
      subTotal += taxableAmount
      totalDiscount += discountAmount
      totalTax += taxAmount
    })
    
    // Apply rounding if enabled
    let totalAmount = subTotal + totalTax
    if (applyRounding) {
      totalAmount = Math.round(totalAmount) + parseFloat(roundingAmount || 0)
    }
    
    setValue('subTotal', subTotal)
    setValue('totalDiscount', totalDiscount)
    setValue('totalTax', totalTax)
    setValue('totalAmount', totalAmount)
    
    return { subTotal, totalDiscount, totalTax, totalAmount }
  }

  const handleCustomerSearch = async (searchText) => {
    if (searchText.length < 2) return

    try {
      const response = await searchCustomers(searchText)
      if (response.success) {
        setSearchedCustomers(response.data)
      }
    } catch (error) {
      console.error('Error searching customers:', error)
    }
  }

  const handleSignatureChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setSignature(file)
      
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setSignaturePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = (data) => {
    // Prepare data for submission
    const formData = new FormData()
    
    // Append basic fields
    formData.append('quotationNumber', data.quotationNumber)
    formData.append('customerId', data.customerId)
    formData.append('customerName', data.customerName || '')
    formData.append('subject', data.subject || '')
    formData.append('date', data.date ? dayjs(data.date).format('YYYY-MM-DD') : '')
    formData.append('expiryDate', data.expiryDate ? dayjs(data.expiryDate).format('YYYY-MM-DD') : '')
    formData.append('status', data.status || 'DRAFTED')
    formData.append('subTotal', data.subTotal || 0)
    formData.append('totalAmount', data.totalAmount || 0)
    formData.append('totalDiscount', data.totalDiscount || 0)
    formData.append('totalTax', data.totalTax || 0)
    formData.append('notes', data.notes || '')
    formData.append('termsAndConditions', data.termsAndConditions || '')
    
    // Append items as JSON string
    if (data.items && data.items.length > 0) {
      formData.append('items', JSON.stringify(data.items))
    }
    
    // Handle signature
    formData.append('sign_type', signatureType)
    if (signatureType === 'eSignature') {
      formData.append('signatureName', signatureName)
      if (signature) {
        formData.append('signature', signature)
      }
    } else {
      // For manual signature, we would need the ID of the selected signature
      // This should be implemented based on how signatures are stored/selected
      formData.append('signatureId', data.signatureId || '')
    }
    
    // Submit the form
    onSubmit(formData)
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card>
        <CardHeader 
          title='Add New Quotation' 
          action={
            <Button 
              component={Link} 
              href='/quotations/quotation-list'
              variant='outlined' 
              // startIcon={<Icon icon='mdi:arrow-left' />}
              // startIcon={<Icon icon='mdi:arrow-left' fontSize={20} />}
            >
              Back to List
            </Button>
          }
        />
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Typography variant='h6'>Quotation Details</Typography>
                <Divider sx={{ mt: 1, mb: 4 }} />
              </Grid>

              {/* Quotation Number */}
              <Grid item xs={12} sm={6} md={3}>
                <Controller
                  name='quotationNumber'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      label='Quotation Number'
                      placeholder='QUO-000001'
                      InputProps={{
                        readOnly: true
                      }}
                      error={Boolean(errors.quotationNumber)}
                      helperText={errors.quotationNumber?.message}
                    />
                  )}
                />
              </Grid>

              {/* Customer */}
              <Grid item xs={12} sm={6} md={5}>
                <Controller
                  name='customerId'
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControl fullWidth error={Boolean(errors.customerId)}>
                      <Autocomplete
                        id='customer-select'
                        options={searchedCustomers.length > 0 ? searchedCustomers : customers}
                        getOptionLabel={(option) => option.name || ''}
                        value={customers.find(c => c._id === value) || null}
                        onChange={(_, newValue) => {
                          if (newValue) {
                            onChange(newValue._id)
                            setValue('customerName', newValue.name)
                          } else {
                            onChange('')
                            setValue('customerName', '')
                          }
                        }}
                        onInputChange={(_, newInputValue) => {
                          handleCustomerSearch(newInputValue)
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label='Customer'
                            error={Boolean(errors.customerId)}
                            helperText={errors.customerId?.message}
                          />
                        )}
                      />
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Date */}
              <Grid item xs={12} sm={6} md={2}>
                <Controller
                  name='date'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label='Date'
                      format='DD/MM/YYYY'
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(errors.date),
                          helperText: errors.date?.message
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Expiry Date */}
              <Grid item xs={12} sm={6} md={2}>
                <Controller
                  name='expiryDate'
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label='Expiry Date'
                      format='DD/MM/YYYY'
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: Boolean(errors.expiryDate),
                          helperText: errors.expiryDate?.message
                        }
                      }}
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
                      label='Subject'
                      placeholder='Enter quotation subject'
                      error={Boolean(errors.subject)}
                      helperText={errors.subject?.message}
                    />
                  )}
                />
              </Grid>

              {/* Items Table */}
              <Grid item xs={12}>
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Items
                </Typography>

                {/* Product Selection */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Autocomplete
                    sx={{ width: 350, mr: 2 }}
                    id='product-select'
                    options={productOptions}
                    getOptionLabel={(option) => option.name || ''}
                    value={selectedProduct}
                    onChange={(_, newValue) => setSelectedProduct(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label='Select Product'
                        placeholder='Search and select a product'
                      />
                    )}
                  />
                  <Button 
                    variant='contained' 
                    onClick={() => handleProductSelect(selectedProduct)}
                    disabled={!selectedProduct}
                  >
                    Add Item
                  </Button>
                </Box>

                {/* Items List */}
                {fields.length > 0 ? (
                  <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align='center'>Quantity</TableCell>
                          <TableCell>Unit</TableCell>
                          <TableCell align='right'>Rate</TableCell>
                          <TableCell align='right'>Discount</TableCell>
                          <TableCell align='right'>Tax (%)</TableCell>
                          <TableCell align='right'>Amount</TableCell>
                          <TableCell align='center'>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fields.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>{watchedItems[index]?.name}</TableCell>
                            <TableCell>{watchedItems[index]?.description || '-'}</TableCell>
                            <TableCell align='center'>
                              <TextField
                                value={watchedItems[index]?.quantity || 0}
                                type='number'
                                size='small'
                                sx={{ width: '80px' }}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                InputProps={{ inputProps: { min: 1 } }}
                              />
                            </TableCell>
                            <TableCell>{watchedItems[index]?.unitName || '-'}</TableCell>
                            <TableCell align='right'>
                              {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(watchedItems[index]?.rate || 0)}
                            </TableCell>
                            <TableCell align='right'>
                              {watchedItems[index]?.discountType === 'percent' 
                                ? `${watchedItems[index]?.discount || 0}%`
                                : new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(watchedItems[index]?.discount || 0)
                              }
                            </TableCell>
                            <TableCell align='right'>{watchedItems[index]?.tax || 0}%</TableCell>
                            <TableCell align='right'>
                              {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(watchedItems[index]?.amount || 0)}
                            </TableCell>
                            <TableCell align='center'>
                              <IconButton onClick={() => handleEditItem(index)} color='primary' size='small'>
                                <Icon icon='mdi:pencil-outline' />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteItem(index)} color='error' size='small'>
                                <Icon icon='mdi:delete-outline' />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                ) : (
                  <Alert severity='info' sx={{ mt: 2 }}>
                    No items added yet. Select a product to add items to this quotation.
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    {/* Notes */}
                    <Typography sx={{ mb: 2 }} variant='subtitle2'>
                      Notes
                    </Typography>
                    <Controller
                      name='notes'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder='Add any additional notes here'
                        />
                      )}
                    />

                    {/* Terms and Conditions */}
                    <Typography sx={{ mt: 4, mb: 2 }} variant='subtitle2'>
                      Terms and Conditions
                    </Typography>
                    <Controller
                      name='termsAndConditions'
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          fullWidth
                          multiline
                          rows={4}
                          placeholder='Add your terms and conditions here'
                        />
                      )}
                    />

                    {/* Signature Section */}
                    <Typography sx={{ mt: 4, mb: 2 }} variant='subtitle2'>
                      Signature
                    </Typography>
                    <Box>
                      <FormControl component='fieldset'>
                        <RadioGroup
                          value={signatureType}
                          onChange={(e) => setSignatureType(e.target.value)}
                          row
                        >
                          <FormControlLabel 
                            value='manualSignature' 
                            control={<Switch
                              checked={signatureType === 'manualSignature'}
                              onChange={() => setSignatureType('manualSignature')}
                            />} 
                            label='Manual Signature' 
                          />
                          <FormControlLabel 
                            value='eSignature' 
                            control={<Switch
                              checked={signatureType === 'eSignature'}
                              onChange={() => setSignatureType('eSignature')}
                            />} 
                            label='E-Signature' 
                          />
                        </RadioGroup>
                      </FormControl>

                      {signatureType === 'eSignature' && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            label='Signature Name'
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            sx={{ mb: 2 }}
                          />
                          <Button
                            variant='outlined'
                            component='label'
                            startIcon={<Icon icon='mdi:cloud-upload-outline' />}
                          >
                            Upload Signature
                            <input
                              type='file'
                              accept='image/*'
                              hidden
                              onChange={handleSignatureChange}
                            />
                          </Button>
                          {signaturePreview && (
                            <Box sx={{ mt: 2 }}>
                              <img 
                                src={signaturePreview} 
                                alt='Signature Preview' 
                                style={{ maxWidth: '200px', maxHeight: '100px' }} 
                              />
                            </Box>
                          )}
                        </Box>
                      )}

                      {signatureType === 'manualSignature' && (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                          <InputLabel>Select Signature</InputLabel>
                          <Controller
                            name='signatureId'
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                label='Select Signature'
                              >
                                <MenuItem value=''>None</MenuItem>
                                {/* Populate with saved signatures from backend */}
                                <MenuItem value='sig1'>Signature 1</MenuItem>
                                <MenuItem value='sig2'>Signature 2</MenuItem>
                              </Select>
                            )}
                          />
                        </FormControl>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {/* Summary */}
                    <Box 
                      sx={{ 
                        p: 3, 
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        bgcolor: theme.palette.background.default
                      }}
                    >
                      <Typography variant='subtitle2' sx={{ mb: 3 }}>
                        Summary
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography>Subtotal:</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography>
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(watch('subTotal') || 0)}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography>Discount:</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography>
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(watch('totalDiscount') || 0)}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography>Tax:</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography>
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(watch('totalTax') || 0)}
                          </Typography>
                        </Grid>

                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={applyRounding}
                                onChange={(e) => setApplyRounding(e.target.checked)}
                              />
                            }
                            label='Apply Rounding'
                          />
                        </Grid>

                        {applyRounding && (
                          <>
                            <Grid item xs={6}>
                              <Typography>Rounding:</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <TextField
                                size='small'
                                type='number'
                                value={roundingAmount}
                                onChange={(e) => setRoundingAmount(e.target.value)}
                                InputProps={{
                                  inputProps: { step: 0.01 },
                                  sx: { textAlign: 'right' }
                                }}
                              />
                            </Grid>
                          </>
                        )}

                        <Grid item xs={12}>
                          <Divider />
                        </Grid>

                        <Grid item xs={6}>
                          <Typography variant='subtitle1'>Total:</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'right' }}>
                          <Typography variant='subtitle1'>
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(watch('totalAmount') || 0)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>

          <Divider sx={{ mt: 2 }} />
          
          <CardActions sx={{ justifyContent: 'flex-end', p: 3 }}>
            <Button 
              variant='outlined' 
              color='secondary' 
              onClick={resetData}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant='contained' 
              type='submit'
              disabled={isSubmitting || fields.length === 0}
              startIcon={isSubmitting ? <Spinner size={20} /> : null}
            >
              {isSubmitting ? 'Saving...' : 'Save Quotation'}
            </Button>
          </CardActions>
        </form>

        {/* Edit Item Modal */}
        <Dialog
          open={editItemOpen}
          onClose={() => setEditItemOpen(false)}
          aria-labelledby='edit-item-dialog-title'
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle id='edit-item-dialog-title'>Edit Item</DialogTitle>
          <DialogContent>
            {currentItem && (
              <Grid container spacing={3} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Name'
                    value={currentItem.name || ''}
                    onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Description'
                    value={currentItem.description || ''}
                    onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                    multiline
                    rows={2}
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Quantity'
                    type='number'
                    value={currentItem.quantity || 0}
                    onChange={(e) => setCurrentItem({...currentItem, quantity: parseFloat(e.target.value) || 0})}
                    InputProps={{ inputProps: { min: 1 } }}
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Rate'
                    type='number'
                    value={currentItem.rate || 0}
                    onChange={(e) => setCurrentItem({...currentItem, rate: parseFloat(e.target.value) || 0})}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Discount'
                    type='number'
                    value={currentItem.discount || 0}
                    onChange={(e) => setCurrentItem({...currentItem, discount: parseFloat(e.target.value) || 0})}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    margin='normal'
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin='normal'>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={currentItem.discountType || 'flat'}
                      onChange={(e) => setCurrentItem({...currentItem, discountType: e.target.value})}
                      label='Discount Type'
                    >
                      <MenuItem value='flat'>Flat</MenuItem>
                      <MenuItem value='percent'>Percentage</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Tax (%)'
                    type='number'
                    value={currentItem.tax || 0}
                    onChange={(e) => setCurrentItem({...currentItem, tax: parseFloat(e.target.value) || 0})}
                    InputProps={{ inputProps: { min: 0, max: 100, step: 0.01 } }}
                    margin='normal'
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditItemOpen(false)} color='secondary'>
              Cancel
            </Button>
            <Button onClick={handleUpdateItem} color='primary'>
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteItemOpen}
          onClose={() => setDeleteItemOpen(false)}
          aria-labelledby='delete-item-dialog-title'
        >
          <DialogTitle id='delete-item-dialog-title'>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to remove this item?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteItemOpen(false)} color='secondary'>
              Cancel
            </Button>
            <Button onClick={confirmDeleteItem} color='error'>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </LocalizationProvider>
  )
}

export default AddQuotation

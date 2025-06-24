// Next Imports
import Link from 'next/link'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { formatCurrency } from '@/utils/currencyUtils'
import { formatDate } from '@/utils/dateUtils'
import moment from 'moment'

const CustomerOverview = ({ customerData, invoices = [], cardDetails }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'unpaid':
        return 'error'
      case 'partially_paid':
        return 'warning'
      case 'overdue':
        return 'error'
      case 'sent':
        return 'info'
      case 'drafted':
        return 'secondary'
      default:
        return 'default'
    }
  }

  // Calculate stats
  const totalInvoices = cardDetails?.totalRecs?.[0]?.count || invoices?.length || 0
  const totalAmount = cardDetails?.totalRecs?.[0]?.amount || invoices?.reduce((sum, invoice) => sum + (invoice.TotalAmount || 0), 0) || 0
  const totalBalance = cardDetails?.outStandingRecs?.[0]?.amount || 0

  return (
    <Grid container spacing={6}>
      {/* Statistics Cards */}
      <Grid item xs={12}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent className='flex flex-col items-center gap-2'>
                <CustomAvatar variant='rounded' skin='light' color='primary'>
                  <i className='ri-shopping-cart-2-line' />
                </CustomAvatar>
                <div className='text-center'>
                  <Typography variant='h4'>{totalInvoices}</Typography>
                  <Typography>Total Orders</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent className='flex flex-col items-center gap-2'>
                <CustomAvatar variant='rounded' skin='light' color='success'>
                  <i className='ri-money-dollar-circle-line' />
                </CustomAvatar>
                <div className='text-center'>
                  <Typography variant='h4'>{formatCurrency(totalAmount)}</Typography>
                  <Typography>Total Spent</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent className='flex flex-col items-center gap-2'>
                <CustomAvatar variant='rounded' skin='light' color='warning'>
                  <i className='ri-time-line' />
                </CustomAvatar>
                <div className='text-center'>
                  <Typography variant='h4'>{formatCurrency(totalBalance)}</Typography>
                  <Typography>Outstanding</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent className='flex flex-col items-center gap-2'>
                <CustomAvatar variant='rounded' skin='light' color='info'>
                  <i className='ri-star-line' />
                </CustomAvatar>
                <div className='text-center'>
                  <Typography variant='h4'>5.0</Typography>
                  <Typography>Rating</Typography>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Recent Invoices */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title='Recent Invoices'
            action={
              <IconButton component={Link} href={`/invoices?customerId=${customerData?._id}`}>
                <i className='ri-external-link-line' />
              </IconButton>
            }
          />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.slice(0, 5).map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>
                      <Typography
                        component={Link}
                        href={`/invoices/invoice-view/${invoice._id}`}
                        className='font-medium text-primary hover:underline'
                      >
                        {invoice.invoiceNumber || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {moment(invoice.invoiceDate).format('DD MMM YY')}
                    </TableCell>
                    <TableCell>
                      <Typography className='font-medium'>
                        {formatCurrency(invoice.TotalAmount || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status || 'Unpaid'}
                        size='small'
                        color={getStatusColor(invoice.status)}
                        variant='tonal'
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size='small'
                        component={Link}
                        href={`/invoices/invoice-view/${invoice._id}`}
                      >
                        <i className='ri-eye-line' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {invoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center'>
                      No invoices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CustomerOverview
// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomerDetails from './CustomerDetails'
import CustomerPlan from './CustomerPlan'
import CustomAvatar from '@core/components/mui/Avatar'
import { formatCurrency } from '@/utils/currencyUtils'

const CustomerLeftOverview = ({ customerData, originalCustomerData, cardDetails }) => {
  // Extract all 6 stat objects from cardDetails
  const totalStats = cardDetails?.totalRecs?.[0] || { amount: 0, count: 0 }
  const paidStats = cardDetails?.paidRecs?.[0] || { amount: 0, count: 0 }
  const outstandingStats = cardDetails?.outStandingRecs?.[0] || { amount: 0, count: 0 }
  const draftedStats = cardDetails?.draftedRecs?.[0] || { amount: 0, count: 0 }
  const cancelledStats = cardDetails?.cancelledRecs?.[0] || { amount: 0, count: 0 }
  const overdueStats = cardDetails?.overDueRecs?.[0] || { amount: 0, count: 0 }

  // Invoice statistics configuration
  const invoiceStats = [
    {
      label: 'Total',
      amount: totalStats.amount,
      count: totalStats.count,
      color: 'primary',
      icon: 'ri-file-text-line',
      description: 'All invoices'
    },
    {
      label: 'Paid',
      amount: paidStats.amount,
      count: paidStats.count,
      color: 'success',
      icon: 'ri-check-double-line',
      description: 'Completed payments'
    },
    {
      label: 'Outstanding',
      amount: outstandingStats.amount,
      count: outstandingStats.count,
      color: 'warning',
      icon: 'ri-time-line',
      description: 'Pending payments'
    },
    {
      label: 'Drafted',
      amount: draftedStats.amount,
      count: draftedStats.count,
      color: 'info',
      icon: 'ri-draft-line',
      description: 'Draft invoices'
    },
    {
      label: 'Cancelled',
      amount: cancelledStats.amount,
      count: cancelledStats.count,
      color: 'secondary',
      icon: 'ri-close-circle-line',
      description: 'Cancelled invoices'
    },
    {
      label: 'Overdue',
      amount: overdueStats.amount,
      count: overdueStats.count,
      color: 'error',
      icon: 'ri-alarm-warning-line',
      description: 'Overdue payments'
    }
  ]

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CustomerDetails 
          customerData={customerData} 
          originalCustomerData={originalCustomerData}
        />
      </Grid>
      
      {/* Invoice Statistics */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-6'>
            <div className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color='primary' size={40}>
                <i className='ri-bar-chart-box-line' />
              </CustomAvatar>
              <div>
                <Typography variant='h6' className='font-semibold'>
                  Invoice Statistics
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Complete breakdown of invoice status
                </Typography>
              </div>
            </div>
            
            <Grid container spacing={4}>
              {invoiceStats.map((stat, index) => (
                <Grid size={{ xs: 6, sm: 4 }} key={index}>
                  <div className='flex flex-col gap-2 p-3 border rounded-lg hover:shadow-sm transition-shadow'>
                    <div className='flex items-center gap-2'>
                      <CustomAvatar variant='rounded' skin='light' color={stat.color} size={32}>
                        <i className={`${stat.icon} text-sm`} />
                      </CustomAvatar>
                      <div className='flex-grow min-w-0'>
                        <Typography variant='body2' className='font-semibold text-truncate'>
                          {stat.label}
                        </Typography>
                        <Typography variant='caption' color='text.secondary' className='text-truncate'>
                          {stat.description}
                        </Typography>
                      </div>
                    </div>
                    
                    <div className='flex flex-col gap-1 pli-10'>
                      <div className='flex items-center justify-between'>
                        <Typography variant='caption' color='text.secondary'>
                          Count:
                        </Typography>
                        <Typography variant='body2' className='font-semibold'>
                          {stat.count || 0}
                        </Typography>
                      </div>
                      <div className='flex items-center justify-between'>
                        <Typography variant='caption' color='text.secondary'>
                          Amount:
                        </Typography>
                        <Typography variant='body2' className='font-semibold'>
                          {stat.amount ? formatCurrency(stat.amount) : formatCurrency(0)}
                        </Typography>
                      </div>
                    </div>
                    
                    {/* Empty state indicator */}
                    {stat.count === 0 && stat.amount === 0 && (
                      <div className='flex items-center justify-center p-2 bg-action-hover rounded-md'>
                        <Typography variant='caption' color='text.secondary' className='text-center'>
                          No {stat.label.toLowerCase()} invoices
                        </Typography>
                      </div>
                    )}
                  </div>
                </Grid>
              ))}
            </Grid>
            
            {/* Summary */}
            <div className='flex items-center justify-between p-4 bg-action-hover rounded-lg'>
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' skin='light' color='primary' size={32}>
                  <i className='ri-calculator-line' />
                </CustomAvatar>
                <div>
                  <Typography variant='body2' className='font-semibold'>
                    Payment Summary
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Collection efficiency
                  </Typography>
                </div>
              </div>
              <div className='text-right'>
                <Typography variant='body2' className='font-semibold'>
                  {totalStats.amount > 0 
                    ? `${Math.round((paidStats.amount / totalStats.amount) * 100)}% Collected`
                    : 'No invoices yet'
                  }
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {formatCurrency(paidStats.amount)} of {formatCurrency(totalStats.amount)}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12 }}>
        <CustomerPlan />
      </Grid>
    </Grid>
  )
}

export default CustomerLeftOverview
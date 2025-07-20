// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useMemo } from 'react'

// Component Imports
import CustomerDetails from './leftSection/CustomerDetails'
import CustomAvatar from '@core/components/mui/Avatar'
import { formatCurrency } from '@/utils/currencyUtils'

const CustomerLeftOverview = ({ customerData, cardDetails, permissions }) => {
  // Extract all 6 stat objects from cardDetails - memoized to prevent re-renders
  const stats = useMemo(() => ({
    totalStats: cardDetails?.totalRecs?.[0] || { amount: 0, count: 0 },
    paidStats: cardDetails?.paidRecs?.[0] || { amount: 0, count: 0 },
    outstandingStats: cardDetails?.outStandingRecs?.[0] || { amount: 0, count: 0 },
    draftedStats: cardDetails?.draftedRecs?.[0] || { amount: 0, count: 0 },
    cancelledStats: cardDetails?.cancelledRecs?.[0] || { amount: 0, count: 0 },
    overdueStats: cardDetails?.overDueRecs?.[0] || { amount: 0, count: 0 }
  }), [cardDetails])

  const { totalStats, paidStats, outstandingStats, draftedStats, cancelledStats, overdueStats } = stats

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
          cardDetails={cardDetails}
          permissions={permissions}
        />
      </Grid>
      
    
    </Grid>
  )
}

export default CustomerLeftOverview
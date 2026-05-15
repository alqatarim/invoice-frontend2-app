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

const CustomerLeftOverview = ({ customerData, cardDetails, permissions, onCustomerUpdate }) => {
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



  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <CustomerDetails
          customerData={customerData}
          cardDetails={cardDetails}
          permissions={permissions}
          onCustomerUpdate={onCustomerUpdate}
        />
      </Grid>


    </Grid>
  )
}

export default CustomerLeftOverview
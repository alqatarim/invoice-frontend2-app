// Next Imports
import Link from 'next/link'
import { useMemo } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'


// Component Imports
import CustomListTable from '@/components/custom-components/CustomListTable'
import MultiBarProgress from '@components/card-statistics/MultiBarProgress'
import { getCustomerInvoiceColumns } from './tableColumns'
import { statusOptions } from '@/data/dataSets'

// Handler Import
import { useOverviewHandlers } from '@/handlers/customers/view'

const CustomerOverview = ({ invoices = [], cardDetails }) => {
  // Handler for overview data management
  const {
    searchValue,
    pagination,
    filteredInvoices,
    // totalAmount,
    handlePageChange,
    handleRowsPerPageChange,
    handleSearchChange,
    getRowKey
  } = useOverviewHandlers({ invoices, cardDetails })

  // Table columns configuration
  const columns = useMemo(() => getCustomerInvoiceColumns(), [])

 // Create stats array for breakdown statistics
 const breakdownStats = useMemo(() => [
  {
    title: "Paid Amount",
    subtitle: "Total Paid",
    titleVariant: 'h6',
    subtitleVariant: 'body2',
    stats: cardDetails?.paidRecs?.[0]?.amount || 0,
    statsVariant: 'h5',
    avatarIcon: statusOptions.find(option => option.value === 'PAID')?.icon,
    color: statusOptions.find(option => option.value === 'PAID')?.color,
    colorOpacity: 'light',
    iconSize: '30px',
    isCurrency: true,
    currencyIconWidth: '1.25rem',
    trendNumber: cardDetails?.paidRecs?.[0]?.count || 0,
  },
  {
    title: "Partially Paid",
    subtitle: "Partial Payments",
    titleVariant: 'h6',
    subtitleVariant: 'body2',
    stats: cardDetails?.partiallyPaidRecs?.[0]?.amount || 0,
    statsVariant: 'h5',
    avatarIcon: statusOptions.find(option => option.value === 'PARTIALLY_PAID')?.icon,
    color: statusOptions.find(option => option.value === 'PARTIALLY_PAID')?.color,
    colorOpacity: 'light',
    iconSize: '30px',
    isCurrency: true,
    currencyIconWidth: '1.25rem',
    trendNumber: cardDetails?.partiallyPaidRecs?.[0]?.count || 0,
  },
  {
    title: "Sent",
    subtitle: "Invoices Sent",
    titleVariant: 'h6',
    subtitleVariant: 'body2',
    stats: cardDetails?.sentRecs?.[0]?.amount || 0,
    statsVariant: 'h5',
    avatarIcon: statusOptions.find(option => option.value === 'SENT')?.icon,
    color: statusOptions.find(option => option.value === 'SENT')?.color,
    colorOpacity: 'light',
    iconSize: '30px',
    isCurrency: true,
    currencyIconWidth: '1.25rem',
    trendNumber: cardDetails?.sentRecs?.[0]?.count || 0,
  },
 
  {
    title: "Drafted",
    subtitle: "Draft Invoices",
    titleVariant: 'h6',
    subtitleVariant: 'body2',
    stats: cardDetails?.draftedRecs?.[0]?.amount || 0,
    statsVariant: 'h5',
    avatarIcon: statusOptions.find(option => option.value === 'DRAFTED')?.icon,
    color: statusOptions.find(option => option.value === 'DRAFTED')?.color,
    colorOpacity: 'light',
    iconSize: '30px',
    isCurrency: true,
    currencyIconWidth: '1.25rem',
    trendNumber: cardDetails?.draftedRecs?.[0]?.count || 0,
  }
 
 , {
    title: "Overdue",
    subtitle: "Past Due",
    titleVariant: 'h6',
    subtitleVariant: 'body2',
    stats: cardDetails?.overDueRecs?.[0]?.amount || 0,
    statsVariant: 'h5',
    avatarIcon: statusOptions.find(option => option.value === 'OVERDUE')?.icon,
    color: statusOptions.find(option => option.value === 'OVERDUE')?.color,
    colorOpacity: 'light',
    iconSize: '30px',
    isCurrency: true,
    currencyIconWidth: '1.25rem',
    trendNumber: cardDetails?.overDueRecs?.[0]?.count || 0,
  },

  ,
  {
    title: "Cancelled",
    subtitle: "Cancelled Invoices",
    titleVariant: 'h6',
    subtitleVariant: 'body2',
    stats: cardDetails?.cancelledRecs?.[0]?.amount || 0,
    statsVariant: 'h5',
    avatarIcon: statusOptions.find(option => option.value === 'CANCELLED')?.icon,
    color: statusOptions.find(option => option.value === 'CANCELLED')?.color,
    colorOpacity: 'light',
    iconSize: '30px',
    isCurrency: true,
    currencyIconWidth: '1.25rem',
    trendNumber: cardDetails?.cancelledRecs?.[0]?.count || 0,
  }


], [cardDetails])

  return (
    <Grid container spacing={6}>
      {/* Statistics Cards */}
      <Grid size={{ xs: 12 }}>
        <MultiBarProgress
          stats={breakdownStats}
          totalAmount={cardDetails?.totalRecs?.[0]?.amount}
          borderColor="primary"
          height={130}
          width={'100%'}
        />
      </Grid>

      {/* Recent Invoices Table */}
      <Grid size={{ xs: 12 }}>
        <CustomListTable
          title='Recent Invoices'
          columns={columns}
          rows={filteredInvoices}
          rowKey={getRowKey}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          showSearch={true}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          noDataText='No invoices found'
          loading={false}
        />
      </Grid>
    </Grid>
  )
}

export default CustomerOverview
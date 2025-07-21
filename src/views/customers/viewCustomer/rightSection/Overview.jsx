// Next Imports
import Link from 'next/link'
import { useState, useMemo, useCallback, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import CustomListTable from '@/components/custom-components/CustomListTable'
import HorizontalStatsGroup from '@components/card-statistics/HorizontalStatsGroup'
import { formatCurrency } from '@/utils/currencyUtils'
import moment from 'moment'
import { getCustomerInvoiceColumns } from './tableColumns'

// Data Imports
import { statusOptions } from '@/data/dataSets'

const CustomerOverview = ({ invoices = [], cardDetails }) => {


  // States
  const [searchValue, setSearchValue] = useState('')
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10, total: 0 })

  // Reset pagination when search value changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 0 }))
  }, [searchValue])



  const getStatusLabel = useMemo(() => (status) => {
    const statusUpper = status?.toUpperCase()
    const statusOption = statusOptions.find(option => option.value === statusUpper)
    return statusOption?.label || status || 'Unpaid'
  }, [])

  // Create stats array for HorizontalStatsGroup (exclude total amount)
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
      colorOpacity: 'lightOpacity',
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
      colorOpacity: 'lightOpacity',
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
      colorOpacity: 'lightOpacity',
      iconSize: '30px',
      isCurrency: true,
      currencyIconWidth: '1.25rem',
      trendNumber: cardDetails?.sentRecs?.[0]?.count || 0,

    },

    {
      title: "Overdue",
      subtitle: "Past Due",
      titleVariant: 'h6',
      subtitleVariant: 'body2',
      stats: cardDetails?.overDueRecs?.[0]?.amount || 0,
      statsVariant: 'h5',
      avatarIcon: statusOptions.find(option => option.value === 'OVERDUE')?.icon,
      color: statusOptions.find(option => option.value === 'OVERDUE')?.color,
      colorOpacity: 'lightOpacity',
      iconSize: '30px',
      isCurrency: true,
      currencyIconWidth: '1.25rem',
      trendNumber: cardDetails?.overDueRecs?.[0]?.count || 0,

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
      colorOpacity: 'lightOpacity',
      iconSize: '30px',
      isCurrency: true,
      currencyIconWidth: '1.25rem',
      trendNumber: cardDetails?.draftedRecs?.[0]?.count || 0,

    },
    {
      title: "Cancelled",
      subtitle: "Cancelled Invoices",
      titleVariant: 'h6',
      subtitleVariant: 'body2',
      stats: cardDetails?.cancelledRecs?.[0]?.amount || 0,
      statsVariant: 'h5',
      avatarIcon: statusOptions.find(option => option.value === 'CANCELLED')?.icon,
      color: statusOptions.find(option => option.value === 'CANCELLED')?.color,
      colorOpacity: 'lightOpacity',
      iconSize: '30px',
      isCurrency: true,
      currencyIconWidth: '1.25rem',
      trendNumber: cardDetails?.cancelledRecs?.[0]?.count || 0,
    }
  ], [cardDetails])

  // Total amount for display and calculations - memoized to prevent re-computation
  const totalAmount = useMemo(() =>
    cardDetails?.totalRecs?.[0]?.amount || 0,
    [cardDetails?.totalRecs]
  )

  // Filter invoices based on search - memoized to prevent re-computation
  const filteredInvoices = useMemo(() =>
    invoices.filter(invoice =>
      invoice.invoiceNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
      getStatusLabel(invoice.status).toLowerCase().includes(searchValue.toLowerCase()) ||
      moment(invoice.invoiceDate).format('MMM DD, YYYY').toLowerCase().includes(searchValue.toLowerCase())
    ), [invoices, searchValue, getStatusLabel]
  )

  // Update pagination total when filtered - memoized to prevent re-renders
  const updatedPagination = useMemo(() => ({
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: filteredInvoices.length
  }), [pagination.page, pagination.pageSize, filteredInvoices.length])

  // Table columns configuration - memoized to prevent re-renders
  const columns = useMemo(() =>
    getCustomerInvoiceColumns(),
    []
  )

  // Handle pagination - memoized to prevent re-renders
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const handleRowsPerPageChange = useCallback((pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, page: 0 }))
  }, [])

  // Handle search - memoized to prevent re-renders
  const handleSearchChange = useCallback((value) => {
    setSearchValue(value)
    // Don't update pagination here to avoid re-render loops
  }, [])

  // Row key function - memoized to prevent re-renders
  const getRowKey = useMemo(() => (row) => row._id, [])

  // Header actions - memoized to prevent re-renders
  const headerActions = useMemo(() => (
    <Button
      variant='outlined'
      component={Link}
      href={`/invoices/invoice-list`}
      startIcon={<i className='ri-external-link-line' />}
      size='small'
    >
      View All
    </Button>
  ), [])

  // Empty content - memoized to prevent re-renders
  const emptyContent = useMemo(() => (
    <div className='flex flex-col items-center gap-4 py-12'>
      <CustomAvatar variant='rounded' skin='light' color='secondary' size={64}>
        <i className='ri-file-list-line text-3xl' />
      </CustomAvatar>
      <div className='text-center'>
        <Typography variant='h6' color='text.secondary' className='font-semibold'>
          No invoices found
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {searchValue
            ? 'Try adjusting your search criteria.'
            : "This customer hasn't made any invoices yet."
          }
        </Typography>
      </div>
    </div>
  ), [searchValue])




  return (
    <Grid container spacing={6}>
      {/* Statistics Cards */}
      <Grid size={{ xs: 12 }}>
        <HorizontalStatsGroup
          stats={breakdownStats}
          totalAmount={totalAmount}
          borderColor="primary"
        />
      </Grid>

      {/* Recent Invoices Table */}
      <Grid size={{ xs: 12 }}>
        <CustomListTable
          title='Recent Invoices'
          columns={columns}
          rows={filteredInvoices}
          rowKey={getRowKey}
          pagination={updatedPagination}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          showSearch={true}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          // searchPlaceholder='Search invoices...'
          // headerActions={headerActions}
          // emptyContent={emptyContent}
          noDataText='No invoices found'
          loading={false}
        />
      </Grid>
    </Grid>
  )
}

export default CustomerOverview
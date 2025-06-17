'use client'

import { useState } from 'react'
import { 
  Alert, 
  Box, 
  CircularProgress,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material'
import { Edit, Visibility, Delete } from '@mui/icons-material'
import Link from 'next/link'
import CustomListTable from '@/components/custom-components/CustomListTable'
import { formatDate } from '@/utils/dateUtils'

const BankSettingsList = ({ 
  banks = [], 
  pagination = {}, 
  loading = false, 
  deleting = false,
  error = null, 
  onRefresh, 
  onDelete,
  onClearError 
}) => {
  const [selectedRows, setSelectedRows] = useState([])

  const columns = [
    {
      key: 'bankName',
      label: 'Bank Name',
      visible: true,
      renderCell: (row) => row?.bankName || '-'
    },
    {
      key: 'accountNumber',
      label: 'Account Number',
      visible: true,
      renderCell: (row) => {
        const accountNumber = row?.accountNumber || ''
        return accountNumber ? `****${accountNumber.slice(-4)}` : '-'
      }
    },
    {
      key: 'accountHolderName',
      label: 'Account Holder',
      visible: true,
      renderCell: (row) => row?.accountHolderName || '-'
    },
    {
      key: 'branchName',
      label: 'Branch',
      visible: true,
      renderCell: (row) => row?.branchName || '-'
    },
    {
      key: 'ifscCode',
      label: 'IFSC Code',
      visible: true,
      renderCell: (row) => row?.ifscCode || '-'
    },
    {
      key: 'status',
      label: 'Status',
      visible: true,
      renderCell: (row) => (
        <Chip
          label={row?.isActive ? 'Active' : 'Inactive'}
          color={row?.isActive ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      visible: true,
      renderCell: (row) => (
        <Box display="flex" gap={1}>
          <Tooltip title="View">
            <IconButton
              component={Link}
              href={`/settings/bank-settings/view/${row._id}`}
              size="small"
              color="primary"
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              component={Link}
              href={`/settings/bank-settings/edit/${row._id}`}
              size="small"
              color="primary"
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleDelete([row._id])}
              size="small"
              color="error"
              disabled={deleting}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  const handleDelete = async (ids) => {
    if (window.confirm('Are you sure you want to delete the selected bank account(s)?')) {
      await onDelete(ids)
      setSelectedRows([])
      onRefresh?.()
    }
  }

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      handleDelete(selectedRows)
    }
  }

  if (loading && banks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={onClearError}>
          {error}
        </Alert>
      )}

      <CustomListTable
        columns={columns}
        rows={banks}
        pagination={pagination}
        loading={loading}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onBulkDelete={selectedRows.length > 0 ? handleBulkDelete : null}
        bulkDeleteLoading={deleting}
        emptyStateMessage="No bank accounts found. Add your first bank account to get started."
        rowKey={(row, index) => row?._id || row?.id || `bank-${index}`}
      />
    </Box>
  )
}

export default BankSettingsList
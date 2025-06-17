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

const TaxSettingsList = ({ 
  taxes = [], 
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
      key: 'name',
      label: 'Tax Name',
      visible: true,
      renderCell: (row) => row?.name || '-'
    },
    {
      key: 'taxRate',
      label: 'Tax Rate',
      visible: true,
      renderCell: (row) => row?.taxRate ? `${row.taxRate}%` : '-'
    },
    {
      key: 'type',
      label: 'Type',
      visible: true,
      renderCell: (row) => row?.type || '-'
    },
    {
      key: 'status',
      label: 'Status',
      visible: true,
      renderCell: (row) => (
        <Chip
          label={row?.status ? 'Active' : 'Inactive'}
          color={row?.status ? 'success' : 'default'}
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
              href={`/settings/tax-settings/view/${row._id}`}
              size="small"
              color="primary"
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              component={Link}
              href={`/settings/tax-settings/edit/${row._id}`}
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
    if (window.confirm('Are you sure you want to delete the selected tax rate(s)?')) {
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

  if (loading && taxes.length === 0) {
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
        rows={taxes}
        pagination={pagination}
        loading={loading}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onBulkDelete={selectedRows.length > 0 ? handleBulkDelete : null}
        bulkDeleteLoading={deleting}
        emptyStateMessage="No tax rates found. Add your first tax rate to get started."
        rowKey={(row, index) => row?._id || row?.id || `tax-${index}`}
      />
    </Box>
  )
}

export default TaxSettingsList
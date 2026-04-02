'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import { Icon } from '@iconify/react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { formatDate } from '@/utils/dateUtils';
import CustomListTable from '@/components/custom-components/CustomListTable';
import OptionMenu from '@core/components/option-menu';
import { deliveryChallanStatusOptions } from '@/data/dataSets';
import { amountFormat, formatDecimal } from '@/utils/numberUtils';
import HorizontalWithBorder from '@components/card-statistics/HorizontalWithBorder';

const getStatusColor = (status) => {
  const statusOption = deliveryChallanStatusOptions.find((option) => option.value === status);
  return statusOption?.color || 'default';
};

const ListDeliveryChallans = ({
  deliveryChallans = [],
  pagination = { current: 1, pageSize: 10, total: 0 },
  loading = false,
  loadingAction = false,
  permissions,
  searchTerm = '',
  cardCounts = {},
  deleteDialogOpen = false,
  convertDialogOpen = false,
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
  onConvert,
  onDeleteDialogClose,
  onDeleteConfirm,
  onConvertDialogClose,
  onConvertConfirm,
}) => {
  const theme = useTheme();

  const columns = useMemo(
    () => [
      {
        key: 'challanNumber',
        visible: true,
        label: 'Challan No',
        sortable: true,
        align: 'center',
        renderCell: (row) => (
          <Link href={`/deliveryChallans/deliveryChallans-view/${row._id}`} passHref>
            <Typography className="cursor-pointer text-primary hover:underline" align="center">
              {row.challanNumber || row.deliveryChallanNumber || 'N/A'}
            </Typography>
          </Link>
        ),
      },
      {
        key: 'customer',
        visible: true,
        label: 'Customer',
        sortable: true,
        align: 'center',
        renderCell: (row) => (
          <Box className="flex justify-between items-start flex-col gap-1">
            <Link href={`/customers/customer-view/${row.customerId?._id}`} passHref>
              <Typography
                variant="body1"
                className="text-[0.95rem] text-start cursor-pointer text-primary hover:underline"
              >
                {row.customerId?.name || 'N/A'}
              </Typography>
            </Link>
            <Typography
              variant="caption"
              color="text.secondary"
              className="text-[0.85rem] truncate select-text"
              sx={{ userSelect: 'text', cursor: 'text' }}
            >
              {row.customerId?.phone || 'N/A'}
            </Typography>
          </Box>
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        visible: true,
        align: 'center',
        renderCell: (row) => (
          <div className="flex items-center gap-1 justify-center">
            <Icon icon="lucide:saudi-riyal" width="1rem" color={theme.palette.secondary.light} />
            <Typography color="text.primary" className="text-[1rem] font-medium">
              {formatDecimal(row.TotalAmount || row.totalAmount)}
            </Typography>
          </div>
        ),
      },
      {
        key: 'deliveryDate',
        label: 'Delivery Date',
        visible: true,
        align: 'center',
        sortable: true,
        renderCell: (row) => (
          <Typography
            variant="body1"
            color="text.primary"
            className="text-[0.9rem] whitespace-nowrap"
          >
            {row.deliveryDate ? formatDate(row.deliveryDate) : 'N/A'}
          </Typography>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        visible: true,
        align: 'center',
        sortable: true,
        renderCell: (row) => (
          <Chip
            label={
              row.status
                ? row.status
                    .replace(/_/g, ' ')
                    .toLowerCase()
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())
                : 'N/A'
            }
            size="medium"
            color={getStatusColor(row.status)}
            variant="tonal"
            sx={{ fontWeight: 500 }}
          />
        ),
      },
      {
        key: 'actions',
        label: '',
        visible: true,
        align: 'right',
        renderCell: (row) => {
          const menuOptions = [];

          if (permissions?.canView) {
            menuOptions.push({
              text: 'View',
              icon: <Icon icon="tabler:eye" />,
              menuItemProps: {
                className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => onView(row._id),
              },
            });
          }

          if (permissions?.canUpdate) {
            menuOptions.push({
              text: 'Edit',
              icon: <Icon icon="tabler:edit" />,
              menuItemProps: {
                className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => onEdit(row._id),
              },
            });

            menuOptions.push({
              text: 'Convert to Invoice',
              icon: <Icon icon="tabler:arrow-right" />,
              menuItemProps: {
                className: 'flex items-center gap-2 text-textSecondary',
                disabled: row?.status === 'CONVERTED',
                onClick: row?.status === 'CONVERTED' ? undefined : () => onConvert(row),
              },
            });
          }

          if (permissions?.canDelete) {
            menuOptions.push({
              text: 'Delete',
              icon: <Icon icon="tabler:trash" />,
              menuItemProps: {
                className: 'flex items-center gap-2 text-textSecondary',
                onClick: () => onDelete(row),
              },
            });
          }

          if (menuOptions.length === 0) {
            return null;
          }

          return (
            <Box className="flex items-center justify-end">
              <OptionMenu
                icon={<MoreVertIcon />}
                iconButtonProps={{ size: 'small', 'aria-label': 'delivery challan actions' }}
                options={menuOptions}
              />
            </Box>
          );
        },
      },
    ],
    [onConvert, onDelete, onEdit, onView, permissions, theme.palette.secondary.light]
  );

  const tablePagination = useMemo(
    () => ({
      page: Math.max(0, pagination.current - 1),
      pageSize: pagination.pageSize,
      total: pagination.total,
    }),
    [pagination.current, pagination.pageSize, pagination.total]
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-start items-center mb-5">
        <div className="flex items-center gap-2">
          <Avatar className="bg-primary/12 text-primary bg-primaryLight w-12 h-12">
            <Icon icon="tabler:truck-delivery" fontSize={26} />
          </Avatar>
          <Typography variant="h5" className="font-semibold text-primary">
            Delivery Challans
          </Typography>
        </div>
      </div>

      <div className="mb-2">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Total Challans"
              subtitle="No of Challans"
              titleVariant="h5"
              subtitleVariant="body2"
              stats={`$ ${amountFormat(cardCounts.totalDeliveryChallans?.total_sum)}`}
              statsVariant="h4"
              trendNumber={cardCounts.totalDeliveryChallans?.count || 0}
              trendNumberVariant="body1"
              avatarIcon="tabler:truck-delivery"
              color="primary"
              iconSize="30px"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Active"
              subtitle="No of Active"
              titleVariant="h5"
              subtitleVariant="body2"
              stats={`$ ${amountFormat(cardCounts.totalActive?.total_sum)}`}
              statsVariant="h4"
              trendNumber={cardCounts.totalActive?.count || 0}
              trendNumberVariant="body1"
              avatarIcon="mdi:check-circle-outline"
              color="success"
              iconSize="35px"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Converted"
              subtitle="No of Converted"
              titleVariant="h5"
              subtitleVariant="body2"
              stats={`$ ${amountFormat(cardCounts.totalConverted?.total_sum)}`}
              statsVariant="h4"
              trendNumber={cardCounts.totalConverted?.count || 0}
              trendNumberVariant="body1"
              avatarIcon="mdi:arrow-right-circle-outline"
              color="info"
              iconSize="35px"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <HorizontalWithBorder
              title="Cancelled"
              subtitle="No of Cancelled"
              titleVariant="h5"
              subtitleVariant="body2"
              stats={`$ ${amountFormat(cardCounts.totalCancelled?.total_sum)}`}
              statsVariant="h4"
              trendNumber={cardCounts.totalCancelled?.count || 0}
              trendNumberVariant="body1"
              avatarIcon="mdi:close-circle-outline"
              color="error"
              iconSize="35px"
            />
          </Grid>
        </Grid>
      </div>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <CustomListTable
            addRowButton={
              permissions?.canCreate && (
                <Button
                  component={Link}
                  href="/deliveryChallans/deliveryChallans-add"
                  variant="contained"
                  startIcon={<Icon icon="tabler:plus" />}
                >
                  New Delivery Challan
                </Button>
              )
            }
            columns={columns}
            rows={deliveryChallans}
            loading={loading}
            pagination={tablePagination}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            noDataText="No delivery challans found"
            rowKey={(row) => row._id || row.id}
            showSearch
            searchValue={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search delivery challans..."
            onRowClick={permissions?.canView ? (row) => onView(row._id) : undefined}
            enableHover
          />
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={onDeleteDialogClose}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            width: { xs: '90%', sm: 'auto' },
            minWidth: { sm: 400 },
            boxShadow: (muiTheme) => `0 8px 24px 0 ${alpha(muiTheme.palette.common.black, 0.16)}`,
          },
        }}
      >
        <DialogTitle sx={{ px: 4, pt: 4, fontSize: '1.25rem' }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <DialogContentText>
            Are you sure you want to delete this delivery challan? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
          <Button
            onClick={onDeleteDialogClose}
            variant="outlined"
            disabled={loadingAction}
            sx={{ borderRadius: '10px', py: 1, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={onDeleteConfirm}
            variant="contained"
            color="error"
            disabled={loadingAction}
            startIcon={loadingAction ? null : <Icon icon="tabler:trash" />}
            sx={{ borderRadius: '10px', py: 1, px: 3, ml: 2 }}
          >
            {loadingAction ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={convertDialogOpen}
        onClose={onConvertDialogClose}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            width: { xs: '90%', sm: 'auto' },
            minWidth: { sm: 400 },
            boxShadow: (muiTheme) => `0 8px 24px 0 ${alpha(muiTheme.palette.common.black, 0.16)}`,
          },
        }}
      >
        <DialogTitle sx={{ px: 4, pt: 4, fontSize: '1.25rem' }}>Convert to Invoice</DialogTitle>
        <DialogContent sx={{ px: 4 }}>
          <DialogContentText>
            Are you sure you want to convert this delivery challan to an invoice? This will create
            a new invoice with the same details.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
          <Button
            onClick={onConvertDialogClose}
            variant="outlined"
            disabled={loadingAction}
            sx={{ borderRadius: '10px', py: 1, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={onConvertConfirm}
            variant="contained"
            disabled={loadingAction}
            startIcon={loadingAction ? null : <Icon icon="tabler:arrow-right" />}
            sx={{ borderRadius: '10px', py: 1, px: 3, ml: 2 }}
          >
            {loadingAction ? 'Converting...' : 'Convert'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ListDeliveryChallans;

import Link from 'next/link';
import dayjs from 'dayjs';
import { Box, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import OptionMenu from '@core/components/option-menu';
import { warrantyStatusOptions } from '@/data/dataSets';

const formatCoverageDate = value => (value ? dayjs(value).format('DD MMM YY') : 'N/A');

const getCoverageProgress = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const totalMs = end.diff(start);

  if (totalMs <= 0) return 100;

  const elapsedMs = dayjs().diff(start);

  if (elapsedMs <= 0) return 0;
  if (elapsedMs >= totalMs) return 100;

  return Math.round((elapsedMs / totalMs) * 100);
};

const coverageProgressStatuses = new Set(['active', 'partial_return', 'claim_open', 'claim_closed', 'expired']);

const shouldShowCoverageProgress = row => {
  const status = row?.effectiveStatus || row?.status || 'active';

  return coverageProgressStatuses.has(status) && Boolean(row?.startDate && row?.endDate);
};



const getSourceDocumentNumber = row => {
  const sourceDocument = row?.sourceDocumentId;
  if (!sourceDocument || typeof sourceDocument !== 'object') return '';
  if ((row?.sourceDocumentType || row?.source) === 'manual') return '';

  return sourceDocument.invoiceNumber || '';
};

const ActionCell = ({ row, handlers, permissions }) => {
  const menuOptions = [];

  if (permissions?.canView) {
    menuOptions.push({
      text: 'View',
      icon: <Icon icon="mdi:eye-outline" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers?.handleView?.(row._id),
      },
    });
  }

  if (permissions?.canUpdate) {
    menuOptions.push({
      text: 'Edit',
      icon: <Icon icon="line-md:edit" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers?.handleEdit?.(row._id),
      },
    });
  }

  return menuOptions.length > 0 ? (
    <Box className="flex items-center justify-end" onClick={event => event.stopPropagation()}>
      <OptionMenu
        icon={<MoreVertIcon />}
        iconButtonProps={{ size: 'small', 'aria-label': 'warranty actions' }}
        options={menuOptions}
      />
    </Box>
  ) : null;
};

export const getWarrantyColumns = ({ permissions = {} } = {}) => [
  {
    key: 'warrantyNumber',
    visible: true,
    label: 'Warranty No',
    // minWidth: 220,
    renderCell: row => (



      <Typography fullWidth variant="body1.5" fontWeight={450} component={Link} href={`/warranties/warranty-view/${row._id}`} className="cursor-pointer text-primary hover:underline">
        {row.warrantyNumber || 'N/A'}
      </Typography>
      // {/* <Typography variant="caption" color="text.secondary">
      //   {(row.source || 'manual').replace(/_/g, ' ')}
      // </Typography> */}
    ),
  },

  {
    key: 'customer',
    visible: true,
    label: 'Customer',
    // minWidth: 180,
    renderCell: row => (
      <Typography color="text.primary" className="text-[0.9rem]">
        {row?.customerId?.name}
      </Typography>
    ),
  },
  {
    key: 'product',
    visible: true,
    label: 'Product',
    // minWidth: 220,
    renderCell: row => {
      const sourceNumber = getSourceDocumentNumber(row);
      const hasSource = Boolean(row?.sourceDocumentId && sourceNumber);

      return (
        <Stack spacing={0.25} className="items-start">
          <Typography variant="body1.5">
            {row.productSnapshot?.name || row.productId?.name || 'N/A'}
          </Typography>
          {hasSource ? (
            <Box
              component={Link}
              href={`/invoices/invoice-view/${row?.sourceDocumentId?._id || ''}`}
              onClick={event => event.stopPropagation()}
              className="flex items-center gap-1 cursor-pointer text-primary hover:underline"
            >
              <Icon icon="mdi:invoice-text-outline" width={14} height={14} />
              <Typography variant="caption" fontWeight={450} color="primary.main">
                {sourceNumber}
              </Typography>
            </Box>
          ) : (
            <></>
          )}
        </Stack>
      );
    },
  },
  {
    key: 'status',
    visible: true,
    label: 'Status',
    align: 'center',
    // minWidth: 150,
    renderCell: row => {


      return (
        <Chip
          size="small"
          color={warrantyStatusOptions.find(option => option.value === row.status)?.color || 'primary'}
          variant="tonal"
          label={warrantyStatusOptions.find(option => option.value === row.status)?.label || 'N/A'}
        />
      );
    },
  },
  {
    key: 'expiryDate',
    visible: true,
    label: 'Expiry Date',
    // minWidth: 210,
    renderCell: row => {
      const status = row.effectiveStatus || row.status || 'active';
      const progress = getCoverageProgress(row.startDate, row.endDate);
      const showProgress = shouldShowCoverageProgress(row);
      const progressColor = status === 'expired' ? 'secondary' : 'info';

      return (
        <Stack spacing={0.5} className="min-w-[100px]">
          <Typography variant="body1.5">
            {formatCoverageDate(row.endDate)}
          </Typography>
          {showProgress ? (
            <LinearProgress
              variant="determinate"
              color={progressColor}
              value={progress}
              className="!h-[3px]"
            />
          ) : null}
        </Stack>
      );
    },
  },
  {
    key: 'action',
    visible: permissions.canView || permissions.canUpdate,
    label: '',
    align: 'right',
    renderCell: (row, handlers) => (
      <ActionCell row={row} handlers={handlers} permissions={permissions} />
    ),
  },
];

export default getWarrantyColumns;

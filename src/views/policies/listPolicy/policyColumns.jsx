import { Icon } from '@iconify/react';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Avatar, Box, Chip, Typography } from '@mui/material';
import OptionMenu from '@core/components/option-menu';
import CustomChip from '@/components/chips/CustomChip';
const DEFAULT_COVERAGE_TYPE = 'repair_or_replace';

const formatDuration = duration => {
  if (!duration?.value) return 'No duration';
  return `${duration.value} ${duration.unit || 'months'}`;
};

const formatLabel = value => (value || 'N/A').replace(/_/g, ' ');

const PolicyActionCell = ({ row, handlers }) => (
  <Box className="flex items-center justify-end" onClick={event => event.stopPropagation()}>
    <OptionMenu
      icon={<MoreVertIcon />}
      iconButtonProps={{ size: 'small', 'aria-label': 'warranty policy actions' }}
      options={[
        {
          text: 'View',
          icon: <Icon icon="mdi:eye-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: event => {
              event?.stopPropagation?.();
              handlers?.openPolicy?.(row, 'view');
            },
          },
        },
        {
          text: 'Edit',
          icon: <Icon icon="mdi:edit-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: event => {
              event?.stopPropagation?.();
              handlers?.openPolicy?.(row, 'edit');
            },
          },
        },
        {
          text: 'Delete',
          icon: <Icon icon="mdi:delete-outline" />,
          menuItemProps: {
            className: 'flex items-center gap-2 text-textSecondary',
            onClick: event => {
              event?.stopPropagation?.();
              handlers?.handleDelete?.(row);
            },
          },
        },
      ]}
    />
  </Box>
);

export const getPolicyColumns = () => [
  {

    key: 'policyNumber',
    visible: true,
    label: 'Policy No',
    // minWidth: 280,
    renderCell: row => (

      <Typography variant="h7" className='whitespace-nowrap'>
        {row.code || ''}
      </Typography>

    ),
  },
  {
    key: 'name',
    visible: true,
    label: 'Name',
    // minWidth: 280,
    renderCell: row => (

      <Typography variant="body1.5" className=''>
        {row.name || 'N/A'}
      </Typography>

    ),
  },
  {
    key: 'duration',
    visible: true,
    label: 'Duration',
    // minWidth: 130,
    renderCell: row => (
      <Typography variant="body1.5" className='whitespace-nowrap'>
        {formatDuration(row.duration)}
      </Typography>
    ),
  },
  {
    key: 'coverageType',
    visible: true,
    label: 'Coverage',
    // minWidth: 180,
    renderCell: row => (
      <CustomChip
        corners="corner"
        size="small"
        variant="outlined"
        color="secondary"
        label={formatLabel(row.coverageType || DEFAULT_COVERAGE_TYPE)}
      />
    ),
  },
  {
    key: 'extensionAllowed',
    visible: true,
    label: 'Extensions',
    // minWidth: 130,
    renderCell: row => (
      <CustomChip
        corners="corner"
        size="small"
        color={row.extensionAllowed ? 'success' : 'secondary'}
        variant="outlined"
        label={row.extensionAllowed ? 'Allowed' : 'Disabled'}
      />
    ),
  },
  {
    key: 'claimLimit',
    visible: true,
    label: 'Claim Limit',
    // minWidth: 130,
    renderCell: row => (
      <Typography color="text.primary" className="text-[0.9rem]">
        {row.claimLimit?.type === 'count' ? `${row.claimLimit.count || 0} claims` : 'Unlimited'}
      </Typography>
    ),
  },
  {
    key: 'status',
    visible: true,
    label: 'Status',
    // minWidth: 120,
    renderCell: row => (
      <Chip
        size="small"
        color={row.status === 'active' ? 'success' : 'secondary'}
        variant="tonal"
        label={row.status || 'active'}
      />
    ),
  },
  {
    key: 'actions',
    visible: true,
    label: '',
    align: 'right',
    // minWidth: 60,
    renderCell: (row, handlers) => <PolicyActionCell row={row} handlers={handlers} />,
  },
];

export default getPolicyColumns;

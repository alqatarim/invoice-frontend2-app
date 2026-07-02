import Link from 'next/link';
import dayjs from 'dayjs';
import { Avatar, Box, Chip, Typography } from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Icon } from '@iconify/react';
import OptionMenu from '@core/components/option-menu';
import { warrantyClaimStatusOptions } from '@/data/dataSets';
import CustomChip from '@/components/chips/CustomChip';
const formatDate = value => (value ? dayjs(value).format('DD MMM YYYY') : 'N/A');

const ActionCell = ({ row, handlers }) => {
  const menuOptions = [
    {
      text: 'View',
      icon: <Icon icon="mdi:eye-outline" />,
      menuItemProps: {
        className: 'flex items-center gap-2 text-textSecondary',
        onClick: () => handlers?.handleView?.(row._id),
      },
    },
  ];

  return (
    <Box className="flex items-center justify-end" onClick={event => event.stopPropagation()}>
      <OptionMenu
        icon={<MoreVertIcon />}
        iconButtonProps={{ size: 'small', 'aria-label': 'claim actions' }}
        options={menuOptions}
      />
    </Box>
  );
};

export const getClaimColumns = () => [
  {
    key: 'claimNumber',
    visible: true,
    label: 'Claim',
    // minWidth: 220,
    renderCell: row => (

      <Typography variant="body1.5" fontWeight={450} component={Link} href={`/claims/claim-view/${row._id}`} className="cursor-pointer text-primary  hover:underline  ">
        {row.claimNumber || 'N/A'}.
      </Typography>


    ),
  },


  {
    key: 'customer',
    visible: true,
    label: 'Customer',
    // minWidth: 180,
    renderCell: row => (
      <Typography color="text.primary" className="text-[0.9rem]">
        {row.customerId?.name || row.customerId?.email || 'Walk-in / unlinked'}
      </Typography>
    ),
  },

  {
    key: 'warranty',
    visible: true,
    label: 'Warranty',
    // minWidth: 180,
    renderCell: row => {
      const warrantyId = row.warrantyRecordId?._id;
      const warrantyNumber = row.warrantyRecordId?.warrantyNumber || 'N/A';

      if (!warrantyId) {
        return (
          <Typography variant='body1.5'>
            {warrantyNumber}
          </Typography>
        );
      }

      return (
        <Typography
          component={Link}
          href={`/warranties/warranty-view/${warrantyId}`}
          variant="body1.5"
          className="cursor-pointer text-primary hover:underline"
          onClick={event => event.stopPropagation()}
        >
          {warrantyNumber}
        </Typography>
      );
    },
  },
  {
    key: 'issueType',
    visible: true,
    label: 'Issue',
    align: 'center',
    // minWidth: 120,
    renderCell: row => (
      <CustomChip
        size="small"
        corners="corner"
        // skin="light"
        variant="outlined"
        // fontSkin="default"
        color="secondary"
        label={(row.issueType || 'repair').replace(/_/g, ' ')}
      />
    ),
  },
  {
    key: 'createdAt',
    visible: true,
    label: 'Created',
    align: 'center',
    // minWidth: 140,
    renderCell: row => (
      <Typography color="text.primary" className="text-[0.9rem]">
        {formatDate(row.createdAt)}
      </Typography>
    ),
  },
  {
    key: 'status',
    visible: true,
    label: 'Status',
    align: 'center',
    // minWidth: 140,
    renderCell: row => {
      const statusOption = warrantyClaimStatusOptions.find(option => option.value === row.status);

      return (
        <Chip
          size="small"
          variant="tonal"
          color={statusOption?.color || 'default'}
          label={statusOption?.label || (row.status || 'submitted').replace(/_/g, ' ')}
        />
      );
    },
  },


  {
    key: 'action',
    visible: true,
    label: '',
    align: 'right',
    // minWidth: 60,
    renderCell: (row, handlers) => (
      <ActionCell row={row} handlers={handlers} />
    ),
  },
];

export default getClaimColumns;
